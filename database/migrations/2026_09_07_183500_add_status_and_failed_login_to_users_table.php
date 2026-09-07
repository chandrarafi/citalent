<?php

use App\Models\User;
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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'is_active')) {
                $table->boolean('is_active')->default(false)->after('email_verified_at');
            }
            if (!Schema::hasColumn('users', 'status')) {
                $table->string('status', 20)->default('pending')->after('is_active'); // 'pending', 'active', 'banned'
            }
            if (!Schema::hasColumn('users', 'failed_login_attempts')) {
                $table->unsignedSmallInteger('failed_login_attempts')->default(0)->after('status');
            }
            if (!Schema::hasColumn('users', 'banned_at')) {
                $table->timestamp('banned_at')->nullable()->after('failed_login_attempts');
            }
        });

        // Set existing verified users to active
        User::whereNotNull('email_verified_at')->update([
            'is_active' => true,
            'status' => 'active',
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'is_active')) {
                $table->dropColumn('is_active');
            }
            if (Schema::hasColumn('users', 'status')) {
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('users', 'failed_login_attempts')) {
                $table->dropColumn('failed_login_attempts');
            }
            if (Schema::hasColumn('users', 'banned_at')) {
                $table->dropColumn('banned_at');
            }
        });
    }
};
