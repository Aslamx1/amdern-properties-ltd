<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Property extends \Illuminate\Database\Eloquent\Model
{
    protected $table = 'properties';

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'description',
        'price',
        'currency',
        'listing_type',
        'property_type',
        'bedrooms',
        'bathrooms',
        'is_verified',
        'status',
        'address',
        'city',
        'district',
        'amenities',
        'location',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_verified' => 'boolean',
        'amenities' => 'array',
        'location' => 'array', // [longitude, latitude]
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class);
    }

    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }

    /**
     * Local scope to filter properties within a given distance (in kilometers)
     * from a specific latitude/longitude point using PostGIS ST_DWithin.
     *
     * @param Builder $query
     * @param float $latitude
     * @param float $longitude
     * @param float $radiusInKm
     * @return Builder
     */
    public function scopeWithinDistance($query, $latitude, $longitude, $radiusInKm = 10)
    {
        return $query->whereRaw(
            "ST_DWithin(
                ST_SetSRID(location::geometry, 4326)::geography,
                ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
                ?
            )",
            [$longitude, $latitude, $radiusInKm * 1000]
        );
    }

    /**
     * Scope for active properties.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for verified properties.
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    /**
     * Scope for filtering by listing type.
     */
    public function scopeListingType($query, $type)
    {
        return $query->where('listing_type', $type);
    }

    /**
     * Scope for filtering by property type.
     */
    public function scopePropertyType($query, $type)
    {
        return $query->where('property_type', $type);
    }

    /**
     * Scope for filtering by district.
     */
    public function scopeDistrict($query, $district)
    {
        return $query->where('district', 'ILIKE', "%{$district}%");
    }

    /**
     * Scope for filtering by city.
     */
    public function scopeCity($query, $city)
    {
        return $query->where('city', 'ILIKE', "%{$city}%");
    }

    /**
     * Get the location as [longitude, latitude] array.
     */
    public function getLocationAttribute($value)
    {
        if (is_array($value)) {
            return $value;
        }

        if ($value === null) {
            return null;
        }

        // Parse PostGIS POINT format: "x y" or "x,y"
        $value = trim($value, '()');
        $coords = preg_split('/[,\s]+/', $value);

        if (count($coords) >= 2) {
            return [(float) $coords[0], (float) $coords[1]];
        }

        return null;
    }

    /**
     * Set the location attribute.
     */
    public function setLocationAttribute($value)
    {
        if (is_array($value) && count($value) === 2) {
            $this->attributes['location'] = "({$value[0]} {$value[1]})";
        } else {
            $this->attributes['location'] = $value;
        }
    }
}