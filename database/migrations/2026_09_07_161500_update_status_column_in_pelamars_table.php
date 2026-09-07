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
        Schema::table('rekrutmen.pelamars', function (Blueprint $table) {
            $table->string('status', 50)->default('submitted')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rekrutmen.pelamars', function (Blueprint $table) {
            $table->string('status', 50)->default('submitted')->change();
        });
    }
};
