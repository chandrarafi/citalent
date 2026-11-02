@if(($status ?? '') === 'rejected')
    @include('emails.lamaran_gagal')
@else
    @include('emails.lamaran_lulus')
@endif