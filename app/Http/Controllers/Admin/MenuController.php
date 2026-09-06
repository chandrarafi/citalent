<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/Menus', [
            'menus' => Menu::with('roles')
                ->whereNull('parent_id')
                ->orderBy('order')
                ->get()
                ->map(fn (Menu $m) => [
                    'id' => $m->id,
                    'name' => $m->name,
                    'label' => $m->label,
                    'url' => $m->url,
                    'icon' => $m->icon,
                    'tone' => $m->tone,
                    'order' => $m->order,
                    'is_active' => $m->is_active,
                    'permission_name' => $m->permission_name,
                    'roles' => $m->roles->pluck('name')->all(),
                ]),
            'allRoles' => Role::orderBy('id')->get()->map(fn (Role $r) => [
                'id' => $r->id,
                'name' => $r->name,
                'label' => $r->label,
            ])->all(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'label' => ['required', 'string', 'max:150'],
            'url' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:100'],
            'tone' => ['nullable', 'string', 'max:50'],
            'order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
            'permission_name' => ['nullable', 'string', 'max:150'],
            'roles' => ['array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        $menu = Menu::create([
            'name' => $data['name'],
            'label' => $data['label'],
            'url' => $data['url'],
            'icon' => $data['icon'] ?? null,
            'tone' => $data['tone'] ?? 'default',
            'order' => $data['order'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
            'permission_name' => $data['permission_name'] ?? null,
        ]);

        if (!empty($data['roles'])) {
            $ids = Role::whereIn('name', $data['roles'])->pluck('id');
            $menu->roles()->sync($ids);
        }

        return back()->with('success', "Menu '{$menu->label}' berhasil dibuat.");
    }

    public function update(Request $request, Menu $menu): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'label' => ['required', 'string', 'max:150'],
            'url' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:100'],
            'tone' => ['nullable', 'string', 'max:50'],
            'order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
            'permission_name' => ['nullable', 'string', 'max:150'],
            'roles' => ['array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        $menu->update([
            'name' => $data['name'],
            'label' => $data['label'],
            'url' => $data['url'],
            'icon' => $data['icon'] ?? null,
            'tone' => $data['tone'] ?? 'default',
            'order' => $data['order'] ?? $menu->order,
            'is_active' => $data['is_active'] ?? $menu->is_active,
            'permission_name' => $data['permission_name'] ?? null,
        ]);

        $ids = Role::whereIn('name', $data['roles'] ?? [])->pluck('id');
        $menu->roles()->sync($ids);

        return back()->with('success', "Menu '{$menu->label}' berhasil diperbarui.");
    }

    public function destroy(Menu $menu): RedirectResponse
    {
        $menu->delete();

        return back()->with('success', "Menu '{$menu->label}' berhasil dihapus.");
    }
}
