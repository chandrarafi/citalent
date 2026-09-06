<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/Roles', [
            'roles' => Role::with('permissions')->orderBy('id')->get()->map(fn (Role $r) => [
                'id' => $r->id,
                'name' => $r->name,
                'label' => $r->label,
                'permissions' => $r->permissions->pluck('name')->all(),
            ]),
            'allPermissions' => Permission::orderBy('name')->pluck('name')->all(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:roles,name'],
            'label' => ['required', 'string', 'max:150'],
            'permissions' => ['array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role = Role::create([
            'name' => $data['name'],
            'label' => $data['label'],
        ]);

        if (!empty($data['permissions'])) {
            $ids = Permission::whereIn('name', $data['permissions'])->pluck('id');
            $role->permissions()->sync($ids);
        }

        return back()->with('success', "Role '{$role->label}' berhasil dibuat.");
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100', "unique:roles,name,{$role->id}"],
            'label' => ['required', 'string', 'max:150'],
            'permissions' => ['array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role->update([
            'name' => $data['name'],
            'label' => $data['label'],
        ]);

        $ids = Permission::whereIn('name', $data['permissions'] ?? [])->pluck('id');
        $role->permissions()->sync($ids);

        return back()->with('success', "Role '{$role->label}' berhasil diperbarui.");
    }

    public function destroy(Role $role): RedirectResponse
    {
        if ($role->name === 'super-admin') {
            return back()->with('error', 'Role super-admin tidak dapat dihapus.');
        }

        $role->delete();

        return back()->with('success', "Role '{$role->label}' berhasil dihapus.");
    }

    public function storePermission(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:permissions,name'],
            'label' => ['required', 'string', 'max:150'],
            'group' => ['nullable', 'string', 'max:50'],
        ]);

        $perm = Permission::create([
            'name' => $data['name'],
            'label' => $data['label'],
            'group' => $data['group'] ?? 'general',
        ]);

        // Auto assign to super-admin
        $superAdmin = Role::where('name', 'super-admin')->first();
        if ($superAdmin) {
            $superAdmin->permissions()->syncWithoutDetaching([$perm->id]);
        }

        return back()->with('success', "Hak Akses '{$perm->label}' ({$perm->name}) berhasil ditambahkan.");
    }
}
