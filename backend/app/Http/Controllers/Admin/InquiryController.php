<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    /**
     * Display a listing of inquiries.
     */
    public function index(Request $request)
    {
        $query = Inquiry::with(['property', 'seeker']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('sender_name', 'LIKE', "%{$search}%")
                  ->orWhere('sender_email', 'LIKE', "%{$search}%")
                  ->orWhere('message', 'LIKE', "%{$search}%");
            });
        }

        $inquiries = $query->latest()->paginate(20);
        $statuses = ['unread', 'read', 'replied'];

        return view('admin.inquiries.index', compact('inquiries', 'statuses'));
    }

    /**
     * Display the specified inquiry.
     */
    public function show($id)
    {
        $inquiry = Inquiry::with(['property', 'seeker'])->findOrFail($id);

        // Mark as read if unread
        if ($inquiry->status === 'unread') {
            $inquiry->update(['status' => 'read']);
        }

        return view('admin.inquiries.show', compact('inquiry'));
    }

    /**
     * Update inquiry status.
     */
    public function update(Request $request, $id)
    {
        $inquiry = Inquiry::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:unread,read,replied',
        ]);

        $inquiry->update($validated);

        return back()->with('success', 'Inquiry status updated.');
    }

    /**
     * Remove the specified inquiry.
     */
    public function destroy($id)
    {
        $inquiry = Inquiry::findOrFail($id);
        $inquiry->delete();

        return redirect()->route('admin.inquiries.index')->with('success', 'Inquiry deleted successfully.');
    }
}