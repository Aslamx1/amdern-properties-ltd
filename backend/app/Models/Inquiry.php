<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model
{
    protected $table = 'inquiries';

    protected $fillable = [
        'property_id',
        'seeker_id',
        'sender_name',
        'sender_email',
        'sender_phone',
        'message',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    const STATUS_UNREAD = 'unread';
    const STATUS_READ = 'read';
    const STATUS_REPLIED = 'replied';

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function seeker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seeker_id');
    }

    public function scopeUnread($query)
    {
        return $query->where('status', self::STATUS_UNREAD);
    }

    public function scopeRead($query)
    {
        return $query->where('status', self::STATUS_READ);
    }

    public function scopeReplied($query)
    {
        return $query->where('status', self::STATUS_REPLIED);
    }
}