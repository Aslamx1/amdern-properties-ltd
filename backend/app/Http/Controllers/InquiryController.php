<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InquiryController extends Controller
{
    /**
     * Store a newly created inquiry.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'sender_name' => 'required|string|max:255',
            'sender_email' => 'required|email|max:255',
            'sender_phone' => 'nullable|string|max:20',
            'message' => 'required|string',
        ]);

        $validated['seeker_id'] = $request->user()?->id;

        $inquiry = Inquiry::create($validated);
        $inquiry->load(['property', 'seeker']);

        return response()->json([
            'message' => 'Your inquiry has been sent successfully',
            'data' => $inquiry,
        ], 201);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Inquiry::with(['property', 'seeker']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $inquiries = $query->latest()->paginate(20);

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
     * Update the specified inquiry.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $inquiry = Inquiry::find($id);

        if (!$inquiry) {
            return response()->json(['message' => 'Inquiry not found'], 404);
        }

        $validated = $request->validate([
            'status' => 'required|in:unread,read,replied',
        ]);

        $inquiry->update($validated);
        $inquiry->load(['property', 'seeker']);

        return response()->json([
            'message' => 'Inquiry updated successfully',
            'data' => $inquiry,
        ]);
    }
}