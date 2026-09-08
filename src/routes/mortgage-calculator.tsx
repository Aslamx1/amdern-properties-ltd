import { createFileRoute } from "@tanstack/react-router";
import { Page, PageHero } from "@/components/site/Page";
import { MortgageCalculator } from "@/components/site/MortgageCalculator";

export const Route = createFileRoute("/mortgage-calculator")({
  head: () => ({
    meta: [
      { title: "Mortgage Calculator — Amdern Properties SMC" },
      {
        name: "description",
        content: "Estimate your monthly mortgage repayments for property in Uganda.",
      },
    ],
  }),
  component: MortgagePage,
});

function MortgagePage() {
  return (
    <Page>
      <PageHero
        eyebrow="Tools"
        title="Mortgage Calculator"
        subtitle="Plan your home purchase by estimating monthly repayments."
      />
      <div className="container-page py-8">
        <MortgageCalculator />
      </div>
    </Page>
  );
}
