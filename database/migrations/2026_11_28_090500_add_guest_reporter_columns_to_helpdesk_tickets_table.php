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
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->string('reporter_name', 150)->nullable()->after('user_id');
            $table->string('reporter_email', 150)->nullable()->after('reporter_name');
            $table->string('reporter_phone', 40)->nullable()->after('reporter_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rekrutmen.helpdesk_tickets', function (Blueprint $table) {
            $table->dropColumn(['reporter_name', 'reporter_email', 'reporter_phone']);
        });
    }
};
