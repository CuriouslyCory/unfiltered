import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { ExternalLink, Phone, Scale, Users } from "lucide-react";
import Link from "next/link";

const resources = {
  contactOfficials: [
    {
      name: "Resist.bot",
      description: "Send messages to elected officials via text message",
      url: "https://resist.bot",
    },
    {
      name: "Call My Congress",
      description: "Find your representatives and their contact information",
      url: "https://www.callmycongress.com",
    },
    {
      name: "GovTrack",
      description: "Track legislation and congressional activity",
      url: "https://www.govtrack.us",
    },
  ],
  legalSupport: [
    {
      name: "ACLU",
      description: "Defending civil rights and civil liberties",
      url: "https://www.aclu.org",
    },
    {
      name: "Lambda Legal",
      description: "Fighting for LGBTQ+ civil rights",
      url: "https://www.lambdalegal.org",
    },
    {
      name: "MoveOn",
      description: "Progressive advocacy and political action",
      url: "https://www.moveon.org",
    },
  ],
  protestResources: {
    knowYourRights: [
      {
        title: "ACLU Your Rights When Protesting",
        url: "https://www.aclu.org/know-your-rights/protesters-rights",
      },
      {
        title: "National Lawyers Guild Legal Support",
        url: "https://www.nlg.org/massdefense/resources/",
      },
      {
        title: "Encounters with Police or ICE",
        url: "https://50protests.com/assets/red_card-self_srv-english.pdf",
      },
    ],
    safetyTips: [
      "Wear comfortable, weather-appropriate clothing",
      "Bring water and snacks",
      "Write emergency contact numbers on your arm",
      "Travel with a buddy",
      "Be aware of exit routes",
      "Charge your phone fully",
      "Bring a portable charger",
      "Know your rights",
      "Have a meet-up plan with your group",
    ],
  },
  events: [
    {
      name: "50 Protests",
      description: "50 Protests",
      url: "https://50protests.com/",
    },
    {
      name: "General Strike",
      description:
        "We’ve voted, we’ve protested, and this country still does not work on behalf of us working people. The General Strike is a grassroots network of regular people who know our greatest power is our labor and our right to refuse it. If everyone fighting for racial, economic, and environmental justice strike together, we can make real change. ",
      url: "https://generalstrikeus.com/",
    },
  ],
};

export default function ResourcesPage() {
  return (
    <div className="mx-auto space-y-8 py-8">
      <div className="text-center">
        <h1 className="mb-4 font-serif text-4xl font-bold">Resources</h1>
        <p className="text-lg text-muted-foreground">
          Tools and resources to help you stay informed and take action
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Contact Officials Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Your Officials
            </CardTitle>
            <CardDescription>
              Tools to help you reach out to your elected representatives
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {resources.contactOfficials.map((resource) => (
              <div key={resource.name} className="space-y-2">
                <h3 className="font-semibold">{resource.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {resource.description}
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Visit Site
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Legal Support Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Legal Support
            </CardTitle>
            <CardDescription>
              Organizations providing legal assistance and advocacy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {resources.legalSupport.map((resource) => (
              <div key={resource.name} className="space-y-2">
                <h3 className="font-semibold">{resource.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {resource.description}
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Visit Site
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Protest Resources Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Protest Resources
            </CardTitle>
            <CardDescription>
              Essential information for safe and effective protesting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="protest-evenets">
                <AccordionTrigger>Events</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-outside list-disc space-y-2">
                    {resources.events.map((event) => (
                      <li
                        key={event.name}
                        className="text-sm text-muted-foreground"
                      >
                        <Link
                          href={event.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          {event.name}
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="know-your-rights">
                <AccordionTrigger>Know Your Rights</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {resources.protestResources.knowYourRights.map((resource) => (
                    <div key={resource.title}>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          {resource.title}
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="safety-tips">
                <AccordionTrigger>Safety Tips</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-inside list-disc space-y-2">
                    {resources.protestResources.safetyTips.map((tip) => (
                      <li key={tip} className="text-sm text-muted-foreground">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
