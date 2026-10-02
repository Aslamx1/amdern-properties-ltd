import { createFileRoute } from "@tanstack/react-router";
import { handleGetPaymentStatus } from "@/lib/payments.server";

export const Route = createFileRoute("/api/payments/status/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        let paymentId = params?.id;
        if (!paymentId) {
          try {
            const url = new URL(request.url);
            const segments = url.pathname.split("/").filter(Boolean);
            paymentId = segments[segments.length - 1] || "";
          } catch {
            paymentId = "";
          }
        }
        return handleGetPaymentStatus(request, paymentId);
      },
    },
  },
});
