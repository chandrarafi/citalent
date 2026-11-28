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
        Schema::create('rekrutmen.helpdesk_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('kode_tiket', 30)->unique();
            $table->foreignId('user_id')->constrained('public.users')->cascadeOnDelete();
            $table->string('kategori', 80);
            $table->string('judul', 180);
            $table->text('deskripsi');
            $table->string('halaman_url', 500)->nullable();
            $table->string('screenshot_path', 500)->nullable();
            $table->string('status', 30)->default('menunggu');
            $table->text('tanggapan_admin')->nullable();
            $table->foreignId('ditangani_oleh')->nullable()->constrained('public.users')->nullOnDelete();
            $table->timestamp('ditangani_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekrutmen.helpdesk_tickets');
    }
};
