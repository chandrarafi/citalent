<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class HelpdeskMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $ticketId,
        public string $kodeTiket,
        public string $ticketStatus,
        public array $messagePayload,
        public ?string $guestChannelKey = null,
    ) {}

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('helpdesk.ticket.' . $this->ticketId),
            new PrivateChannel('helpdesk.admin'),
        ];

        if (!empty($this->guestChannelKey)) {
            $channels[] = new Channel('helpdesk.guest.' . $this->guestChannelKey);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'helpdesk.message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'ticket_id' => $this->ticketId,
            'kode_tiket' => $this->kodeTiket,
            'ticket_status' => $this->ticketStatus,
            'message' => $this->messagePayload,
        ];
    }
}
