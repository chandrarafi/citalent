<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\SendOtpMail;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Show the login screen.
     */
    public function showLogin(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->intended('/');
        }

        return Inertia::render('auth/Login');
    }

    /**
     * Authenticate user credentials.
     */
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $remember = $request->boolean('remember', false);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user) {
            return back()->withErrors([
                'email' => 'Email atau password yang Anda masukkan salah.',
            ])->onlyInput('email');
        }

        // 1. Cek jika akun sudah diblokir (banned)
        if ($user->isBanned()) {
            return back()->withErrors([
                'email' => 'Akun Anda telah diblokir (Banned) karena telah 10 kali salah memasukkan password. Silakan hubungi Administrator.',
            ])->onlyInput('email');
        }

        // 2. Cek kecocokan password
        if (!Hash::check($credentials['password'], $user->password)) {
            $user->failed_login_attempts += 1;

            if ($user->failed_login_attempts >= 10) {
                $user->status = 'banned';
                $user->is_active = false;
                $user->banned_at = now();
                $user->save();

                return back()->withErrors([
                    'email' => 'Akun Anda telah diblokir (Banned) karena telah 10 kali salah memasukkan password. Silakan hubungi Administrator.',
                ])->onlyInput('email');
            }

            $user->save();
            $sisa = 10 - $user->failed_login_attempts;

            return back()->withErrors([
                'email' => "Password yang Anda masukkan salah",
            ])->onlyInput('email');
        }

        // 3. Cek status aktif (sudah menyelesaikan OTP)
        if (!$user->isActive()) {
            // Generate OTP baru & redirect ke halaman verifikasi OTP
            $otp = sprintf('%06d', random_int(100000, 999999));
            $user->update([
                'otp_code' => $otp,
                'otp_expires_at' => now()->addMinutes(10),
            ]);

            try {
                Mail::to($user->email)->send(new SendOtpMail($otp, $user->name));
            } catch (\Throwable $e) {
                Log::error('Gagal kirim OTP saat login unverified: ' . $e->getMessage());
            }

            $request->session()->put('otp_email', $user->email);

            return redirect()->route('otp.verify')->with('error', 'Akun Anda belum aktif. Silakan masukkan kode OTP yang telah kami kirimkan ke email Anda.');
        }

        // 4. Password valid dan akun aktif: reset failed login & login
        $user->update([
            'failed_login_attempts' => 0,
        ]);

        Auth::login($user, $remember);
        $request->session()->regenerate();

        return redirect()->intended('/');
    }

    /**
     * Show candidate registration form.
     */
    public function showRegister(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->intended('/');
        }

        return Inertia::render('auth/Register');
    }

    /**
     * Handle candidate registration request.
     */
    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:25'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'phone.required' => 'Nomor HP / WhatsApp wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Alamat email sudah terdaftar. Silakan gunakan email lain atau login.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        // Ensure kandidat role exists
        $kandidatRole = Role::firstOrCreate(
            ['name' => 'kandidat'],
            [
                'label' => 'Kandidat',
                'description' => 'Role untuk pelamar kerja / kandidat.',
            ]
        );

        $otp = sprintf('%06d', random_int(100000, 999999));

        $user = User::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $kandidatRole->id,
            'otp_code' => $otp,
            'otp_expires_at' => now()->addMinutes(10),
            'email_verified_at' => null,
            'is_active' => false,
            'status' => 'pending',
            'failed_login_attempts' => 0,
        ]);

        // Send OTP email
        try {
            Mail::to($user->email)->send(new SendOtpMail($otp, $user->name));
        } catch (\Throwable $e) {
            Log::error('Gagal mengirim email OTP pendaftaran: ' . $e->getMessage());
        }

        $request->session()->put('otp_email', $user->email);

        return redirect()->route('otp.verify')->with('success', 'Pendaftaran berhasil! Kode verifikasi OTP telah dikirim ke email ' . $user->email . '.');
    }

    /**
     * Show OTP verification screen.
     */
    public function showVerifyOtp(Request $request): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->intended('/');
        }

        $email = $request->session()->get('otp_email') ?? $request->query('email');

        if (!$email) {
            return redirect()->route('register');
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            return redirect()->route('register')->withErrors(['email' => 'Akun tidak ditemukan.']);
        }

        if ($user->isActive()) {
            return redirect()->route('login')->with('success', 'Akun Anda sudah aktif. Silakan login.');
        }

        if ($user->isBanned()) {
            return redirect()->route('login')->withErrors(['email' => 'Akun Anda telah diblokir (Banned). Silakan hubungi Administrator.']);
        }

        return Inertia::render('auth/VerifyOtp', [
            'email' => $email,
            'userName' => $user->name,
        ]);
    }

    /**
     * Process OTP verification and activate account.
     */
    public function verifyOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'otp' => ['required', 'string', 'size:6'],
        ], [
            'otp.required' => 'Kode OTP wajib diisi.',
            'otp.size' => 'Kode OTP harus terdiri dari 6 digit.',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return back()->withErrors(['otp' => 'Akun tidak ditemukan.']);
        }

        if ($user->isBanned()) {
            return redirect()->route('login')->withErrors(['email' => 'Akun Anda telah diblokir (Banned). Silakan hubungi Administrator.']);
        }

        if ($user->isActive()) {
            Auth::login($user);
            $request->session()->forget('otp_email');
            $request->session()->regenerate();
            return redirect()->intended('/')->with('success', 'Akun telah aktif.');
        }

        if ($user->otp_code !== $request->otp) {
            return back()->withErrors(['otp' => 'Kode OTP yang Anda masukkan salah.']);
        }

        if ($user->otp_expires_at && now()->greaterThan($user->otp_expires_at)) {
            return back()->withErrors(['otp' => 'Kode OTP telah kedaluwarsa. Silakan klik tombol "Kirim Ulang OTP".']);
        }

        // Verifikasi berhasil: aktifkan akun
        $user->update([
            'email_verified_at' => now(),
            'is_active' => true,
            'status' => 'active',
            'failed_login_attempts' => 0,
            'otp_code' => null,
            'otp_expires_at' => null,
        ]);

        $request->session()->forget('otp_email');
        Auth::login($user);
        $request->session()->regenerate();

        if ($user->hasRole('kandidat') && !$user->isProfileComplete()) {
            return redirect()->route('kandidat.profile')->with('success', 'Selamat! Akun Anda berhasil diverifikasi dan aktif. Silakan lengkapi profil biodata Anda untuk keperluan melamar pekerjaan.');
        }

        return redirect()->intended('/')->with('success', 'Selamat! Akun Anda berhasil diverifikasi dan aktif.');
    }

    /**
     * Resend OTP code to candidate's email.
     */
    public function resendOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return back()->withErrors(['otp' => 'Akun tidak ditemukan.']);
        }

        if ($user->isBanned()) {
            return redirect()->route('login')->withErrors(['email' => 'Akun Anda telah diblokir (Banned). Silakan hubungi Administrator.']);
        }

        if ($user->isActive()) {
            return redirect()->route('login')->with('success', 'Akun Anda sudah aktif. Silakan login.');
        }

        $otp = sprintf('%06d', random_int(100000, 999999));

        $user->update([
            'otp_code' => $otp,
            'otp_expires_at' => now()->addMinutes(10),
        ]);

        try {
            Mail::to($user->email)->send(new SendOtpMail($otp, $user->name));
        } catch (\Throwable $e) {
            Log::error('Gagal mengirim ulang email OTP: ' . $e->getMessage());
        }

        return back()->with('success', 'Kode OTP baru telah berhasil dikirim ke ' . $user->email . '.');
    }

    /**
     * Log the user out of the application.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
