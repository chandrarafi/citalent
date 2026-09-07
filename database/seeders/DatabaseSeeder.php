<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleAndMenuSeeder::class);

        // Seed default departemen & jabatan jika belum ada
        if (\App\Models\Departement::count() === 0) {
            $deps = [
                ['kd_departement' => 'IT', 'deskripsi' => 'Information Technology', 'active' => true],
                ['kd_departement' => 'HR', 'deskripsi' => 'Human Resources', 'active' => true],
                ['kd_departement' => 'FIN', 'deskripsi' => 'Finance & Accounting', 'active' => true],
                ['kd_departement' => 'MKT', 'deskripsi' => 'Marketing & Sales', 'active' => true],
                ['kd_departement' => 'OPS', 'deskripsi' => 'Operations', 'active' => true],
            ];

            foreach ($deps as $d) {
                \App\Models\Departement::create($d);
            }
        }

        if (\App\Models\Jabatan::count() === 0) {
            $jabs = [
                ['kd_departement' => 'IT', 'kd_jabatan' => 'IT-DEV', 'nama_jabatan' => 'Fullstack Developer', 'active' => true],
                ['kd_departement' => 'IT', 'kd_jabatan' => 'IT-QA', 'nama_jabatan' => 'QA Engineer', 'active' => true],
                ['kd_departement' => 'HR', 'kd_jabatan' => 'HR-REC', 'nama_jabatan' => 'Recruiter Specialist', 'active' => true],
                ['kd_departement' => 'HR', 'kd_jabatan' => 'HR-MGR', 'nama_jabatan' => 'HR Manager', 'active' => true],
                ['kd_departement' => 'FIN', 'kd_jabatan' => 'FIN-ACC', 'nama_jabatan' => 'Accounting Officer', 'active' => true],
                ['kd_departement' => 'MKT', 'kd_jabatan' => 'MKT-SLS', 'nama_jabatan' => 'Sales Executive', 'active' => true],
            ];

            foreach ($jabs as $j) {
                \App\Models\Jabatan::create($j);
            }
        }
    }
}
