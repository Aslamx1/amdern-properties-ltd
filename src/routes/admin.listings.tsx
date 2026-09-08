import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminPhotoUpload } from "@/components/admin/AdminPhotoUpload";
import {
  apiAdminProperties,
  apiAdminCreateProperty,
  apiAdminUpdateProperty,
  apiAdminDeleteProperty,
  type AdminProperty,
  type AdminPropertyCreateInput,
} from "@/lib/api-admin";

export const Route = createFileRoute("/admin/listings")({
  component: AdminListingsComponent,
});

// ============================================================================
// CONSTANTS
// ============================================================================
const CATEGORY_OPTIONS = [
  { value: "houses", label: "Houses" },
  { value: "flats", label: "Flats & Apartments" },
  { value: "land", label: "Land & Plots" },
  { value: "commercial", label: "Commercial" },
  { value: "vehicles", label: "Vehicles" },
];

const LISTING_TYPE_OPTIONS = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
  { value: "shortlet", label: "Shortlet" },
  { value: "jv", label: "Joint Venture" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

// ============================================================================
// COMPONENT: Admin Listings Management
// ============================================================================

function AdminListingsComponent() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [categoryChangeConfirm, setCategoryChangeConfirm] = useState<{
   id: string;
   oldCategory: string;
   newCategory: string;
  } | null>(null);

  // Lightbox state for expanded photos
  const [expandedPhoto, setExpandedPhoto] = useState<{
   url: string;
   propertyTitle: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
   ref: "",
   title: "",
   type: "",
   category: "",
   listing_type: "sale",
   price: 0,
   period: null as string | null,
   area: "",
   district: "",
   region: "",
   beds: 0,
   baths: 0,
   toilets: 0,
   parking: 0,
   plot_size: "",
   size_sqm: 0,
   description: "",
   features: [] as string[],
   images: [] as string[],
   serviced: false,
   furnished: false,
   shared: false,
   added_days_ago: 0,
   photo_count: 0,
   video_url: null as string | null,
   badge: "",
   agent_id: "amdern-main",
   status: "active",
   moderation_status: "approved",
  });

  // Fetch properties from the real backend API
  const { data: listData, refetch: refetchList } = useQuery({
    queryKey: ["adminProperties"],
    queryFn: () =>
      apiAdminProperties({
        limit: 50,
        offset: 0,
      }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => apiAdminCreateProperty(data as AdminPropertyCreateInput),
    onSuccess: () => {
      setIsCreating(false);
      resetForm();
      refetchList();
      alert("Property created successfully!");
    },
    onError: (error: any) => {
      alert(`Failed to create property: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<typeof formData> }) =>
      apiAdminUpdateProperty(data.id, data.updates),
    onSuccess: () => {
      setEditingId(null);
      setCategoryChangeConfirm(null);
      resetForm();
      refetchList();
      alert("Property updated successfully!");
    },
    onError: (error: any) => {
      alert(`Failed to update property: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiAdminDeleteProperty(id),
    onSuccess: () => {
      setDeleteConfirm(null);
      refetchList();
      alert("Property deleted successfully!");
    },
    onError: (error: any) => {
      alert(`Failed to delete property: ${error.message}`);
    },
  });

  const resetForm = () => {
   setFormData({
     ref: "",
     title: "",
     type: "",
     category: "",
     listing_type: "sale",
     price: 0,
     period: null,
     area: "",
     district: "",
     region: "",
     beds: 0,
     baths: 0,
     toilets: 0,
     parking: 0,
     plot_size: "",
     size_sqm: 0,
     description: "",
     features: [],
     images: [],
     serviced: false,
     furnished: false,
     shared: false,
     added_days_ago: 0,
     photo_count: 0,
     video_url: null,
     badge: "",
     agent_id: "amdern-main",
     status: "active",
     moderation_status: "approved",
   });
  };

  const handleEdit = (prop: AdminProperty) => {
    const property = prop as any;
    setEditingId(prop.id);
    setIsCreating(false);
    setFormData({
      ref: property.ref ?? "",
      title: property.title ?? "",
      type: property.propertyType ?? property.type ?? "",
      category: String(property.category ?? "").toLowerCase(),
      listing_type: String(property.listingType ?? "sale").toLowerCase(),
      price: Number(property.price ?? 0),
      period: property.period ?? null,
      area: property.area ?? "",
      district: property.district ?? "",
      region: property.region ?? "",
      beds: Number(property.bedrooms ?? 0),
      baths: Number(property.bathrooms ?? 0),
      toilets: Number(property.toilets ?? 0),
      parking: Number(property.parking ?? 0),
      plot_size: property.plotSize ?? "",
      size_sqm: Number(property.sizeSqm ?? 0),
      description: property.description ?? "",
      features: Array.isArray(property.features) ? property.features : [],
      images: Array.isArray(property.images)
        ? property.images.map((image: any) => typeof image === "string" ? image : image.imageUrl || image.url || "").filter(Boolean)
        : property.image
          ? [property.image]
          : [],
      serviced: !!property.serviced,
      furnished: !!property.furnished,
      shared: !!property.shared,
      added_days_ago: Number(property.added_days_ago ?? 0),
      photo_count: Number(property.photo_count ?? 0),
      video_url: property.video_url ?? null,
      badge: property.badge ?? "",
      agent_id: property.agent_id ?? "amdern-main",
      status: property.status ?? "active",
      moderation_status: property.moderationStatus ?? "approved",
    });
  };

  const handleCreate = () => {
    if (!formData.category) {
      alert("Category is required! Please select a category before saving.");
      return;
    }

    if (!formData.title) {
      alert("Title is required!");
      return;
    }

    const primaryImage = formData.images[0] ?? "";
    const apiInput = {
      title: formData.title,
      price: formData.price,
      category: formData.category,
      listingType: formData.listing_type,
      description: formData.description,
      propertyType: formData.type,
      district: formData.district,
      area: formData.area,
      region: formData.region,
      bedrooms: formData.beds,
      bathrooms: formData.baths,
      toilets: formData.toilets,
      parking: formData.parking,
      sizeSqm: formData.size_sqm,
      status: formData.status,
      moderationStatus: formData.moderation_status,
      features: formData.features,
      period: formData.period ?? undefined,
      badge: formData.badge || undefined,
      videoUrl: formData.video_url ?? undefined,
      images: formData.images.map((imageUrl, index) => ({
        imageUrl,
        webpUrl: imageUrl,
        thumbUrl: imageUrl,
        isPrimary: !primaryImage ? false : imageUrl === primaryImage && index === 0,
        sortOrder: index,
      })),
    };

    createMutation.mutate(apiInput as any);
  };

  const handleSaveEdit = (editingProp: AdminProperty) => {
    if (!formData.category) {
      alert("Category is required!");
      return;
    }

    // Check if category is changing — requires explicit confirmation
    if (formData.category !== (editingProp.category ?? "").toLowerCase()) {
      setCategoryChangeConfirm({
        id: editingProp.id,
        oldCategory: editingProp.category ?? "",
        newCategory: formData.category,
      });
      return;
    }

    const primaryImage = formData.images[0] ?? "";
    const apiInput = {
      title: formData.title,
      price: formData.price,
      category: formData.category,
      listingType: formData.listing_type,
      description: formData.description,
      propertyType: formData.type,
      district: formData.district,
      area: formData.area,
      region: formData.region,
      bedrooms: formData.beds,
      bathrooms: formData.baths,
      toilets: formData.toilets,
      parking: formData.parking,
      sizeSqm: formData.size_sqm,
      status: formData.status,
      moderationStatus: formData.moderation_status,
      features: formData.features,
      period: formData.period ?? undefined,
      badge: formData.badge || undefined,
      videoUrl: formData.video_url ?? undefined,
      images: formData.images.map((imageUrl, index) => ({
        imageUrl,
        webpUrl: imageUrl,
        thumbUrl: imageUrl,
        isPrimary: !primaryImage ? false : imageUrl === primaryImage && index === 0,
        sortOrder: index,
      })),
    };

    updateMutation.mutate({
      id: editingProp.id,
      updates: apiInput,
    });
  };

  const confirmCategoryChange = () => {
    if (!categoryChangeConfirm) return;

    const primaryImage = formData.images[0] ?? "";
    const apiInput = {
      title: formData.title,
      price: formData.price,
      category: formData.category,
      listingType: formData.listing_type,
      description: formData.description,
      propertyType: formData.type,
      district: formData.district,
      area: formData.area,
      region: formData.region,
      bedrooms: formData.beds,
      bathrooms: formData.baths,
      toilets: formData.toilets,
      parking: formData.parking,
      sizeSqm: formData.size_sqm,
      status: formData.status,
      moderationStatus: formData.moderation_status,
      features: formData.features,
      period: formData.period ?? undefined,
      badge: formData.badge || undefined,
      videoUrl: formData.video_url ?? undefined,
      images: formData.images.map((imageUrl, index) => ({
        imageUrl,
        webpUrl: imageUrl,
        thumbUrl: imageUrl,
        isPrimary: !primaryImage ? false : imageUrl === primaryImage && index === 0,
        sortOrder: index,
      })),
    };

    updateMutation.mutate({
      id: categoryChangeConfirm.id,
      updates: apiInput,
    });
  };

  const handleDelete = (prop: AdminProperty) => {
    setDeleteConfirm(prop.id);
  };

  const confirmDelete = () => {
   if (!deleteConfirm) return;
   deleteMutation.mutate(deleteConfirm);
  };

  const properties = listData?.properties || [];

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Properties Management</h1>
          <p className="text-gray-500 mt-1">Manage property listings with strict category isolation</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Property
        </Button>
      </div>

      {/* FORM: Create / Edit */}
      {(isCreating || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Property" : "Create New Property"}</CardTitle>
            <CardDescription>
              ⚠️ Category is required and strictly enforced. You cannot accidentally move a property to the wrong category.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ref */}
              <div>
                <Label htmlFor="ref">Reference (AMD****)</Label>
                <Input
                  id="ref"
                  value={formData.ref}
                  onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                  placeholder="e.g., AMD1001"
                />
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Property title"
                />
              </div>

              {/* Type */}
              <div>
                <Label htmlFor="type">Property Type</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g., Detached House"
                />
              </div>

              {/* CATEGORY - STRICT ENFORCEMENT */}
              <div>
                <Label htmlFor="category" className="font-bold text-red-600">
                  ⚠️ Category (REQUIRED)
                </Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!formData.category && <p className="text-red-600 text-sm mt-1">Category is required!</p>}
              </div>

              {/* Listing Type */}
              <div>
                <Label htmlFor="listing_type">Listing Type</Label>
                <Select value={formData.listing_type} onValueChange={(value: any) => setFormData({ ...formData, listing_type: value })}>
                  <SelectTrigger id="listing_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LISTING_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div>
                <Label htmlFor="price">Price (UGX)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>

              {/* Area */}
              <div>
                <Label htmlFor="area">Area / Neighborhood</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g., Kyaliwajjala"
                />
              </div>

              {/* District */}
              <div>
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g., Wakiso"
                />
              </div>

              {/* Region */}
              <div>
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="e.g., Central Region"
                />
              </div>

              {/* Beds, Baths, Toilets, Parking */}
              <div>
                <Label htmlFor="beds">Bedrooms</Label>
                <Input
                  id="beds"
                  type="number"
                  value={formData.beds}
                  onChange={(e) => setFormData({ ...formData, beds: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="baths">Bathrooms</Label>
                <Input
                  id="baths"
                  type="number"
                  value={formData.baths}
                  onChange={(e) => setFormData({ ...formData, baths: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="toilets">Toilets</Label>
                <Input
                  id="toilets"
                  type="number"
                  value={formData.toilets}
                  onChange={(e) => setFormData({ ...formData, toilets: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="parking">Parking Spaces</Label>
                <Input
                  id="parking"
                  type="number"
                  value={formData.parking}
                  onChange={(e) => setFormData({ ...formData, parking: Number(e.target.value) })}
                />
              </div>

              {/* Plot Size */}
              <div>
                <Label htmlFor="plot_size">Plot Size</Label>
                <Input
                  id="plot_size"
                  value={formData.plot_size}
                  onChange={(e) => setFormData({ ...formData, plot_size: e.target.value })}
                  placeholder="e.g., 13 Decimals"
                />
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Property description"
              />
            </div>

            <div className="space-y-3">
              <Label>Property Photos</Label>
              <AdminPhotoUpload
                listingId={editingId || undefined}
                existingImages={formData.images}
                onImagesChange={(urls) => setFormData({ ...formData, images: urls })}
                maxFiles={20}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              {editingId && (
                <Button
                  onClick={() => handleSaveEdit(properties.find((p: AdminProperty) => p.id === editingId)!)}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              )}
              {isCreating && (
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Property"}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TABLE: Properties List */}
      <Card>
        <CardHeader>
          <CardTitle>All Properties ({properties.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <p className="text-gray-500">No properties yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Photo</th>
                    <th className="text-left py-2 px-2">Ref</th>
                    <th className="text-left py-2 px-2">Title</th>
                    <th className="text-left py-2 px-2">Category</th>
                    <th className="text-left py-2 px-2">Price</th>
                    <th className="text-left py-2 px-2">Location</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                   {properties.map((prop: AdminProperty) => (
                     <tr key={prop.id} className="border-b hover:bg-gray-50">
                       <td className="py-2 px-2">
                         {prop.image ? (
                           <img
                             src={prop.image}
                             alt={prop.title}
                             className="h-10 w-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                             onClick={() => setExpandedPhoto({
                               url: prop.image as string,
                               propertyTitle: prop.title
                             })}
                             onError={(e) => {
                               (e.target as HTMLImageElement).src =
                                 "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%236b7280' font-size='16'%3EImage not found%3C/text%3E%3C/svg%3E";
                             }}
                           />
                         ) : (
                           <div className="h-10 w-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                             No image
                           </div>
                         )}
                       </td>
                       <td className="py-2 px-2 font-mono text-xs">{prop.slug}</td>
                       <td className="py-2 px-2 max-w-xs truncate">{prop.title}</td>
                      <td className="py-2 px-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{prop.category}</span>
                      </td>
                      <td className="py-2 px-2">UGX {(prop.price / 1000000).toFixed(0)}M</td>
                      <td className="py-2 px-2 text-xs">{prop.area}</td>
                      <td className="py-2 px-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${prop.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100"}`}>
                          {prop.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(prop)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(prop)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ALERT: Category Change Confirmation */}
      <AlertDialog open={!!categoryChangeConfirm} onOpenChange={(open) => !open && setCategoryChangeConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>⚠️ Category Change Detected</AlertDialogTitle>
          <AlertDialogDescription>
            You are changing the category from <strong>{categoryChangeConfirm?.oldCategory}</strong> to <strong>{categoryChangeConfirm?.newCategory}</strong>.
            <br />
            <br />
            This property will move from one section to another:
            <ul className="list-disc ml-4 mt-2">
              <li>
                <strong>Old Category:</strong> The property will no longer appear on the {categoryChangeConfirm?.oldCategory} page
              </li>
              <li>
                <strong>New Category:</strong> The property will now appear ONLY on the {categoryChangeConfirm?.newCategory} page
              </li>
            </ul>
            <br />
            <strong>Are you absolutely sure?</strong>
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCategoryChange} className="bg-red-600 hover:bg-red-700">
              Yes, Change Category
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* ALERT: Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Property?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. All images and data associated with this property will be permanently deleted.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* LIGHTBOX: Expanded Photo Modal */}
      {expandedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setExpandedPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setExpandedPhoto(null)}
              className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg"
              title="Close (or press Escape)"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Image Container */}
            <div className="flex flex-col h-full">
              <img
                src={expandedPhoto.url}
                alt={expandedPhoto.propertyTitle}
                className="w-full h-auto max-h-[75vh] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='16'%3EImage not found%3C/text%3E%3C/svg%3E";
                }}
              />

              {/* Property Title & Close Button */}
              <div className="bg-gray-100 p-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">{expandedPhoto.propertyTitle}</p>
                <button
                  onClick={() => setExpandedPhoto(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    );
}
