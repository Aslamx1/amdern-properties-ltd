@extends('layouts.admin')

@section('title', 'Create Property')

@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <h4>Create New Property</h4>
            </div>
            <div class="card-body">
                <form method="POST" enctype="multipart/form-data">
                    @csrf

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Title *</label>
                            <input type="text" name="title" class="form-control" value="{{ old('title') }}" required>
                            @error('title')<div class="text-danger">{{ $message }}</div>@enderror
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Listing Type *</label>
                            <select name="listing_type" class="form-select" required>
                                <option value="">Select Type</option>
                                <option value="for_sale" {{ old('listing_type') === 'for_sale' ? 'selected' : '' }}>For Sale</option>
                                <option value="for_rent" {{ old('listing_type') === 'for_rent' ? 'selected' : '' }}>For Rent</option>
                            </select>
                            @error('listing_type')<div class="text-danger">{{ $message }}</div>@enderror
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Property Type *</label>
                            <select name="property_type" class="form-select" required>
                                <option value="">Select Type</option>
                                <option value="apartment" {{ old('property_type') === 'apartment' ? 'selected' : '' }}>Apartment</option>
                                <option value="house" {{ old('property_type') === 'house' ? 'selected' : '' }}>House</option>
                                <option value="land" {{ old('property_type') === 'land' ? 'selected' : '' }}>Land</option>
                                <option value="commercial" {{ old('property_type') === 'commercial' ? 'selected' : '' }}>Commercial</option>
                            </select>
                            @error('property_type')<div class="text-danger">{{ $message }}</div>@enderror
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Price (UGX) *</label>
                            <input type="number" name="price" class="form-control" value="{{ old('price') }}" required>
                            @error('price')<div class="text-danger">{{ $message }}</div>@enderror
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Currency</label>
                            <select name="currency" class="form-select">
                                <option value="UGX" {{ old('currency') === 'UGX' ? 'selected' : '' }}>UGX</option>
                                <option value="USD" {{ old('currency') === 'USD' ? 'selected' : '' }}>USD</option>
                            </select>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Status *</label>
                            <select name="status" class="form-select" required>
                                <option value="active" {{ old('status') === 'active' ? 'selected' : '' }}>Active</option>
                                <option value="pending" {{ old('status') === 'pending' ? 'selected' : '' }}>Pending</option>
                                <option value="sold" {{ old('status') === 'sold' ? 'selected' : '' }}>Sold</option>
                                <option value="draft" {{ old('status') === 'draft' ? 'selected' : '' }}>Draft</option>
                            </select>
                            @error('status')<div class="text-danger">{{ $message }}</div>@enderror
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Bedrooms</label>
                            <input type="number" name="bedrooms" class="form-control" value="{{ old('bedrooms', 0) }}" min="0">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Bathrooms</label>
                            <input type="number" name="bathrooms" class="form-control" value="{{ old('bathrooms', 0) }}" min="0">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Toilets</label>
                            <input type="number" name="toilets" class="form-control" value="{{ old('toilets', 0) }}" min="0">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Parking</label>
                            <input type="number" name="parking" class="form-control" value="{{ old('parking', 0) }}" min="0">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Plot Size</label>
                            <input type="text" name="plot_size" class="form-control" value="{{ old('plot_size') }}" placeholder="e.g., 50x100 ft">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Size (sqm)</label>
                            <input type="number" name="size_sqm" class="form-control" value="{{ old('size_sqm') }}" step="0.01">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Address</label>
                            <input type="text" name="address" class="form-control" value="{{ old('address') }}">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">City</label>
                            <input type="text" name="city" class="form-control" value="{{ old('city') }}">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">District</label>
                            <input type="text" name="district" class="form-control" value="{{ old('district') }}">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Area/Neighborhood</label>
                            <input type="text" name="area" class="form-control" value="{{ old('area') }}">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Latitude</label>
                            <input type="number" name="latitude" class="form-control" value="{{ old('latitude') }}" step="any">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Longitude</label>
                            <input type="number" name="longitude" class="form-control" value="{{ old('longitude') }}" step="any">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Agent/Owner *</label>
                            <select name="user_id" class="form-select" required>
                                <option value="">Select User</option>
                                @foreach($users as $user)
                                    <option value="{{ $user->id }}" {{ old('user_id') == $user->id ? 'selected' : '' }}>
                                        {{ $user->name }} ({{ $user->role->name ?? 'No Role' }})
                                    </option>
                                @endforeach
                            </select>
                            @error('user_id')<div class="text-danger">{{ $message }}</div>@enderror
                        </div>

                        <div class="col-12 mb-3">
                            <label class="form-label">Description</label>
                            <textarea name="description" class="form-control" rows="4">{{ old('description') }}</textarea>
                        </div>

                        <div class="col-12 mb-3">
                            <label class="form-label">Features (comma-separated)</label>
                            <input type="text" name="features[]" class="form-control" value="{{ old('features.0') }}" placeholder="e.g., swimming pool, gym, security">
                            <small class="text-muted">Add features separated by commas</small>
                        </div>

                        <div class="col-md-4 mb-3">
                            <div class="form-check">
                                <input type="checkbox" name="serviced" class="form-check-input" value="1" {{ old('serviced') ? 'checked' : '' }}>
                                <label class="form-check-label">Serviced</label>
                            </div>
                        </div>

                        <div class="col-md-4 mb-3">
                            <div class="form-check">
                                <input type="checkbox" name="furnished" class="form-check-input" value="1" {{ old('furnished') ? 'checked' : '' }}>
                                <label class="form-check-label">Furnished</label>
                            </div>
                        </div>

                        <div class="col-md-4 mb-3">
                            <div class="form-check">
                                <input type="checkbox" name="shared" class="form-check-input" value="1" {{ old('shared') ? 'checked' : '' }}>
                                <label class="form-check-label">Shared</label>
                            </div>
                        </div>

                        <div class="col-12 mb-3">
                            <label class="form-label">Images</label>
                            <input type="file" name="images[]" class="form-control" multiple accept="image/*">
                            <small class="text-muted">You can select multiple images. First image will be set as primary.</small>
                        </div>
                    </div>

                    <div class="mt-4">
                        <button type="submit" class="btn btn-success">
                            <i class="bi bi-check-circle"></i> Create Property
                        </button>
                        <a href="{{ route('admin.properties.index') }}" class="btn btn-secondary">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection