<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('rekrutmen.helpdesk_tickets', function (Blueprint $table) {
            $table->string('chat_token', 64)->nullable()->unique()->after('user_id');
        });

        Schema::create('rekrutmen.helpdesk_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('helpdesk_ticket_id')
                ->constrained('rekrutmen.helpdesk_tickets')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('public.users')
                ->nullOnDelete();
            $table->string('sender_type', 20); // 'kandidat', 'guest', 'admin', 'system'
            $table->string('sender_name', 150);
            $table->text('message');
            $table->string('attachment_path', 500)->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->index(['helpdesk_ticket_id', 'id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekrutmen.helpdesk_messages');

        Schema::table('rekrutmen.helpdesk_tickets', function (Blueprint $table) {
            $table->dropColumn('chat_token');
        });
    }
};
