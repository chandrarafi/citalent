<?php

use App\Models\HelpdeskTicket;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('helpdesk.admin', function ($user) {
    $user->loadMissing('role.permissions');

    return $user->hasPermission('manage-helpdesk');
});

Broadcast::channel('helpdesk.ticket.{ticketId}', function ($user, $ticketId) {
    $user->loadMissing('role.permissions');

    if ($user->hasPermission('manage-helpdesk')) {
        return true;
    }

    $ticket = HelpdeskTicket::query()->select(['id', 'user_id'])->find($ticketId);
    if (!$ticket) {
        return false;
    }

    return $ticket->user_id !== null && (int) $ticket->user_id === (int) $user->id;
});
