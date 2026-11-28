<?php

namespace App\Http\Controllers;

use App\Events\HelpdeskMessageSent;
use App\Events\HelpdeskTicketUpdated;
use App\Models\HelpdeskMessage;
use App\Models\HelpdeskTicket;
use App\Services\TelegramNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class HelpdeskController extends Controller
{
    /**
     * Dispatch broadcast event without breaking HTTP persistence if WebSocket server is unreachable.
     */
    private function safeBroadcast(object $event): void
    {
        try {
            event($event);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * Format chat message payload for JSON responses & WebSocket broadcasts.
     */
    private function formatMessage(HelpdeskMessage $message): array
    {
        return [
            'id' => $message->id,
            'helpdesk_ticket_id' => $message->helpdesk_ticket_id,
            'user_id' => $message->user_id,
            'sender_type' => $message->sender_type,
            'sender_name' => $message->sender_name,
            'message' => $message->message,
            'attachment_url' => $message->attachment_url,
            'is_read' => (bool) $message->is_read,
            'created_at' => $message->created_at?->format('d M Y, H:i'),
            'time_short' => $message->created_at?->format('H:i'),
        ];
    }

    /**
     * Format ticket payload for frontend consumption.
     */
    private function formatTicket(HelpdeskTicket $ticket, bool $includeGuestChannel = false): array
    {
        $user = $ticket->relationLoaded('user') ? $ticket->user : null;

        $payload = [
            'id' => $ticket->id,
            'kode_tiket' => $ticket->kode_tiket,
            'is_guest' => $ticket->user_id === null,
            'is_open' => $ticket->isOpenForChat(),
            'reporter_name' => $user?->name ?? $ticket->reporter_name,
            'reporter_email' => $user?->email ?? $ticket->reporter_email,
            'reporter_phone' => $user?->phone ?? $ticket->reporter_phone,
            'kategori' => $ticket->kategori,
            'judul' => $ticket->judul,
            'deskripsi' => $ticket->deskripsi,
            'halaman_url' => $ticket->halaman_url,
            'screenshot_url' => $ticket->screenshot_url,
            'status' => $ticket->status,
            'tanggapan_admin' => $ticket->tanggapan_admin,
            'handler_name' => $ticket->handler?->name,
            'ditangani_at' => $ticket->ditangani_at?->format('d M Y, H:i'),
            'messages_count' => isset($ticket->messages_count) ? (int) $ticket->messages_count : null,
            'created_at' => $ticket->created_at?->format('d M Y, H:i'),
            'updated_at' => $ticket->updated_at?->format('d M Y, H:i'),
            'user' => $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ] : null,
        ];

        if ($includeGuestChannel && $ticket->chat_token) {
            $payload['guest_channel'] = $ticket->getGuestChannelKey();
        }

        return $payload;
    }

    /**
     * Shared ticket validation & storage for both authenticated candidates and login guests.
     */
    private function validateAndCreateTicket(Request $request, bool $requireGuestContact): HelpdeskTicket
    {
        $rules = [
            'kategori' => ['required', 'string', Rule::in(HelpdeskTicket::KATEGORIS)],
            'judul' => ['required', 'string', 'min:5', 'max:180'],
            'deskripsi' => ['required', 'string', 'min:10', 'max:3000'],
            'halaman_url' => ['nullable', 'string', 'max:500'],
            'screenshot' => ['nullable', 'file', 'image', 'mimes:jpeg,png,jpg,webp', 'max:3072'],
        ];

        if ($requireGuestContact) {
            $rules['reporter_name'] = ['required', 'string', 'min:2', 'max:150'];
            $rules['reporter_email'] = ['required', 'email', 'max:150'];
            $rules['reporter_phone'] = ['nullable', 'string', 'max:40'];
        }

        $validated = $request->validate($rules, [
            'reporter_name.required' => 'Nama lengkap wajib diisi.',
            'reporter_name.min' => 'Nama lengkap minimal 2 karakter.',
            'reporter_email.required' => 'Email aktif wajib diisi agar tim kami dapat menghubungi Anda.',
            'reporter_email.email' => 'Format alamat email tidak valid.',
            'kategori.required' => 'Kategori kendala wajib dipilih.',
            'kategori.in' => 'Kategori kendala tidak valid.',
            'judul.required' => 'Judul atau ringkasan kendala wajib diisi.',
            'judul.min' => 'Judul kendala minimal 5 karakter.',
            'judul.max' => 'Judul kendala maksimal 180 karakter.',
            'deskripsi.required' => 'Deskripsi error atau kronologi wajib diisi.',
            'deskripsi.min' => 'Deskripsi minimal 10 karakter agar tim kami dapat menelusuri masalahnya.',
            'screenshot.image' => 'Lampiran harus berupa gambar (JPG, PNG, atau WEBP).',
            'screenshot.mimes' => 'Format screenshot harus JPG, PNG, atau WEBP.',
            'screenshot.max' => 'Ukuran screenshot maksimal 3 MB.',
        ]);

        $screenshotPath = null;
        if ($request->hasFile('screenshot')) {
            $screenshotPath = $request->file('screenshot')->store('rekrutmen/helpdesk', 'public');
        }

        $user = Auth::user();
        $reporterName = $user ? $user->name : trim($validated['reporter_name']);

        $ticket = HelpdeskTicket::createWithGeneratedKode([
            'user_id' => $user?->id,
            'chat_token' => $user ? null : bin2hex(random_bytes(24)),
            'reporter_name' => $user ? null : $reporterName,
            'reporter_email' => $user ? null : trim($validated['reporter_email']),
            'reporter_phone' => $user ? null : (isset($validated['reporter_phone']) && trim($validated['reporter_phone']) !== '' ? trim($validated['reporter_phone']) : null),
            'kategori' => $validated['kategori'],
            'judul' => trim($validated['judul']),
            'deskripsi' => trim($validated['deskripsi']),
            'halaman_url' => !empty($validated['halaman_url']) ? trim($validated['halaman_url']) : null,
            'screenshot_path' => $screenshotPath,
            'status' => 'menunggu',
        ]);

        // Seed opening chat message from the initial ticket description so Live Chat starts immediately
        HelpdeskMessage::create([
            'helpdesk_ticket_id' => $ticket->id,
            'user_id' => $user?->id,
            'sender_type' => $user ? 'kandidat' : 'guest',
            'sender_name' => $reporterName,
            'message' => trim($validated['deskripsi']),
            'attachment_path' => $screenshotPath,
            'is_read' => false,
        ]);

        $ticket->load(['user:id,name,email,phone', 'handler:id,name'])->loadCount('messages');

        $this->safeBroadcast(new HelpdeskTicketUpdated(
            'created',
            $this->formatTicket($ticket, true),
            $ticket->getGuestChannelKey(),
        ));

        $ticketId = $ticket->id;
        app()->terminating(function () use ($ticketId) {
            $fresh = HelpdeskTicket::with('user:id,name,email,phone')->find($ticketId);
            if ($fresh) {
                app(TelegramNotificationService::class)->sendHelpdeskTicketAlert($fresh);
            }
        });

        return $ticket;
    }

    /**
     * Validate & store a chat message for a ticket and broadcast it via Laravel Reverb.
     */
    private function validateAndStoreMessage(
        Request $request,
        HelpdeskTicket $ticket,
        string $senderType,
        string $senderName,
        ?int $userId,
    ): HelpdeskMessage {
        $validated = $request->validate([
            'message' => ['nullable', 'string', 'max:2000', 'required_without:attachment'],
            'attachment' => ['nullable', 'file', 'image', 'mimes:jpeg,png,jpg,webp', 'max:3072'],
        ], [
            'message.required_without' => 'Pesan atau lampiran gambar wajib diisi.',
            'message.max' => 'Pesan maksimal 2000 karakter.',
            'attachment.image' => 'Lampiran harus berupa gambar (JPG, PNG, atau WEBP).',
            'attachment.mimes' => 'Format lampiran harus JPG, PNG, atau WEBP.',
            'attachment.max' => 'Ukuran lampiran maksimal 3 MB.',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('rekrutmen/helpdesk', 'public');
        }

        $text = isset($validated['message']) ? trim((string) $validated['message']) : '';
        if ($text === '' && $attachmentPath !== null) {
            $text = '[Mengirim lampiran gambar]';
        }

        $msg = HelpdeskMessage::create([
            'helpdesk_ticket_id' => $ticket->id,
            'user_id' => $userId,
            'sender_type' => $senderType,
            'sender_name' => $senderName,
            'message' => $text,
            'attachment_path' => $attachmentPath,
            'is_read' => false,
        ]);

        $statusChanged = false;
        if ($senderType === 'admin' && $ticket->status === 'menunggu') {
            $ticket->update([
                'status' => 'diproses',
                'ditangani_oleh' => $userId,
                'ditangani_at' => now(),
            ]);
            $statusChanged = true;
        } else {
            $ticket->touch();
        }

        $ticket->load(['user:id,name,email,phone', 'handler:id,name'])->loadCount('messages');

        $guestChannelKey = $ticket->getGuestChannelKey();

        $this->safeBroadcast(new HelpdeskMessageSent(
            $ticket->id,
            $ticket->kode_tiket,
            $ticket->status,
            $this->formatMessage($msg),
            $guestChannelKey,
        ));

        if ($statusChanged) {
            $this->safeBroadcast(new HelpdeskTicketUpdated(
                'updated',
                $this->formatTicket($ticket, true),
                $guestChannelKey,
            ));
        }

        return $msg;
    }

    /**
     * Ensure incoming guest request holds the secret chat token for the requested ticket.
     */
    private function resolveAuthorizedGuestTicket(Request $request, string $kodeTiket): ?HelpdeskTicket
    {
        $token = (string) ($request->header('X-Chat-Token') ?: $request->query('token') ?: $request->input('chat_token', ''));
        if ($token === '') {
            return null;
        }

        $ticket = HelpdeskTicket::with(['user:id,name,email,phone', 'handler:id,name'])
            ->withCount('messages')
            ->where('kode_tiket', $kodeTiket)
            ->whereNull('user_id')
            ->first();

        if (!$ticket || empty($ticket->chat_token) || !hash_equals($ticket->chat_token, $token)) {
            return null;
        }

        return $ticket;
    }

    /**
     * JSON list of error tickets submitted by the authenticated candidate.
     */
    public function kandidatIndex(Request $request): JsonResponse
    {
        $user = Auth::user();

        $tickets = HelpdeskTicket::with('handler:id,name')
            ->withCount('messages')
            ->where('user_id', $user->id)
            ->orderByDesc('id')
            ->get()
            ->map(fn (HelpdeskTicket $ticket) => $this->formatTicket($ticket))
            ->values();

        return response()->json([
            'tickets' => $tickets,
            'summary' => [
                'total' => $tickets->count(),
                'aktif' => $tickets->whereIn('status', HelpdeskTicket::OPEN_STATUSES)->count(),
                'selesai' => $tickets->whereIn('status', ['selesai', 'ditutup'])->count(),
            ],
            'live_chat_schedule' => HelpdeskTicket::liveChatAvailability(),
        ]);
    }

    /**
     * Store a new candidate error report via the floating Helpdesk widget (authenticated).
     */
    public function kandidatStore(Request $request): JsonResponse
    {
        $ticket = $this->validateAndCreateTicket($request, false);
        $schedule = HelpdeskTicket::liveChatAvailability();

        return response()->json([
            'message' => $schedule['active']
                ? 'Tiket berhasil dibuka! Silakan lanjutkan percakapan via Live Chat.'
                : 'Tiket berhasil dikirim! Live Chat aktif Senin – Sabtu pukul 08:00 – 17:00 WIB.',
            'ticket' => $this->formatTicket($ticket),
            'live_chat_schedule' => $schedule,
        ], 201);
    }

    /**
     * Fetch live chat history for an authenticated candidate's ticket.
     */
    public function kandidatMessagesIndex(HelpdeskTicket $helpdeskTicket): JsonResponse
    {
        if ($helpdeskTicket->user_id === null || (int) $helpdeskTicket->user_id !== (int) Auth::id()) {
            abort(403, 'Anda tidak memiliki akses ke percakapan tiket ini.');
        }

        $helpdeskTicket->load(['user:id,name,email,phone', 'handler:id,name'])->loadCount('messages');
        $messages = $helpdeskTicket->messages()->get()->map(fn (HelpdeskMessage $m) => $this->formatMessage($m))->values();

        return response()->json([
            'ticket' => $this->formatTicket($helpdeskTicket),
            'messages' => $messages,
            'live_chat_schedule' => HelpdeskTicket::liveChatAvailability(),
        ]);
    }

    /**
     * Send a live chat message as the authenticated candidate.
     */
    public function kandidatMessagesStore(Request $request, HelpdeskTicket $helpdeskTicket): JsonResponse
    {
        $user = Auth::user();
        if ($helpdeskTicket->user_id === null || (int) $helpdeskTicket->user_id !== (int) $user->id) {
            abort(403, 'Anda tidak memiliki akses ke percakapan tiket ini.');
        }

        if (!$helpdeskTicket->isOpenForChat()) {
            return response()->json([
                'message' => 'Tiket sudah ditutup atau selesai. Silakan buka tiket baru jika masih ada kendala.',
            ], 422);
        }

        $schedule = HelpdeskTicket::liveChatAvailability();
        if (!$schedule['active']) {
            return response()->json([
                'message' => $schedule['message'],
                'live_chat_schedule' => $schedule,
            ], 422);
        }

        $msg = $this->validateAndStoreMessage($request, $helpdeskTicket, 'kandidat', $user->name, $user->id);

        return response()->json([
            'message' => $this->formatMessage($msg),
            'ticket' => $this->formatTicket($helpdeskTicket->fresh(['user:id,name,email,phone', 'handler:id,name'])->loadCount('messages')),
            'live_chat_schedule' => $schedule,
        ], 201);
    }

    /**
     * Store an error report submitted from public/login page before authentication.
     */
    public function publicStore(Request $request): JsonResponse
    {
        $ticket = $this->validateAndCreateTicket($request, !Auth::check());
        $schedule = HelpdeskTicket::liveChatAvailability();

        return response()->json([
            'message' => $schedule['active']
                ? 'Tiket login berhasil dibuka! Anda dapat langsung chat dengan tim kami di sini.'
                : 'Tiket login berhasil dikirim! Live Chat aktif Senin – Sabtu pukul 08:00 – 17:00 WIB.',
            'ticket' => $this->formatTicket($ticket, true),
            'chat_token' => $ticket->chat_token,
            'live_chat_schedule' => $schedule,
        ], 201);
    }

    /**
     * Fetch live chat history for a guest ticket using its secret chat_token.
     */
    public function publicMessagesIndex(Request $request, string $kodeTiket): JsonResponse
    {
        $ticket = $this->resolveAuthorizedGuestTicket($request, $kodeTiket);
        if (!$ticket) {
            abort(403, 'Token tiket tidak valid atau tidak ditemukan.');
        }

        $messages = $ticket->messages()->get()->map(fn (HelpdeskMessage $m) => $this->formatMessage($m))->values();

        return response()->json([
            'ticket' => $this->formatTicket($ticket, true),
            'messages' => $messages,
            'live_chat_schedule' => HelpdeskTicket::liveChatAvailability(),
        ]);
    }

    /**
     * Send a live chat message on a guest ticket using its secret chat_token.
     */
    public function publicMessagesStore(Request $request, string $kodeTiket): JsonResponse
    {
        $ticket = $this->resolveAuthorizedGuestTicket($request, $kodeTiket);
        if (!$ticket) {
            abort(403, 'Token tiket tidak valid atau tidak ditemukan.');
        }

        if (!$ticket->isOpenForChat()) {
            return response()->json([
                'message' => 'Tiket sudah ditutup atau selesai. Silakan buka tiket baru jika masih ada kendala.',
            ], 422);
        }

        $schedule = HelpdeskTicket::liveChatAvailability();
        if (!$schedule['active']) {
            return response()->json([
                'message' => $schedule['message'],
                'live_chat_schedule' => $schedule,
            ], 422);
        }

        $msg = $this->validateAndStoreMessage(
            $request,
            $ticket,
            'guest',
            $ticket->reporter_name ?: 'Pelapor',
            null,
        );

        return response()->json([
            'message' => $this->formatMessage($msg),
            'ticket' => $this->formatTicket($ticket->fresh(['user:id,name,email,phone', 'handler:id,name'])->loadCount('messages'), true),
            'live_chat_schedule' => $schedule,
        ], 201);
    }

    /**
     * Admin / HR view for managing candidate helpdesk error reports & live chat.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = (string) $request->query('status', 'all');
        $kategori = (string) $request->query('kategori', 'all');

        $query = HelpdeskTicket::with(['user:id,name,email,phone', 'handler:id,name'])
            ->withCount('messages')
            ->orderByRaw("CASE status WHEN 'menunggu' THEN 1 WHEN 'diproses' THEN 2 WHEN 'selesai' THEN 3 ELSE 4 END")
            ->orderByDesc('updated_at')
            ->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('kode_tiket', 'ilike', "%{$search}%")
                    ->orWhere('judul', 'ilike', "%{$search}%")
                    ->orWhere('deskripsi', 'ilike', "%{$search}%")
                    ->orWhere('halaman_url', 'ilike', "%{$search}%")
                    ->orWhere('reporter_name', 'ilike', "%{$search}%")
                    ->orWhere('reporter_email', 'ilike', "%{$search}%")
                    ->orWhere('reporter_phone', 'ilike', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'ilike', "%{$search}%")
                            ->orWhere('email', 'ilike', "%{$search}%");
                    });
            });
        }

        if ($status !== '' && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($kategori !== '' && $kategori !== 'all') {
            $query->where('kategori', $kategori);
        }

        $tickets = $query->get()
            ->map(fn (HelpdeskTicket $ticket) => $this->formatTicket($ticket, true))
            ->values();

        $allCounts = HelpdeskTicket::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $stats = [
            'total' => (int) $allCounts->sum(),
            'menunggu' => (int) ($allCounts['menunggu'] ?? 0),
            'diproses' => (int) ($allCounts['diproses'] ?? 0),
            'selesai' => (int) (($allCounts['selesai'] ?? 0) + ($allCounts['ditutup'] ?? 0)),
        ];

        return Inertia::render('helpdesk/Index', [
            'tickets' => $tickets,
            'stats' => $stats,
            'kategoriOptions' => HelpdeskTicket::KATEGORIS,
            'liveChatSchedule' => HelpdeskTicket::liveChatAvailability(),
            'filters' => [
                'search' => $search,
                'status' => $status,
                'kategori' => $kategori,
            ],
        ]);
    }

    /**
     * Fetch live chat history for admin.
     */
    public function adminMessagesIndex(HelpdeskTicket $helpdeskTicket): JsonResponse
    {
        $helpdeskTicket->load(['user:id,name,email,phone', 'handler:id,name'])->loadCount('messages');

        $helpdeskTicket->messages()
            ->whereIn('sender_type', ['kandidat', 'guest'])
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $messages = $helpdeskTicket->messages()->get()->map(fn (HelpdeskMessage $m) => $this->formatMessage($m))->values();

        return response()->json([
            'ticket' => $this->formatTicket($helpdeskTicket, true),
            'messages' => $messages,
        ]);
    }

    /**
     * Send live chat message as admin/HR via Laravel Reverb.
     */
    public function adminMessagesStore(Request $request, HelpdeskTicket $helpdeskTicket): JsonResponse
    {
        $admin = Auth::user();
        $msg = $this->validateAndStoreMessage($request, $helpdeskTicket, 'admin', $admin->name, $admin->id);

        return response()->json([
            'message' => $this->formatMessage($msg),
            'ticket' => $this->formatTicket($helpdeskTicket->fresh(['user:id,name,email,phone', 'handler:id,name'])->loadCount('messages'), true),
        ], 201);
    }

    /**
     * Update ticket status & admin response.
     */
    public function update(Request $request, HelpdeskTicket $helpdeskTicket): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(HelpdeskTicket::STATUSES)],
            'tanggapan_admin' => ['nullable', 'string', 'max:3000'],
        ], [
            'status.required' => 'Status penanganan wajib dipilih.',
            'status.in' => 'Status penanganan tidak valid.',
        ]);

        $helpdeskTicket->update([
            'status' => $validated['status'],
            'tanggapan_admin' => isset($validated['tanggapan_admin']) && trim($validated['tanggapan_admin']) !== ''
                ? trim($validated['tanggapan_admin'])
                : null,
            'ditangani_oleh' => Auth::id(),
            'ditangani_at' => now(),
        ]);

        $helpdeskTicket->load(['user:id,name,email,phone', 'handler:id,name'])->loadCount('messages');

        $this->safeBroadcast(new HelpdeskTicketUpdated(
            'updated',
            $this->formatTicket($helpdeskTicket, true),
            $helpdeskTicket->getGuestChannelKey(),
        ));

        return back()->with('success', "Tiket {$helpdeskTicket->kode_tiket} berhasil diperbarui.");
    }

    /**
     * Delete a helpdesk ticket and its attached screenshot / chat images if present.
     */
    public function destroy(HelpdeskTicket $helpdeskTicket): RedirectResponse
    {
        foreach ($helpdeskTicket->messages as $msg) {
            if ($msg->attachment_path && Storage::disk('public')->exists($msg->attachment_path)) {
                Storage::disk('public')->delete($msg->attachment_path);
            }
        }

        if ($helpdeskTicket->screenshot_path && Storage::disk('public')->exists($helpdeskTicket->screenshot_path)) {
            Storage::disk('public')->delete($helpdeskTicket->screenshot_path);
        }

        $kode = $helpdeskTicket->kode_tiket;
        $ticketId = $helpdeskTicket->id;
        $guestChannelKey = $helpdeskTicket->getGuestChannelKey();

        $helpdeskTicket->delete();

        $this->safeBroadcast(new HelpdeskTicketUpdated(
            'deleted',
            ['id' => $ticketId, 'kode_tiket' => $kode],
            $guestChannelKey,
        ));

        return back()->with('success', "Tiket {$kode} berhasil dihapus.");
    }
}
