<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HelpdeskMessage extends Model
{
    protected $table = 'rekrutmen.helpdesk_messages';

    protected $fillable = [
        'helpdesk_ticket_id',
        'user_id',
        'sender_type',
        'sender_name',
        'message',
        'attachment_path',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    protected $appends = [
        'attachment_url',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(HelpdeskTicket::class, 'helpdesk_ticket_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getAttachmentUrlAttribute(): ?string
    {
        if (empty($this->attachment_path)) {
            return null;
        }

        if (str_starts_with($this->attachment_path, 'http://') || str_starts_with($this->attachment_path, 'https://')) {
            return $this->attachment_path;
        }

        return asset('storage/' . $this->attachment_path);
    }
}
