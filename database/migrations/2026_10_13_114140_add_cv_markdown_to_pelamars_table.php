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
        if (Schema::hasTable('rekrutmen.pelamars')) {
            Schema::table('rekrutmen.pelamars', function (Blueprint $table) {
                if (!Schema::hasColumn('rekrutmen.pelamars', 'cv_markdown')) {
                    $table->mediumText('cv_markdown')->nullable()->after('cv_path');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('rekrutmen.pelamars')) {
            Schema::table('rekrutmen.pelamars', function (Blueprint $table) {
                if (Schema::hasColumn('rekrutmen.pelamars', 'cv_markdown')) {
                    $table->dropColumn('cv_markdown');
                }
            });
        }
    }
};
