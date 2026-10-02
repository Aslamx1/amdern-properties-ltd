import { createFileRoute } from "@tanstack/react-router";
import { handleInitiatePayment } from "@/lib/payments.server";

export const Route = createFileRoute("/api/payments/initiate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return handleInitiatePayment(request);
      },
    },
  },
});
