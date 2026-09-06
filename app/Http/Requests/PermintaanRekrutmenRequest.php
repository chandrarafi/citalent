<?php

namespace App\Http\Requests;

use App\Models\Departement;
use App\Models\Jabatan;
use App\Models\PermintaanRekrutmen;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PermintaanRekrutmenRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $permintaan = $this->route('permintaanrekrutman') ?? $this->route('permintaanrekrutmen');
        $id = is_object($permintaan) ? $permintaan->id : $permintaan;

        return [
            'kode_permintaan' => [
                'required',
                'string',
                'max:50',
                Rule::unique(PermintaanRekrutmen::class, 'kode_permintaan')->ignore($id),
            ],
            'kd_departement' => ['required', 'integer', Rule::exists(Departement::class, 'id')],
            'posisi_id' => ['required', 'integer', Rule::exists(Jabatan::class, 'id')],
            'jumlah' => ['required', 'integer', 'min:1'],
            'tgl_permintaan' => ['required', 'date'],
            'target_join' => ['required', 'date', 'after_or_equal:tgl_permintaan'],
            'prioritas' => ['required', 'string', 'in:high,medium,low'],
            'status_persetujuan' => ['nullable', 'string', 'in:pending,disetujui,ditolak,cancel'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'kode_permintaan' => 'Kode Permintaan',
            'kd_departement' => 'Departemen',
            'posisi_id' => 'Posisi / Jabatan',
            'jumlah' => 'Jumlah Kebutuhan',
            'tgl_permintaan' => 'Tanggal Permintaan',
            'target_join' => 'Target Bergabung (Join)',
            'prioritas' => 'Prioritas',
            'status_persetujuan' => 'Status Persetujuan',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'unique' => ':attribute sudah terdaftar, gunakan kode lain.',
            'exists' => ':attribute yang dipilih tidak valid.',
            'min' => ':attribute minimal bernilai :min.',
            'after_or_equal' => ':attribute harus sama atau setelah Tanggal Permintaan.',
            'in' => ':attribute yang dipilih tidak sesuai pilihan yang tersedia.',
        ];
    }
}
