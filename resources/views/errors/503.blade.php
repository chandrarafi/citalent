<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Server Maintenance - {{ config('app.name', 'Citalent') }}</title>
        <link rel="icon" href="/favicon.ico" sizes="any">
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/maintenance.tsx'])
    </head>
    <body class="antialiased min-h-screen bg-[#D4F6FF] text-[#3a2e5c]">
        <div id="maintenance-root"></div>
    </body>
</html>
