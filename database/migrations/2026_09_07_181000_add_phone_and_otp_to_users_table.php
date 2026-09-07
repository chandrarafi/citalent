<?php

use App\Models\Permission;
use App\Models\Role;
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
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone', 25)->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'otp_code')) {
                $table->string('otp_code', 10)->nullable()->after('remember_token');
            }
            if (!Schema::hasColumn('users', 'otp_expires_at')) {
                $table->timestamp('otp_expires_at')->nullable()->after('otp_code');
            }
        });

        // Ensure 'kandidat' role exists
        if (Schema::hasTable('roles')) {
            $kandidatRole = Role::firstOrCreate(
                ['name' => 'kandidat'],
                [
                    'label' => 'Kandidat',
                    'description' => 'Role untuk pelamar kerja / kandidat.',
                ]
            );

            // Assign basic view-dashboard permission if available
            $viewDashboard = Permission::where('name', 'view-dashboard')->first();
            if ($viewDashboard) {
                $kandidatRole->permissions()->syncWithoutDetaching([$viewDashboard->id]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'phone')) {
                $table->dropColumn('phone');
            }
            if (Schema::hasColumn('users', 'otp_code')) {
                $table->dropColumn('otp_code');
            }
            if (Schema::hasColumn('users', 'otp_expires_at')) {
                $table->dropColumn('otp_expires_at');
            }
        });
    }
};
