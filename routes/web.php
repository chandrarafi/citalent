<?php

use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\KandidatLowonganController;
use App\Http\Controllers\KandidatProfileController;
use App\Http\Controllers\LowonganController;
use App\Http\Controllers\PelamarController;
use App\Http\Controllers\PermintaanRekrutmenController;
use App\Http\Controllers\PublicJobController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ─── Public Job Vacancy & Candidate Application ─────────────────────────────
Route::get('/karir/{slug}', [PublicJobController::class, 'show'])->name('careers.show');
Route::post('/karir/{slug}/apply', [PublicJobController::class, 'apply'])->name('careers.apply');

// ─── Auth ────────────────────────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');

    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->name('register.post');

    Route::get('/verify-otp', [AuthController::class, 'showVerifyOtp'])->name('otp.verify');
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp'])->name('otp.verify.post');
    Route::post('/resend-otp', [AuthController::class, 'resendOtp'])->name('otp.resend');
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

// ─── App ─────────────────────────────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::get('/', function () {
        return Inertia::render('dashboard/Index');
    })->name('dashboard');

    // ─── Fitur Kandidat ──────────────────────────────────────────────────────
    Route::get('/kandidat/lowongan', [KandidatLowonganController::class, 'index'])->name('kandidat.lowongan');
    Route::post('/kandidat/lowongan/{lowongan}/apply', [KandidatLowonganController::class, 'apply'])->name('kandidat.lowongan.apply');
    Route::get('/kandidat/lamaran', [KandidatLowonganController::class, 'myApplications'])->name('kandidat.lamaran');
    Route::get('/kandidat/lamaran/{pelamar:no_pendaftaran}', [KandidatLowonganController::class, 'showApplication'])->name('kandidat.lamaran.show');
    Route::get('/kandidat/profil', [KandidatProfileController::class, 'edit'])->name('kandidat.profile');
    Route::post('/kandidat/profil', [KandidatProfileController::class, 'update'])->name('kandidat.profile.update');

    // ─── Permintaan Rekrutmen ────────────────────────────────────────────────
    Route::post('/permintaanrekrutmen/{permintaanrekrutman}/approve', [PermintaanRekrutmenController::class, 'approve'])
        ->name('permintaan-rekrutmen.approve')
        ->middleware('permission:manage-permintaan-rekrutmen');

    Route::post('/permintaanrekrutmen/{permintaanrekrutman}/reject', [PermintaanRekrutmenController::class, 'reject'])
        ->name('permintaan-rekrutmen.reject')
        ->middleware('permission:manage-permintaan-rekrutmen');

    Route::post('/permintaanrekrutmen/{permintaanrekrutman}/publish', [PermintaanRekrutmenController::class, 'publish'])
        ->name('permintaan-rekrutmen.publish')
        ->middleware('permission:manage-permintaan-rekrutmen');

    Route::resource('permintaanrekrutmen', PermintaanRekrutmenController::class)
        ->names('permintaan-rekrutmen')
        ->middleware('permission:manage-permintaan-rekrutmen');

    // ─── Manajemen Lowongan Pekerjaan ────────────────────────────────────────
    Route::get('/lowongan', [LowonganController::class, 'index'])
        ->name('lowongan.index')
        ->middleware('permission:manage-permintaan-rekrutmen');

    Route::get('/lowongan/create', [LowonganController::class, 'create'])
        ->name('lowongan.create')
        ->middleware('permission:manage-permintaan-rekrutmen');

    Route::post('/lowongan', [LowonganController::class, 'store'])
        ->name('lowongan.store')
        ->middleware('permission:manage-permintaan-rekrutmen');

    Route::get('/lowongan/{lowongan}', [LowonganController::class, 'show'])
        ->name('lowongan.show')
        ->middleware('permission:manage-permintaan-rekrutmen');

    Route::get('/lowongan/{lowongan}/edit', [LowonganController::class, 'edit'])
        ->name('lowongan.edit')
        ->middleware('permission:manage-permintaan-rekrutmen');

    Route::put('/lowongan/{lowongan}', [LowonganController::class, 'update'])
        ->name('lowongan.update')
        ->middleware('permission:manage-permintaan-rekrutmen');

    Route::post('/lowongan/{lowongan}/toggle-status', [LowonganController::class, 'toggleStatus'])
        ->name('lowongan.toggle-status')
        ->middleware('permission:manage-permintaan-rekrutmen');

    Route::delete('/lowongan/{lowongan}', [LowonganController::class, 'destroy'])
        ->name('lowongan.destroy')
        ->middleware('permission:manage-permintaan-rekrutmen');

    // ─── Manajemen Pelamar / Kandidat ────────────────────────────────────────
    Route::get('/pelamar', [PelamarController::class, 'index'])
        ->name('pelamar.index')
        ->middleware('permission:manage-permintaan-rekrutmen');

    Route::get('/pelamar/{pelamar}', [PelamarController::class, 'show'])
        ->name('pelamar.show')
        ->middleware('permission:manage-permintaan-rekrutmen');

    Route::put('/pelamar/{pelamar}/status', [PelamarController::class, 'updateStatus'])
        ->name('pelamar.update-status')
        ->middleware('permission:manage-permintaan-rekrutmen');

    Route::delete('/pelamar/{pelamar}', [PelamarController::class, 'destroy'])
        ->name('pelamar.destroy')
        ->middleware('permission:manage-permintaan-rekrutmen');

    // ─── Admin ───────────────────────────────────────────────────────────────
    Route::middleware('role:super-admin')->prefix('admin')->name('admin.')->group(function () {
        // Users
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

        // Roles
        Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
        Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
        Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');

        // Master Permissions
        Route::post('/permissions', [RoleController::class, 'storePermission'])->name('permissions.store');

        // Menus
        Route::get('/menus', [MenuController::class, 'index'])->name('menus.index');
        Route::post('/menus', [MenuController::class, 'store'])->name('menus.store');
        Route::put('/menus/{menu}', [MenuController::class, 'update'])->name('menus.update');
        Route::delete('/menus/{menu}', [MenuController::class, 'destroy'])->name('menus.destroy');
    });
});
