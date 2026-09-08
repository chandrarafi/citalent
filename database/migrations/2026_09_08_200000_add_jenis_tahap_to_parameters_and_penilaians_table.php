<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Menu;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add jenis_tahap column to parameter_skill_tests
        if (Schema::hasTable('parameter_skill_tests') && !Schema::hasColumn('parameter_skill_tests', 'jenis_tahap')) {
            Schema::table('parameter_skill_tests', function (Blueprint $table) {
                $table->string('jenis_tahap', 50)->default('skill_test')->after('kd_jabatan');
                $table->index(['kd_jabatan', 'jenis_tahap']);
            });
        }

        // 2. Add jenis_tahap column to penilaian_skill_tests
        if (Schema::hasTable('penilaian_skill_tests') && !Schema::hasColumn('penilaian_skill_tests', 'jenis_tahap')) {
            Schema::table('penilaian_skill_tests', function (Blueprint $table) {
                $table->string('jenis_tahap', 50)->default('skill_test')->after('kd_jabatan');
                $table->index(['pelamar_id', 'jenis_tahap']);
            });
        }

        // 3. Create New Permissions
        $newPermissions = [
            ['name' => 'manage-parameter-interview-hr', 'label' => 'Kelola Parameter Interview HR', 'group' => 'rekrutmen'],
            ['name' => 'manage-penilaian-interview-hr', 'label' => 'Penilaian Interview HR', 'group' => 'rekrutmen'],
            ['name' => 'manage-parameter-interview-user', 'label' => 'Kelola Parameter Interview User', 'group' => 'rekrutmen'],
            ['name' => 'manage-penilaian-interview-user', 'label' => 'Penilaian Interview User', 'group' => 'rekrutmen'],
            ['name' => 'manage-parameter-interview-gm', 'label' => 'Kelola Parameter Interview GM', 'group' => 'rekrutmen'],
            ['name' => 'manage-penilaian-interview-gm', 'label' => 'Penilaian Interview GM', 'group' => 'rekrutmen'],
        ];

        $permissionModels = [];
        foreach ($newPermissions as $p) {
            $permissionModels[$p['name']] = Permission::firstOrCreate(
                ['name' => $p['name']],
                $p
            );
        }

        // 4. Create New Menus
        $newMenus = [
            [
                'name' => 'parameter-interview-hr',
                'label' => 'Parameter Interview HR',
                'url' => '/parameter-interview-hr',
                'icon' => 'target',
                'tone' => 'purple',
                'order' => 5,
                'permission_name' => 'manage-parameter-interview-hr',
                'is_active' => true,
            ],
            [
                'name' => 'parameter-interview-user',
                'label' => 'Parameter Interview User',
                'url' => '/parameter-interview-user',
                'icon' => 'target',
                'tone' => 'purple',
                'order' => 6,
                'permission_name' => 'manage-parameter-interview-user',
                'is_active' => true,
            ],
            [
                'name' => 'parameter-interview-gm',
                'label' => 'Parameter Interview GM',
                'url' => '/parameter-interview-gm',
                'icon' => 'target',
                'tone' => 'purple',
                'order' => 7,
                'permission_name' => 'manage-parameter-interview-gm',
                'is_active' => true,
            ],
            [
                'name' => 'penilaian-interview-hr',
                'label' => 'Penilaian Interview HR',
                'url' => '/penilaian-interview-hr',
                'icon' => 'overview',
                'tone' => 'mint',
                'order' => 9,
                'permission_name' => 'manage-penilaian-interview-hr',
                'is_active' => true,
            ],
            [
                'name' => 'penilaian-interview-user',
                'label' => 'Penilaian Interview User',
                'url' => '/penilaian-interview-user',
                'icon' => 'overview',
                'tone' => 'mint',
                'order' => 10,
                'permission_name' => 'manage-penilaian-interview-user',
                'is_active' => true,
            ],
            [
                'name' => 'penilaian-interview-gm',
                'label' => 'Penilaian Interview GM',
                'url' => '/penilaian-interview-gm',
                'icon' => 'overview',
                'tone' => 'mint',
                'order' => 11,
                'permission_name' => 'manage-penilaian-interview-gm',
                'is_active' => true,
            ],
        ];

        $menuModels = [];
        foreach ($newMenus as $m) {
            $menuModels[$m['name']] = Menu::firstOrCreate(
                ['name' => $m['name']],
                $m
            );
        }

        // 5. Attach to Roles
        $superAdmin = Role::where('name', 'super-admin')->first();
        if ($superAdmin) {
            $superAdmin->permissions()->syncWithoutDetaching(array_map(fn($p) => $p->id, $permissionModels));
            $superAdmin->menus()->syncWithoutDetaching(array_map(fn($m) => $m->id, $menuModels));
        }

        $hrManager = Role::where('name', 'hr-manager')->first();
        if ($hrManager) {
            $hrManager->permissions()->syncWithoutDetaching(array_map(fn($p) => $p->id, $permissionModels));
            $hrManager->menus()->syncWithoutDetaching(array_map(fn($m) => $m->id, $menuModels));
        }

        $penguji = Role::where('name', 'penguji')->first();
        if ($penguji) {
            $pengujiPermissions = [
                $permissionModels['manage-penilaian-interview-hr']->id,
                $permissionModels['manage-penilaian-interview-user']->id,
                $permissionModels['manage-penilaian-interview-gm']->id,
            ];
            $pengujiMenus = [
                $menuModels['penilaian-interview-hr']->id,
                $menuModels['penilaian-interview-user']->id,
                $menuModels['penilaian-interview-gm']->id,
            ];
            $penguji->permissions()->syncWithoutDetaching($pengujiPermissions);
            $penguji->menus()->syncWithoutDetaching($pengujiMenus);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $names = [
            'parameter-interview-hr',
            'parameter-interview-user',
            'parameter-interview-gm',
            'penilaian-interview-hr',
            'penilaian-interview-user',
            'penilaian-interview-gm',
        ];

        Menu::whereIn('name', $names)->delete();
        Permission::whereIn('name', array_map(fn($n) => "manage-{$n}", $names))->delete();

        if (Schema::hasColumn('parameter_skill_tests', 'jenis_tahap')) {
            Schema::table('parameter_skill_tests', function (Blueprint $table) {
                $table->dropColumn('jenis_tahap');
            });
        }

        if (Schema::hasColumn('penilaian_skill_tests', 'jenis_tahap')) {
            Schema::table('penilaian_skill_tests', function (Blueprint $table) {
                $table->dropColumn('jenis_tahap');
            });
        }
    }
};
