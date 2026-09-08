@extends('layouts.admin')

@section('title', 'Dashboard')

@section('content')
<div class="row">
    <div class="col-md-3">
        <div class="stats-card">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <p class="mb-0">Total Properties</p>
                    <div class="stats-number">{{ number_format($stats['total_properties']) }}</div>
                </div>
                <i class="bi bi-house" style="font-size: 3rem; opacity: 0.5;"></i>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="stats-card blue">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <p class="mb-0">Active Properties</p>
                    <div class="stats-number">{{ number_format($stats['active_properties']) }}</div>
                </div>
                <i class="bi bi-check-circle" style="font-size: 3rem; opacity: 0.5;"></i>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="stats-card green">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <p class="mb-0">Total Users</p>
                    <div class="stats-number">{{ number_format($stats['total_users']) }}</div>
                </div>
                <i class="bi bi-people" style="font-size: 3rem; opacity: 0.5;"></i>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="stats-card orange">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <p class="mb-0">Total Inquiries</p>
                    <div class="stats-number">{{ number_format($stats['total_inquiries']) }}</div>
                </div>
                <i class="bi bi-envelope" style="font-size: 3rem; opacity: 0.5;"></i>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-3">
        <div class="stats-card purple">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <p class="mb-0">Unread Inquiries</p>
                    <div class="stats-number">{{ number_format($stats['unread_inquiries']) }}</div>
                </div>
                <i class="bi bi-envelope-open" style="font-size: 3rem; opacity: 0.5;"></i>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="stats-card">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <p class="mb-0">Sold Properties</p>
                    <div class="stats-number">{{ number_format($stats['sold_properties']) }}</div>
                </div>
                <i class="bi bi-trophy" style="font-size: 3rem; opacity: 0.5;"></i>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="stats-card blue">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <p class="mb-0">New Today</p>
                    <div class="stats-number">{{ number_format($stats['new_inquiries_today']) }}</div>
                </div>
                <i class="bi bi-calendar-check" style="font-size: 3rem; opacity: 0.5;"></i>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="stats-card green">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <p class="mb-0">This Month</p>
                    <div class="stats-number">{{ number_format($stats['properties_this_month']) }}</div>
                </div>
                <i class="bi bi-calendar-month" style="font-size: 3rem; opacity: 0.5;"></i>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-8">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span>Recent Properties</span>
                <a href="{{ route('admin.properties.index') }}" class="btn btn-sm btn-primary">View All</a>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Ref</th>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($recentProperties as $property)
                                <tr>
                                    <td>{{ $property->ref ?? 'N/A' }}</td>
                                    <td>{{ $property->title }}</td>
                                    <td>{{ ucfirst($property->property_type) }}</td>
                                    <td>USh {{ number_format($property->price) }}</td>
                                    <td>
                                        <span class="badge bg-{{ $property->status === 'active' ? 'success' : ($property->status === 'pending' ? 'warning' : 'secondary') }}">
                                            {{ ucfirst($property->status) }}
                                        </span>
                                    </td>
                                    <td>{{ $property->created_at->format('M d, Y') }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="text-center text-muted">No properties found</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span>Recent Inquiries</span>
                <a href="{{ route('admin.inquiries.index') }}" class="btn btn-sm btn-primary">View All</a>
            </div>
            <div class="card-body">
                @forelse($recentInquiries as $inquiry)
                    <div class="d-flex justify-content-between align-items-start mb-3 pb-3 border-bottom">
                        <div>
                            <h6 class="mb-1">{{ $inquiry->sender_name }}</h6>
                            <p class="mb-1 text-muted small">{{ $inquiry->sender_email }}</p>
                            <p class="mb-0 small">{{ Str::limit($inquiry->message, 50) }}</p>
                        </div>
                        <span class="badge bg-{{ $inquiry->status === 'unread' ? 'danger' : ($inquiry->status === 'read' ? 'warning' : 'success') }}">
                            {{ ucfirst($inquiry->status) }}
                        </span>
                    </div>
                @empty
                    <p class="text-center text-muted">No inquiries yet</p>
                @endforelse
            </div>
        </div>
    </div>
</div>

<div class="row mt-4">
    <div class="col-md-6">
        <div class="card">
            <div class="card-header">Properties by Type</div>
            <div class="card-body">
                @forelse($propertiesByType as $type)
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span>{{ ucfirst($type->property_type) }}</span>
                        <span class="badge bg-primary">{{ $type->count }}</span>
                    </div>
                @empty
                    <p class="text-muted">No data available</p>
                @endforelse
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="card">
            <div class="card-header">Properties by District</div>
            <div class="card-body">
                @forelse($propertiesByDistrict as $district)
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span>{{ $district->district }}</span>
                        <span class="badge bg-info">{{ $district->count }}</span>
                    </div>
                @empty
                    <p class="text-muted">No data available</p>
                @endforelse
            </div>
        </div>
    </div>
</div>
@endsection