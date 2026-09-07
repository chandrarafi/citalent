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
        // 1. Ensure Role 'kandidat' exists
        $kandidatRole = Role::firstOrCreate(
            ['name' => 'kandidat'],
            [
                'label' => 'Kandidat',
                'description' => 'Role untuk pelamar kerja / kandidat.',
            ]
        );

        $superAdmin = Role::where('name', 'super-admin')->first();

        // 2. Create Candidate Permissions
        $p1 = Permission::firstOrCreate(
            ['name' => 'view-lowongan-kandidat'],
            [
                'label' => 'Lihat Lowongan Kerja Kandidat',
                'group' => 'kandidat',
            ]
        );

        $p2 = Permission::firstOrCreate(
            ['name' => 'apply-lowongan-kandidat'],
            [
                'label' => 'Lamar Lowongan Kerja',
                'group' => 'kandidat',
            ]
        );

        // Sync permissions to kandidat role
        $kandidatRole->permissions()->syncWithoutDetaching([$p1->id, $p2->id]);
        if ($superAdmin) {
            $superAdmin->permissions()->syncWithoutDetaching([$p1->id, $p2->id]);
        }

        // 3. Create Candidate Menus
        $menus = [
            [
                'name' => 'kandidat-lowongan',
                'label' => 'Lowongan Kerja',
                'url' => '/kandidat/lowongan',
                'icon' => 'target',
                'tone' => 'purple',
                'order' => 1,
                'permission_name' => 'view-lowongan-kandidat',
            ],
            [
                'name' => 'kandidat-profil',
                'label' => 'Profil Biodata',
                'url' => '/kandidat/profil',
                'icon' => 'users',
                'tone' => 'mint',
                'order' => 2,
                'permission_name' => 'view-lowongan-kandidat',
            ],
            [
                'name' => 'kandidat-lamaran',
                'label' => 'Riwayat Lamaran',
                'url' => '/kandidat/lamaran',
                'icon' => 'log',
                'tone' => 'blue',
                'order' => 3,
                'permission_name' => 'view-lowongan-kandidat',
            ],
        ];

        foreach ($menus as $m) {
            $menu = Menu::updateOrCreate(
                ['name' => $m['name']],
                $m
            );

            $menu->roles()->syncWithoutDetaching([$kandidatRole->id]);
            if ($superAdmin) {
                $menu->roles()->syncWithoutDetaching([$superAdmin->id]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Menu::whereIn('name', ['kandidat-lowongan', 'kandidat-profil', 'kandidat-lamaran'])->delete();
        Permission::whereIn('name', ['view-lowongan-kandidat', 'apply-lowongan-kandidat'])->delete();
    }
};
