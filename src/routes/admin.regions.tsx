import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Globe, MapPin, Tag } from "lucide-react";

export const Route = createFileRoute("/admin/regions")({
  component: AdminRegions,
});

function AdminRegions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Locations & Taxonomies</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage regions, districts, sub-locations, and property amenity tags.
        </p>
      </div>
      <Card className="p-12 text-center">
        <Globe className="mx-auto h-16 w-16 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Regional Hierarchy Editor</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          Dynamic editor for regions, districts, sub-locations (e.g. Central Region → Wakiso →
          Kira), and property amenity tags.
        </p>
      </Card>
    </div>
  );
}
