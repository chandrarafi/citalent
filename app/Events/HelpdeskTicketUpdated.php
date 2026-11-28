<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class HelpdeskTicketUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $action,
        public array $ticketPayload,
        public ?string $guestChannelKey = null,
    ) {}

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('helpdesk.ticket.' . $this->ticketPayload['id']),
            new PrivateChannel('helpdesk.admin'),
        ];

        if (!empty($this->guestChannelKey)) {
            $channels[] = new Channel('helpdesk.guest.' . $this->guestChannelKey);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'helpdesk.ticket.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'action' => $this->action,
            'ticket' => $this->ticketPayload,
        ];
    }
}
