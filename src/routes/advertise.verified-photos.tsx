import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/advertise/verified-photos")({
  head: () => ({
    meta: [
      { title: "Verified photos — professional photography for your listing" },
      {
        name: "description",
        content:
          "Book professional photography and get the verified photo badge on your Amdern Properties listing.",
      },
      { property: "og:title", content: "Verified photos for property listings" },
      {
        property: "og:description",
        content: "Professional photography and a verified badge that buyers trust.",
      },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Advertise"
      title="Verified photos"
      subtitle="Listings with verified photography receive significantly more enquiries than those with phone snapshots."
      sections={[
        {
          heading: "How it works",
          body: "Book a shoot, our photographer visits the property at an agreed time, and edited images are uploaded to your listing along with the verified photo badge confirming the images show the actual property.",
        },
        {
          heading: "What you get",
          body: "Every shoot is delivered as a complete set of edited images ready to publish.",
          bullets: [
            "20 to 30 edited wide-angle interior and exterior images",
            "Verified photo badge on the listing",
            "Optional drone exterior shots for land and estates",
            "Images licensed for your own marketing use",
          ],
        },
        {
          heading: "Why it matters",
          body: "Buyers scroll quickly. A bright, well composed lead image is the single biggest factor in whether a listing is opened at all — and the verified badge removes the doubt about whether the photos are genuine.",
        },
      ]}
      cta={{ label: "Book a shoot", to: "/contact" }}
    />
  ),
});
