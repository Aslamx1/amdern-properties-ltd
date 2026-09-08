<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Inquiry;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AgentDashboardController extends Controller
{
    /**
     * Display agent dashboard.
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $stats = [
            'total_properties' => Property::where('user_id', $user->id)->count(),
            'active_properties' => Property::where('user_id', $user->id)->where('status', 'active')->count(),
            'pending_properties' => Property::where('user_id', $user->id)->where('status', 'pending')->count(),
            'sold_properties' => Property::where('user_id', $user->id)->where('status', 'sold')->count(),
            'total_inquiries' => Inquiry::whereHas('property', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->count(),
            'unread_inquiries' => Inquiry::whereHas('property', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->where('status', 'unread')->count(),
        ];

        $recent_inquiries = Inquiry::whereHas('property', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->with(['property', 'seeker'])->latest()->limit(5)->get();

        return response()->json([
            'stats' => $stats,
            'recent_inquiries' => $recent_inquiries,
        ]);
    }

    /**
     * Display agent's properties.
     */
    public function properties(Request $request): JsonResponse
    {
        $properties = Property::where('user_id', $request->user()->id)
            ->with(['images'])
            ->latest()
            ->paginate(20);

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
     * Display agent's inquiries.
     */
    public function inquiries(Request $request): JsonResponse
    {
        $inquiries = Inquiry::whereHas('property', function ($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })->with(['property', 'seeker'])->latest()->paginate(20);

        return response()->json([
            'data' => $inquiries->items(),
            'meta' => [
                'current_page' => $inquiries->currentPage(),
                'last_page' => $inquiries->lastPage(),
                'per_page' => $inquiries->perPage(),
                'total' => $inquiries->total(),
            ],
        ]);
    }

    /**
     * Show form for creating a new property.
     */
    public function createProperty()
    {
        return response()->json(['message' => 'Property creation form']);
    }

    /**
     * Store a newly created property.
     */
    public function storeProperty(Request $request): JsonResponse
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

        return response()->json([
            'message' => 'Property created successfully',
            'data' => $property->load('images'),
        ], 201);
    }

    /**
     * Show form for editing a property.
     */
    public function editProperty($id): JsonResponse
    {
        $property = Property::where('user_id', auth()->id())->with('images')->find($id);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        return response()->json(['data' => $property]);
    }

    /**
     * Update the specified property.
     */
    public function updateProperty(Request $request, $id): JsonResponse
    {
        $property = Property::where('user_id', $request->user()->id)->find($id);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
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

        return response()->json([
            'message' => 'Property updated successfully',
            'data' => $property->load('images'),
        ]);
    }

    /**
     * Delete a property.
     */
    public function deleteProperty(Request $request, $id): JsonResponse
    {
        $property = Property::where('user_id', $request->user()->id)->find($id);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        $property->delete();

        return response()->json(['message' => 'Property deleted successfully']);
    }
}