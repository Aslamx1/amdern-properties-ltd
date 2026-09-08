@extends('layouts.admin')

@section('title', 'Property Details')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <h1>Property Details</h1>
    <div>
        <a href="{{ route('admin.properties.edit', $property->id) }}" class="btn btn-warning">
            <i class="bi bi-pencil"></i> Edit
        </a>
        <a href="{{ route('admin.properties.index') }}" class="btn btn-secondary">Back</a>
    </div>
</div>

<div class="row">
    <div class="col-md-8">
        <div class="card">
            <div class="card-header">
                <h4>{{ $property->title }}</h4>
            </div>
            <div class="card-body">
                @if($property->images->count() > 0)
                    <div class="mb-3">
                        <img src="{{ $property->images->first()->image_url }}" class="img-fluid rounded" style="max-height: 400px; width: 100%; object-fit: cover;">
                    </div>
                    <div class="row">
                        @foreach($property->images as $image)
                            <div class="col-md-3 mb-2">
                                <img src="{{ $image->image_url }}" class="img-fluid rounded" style="height: 100px; width: 100%; object-fit: cover;">
                            </div>
                        @endforeach
                    </div>
                @endif

                <div class="mt-3">
                    <h5>Description</h5>
                    <p>{{ $property->description ?? 'No description provided' }}</p>
                </div>

                <div class="row mt-3">
                    <div class="col-md-3">
                        <strong>Price:</strong><br>
                        USh {{ number_format($property->price) }}
                    </div>
                    <div class="col-md-3">
                        <strong>Type:</strong><br>
                        {{ ucfirst($property->property_type) }}
                    </div>
                    <div class="col-md-3">
                        <strong>Listing:</strong><br>
                        {{ ucfirst(str_replace('_', ' ', $property->listing_type)) }}
                    </div>
                    <div class="col-md-3">
                        <strong>Status:</strong><br>
                        <span class="badge bg-{{ $property->status === 'active' ? 'success' : ($property->status === 'pending' ? 'warning' : 'secondary') }}">
                            {{ ucfirst($property->status) }}
                        </span>
                    </div>
                </div>

                <div class="row mt-3">
                    <div class="col-md-3">
                        <strong>Bedrooms:</strong> {{ $property->bedrooms }}
                    </div>
                    <div class="col-md-3">
                        <strong>Bathrooms:</strong> {{ $property->bathrooms }}
                    </div>
                    <div class="col-md-3">
                        <strong>Toilets:</strong> {{ $property->toilets ?? 0 }}
                    </div>
                    <div class="col-md-3">
                        <strong>Parking:</strong> {{ $property->parking ?? 0 }}
                    </div>
                </div>

                <div class="row mt-3">
                    <div class="col-md-6">
                        <strong>Address:</strong><br>
                        {{ $property->address ?? 'N/A' }}
                    </div>
                    <div class="col-md-6">
                        <strong>Location:</strong><br>
                        {{ $property->city }}, {{ $property->district }}
                    </div>
                </div>

                @if($property->features)
                    <div class="mt-3">
                        <strong>Features:</strong><br>
                        @foreach(is_array($property->features) ? $property->features : explode(',', $property->features) as $feature)
                            <span class="badge bg-secondary me-1">{{ trim($feature) }}</span>
                        @endforeach
                    </div>
                @endif
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card">
            <div class="card-header">
                <h5>Property Information</h5>
            </div>
            <div class="card-body">
                <p><strong>Ref:</strong> {{ $property->ref ?? 'AMD' . str_pad($property->id, 4, '0', STR_PAD_LEFT) }}</p>
                <p><strong>Agent/Owner:</strong> {{ $property->user->name ?? 'N/A' }}</p>
                <p><strong>Email:</strong> {{ $property->user->email ?? 'N/A' }}</p>
                <p><strong>Phone:</strong> {{ $property->user->phone ?? 'N/A' }}</p>
                <p><strong>Created:</strong> {{ $property->created_at->format('M d, Y H:i') }}</p>
                <p><strong>Updated:</strong> {{ $property->updated_at->format('M d, Y H:i') }}</p>
                <p><strong>Verified:</strong> {{ $property->is_verified ? 'Yes' : 'No' }}</p>
            </div>
        </div>

        <div class="card mt-3">
            <div class="card-header">
                <h5>Inquiries ({{ $property->inquiries->count() }})</h5>
            </div>
            <div class="card-body">
                @forelse($property->inquiries->take(5) as $inquiry)
                    <div class="border-bottom pb-2 mb-2">
                        <strong>{{ $inquiry->sender_name }}</strong><br>
                        <small class="text-muted">{{ $inquiry->sender_email }}</small><br>
                        <small>{{ Str::limit($inquiry->message, 50) }}</small>
                    </div>
                @empty
                    <p class="text-muted">No inquiries yet</p>
                @endforelse
            </div>
        </div>
    </div>
</div>
@endsection