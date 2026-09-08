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
        Schema::create('parameter_skill_tests', function (Blueprint $table) {
            $table->id();
            $table->string('kd_jabatan');
            $table->string('parameter');
            $table->unsignedInteger('bobot')->default(0); // in percent, e.g. 30 for 30%
            $table->string('icon')->nullable();
            $table->unsignedInteger('urutan')->default(1);
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index('kd_jabatan');
        });

        Schema::create('detail_parameter_skill_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parameter_skill_test_id')
                ->constrained('parameter_skill_tests')
                ->onDelete('cascade');
            $table->string('yang_dinilai');
            $table->unsignedInteger('urutan')->default(1);
            $table->timestamps();
        });

        // Add Permission
        $permission = Permission::firstOrCreate(
            ['name' => 'manage-parameter-skill-test'],
            [
                'label' => 'Kelola Parameter Skill Test',
                'group' => 'rekrutmen',
            ]
        );

        // Attach to super-admin and hr-manager
        $superAdmin = Role::where('name', 'super-admin')->first();
        if ($superAdmin) {
            $superAdmin->permissions()->syncWithoutDetaching([$permission->id]);
        }

        $hrManager = Role::where('name', 'hr-manager')->first();
        if ($hrManager) {
            $hrManager->permissions()->syncWithoutDetaching([$permission->id]);
        }

        // Add Menu
        $menu = Menu::firstOrCreate(
            ['name' => 'parameter-skill-test'],
            [
                'label' => 'Parameter Skill Test',
                'url' => '/parameter-skill-test',
                'icon' => 'target',
                'tone' => 'purple',
                'order' => 4,
                'permission_name' => 'manage-parameter-skill-test',
                'is_active' => true,
            ]
        );

        if ($superAdmin) {
            $superAdmin->menus()->syncWithoutDetaching([$menu->id]);
        }
        if ($hrManager) {
            $hrManager->menus()->syncWithoutDetaching([$menu->id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_parameter_skill_tests');
        Schema::dropIfExists('parameter_skill_tests');

        Menu::where('name', 'parameter-skill-test')->delete();
        Permission::where('name', 'manage-parameter-skill-test')->delete();
    }
};
