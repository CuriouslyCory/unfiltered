from typing import List, Tuple
from crawl4ai import AsyncWebCrawler, CacheMode
from crawl4ai.async_configs import BrowserConfig, CrawlerRunConfig
import asyncio
import psutil
import os
import re


async def crawl_parallel(urls: List[str], max_concurrent: int = 3):
    print("\n=== Parallel Crawling with Browser Reuse + Memory Check ===")

    # We'll keep track of peak memory usage across all tasks
    peak_memory = 0
    process = psutil.Process(os.getpid())

    def log_memory(prefix: str = ""):
        nonlocal peak_memory
        current_mem = process.memory_info().rss  # in bytes
        if current_mem > peak_memory:
            peak_memory = current_mem
        print(
            f"{prefix} Current Memory: {current_mem // (1024 * 1024)} MB, Peak: {peak_memory // (1024 * 1024)} MB"
        )

    # Minimal browser config
    browser_config = BrowserConfig(
        headless=True,
        verbose=False,  # corrected from 'verbos=False'
        extra_args=["--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox"],
    )
    crawl_config = CrawlerRunConfig(cache_mode=CacheMode.BYPASS)

    # Create the crawler instance
    crawler = AsyncWebCrawler(config=browser_config)
    await crawler.start()

    full_results = []

    try:
        # We'll chunk the URLs in batches of 'max_concurrent'
        success_count = 0
        fail_count = 0
        for i in range(0, len(urls), max_concurrent):
            batch = urls[i : i + max_concurrent]
            tasks = []

            for j, url in enumerate(batch):
                # Unique session_id per concurrent sub-task
                session_id = f"parallel_session_{i + j}"
                task = crawler.arun(url=url, config=crawl_config, session_id=session_id)
                tasks.append(task)

            # Check memory usage prior to launching tasks
            log_memory(prefix=f"Before batch {i//max_concurrent + 1}: ")

            # Gather results
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Check memory usage after tasks complete
            log_memory(prefix=f"After batch {i//max_concurrent + 1}: ")

            # Evaluate results
            for url, result in zip(batch, results):
                if isinstance(result, Exception):
                    print(f"Error crawling {url}: {result}")
                    fail_count += 1
                elif result.success:
                    success_count += 1
                    full_results.append(result)
                else:
                    fail_count += 1

        print(f"\nSummary:")
        print(f"  - Successfully crawled: {success_count}")
        print(f"  - Failed: {fail_count}")

    finally:
        print("\nClosing crawler...")
        await crawler.close()
        # Final memory log
        log_memory(prefix="Final: ")
        print(f"\nPeak memory usage (MB): {peak_memory // (1024 * 1024)}")
        return full_results


def get_text_between_hashes(input_string: str) -> str:
    """
    Returns the content between the first and second instance
    of '###' in the given string. If fewer than two instances
    of '###' exist, returns an empty string.
    """
    parts = input_string.split("###")
    # We expect at least three parts: text before the first '###',
    # text between, and text after the second '###'.
    if len(parts) >= 3:
        return parts[1]
    else:
        return ""


def save_content(filename: str, content: str) -> None:
    """
    Saves content to a file named `filename`. If the file does not exist,
    it is created. If it does exist, its contents are overwritten.

    :param filename: The path/name of the file to write to
    :param content: The text to write to the file
    """
    # remove any special characters from the filename
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)


def get_wh_gov_page_content(input_string: str) -> str:
    """
    Returns the content between the first and second instance
    of '###' in the given string. If fewer than two instances
    of '###' exist, returns an empty string.
    """
    parts = input_string.split("[Presidential Actions]")
    content_start = parts[1]
    content = content_start.split("* [News]")[0]
    # We expect at least three parts: text before the first '###',
    # text between, and text after the second '###'.
    return content


async def get_urls_for_page_paralell(page: int) -> List[Tuple[str, str]]:
    """
    Scrapes the EP index for document urls

    :param page: The page number to scrape
    """
    pages = await crawl_parallel(
        [
            # f"https://www.presidency.ucsb.edu/documents/app-categories/written-presidential-orders/presidential/executive-orders?items_per_page=60&page={page}"
            f"https://www.whitehouse.gov/presidential-actions/page/{page}"
        ]
    )
    print(f"list page {page} scraped")
    # Define the prefix we want to match
    # prefix = "https://www.presidency.ucsb.edu/documents/executive-order"
    prefix = "https://www.whitehouse.gov/presidential-actions/2025"

    # Iterate over 'internal' items, collecting only hrefs that start with the prefix
    filtered_hrefs = [
        [item["href"], item["text"]]
        for item in pages[0].links["internal"]
        if item["href"].startswith(prefix)
    ]
    return filtered_hrefs


async def paralell_process():
    for pageNum in range(1, 6):
        pageRefs = await get_urls_for_page_paralell(pageNum)
        print(f"Page {pageNum} has {len(pageRefs)} links")
        links = [item[0] for item in pageRefs]
        print(f"{len(links)} links found")
        crawl_result = await crawl_parallel(links, max_concurrent=5)
        for result in crawl_result:
            if result.success and result.markdown.startswith(" We're Sorry!") == False:
                eoSlug = result.url[
                    len("https://www.whitehouse.gov/presidential-actions/2025/") : -1
                ]  # get the slug portion of the url to use in the filename
                eoSlug = re.sub(r"[^a-zA-Z0-9_]", "_", eoSlug)
                save_content(
                    f"./scripts/executive_orders/{eoSlug}.md",
                    get_wh_gov_page_content(result.markdown),
                )
                print(f"{eoSlug} saved")


def main():
    asyncio.run(paralell_process())


if __name__ == "__main__":
    main()
