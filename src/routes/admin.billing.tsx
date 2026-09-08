import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { CreditCard, DollarSign, Receipt } from "lucide-react";

export const Route = createFileRoute("/admin/billing")({
  component: AdminBilling,
});

function AdminBilling() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing & Revenue</h1>
        <p className="mt-1 text-sm text-slate-600">
          Track invoicing, premium subscriptions, and featured listing payments.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Monthly Revenue</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">USh 4.5M</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Active Subscriptions</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">12</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pending Invoices</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">3</p>
        </Card>
      </div>
      <Card className="p-12 text-center">
        <CreditCard className="mx-auto h-16 w-16 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Revenue & Billing</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          Invoicing logs for tier upgrades, premium subscriptions, and featured listings paid via
          Mobile Money (MTN/Airtel), Bank Transfer, or Card.
        </p>
      </Card>
    </div>
  );
}
