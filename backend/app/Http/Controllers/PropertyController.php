<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Inquiry;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PropertyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Property::with(['images', 'user'])
            ->active();

        // Filter by listing type
        if ($request->has('listing_type')) {
            $query->listingType($request->listing_type);
        }

        // Filter by property type
        if ($request->has('property_type')) {
            $query->propertyType($request->property_type);
        }

        // Filter by district
        if ($request->has('district')) {
            $query->district($request->district);
        }

        // Filter by city
        if ($request->has('city')) {
            $query->city($request->city);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Spatial query - properties within X km radius
        if ($request->has(['lat', 'lng', 'radius'])) {
            $query->withinDistance(
                $request->lat,
                $request->lng,
                $request->radius
            );
        }

        // Search by text
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%")
                  ->orWhere('description', 'ILIKE', "%{$search}%")
                  ->orWhere('address', 'ILIKE', "%{$search}%");
            });
        }

        // Verified only
        if ($request->boolean('verified')) {
            $query->verified();
        }

        // Pagination
        $limit = min($request->limit ?? 20, 100);
        $properties = $query->latest()->paginate($limit);

        return response()->json([
            'data' => $properties->items(),
            'meta' => [
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
            ],
        ]);
    }

    /**
     * Store a newly created resource.
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
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'district' => 'nullable|string',
            'amenities' => 'nullable|array',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $validated['user_id'] = $request->user()->id;

        if ($request->has('latitude') && $request->has('longitude')) {
            $validated['location'] = [$request->longitude, $request->latitude];
        }

        $property = Property::create($validated);
        $property->load(['images', 'user']);

        return response()->json([
            'message' => 'Property created successfully',
            'data' => $property,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $property = Property::with(['images', 'user', 'inquiries'])
            ->find($id);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        return response()->json(['data' => $property]);
    }

    /**
     * Update the specified resource.
     */
    public function update(Request $request, $id)
    {
        $property = Property::find($id);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        if ($property->user_id !== $request->user()->id && !$request->user()->hasRole('Admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'currency' => 'sometimes|string|size:3',
            'listing_type' => 'sometimes|in:for_sale,for_rent',
            'property_type' => 'sometimes|in:apartment,house,land,commercial',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'district' => 'nullable|string',
            'amenities' => 'nullable|array',
            'is_verified' => 'sometimes|boolean',
            'status' => 'sometimes|in:active,pending,sold',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        if ($request->has('latitude') && $request->has('longitude')) {
            $validated['location'] = [$request->longitude, $request->latitude];
        }

        $property->update($validated);
        $property->load(['images', 'user']);

        return response()->json([
            'message' => 'Property updated successfully',
            'data' => $property,
        ]);
    }

    /**
     * Remove the specified resource.
     */
    public function destroy(Request $request, $id)
    {
        $property = Property::find($id);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        if ($property->user_id !== $request->user()->id && !$request->user()->hasRole('Admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $property->delete();

        return response()->json(['message' => 'Property deleted successfully']);
    }
}