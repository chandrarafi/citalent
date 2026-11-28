<?php

use App\Models\Menu;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $permission = Permission::firstOrCreate(
            ['name' => 'manage-helpdesk'],
            [
                'label' => 'Kelola Pengaduan Helpdesk',
                'group' => 'rekrutmen',
            ]
        );

        $roleNames = ['super-admin', 'hr-manager', 'hr'];
        $roles = Role::whereIn('name', $roleNames)->get();

        foreach ($roles as $role) {
            $role->permissions()->syncWithoutDetaching([$permission->id]);
        }

        $menu = Menu::updateOrCreate(
            ['name' => 'helpdesk'],
            [
                'label' => 'Helpdesk Error',
                'kelompok' => 'Rekrutmen & Seleksi',
                'url' => '/helpdesk',
                'icon' => 'comment',
                'tone' => 'orange',
                'order' => 9,
                'permission_name' => 'manage-helpdesk',
                'is_active' => true,
            ]
        );

        if ($roles->isNotEmpty()) {
            $menu->roles()->syncWithoutDetaching($roles->pluck('id')->all());
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Menu::where('name', 'helpdesk')->delete();
        Permission::where('name', 'manage-helpdesk')->delete();
    }
};
