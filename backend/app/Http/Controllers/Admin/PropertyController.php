<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\User;
use App\Models\Role;
use App\Models\Inquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PropertyController extends Controller
{
    /**
     * Display a listing of properties.
     */
    public function index(Request $request)
    {
        $query = Property::with(['user', 'images']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('ref', 'LIKE', "%{$search}%")
                  ->orWhere('address', 'LIKE', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by listing type
        if ($request->has('listing_type')) {
            $query->where('listing_type', $request->listing_type);
        }

        // Filter by property type
        if ($request->has('property_type')) {
            $query->where('property_type', $request->property_type);
        }

        // Filter by district
        if ($request->has('district')) {
            $query->where('district', $request->district);
        }

        $properties = $query->latest()->paginate(20);

        // Get filter options
        $districts = Property::distinct()->pluck('district')->filter()->sort()->values();
        $propertyTypes = ['apartment', 'house', 'land', 'commercial'];
        $listingTypes = ['for_sale', 'for_rent'];
        $statuses = ['active', 'pending', 'sold', 'draft'];

        return view('admin.properties.index', compact('properties', 'districts', 'propertyTypes', 'listingTypes', 'statuses'));
    }

    /**
     * Show the form for creating a new property.
     */
    public function create()
    {
        $users = User::whereHas('role', function ($q) {
            $q->whereIn('name', ['Estate Agent', 'Property Developer', 'Property Owner']);
        })->get();

        return view('admin.properties.create', compact('users'));
    }

    /**
     * Store a newly created property.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'listing_type' => 'required|in:for_sale,for_rent',
            'property_type' => 'required|in:apartment,house,land,commercial',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'toilets' => 'nullable|integer|min:0',
            'parking' => 'nullable|integer|min:0',
            'plot_size' => 'nullable|string|max:100',
            'size_sqm' => 'nullable|numeric|min:0',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'district' => 'nullable|string',
            'area' => 'nullable|string',
            'features' => 'nullable|array',
            'serviced' => 'boolean',
            'furnished' => 'boolean',
            'shared' => 'boolean',
            'status' => 'required|in:active,pending,sold,draft',
            'user_id' => 'required|exists:users,id',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . time();
        $validated['is_verified'] = false;
        $validated['moderation_status'] = 'approved';

        if ($request->has('latitude') && $request->has('longitude')) {
            $validated['location'] = [$request->longitude, $request->latitude];
        }

        $property = Property::create($validated);

        // Handle image uploads
        if ($request->hasFile('images')) {
            $this->handleImageUploads($property, $request->file('images'));
        }

        return redirect()->route('admin.properties.index')->with('success', 'Property created successfully.');
    }

    /**
     * Display the specified property.
     */
    public function show($id)
    {
        $property = Property::with(['user', 'images', 'inquiries'])->findOrFail($id);

        return view('admin.properties.show', compact('property'));
    }

    /**
     * Show the form for editing the property.
     */
    public function edit($id)
    {
        $property = Property::with('images')->findOrFail($id);
        $users = User::whereHas('role', function ($q) {
            $q->whereIn('name', ['Estate Agent', 'Property Developer', 'Property Owner']);
        })->get();

        return view('admin.properties.edit', compact('property', 'users'));
    }

    /**
     * Update the specified property.
     */
    public function update(Request $request, $id)
    {
        $property = Property::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'listing_type' => 'required|in:for_sale,for_rent',
            'property_type' => 'required|in:apartment,house,land,commercial',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'toilets' => 'nullable|integer|min:0',
            'parking' => 'nullable|integer|min:0',
            'plot_size' => 'nullable|string|max:100',
            'size_sqm' => 'nullable|numeric|min:0',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'district' => 'nullable|string',
            'area' => 'nullable|string',
            'features' => 'nullable|array',
            'serviced' => 'boolean',
            'furnished' => 'boolean',
            'shared' => 'boolean',
            'status' => 'required|in:active,pending,sold,draft',
            'user_id' => 'required|exists:users,id',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        if ($request->has('latitude') && $request->has('longitude')) {
            $validated['location'] = [$request->longitude, $request->latitude];
        }

        $property->update($validated);

        // Handle new image uploads
        if ($request->hasFile('images')) {
            $this->handleImageUploads($property, $request->file('images'));
        }

        return redirect()->route('admin.properties.index')->with('success', 'Property updated successfully.');
    }

    /**
     * Remove the specified property.
     */
    public function destroy($id)
    {
        $property = Property::findOrFail($id);
        $property->delete();

        return redirect()->route('admin.properties.index')->with('success', 'Property deleted successfully.');
    }

    /**
     * Handle image uploads for a property.
     */
    private function handleImageUploads(Property $property, $images)
    {
        foreach ($images as $index => $image) {
            $path = $image->store('property-media/' . $property->id, 'public');
            $url = Storage::url($path);

            PropertyImage::create([
                'property_id' => $property->id,
                'image_url' => $url,
                'image_path' => $path,
                'is_primary' => $index === 0,
                'sort_order' => $index,
            ]);
        }
    }

    /**
     * Delete a property image.
     */
    public function deleteImage($imageId)
    {
        $image = PropertyImage::findOrFail($imageId);

        // Delete file from storage
        if (Storage::disk('public')->exists($image->image_path)) {
            Storage::disk('public')->delete($image->image_path);
        }

        $image->delete();

        return back()->with('success', 'Image deleted successfully.');
    }

    /**
     * Set primary image.
     */
    public function setPrimaryImage($imageId)
    {
        $image = PropertyImage::findOrFail($imageId);

        // Remove primary status from other images
        PropertyImage::where('property_id', $image->property_id)
            ->update(['is_primary' => false]);

        // Set this image as primary
        $image->update(['is_primary' => true]);

        return back()->with('success', 'Primary image updated.');
    }
}