@extends('layouts.admin')

@section('title', 'Inquiry Details')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <h1>Inquiry #{{ $inquiry->id }}</h1>
    <div>
        <a href="{{ route('admin.inquiries.index') }}" class="btn btn-secondary">Back to Inquiries</a>
    </div>
</div>

<div class="row">
    <div class="col-md-8">
        <div class="card">
            <div class="card-header">
                <h4>Inquiry Details</h4>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <strong>Sender Name:</strong><br>
                        {{ $inquiry->sender_name }}
                    </div>
                    <div class="col-md-6 mb-3">
                        <strong>Email:</strong><br>
                        <a href="mailto:{{ $inquiry->sender_email }}">{{ $inquiry->sender_email }}</a>
                    </div>
                    <div class="col-md-6 mb-3">
                        <strong>Phone:</strong><br>
                        @if($inquiry->sender_phone)
                            <a href="tel:{{ $inquiry->sender_phone }}">{{ $inquiry->sender_phone }}</a>
                        @else
                            <span class="text-muted">Not provided</span>
                        @endif
                    </div>
                    <div class="col-md-6 mb-3">
                        <strong>Status:</strong><br>
                        <span class="badge bg-{{ $inquiry->status === 'unread' ? 'danger' : ($inquiry->status === 'read' ? 'warning' : 'success') }}">
                            {{ ucfirst($inquiry->status) }}
                        </span>
                    </div>
                    <div class="col-md-6 mb-3">
                        <strong>Property:</strong><br>
                        @if($inquiry->property)
                            <a href="{{ route('admin.properties.show', $inquiry->property->id) }}">
                                {{ $inquiry->property->title }}
                            </a>
                        @else
                            <span class="text-muted">Property deleted</span>
                        @endif
                    </div>
                    <div class="col-md-6 mb-3">
                        <strong>Date:</strong><br>
                        {{ $inquiry->created_at->format('M d, Y H:i') }}
                    </div>
                </div>

                <div class="mt-3">
                    <strong>Message:</strong>
                    <div class="border p-3 rounded mt-2 bg-light">
                        {{ $inquiry->message }}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card">
            <div class="card-header">
                <h5>Update Status</h5>
            </div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.inquiries.update', $inquiry->id) }}">
                    @csrf
                    @method('PATCH')

                    <div class="mb-3">
                        <label class="form-label">Status</label>
                        <select name="status" class="form-select">
                            <option value="unread" {{ $inquiry->status === 'unread' ? 'selected' : '' }}>Unread</option>
                            <option value="read" {{ $inquiry->status === 'read' ? 'selected' : '' }}>Read</option>
                            <option value="replied" {{ $inquiry->status === 'replied' ? 'selected' : '' }}>Replied</option>
                        </select>
                    </div>

                    <button type="submit" class="btn btn-primary w-100">Update Status</button>
                </form>
            </div>
        </div>

        @if($inquiry->property)
            <div class="card mt-3">
                <div class="card-header">
                    <h5>Property Info</h5>
                </div>
                <div class="card-body">
                    <p><strong>Title:</strong> {{ $inquiry->property->title }}</p>
                    <p><strong>Price:</strong> USh {{ number_format($inquiry->property->price) }}</p>
                    <p><strong>Type:</strong> {{ ucfirst($inquiry->property->property_type) }}</p>
                    <p><strong>Location:</strong> {{ $inquiry->property->city }}, {{ $inquiry->property->district }}</p>
                    <a href="{{ route('admin.properties.show', $inquiry->property->id) }}" class="btn btn-sm btn-primary">View Property</a>
                </div>
            </div>
        @endif

        @if($inquiry->seeker)
            <div class="card mt-3">
                <div class="card-header">
                    <h5>Registered User</h5>
                </div>
                <div class="card-body">
                    <p><strong>Name:</strong> {{ $inquiry->seeker->name }}</p>
                    <p><strong>Email:</strong> {{ $inquiry->seeker->email }}</p>
                    <p><strong>Phone:</strong> {{ $inquiry->seeker->phone ?? 'N/A' }}</p>
                    <p><strong>Role:</strong> {{ $inquiry->seeker->role->name ?? 'N/A' }}</p>
                </div>
            </div>
        @endif
    </div>
</div>
@endsection