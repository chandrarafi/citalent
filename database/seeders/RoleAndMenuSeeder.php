<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RoleAndMenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Roles
        $superAdmin = Role::firstOrCreate(
            ['name' => 'super-admin'],
            [
                'label' => 'Super Admin',
                'description' => 'Full administrative access to all features, RBAC, and menus.',
            ]
        );

        $hrManager = Role::firstOrCreate(
            ['name' => 'hr-manager'],
            [
                'label' => 'HR Manager',
                'description' => 'Access to HR operations and employees management.',
            ]
        );

        $employee = Role::firstOrCreate(
            ['name' => 'employee'],
            [
                'label' => 'Employee',
                'description' => 'Standard employee user access.',
            ]
        );

        $kandidat = Role::firstOrCreate(
            ['name' => 'kandidat'],
            [
                'label' => 'Kandidat',
                'description' => 'Role untuk pelamar kerja / kandidat.',
            ]
        );

        // 2. Create Permissions
        $permissions = [
            ['name' => 'view-dashboard', 'label' => 'View Dashboard', 'group' => 'dashboard'],
            ['name' => 'manage-roles', 'label' => 'Manage Roles & Permissions', 'group' => 'rbac'],
            ['name' => 'manage-menus', 'label' => 'Manage System Menus', 'group' => 'menu'],
            ['name' => 'manage-users', 'label' => 'Manage User Accounts', 'group' => 'user'],
            ['name' => 'manage-employees', 'label' => 'Manage Employee Records', 'group' => 'employee'],
            ['name' => 'manage-permintaan-rekrutmen', 'label' => 'Kelola Permintaan Rekrutmen', 'group' => 'rekrutmen'],
            ['name' => 'view-lowongan-kandidat', 'label' => 'Lihat Lowongan Kerja Kandidat', 'group' => 'kandidat'],
            ['name' => 'apply-lowongan-kandidat', 'label' => 'Lamar Lowongan Kerja', 'group' => 'kandidat'],
        ];

        $permissionModels = [];
        foreach ($permissions as $p) {
            $permissionModels[$p['name']] = Permission::firstOrCreate(
                ['name' => $p['name']],
                $p
            );
        }

        // Attach all permissions to super-admin
        $superAdmin->permissions()->sync(array_values(array_map(fn ($p) => $p->id, $permissionModels)));

        // Attach specific permissions to hr-manager
        $hrManager->permissions()->sync([
            $permissionModels['view-dashboard']->id,
            $permissionModels['manage-employees']->id,
            $permissionModels['manage-permintaan-rekrutmen']->id,
        ]);

        // Attach employee permissions
        $employee->permissions()->sync([
            $permissionModels['view-dashboard']->id,
        ]);

        // Attach kandidat permissions
        $kandidat->permissions()->sync([
            $permissionModels['view-lowongan-kandidat']->id,
            $permissionModels['apply-lowongan-kandidat']->id,
        ]);

        // 3. Create Menus
        $menusData = [
            [
                'name' => 'overview',
                'label' => 'Overview',
                'url' => '/',
                'icon' => 'overview',
                'tone' => 'purple',
                'order' => 1,
                'permission_name' => 'view-dashboard',
            ],
            [
                'name' => 'permintaanrekrutmen',
                'label' => 'Permintaan Rekrutmen',
                'url' => '/permintaanrekrutmen',
                'icon' => 'menu',
                'tone' => 'mint',
                'order' => 2,
                'permission_name' => 'manage-permintaan-rekrutmen',
            ],
            [
                'name' => 'lowongan',
                'label' => 'Lowongan Pekerjaan',
                'url' => '/lowongan',
                'icon' => 'target',
                'tone' => 'purple',
                'order' => 3,
                'permission_name' => 'manage-permintaan-rekrutmen',
            ],
            [
                'name' => 'pelamar',
                'label' => 'Data Pelamar',
                'url' => '/pelamar',
                'icon' => 'users',
                'tone' => 'blue',
                'order' => 4,
                'permission_name' => 'manage-permintaan-rekrutmen',
            ],
            [
                'name' => 'users',
                'label' => 'User Management',
                'url' => '/admin/users',
                'icon' => 'users',
                'tone' => 'blue',
                'order' => 5,
                'permission_name' => 'manage-users',
            ],
            [
                'name' => 'roles',
                'label' => 'Roles & RBAC',
                'url' => '/admin/roles',
                'icon' => 'target',
                'tone' => 'purple',
                'order' => 6,
                'permission_name' => 'manage-roles',
            ],
            [
                'name' => 'menus',
                'label' => 'Menu Management',
                'url' => '/admin/menus',
                'icon' => 'settings',
                'tone' => 'orange',
                'order' => 7,
                'permission_name' => 'manage-menus',
            ],
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

        foreach ($menusData as $m) {
            $menu = Menu::updateOrCreate(
                ['name' => $m['name']],
                $m
            );

            // By default, link super-admin to all menus
            $menu->roles()->syncWithoutDetaching([$superAdmin->id]);

            // General menus accessible to all roles
            if (in_array($m['name'], ['overview', 'inbox', 'board', 'messages', 'settings'])) {
                $menu->roles()->syncWithoutDetaching([$hrManager->id, $employee->id]);
            }

            if (in_array($m['name'], ['kandidat-lowongan', 'kandidat-profil', 'kandidat-lamaran'])) {
                $menu->roles()->syncWithoutDetaching([$kandidat->id]);
            }
        }

        // 4. Create Initial Super Admin User
        User::updateOrCreate(
            ['email' => 'admin@citalent.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password'),
                'role_id' => $superAdmin->id,
                'email_verified_at' => now(),
            ]
        );

        // Create HR Manager User
        User::updateOrCreate(
            ['email' => 'hr@citalent.com'],
            [
                'name' => 'HR Specialist',
                'password' => Hash::make('password'),
                'role_id' => $hrManager->id,
                'email_verified_at' => now(),
            ]
        );
    }
}
