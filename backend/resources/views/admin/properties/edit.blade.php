@extends('layouts.admin')

@section('title', 'Edit Property')

@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <h4>Edit Property: {{ $property->title }}</h4>
            </div>
            <div class="card-body">
                <form method="POST" enctype="multipart/form-data">
                    @csrf
                    @method('PUT')

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Title *</label>
                            <input type="text" name="title" class="form-control" value="{{ old('title', $property->title) }}" required>
                            @error('title')<div class="text-danger">{{ $message }}</div>@enderror
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Listing Type *</label>
                            <select name="listing_type" class="form-select" required>
                                <option value="">Select Type</option>
                                <option value="for_sale" {{ old('listing_type', $property->listing_type) === 'for_sale' ? 'selected' : '' }}>For Sale</option>
                                <option value="for_rent" {{ old('listing_type', $property->listing_type) === 'for_rent' ? 'selected' : '' }}>For Rent</option>
                            </select>
                            @error('listing_type')<div class="text-danger">{{ $message }}</div>@enderror
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Property Type *</label>
                            <select name="property_type" class="form-select" required>
                                <option value="">Select Type</option>
                                <option value="apartment" {{ old('property_type', $property->property_type) === 'apartment' ? 'selected' : '' }}>Apartment</option>
                                <option value="house" {{ old('property_type', $property->property_type) === 'house' ? 'selected' : '' }}>House</option>
                                <option value="land" {{ old('property_type', $property->property_type) === 'land' ? 'selected' : '' }}>Land</option>
                                <option value="commercial" {{ old('property_type', $property->property_type) === 'commercial' ? 'selected' : '' }}>Commercial</option>
                            </select>
                            @error('property_type')<div class="text-danger">{{ $message }}</div>@enderror
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Price (UGX) *</label>
                            <input type="number" name="price" class="form-control" value="{{ old('price', $property->price) }}" required>
                            @error('price')<div class="text-danger">{{ $message }}</div>@enderror
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Currency</label>
                            <select name="currency" class="form-select">
                                <option value="UGX" {{ old('currency', $property->currency) === 'UGX' ? 'selected' : '' }}>UGX</option>
                                <option value="USD" {{ old('currency', $property->currency) === 'USD' ? 'selected' : '' }}>USD</option>
                            </select>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Status *</label>
                            <select name="status" class="form-select" required>
                                <option value="active" {{ old('status', $property->status) === 'active' ? 'selected' : '' }}>Active</option>
                                <option value="pending" {{ old('status', $property->status) === 'pending' ? 'selected' : '' }}>Pending</option>
                                <option value="sold" {{ old('status', $property->status) === 'sold' ? 'selected' : '' }}>Sold</option>
                                <option value="draft" {{ old('status', $property->status) === 'draft' ? 'selected' : '' }}>Draft</option>
                            </select>
                            @error('status')<div class="text-danger">{{ $message }}</div>@enderror
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Bedrooms</label>
                            <input type="number" name="bedrooms" class="form-control" value="{{ old('bedrooms', $property->bedrooms) }}" min="0">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Bathrooms</label>
                            <input type="number" name="bathrooms" class="form-control" value="{{ old('bathrooms', $property->bathrooms) }}" min="0">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Toilets</label>
                            <input type="number" name="toilets" class="form-control" value="{{ old('toilets', $property->toilets ?? 0) }}" min="0">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Parking</label>
                            <input type="number" name="parking" class="form-control" value="{{ old('parking', $property->parking ?? 0) }}" min="0">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Plot Size</label>
                            <input type="text" name="plot_size" class="form-control" value="{{ old('plot_size', $property->plot_size) }}" placeholder="e.g., 50x100 ft">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Size (sqm)</label>
                            <input type="number" name="size_sqm" class="form-control" value="{{ old('size_sqm', $property->size_sqm) }}" step="0.01">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Address</label>
                            <input type="text" name="address" class="form-control" value="{{ old('address', $property->address) }}">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">City</label>
                            <input type="text" name="city" class="form-control" value="{{ old('city', $property->city) }}">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">District</label>
                            <input type="text" name="district" class="form-control" value="{{ old('district', $property->district) }}">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Area/Neighborhood</label>
                            <input type="text" name="area" class="form-control" value="{{ old('area', $property->area) }}">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Latitude</label>
                            <input type="number" name="latitude" class="form-control" value="{{ old('latitude', $property->location[1] ?? '') }}" step="any">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Longitude</label>
                            <input type="number" name="longitude" class="form-control" value="{{ old('longitude', $property->location[0] ?? '') }}" step="any">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Agent/Owner *</label>
                            <select name="user_id" class="form-select" required>
                                <option value="">Select User</option>
                                @foreach($users as $user)
                                    <option value="{{ $user->id }}" {{ old('user_id', $property->user_id) == $user->id ? 'selected' : '' }}>
                                        {{ $user->name }} ({{ $user->role->name ?? 'No Role' }})
                                    </option>
                                @endforeach
                            </select>
                            @error('user_id')<div class="text-danger">{{ $message }}</div>@enderror
                        </div>

                        <div class="col-12 mb-3">
                            <label class="form-label">Description</label>
                            <textarea name="description" class="form-control" rows="4">{{ old('description', $property->description) }}</textarea>
                        </div>

                        <div class="col-12 mb-3">
                            <label class="form-label">Current Images</label>
                            <div class="row">
                                @forelse($property->images as $image)
                                    <div class="col-md-3 mb-3">
                                        <div class="card">
                                            <img src="{{ $image->image_url }}" class="card-img-top" style="height: 150px; object-fit: cover;">
                                            <div class="card-body p-2">
                                                <div class="d-flex justify-content-between align-items-center">
                                                    <span class="badge bg-{{ $image->is_primary ? 'success' : 'secondary' }}">
                                                        {{ $image->is_primary ? 'Primary' : 'Secondary' }}
                                                    </span>
                                                    <div>
                                                        <a href="{{ route('admin.properties.setPrimaryImage', $image->id) }}" class="btn btn-sm btn-info">Set Primary</a>
                                                        <a href="{{ route('admin.properties.deleteImage', $image->id) }}" class="btn btn-sm btn-danger" onclick="return confirm('Delete this image?')">Delete</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                @empty
                                    <p class="text-muted">No images uploaded</p>
                                @endforelse
                            </div>
                        </div>

                        <div class="col-12 mb-3">
                            <label class="form-label">Add New Images</label>
                            <input type="file" name="images[]" class="form-control" multiple accept="image/*">
                        </div>

                        <div class="col-12 mb-3">
                            <label class="form-label">Features (comma-separated)</label>
                            <input type="text" name="features[]" class="form-control" value="{{ old('features.0', is_array($property->features) ? implode(', ', $property->features) : $property->features) }}" placeholder="e.g., swimming pool, gym, security">
                        </div>

                        <div class="col-md-4 mb-3">
                            <div class="form-check">
                                <input type="checkbox" name="serviced" class="form-check-input" value="1" {{ old('serviced', $property->serviced) ? 'checked' : '' }}>
                                <label class="form-check-label">Serviced</label>
                            </div>
                        </div>

                        <div class="col-md-4 mb-3">
                            <div class="form-check">
                                <input type="checkbox" name="furnished" class="form-check-input" value="1" {{ old('furnished', $property->furnished) ? 'checked' : '' }}>
                                <label class="form-check-label">Furnished</label>
                            </div>
                        </div>

                        <div class="col-md-4 mb-3">
                            <div class="form-check">
                                <input type="checkbox" name="shared" class="form-check-input" value="1" {{ old('shared', $property->shared) ? 'checked' : '' }}>
                                <label class="form-check-label">Shared</label>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4">
                        <button type="submit" class="btn btn-success">
                            <i class="bi bi-check-circle"></i> Update Property
                        </button>
                        <a href="{{ route('admin.properties.index') }}" class="btn btn-secondary">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection