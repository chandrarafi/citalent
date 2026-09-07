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
        if (!Schema::hasTable('departement')) {
            Schema::create('departement', function (Blueprint $table) {
                $table->id();
                $table->string('kd_departement', 50)->unique();
                $table->string('deskripsi', 255);
                $table->boolean('active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('jabatan')) {
            Schema::create('jabatan', function (Blueprint $table) {
                $table->id();
                $table->string('kd_departement', 50)->nullable();
                $table->string('kd_jabatan', 50)->nullable();
                $table->string('nama_jabatan', 255);
                $table->boolean('active')->default(true);
                $table->boolean('flag_approval')->default(false);
                $table->boolean('flag_proposal')->default(false);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jabatan');
        Schema::dropIfExists('departement');
    }
};
