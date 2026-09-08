import { createFileRoute } from "@tanstack/react-router";
import { PrivacySettings } from "@/components/site/PrivacySettings";
import { Page } from "@/components/site/Page";

export const Route = createFileRoute("/account/privacy")({
  component: AccountPrivacyPage,
});

function AccountPrivacyPage() {
  return (
    <Page>
      <div className="max-w-2xl">
        <PrivacySettings />
      </div>
    </Page>
  );
}
