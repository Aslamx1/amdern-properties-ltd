<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\Inquiry;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index()
    {
        // Real statistics from database
        $stats = [
            'total_properties' => Property::count(),
            'active_properties' => Property::where('status', 'active')->count(),
            'pending_properties' => Property::where('status', 'pending')->count(),
            'sold_properties' => Property::where('status', 'sold')->count(),
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'total_inquiries' => Inquiry::count(),
            'unread_inquiries' => Inquiry::where('status', 'unread')->count(),
            'new_inquiries_today' => Inquiry::whereDate('created_at', today())->count(),
            'properties_this_month' => Property::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];

        // Recent properties
        $recentProperties = Property::with(['user', 'images'])
            ->latest()
            ->limit(10)
            ->get();

        // Recent inquiries
        $recentInquiries = Inquiry::with(['property', 'seeker'])
            ->latest()
            ->limit(10)
            ->get();

        // Properties by type
        $propertiesByType = Property::select('property_type', \Illuminate\Support\Facades\DB::raw('COUNT(*) as count'))
            ->groupBy('property_type')
            ->get();

        // Properties by listing type
        $propertiesByListingType = Property::select('listing_type', \Illuminate\Support\Facades\DB::raw('COUNT(*) as count'))
            ->groupBy('listing_type')
            ->get();

        // Properties by district
        $propertiesByDistrict = Property::select('district', \Illuminate\Support\Facades\DB::raw('COUNT(*) as count'))
            ->where('district', '!=', null)
            ->groupBy('district')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        // Users by role
        $usersByRole = User::select('role_id', \Illuminate\Support\Facades\DB::raw('COUNT(*) as count'))
            ->groupBy('role_id')
            ->with('role')
            ->get();

        // Price statistics
        $priceStats = [
            'avg_price' => Property::where('status', 'active')->avg('price'),
            'min_price' => Property::where('status', 'active')->min('price'),
            'max_price' => Property::where('status', 'active')->max('price'),
        ];

        return view('admin.dashboard', compact(
            'stats',
            'recentProperties',
            'recentInquiries',
            'propertiesByType',
            'propertiesByListingType',
            'propertiesByDistrict',
            'usersByRole',
            'priceStats'
        ));
    }
}