import os
import re
from prisma import Prisma
import asyncio
from dotenv import load_dotenv
from datetime import datetime, timezone
import uuid
from google import genai
from google.genai import types
import json

load_dotenv()

# Initialize Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

# Define the response schema for Gemini
response_schema = {
    "type": "OBJECT",
    "required": [
        "key_points",
        "areas_of_concern",
        "constitutional_considerations",
        "potential_implications",
        "final_summary",
    ],
    "properties": {
        "key_points": {
            "type": "STRING",
            "description": "A concise summary of the document's main arguments and key findings",
        },
        "areas_of_concern": {
            "type": "STRING",
            "description": "Potential problems, risks, or drawbacks highlighted in the document",
        },
        "constitutional_considerations": {
            "type": "STRING",
            "description": "Any discussion of the document's relationship to constitutional principles or laws",
        },
        "potential_implications": {
            "type": "STRING",
            "description": "The broader consequences or effects of the document's content",
        },
        "final_summary": {
            "type": "STRING",
            "description": "A brief, overall conclusion about the document's significance",
        },
    },
}


def parse_date(date_str):
    """
    Parse date string into datetime object.

    example input: "January 19, 2025"
    """
    try:
        return datetime.strptime(date_str.strip(), "%B %d, %Y")
    except ValueError:
        try:
            return datetime.strptime(date_str.strip(), "%b %d, %Y")
        except ValueError:
            print(f"Could not parse date: {date_str}")
            return None


def extract_metadata(content):
    """Extract metadata from the MDX file content."""
    metadata = {}

    # Extract docLink
    doc_link_match = re.search(r'export const docLink = "(.*?)";', content)
    if doc_link_match:
        metadata["docLink"] = doc_link_match.group(1)

    # Extract metadata block
    metadata_match = re.search(
        r"export const metadata = ({[^;]*});", content, re.DOTALL
    )
    if metadata_match:
        try:
            metadata_json = metadata_match.group(1)
            # Clean up the JSON string (remove newlines and extra spaces)
            metadata_json = re.sub(r"\s+", " ", metadata_json)
            # Add quotes around JavaScript object keys
            metadata_json = re.sub(r"([{,])\s*(\w+):", r'\1"\2":', metadata_json)
            # Remove trailing comma before closing brace
            metadata_json = re.sub(r",\s*}", "}", metadata_json)
            metadata_obj = json.loads(metadata_json)
            metadata["title"] = metadata_obj.get("title", "")
            metadata["shortSummary"] = metadata_obj.get("description", "")
        except json.JSONDecodeError as e:
            print(f"Error parsing metadata JSON: {str(e)}")
            print(f"Attempted to parse: {metadata_json}")

    # Extract dateSigned
    date_match = re.search(r'export const dateSigned = "(.*?)";', content)
    if date_match:
        date_str = date_match.group(1)
        metadata["dateSigned"] = parse_date(date_str)

    # Extract signer
    signer_match = re.search(r'export const signer = "(.*?)";', content)
    if signer_match:
        metadata["signer"] = signer_match.group(1)

    # Use Gemini to extract structured sections
    try:
        # Create the generation config
        generation_config = types.GenerateContentConfig(
            system_instruction="""You are an AI assistant tasked with extracting structured content from MDX files containing executive order analysis. Your task is to identify and extract specific sections from the content and return them in a structured JSON format.

<instructions>
    1. IDENTIFY AND EXTRACT THE FOLLOWING SECTIONS:
        - Key Points: Extract the content under the "Key points" or similar heading
        - Areas of Concern: Extract the content under the "Areas of Concern" heading
        - Constitutional Considerations: Extract the content under the "Constitutional Considerations" heading
        - Potential Implications: Extract the content under the "Potential Implications" heading
        - Final Summary: Extract the content under any final summary or conclusion section

    2. FORMAT REQUIREMENTS:
        - Preserve the original markdown formatting within each section
        - Include all bullet points, bold text, and other formatting
        - Extract all content between the section heading and the next heading
        - Do not modify or rewrite the content
        - Return exactly what appears in the original text

    3. OUTPUT STRUCTURE:
        - Return a JSON object with the five required fields
        - Each field should contain the complete text content of its section
        - Preserve line breaks and formatting
</instructions>""",
            temperature=0,
            top_p=0.95,
            top_k=40,
            response_schema=response_schema,
            response_mime_type="application/json",
        )

        # Create the prompt with the file content
        prompt = f"<ExecutiveOrder>\n{content}\n</ExecutiveOrder>"

        # Generate content
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt,
            config=generation_config,
        )

        # Parse the response
        if response.text:
            try:
                structured_data = json.loads(response.text)
                metadata.update(
                    {
                        "key_points": structured_data.get("key_points", ""),
                        "areas_of_concern": structured_data.get("areas_of_concern", ""),
                        "constitutional_considerations": structured_data.get(
                            "constitutional_considerations", ""
                        ),
                        "potential_implications": structured_data.get(
                            "potential_implications", ""
                        ),
                        "final_summary": structured_data.get("final_summary", ""),
                    }
                )
            except json.JSONDecodeError as e:
                print(f"Error parsing JSON response: {str(e)}")
                print(f"Raw response: {response.text}")
        else:
            print("No text in response from Gemini")

    except Exception as e:
        print(f"Error extracting structured data: {str(e)}")
        print(f"Error type: {type(e)}")

    return metadata


def extract_sections(content):
    """Extract sections from the MDX content."""
    # Split content by headings (##)
    sections = []
    current_section = None
    current_content = []

    for line in content.split("\n"):
        if line.startswith("## "):
            # Save previous section if exists
            if current_section:
                sections.append(
                    {
                        "title": current_section,
                        "content": "\n".join(current_content).strip(),
                    }
                )
            # Start new section
            current_section = line.replace("## ", "").strip()
            current_content = []
        elif current_section and line:
            current_content.append(line)

    # Add the last section
    if current_section and current_content:
        sections.append(
            {"title": current_section, "content": "\n".join(current_content).strip()}
        )

    return sections


def generate_document_name(filename):
    """Generate a simple, unique document name."""
    # Generate a short UUID
    short_id = str(uuid.uuid4())[:8]
    # Get base name without extension and remove special chars
    base_name = os.path.splitext(filename)[0]
    base_name = re.sub(r"[^a-zA-Z0-9]", "", base_name)
    # Limit base name length and combine with UUID
    return f"{base_name[:20]}_{short_id}"


async def process_files():
    """Process all MDX files and insert data into the database."""
    prisma = Prisma()
    await prisma.connect()

    # Get all MDX files from the _articles directory
    articles_dir = "src/app/eo-summary/_articles"

    try:
        for filename in os.listdir(articles_dir):
            if filename.endswith(".mdx"):
                print(f"Processing {filename}")
                file_path = os.path.join(articles_dir, filename)

                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()

                # Extract metadata
                metadata = extract_metadata(content)

                if not metadata.get("title") or not metadata.get("docLink"):
                    print(f"Skipping {filename} - missing required metadata")
                    continue

                if not metadata.get("dateSigned") or not metadata.get("signer"):
                    print(f"Skipping {filename} - missing date or signer")
                    continue

                now = datetime.now(timezone.utc)
                print(f"Processing {filename}")

                # Create document record
                try:
                    create_data = {
                        "title": metadata["title"],
                        "originalDocumentUrl": metadata["docLink"],
                        "shortSummary": metadata["shortSummary"],
                        "dateSigned": metadata["dateSigned"],
                        "signer": metadata["signer"],
                        "createdAt": now,
                        "updatedAt": now,
                    }
                    print(f"Attempting to create document with data: {create_data}")

                    document = await prisma.document.create(create_data)

                    # Create artifacts for each section
                    sections = [
                        {"title": "Key Points", "content": metadata["key_points"]},
                        {
                            "title": "Areas of Concern",
                            "content": metadata["areas_of_concern"],
                        },
                        {
                            "title": "Constitutional Considerations",
                            "content": metadata["constitutional_considerations"],
                        },
                        {
                            "title": "Potential Implications",
                            "content": metadata["potential_implications"],
                        },
                        {
                            "title": "Final Summary",
                            "content": metadata["final_summary"],
                        },
                    ]

                    for section in sections:
                        if section["content"]:  # Only create if content exists
                            await prisma.documentartifact.create(
                                {
                                    "title": section["title"],
                                    "content": section["content"],
                                    "documentId": document.id,
                                    "createdAt": now,
                                    "updatedAt": now,
                                }
                            )

                    print(f"Successfully processed {filename}")
                except Exception as e:
                    print(f"Error processing {filename}: {str(e)}")
                    print(f"Error type: {type(e)}")
                    print(f"Full error details: {repr(e)}")

    finally:
        await prisma.disconnect()


if __name__ == "__main__":
    asyncio.run(process_files())
