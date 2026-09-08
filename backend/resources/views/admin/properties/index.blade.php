@extends('layouts.admin')

@section('title', 'Properties Management')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <h1>Properties</h1>
    <a href="{{ route('admin.properties.create') }}" class="btn btn-primary">
        <i class="bi bi-plus-circle"></i> Add Property
    </a>
</div>

<div class="card">
    <div class="card-header">
        <form method="GET" class="row g-3">
            <div class="col-md-3">
                <input type="text" name="search" class="form-control" placeholder="Search properties..." value="{{ request('search') }}">
            </div>
            <div class="col-md-2">
                <select name="status" class="form-select">
                    <option value="">All Status</option>
                    @foreach($statuses as $status)
                        <option value="{{ $status }}" {{ request('status') === $status ? 'selected' : '' }}>
                            {{ ucfirst($status) }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-2">
                <select name="listing_type" class="form-select">
                    <option value="">All Types</option>
                    <option value="for_sale" {{ request('listing_type') === 'for_sale' ? 'selected' : '' }}>For Sale</option>
                    <option value="for_rent" {{ request('listing_type') === 'for_rent' ? 'selected' : '' }}>For Rent</option>
                </select>
            </div>
            <div class="col-md-2">
                <select name="property_type" class="form-select">
                    <option value="">All Categories</option>
                    @foreach($propertyTypes as $type)
                        <option value="{{ $type }}" {{ request('property_type') === $type ? 'selected' : '' }}>
                            {{ ucfirst($type) }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-2">
                <select name="district" class="form-select">
                    <option value="">All Districts</option>
                    @foreach($districts as $district)
                        <option value="{{ $district }}" {{ request('district') === $district ? 'selected' : '' }}>
                            {{ $district }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-1">
                <button type="submit" class="btn btn-secondary w-100">
                    <i class="bi bi-search"></i>
                </button>
            </div>
        </form>
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
                        <th>Location</th>
                        <th>Status</th>
                        <th>Agent</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($properties as $property)
                        <tr>
                            <td>{{ $property->ref ?? 'AMD' . str_pad($property->id, 4, '0', STR_PAD_LEFT) }}</td>
                            <td>
                                <strong>{{ $property->title }}</strong>
                                @if($property->images->count() > 0)
                                    <br><img src="{{ $property->images->first()->image_url }}" width="50" height="50" class="rounded mt-1">
                                @endif
                            </td>
                            <td>
                                {{ ucfirst($property->property_type) }}
                                <br><small class="text-muted">{{ ucfirst(str_replace('_', ' ', $property->listing_type)) }}</small>
                            </td>
                            <td>USh {{ number_format($property->price) }}</td>
                            <td>{{ $property->city }}, {{ $property->district }}</td>
                            <td>
                                <span class="badge bg-{{ $property->status === 'active' ? 'success' : ($property->status === 'pending' ? 'warning' : ($property->status === 'sold' ? 'danger' : 'secondary')) }}">
                                    {{ ucfirst($property->status) }}
                                </span>
                            </td>
                            <td>{{ $property->user->name ?? 'N/A' }}</td>
                            <td class="action-btns">
                                <a href="{{ route('admin.properties.show', $property->id) }}" class="btn btn-sm btn-info" title="View">
                                    <i class="bi bi-eye"></i>
                                </a>
                                <a href="{{ route('admin.properties.edit', $property->id) }}" class="btn btn-sm btn-warning" title="Edit">
                                    <i class="bi bi-pencil"></i>
                                </a>
                                <form action="{{ route('admin.properties.destroy', $property->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Are you sure?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-sm btn-danger" title="Delete">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="text-center text-muted py-4">No properties found</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        {{ $properties->links() }}
    </div>
</div>
@endsection