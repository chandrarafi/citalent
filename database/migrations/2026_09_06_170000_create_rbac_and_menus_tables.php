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
        // 1. Roles table
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g. super-admin, hr-manager, employee
            $table->string('label'); // Display name e.g. Super Admin
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 2. Permissions table
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g. view-dashboard, manage-roles, manage-menus
            $table->string('label'); // Display name e.g. Manage Roles
            $table->string('group')->default('general'); // e.g. dashboard, rbac, menu, employee
            $table->timestamps();
        });

        // 3. Pivot: permission_role
        Schema::create('permission_role', function (Blueprint $table) {
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->primary(['permission_id', 'role_id']);
        });

        // 4. Menus table
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // unique slug identifier e.g. dashboard, roles, menus
            $table->string('label'); // Display label e.g. Overview, Roles & Permissions
            $table->string('url')->default('/'); // href path e.g. /, /admin/roles
            $table->string('icon')->default('overview'); // Pouf icon name e.g. overview, settings, log
            $table->string('tone')->default('purple'); // Pouf tone e.g. purple, blue, mint, pink
            $table->integer('order')->default(0);
            $table->foreignId('parent_id')->nullable()->constrained('menus')->cascadeOnDelete();
            $table->string('permission_name')->nullable(); // Optional permission requirement
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 5. Pivot: menu_role
        Schema::create('menu_role', function (Blueprint $table) {
            $table->foreignId('menu_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->primary(['menu_id', 'role_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_role');
        Schema::dropIfExists('menus');
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};
