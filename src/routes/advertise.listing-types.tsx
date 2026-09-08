import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/advertise/listing-types")({
  head: () => ({
    meta: [
      { title: "Listing types and packages — advertise property in Uganda" },
      {
        name: "description",
        content:
          "Compare Basic, Premium and Premium Plus listing packages for advertising property on Amdern Properties.",
      },
      { property: "og:title", content: "Listing types and packages" },
      {
        property: "og:description",
        content: "Compare listing packages for advertising property in Uganda.",
      },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Advertise"
      title="Listing types"
      subtitle="Choose the level of exposure that matches how quickly you need to sell or let."
      sections={[
        {
          heading: "Basic listing",
          body: "Your property appears in search results with up to 8 photos and your agency contact details. Suitable for properties with a flexible timeline.",
        },
        {
          heading: "Premium listing",
          body: "Premium listings rank above basic listings in search results, carry a highlighted border and support up to 20 photos plus a floor plan.",
        },
        {
          heading: "Premium Plus listing",
          body: "The highest level of exposure: top placement in search results, homepage feature rotation, verified photo badge and inclusion in our email alerts to matched property seekers.",
        },
        {
          heading: "Getting started",
          body: "Submit your property using the listing form and select your preferred package. Our team will confirm pricing and publish the listing once details are verified.",
        },
      ]}
      cta={{ label: "List a property", to: "/list-property" }}
    />
  ),
});
