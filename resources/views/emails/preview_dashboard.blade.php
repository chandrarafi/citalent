<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview Template Email - {{ config('app.name', 'Citalent') }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        /* Header Toolbar */
        .top-navbar {
            background: #1e293b;
            border-bottom: 1px solid #334155;
            padding: 10px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            flex-wrap: wrap;
            z-index: 50;
        }
        .brand-section {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .brand-badge {
            background: #0284c7;
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 3px 8px;
            border-radius: 6px;
        }
        .brand-title {
            font-size: 15px;
            font-weight: 700;
            color: #ffffff;
        }
        /* Nav Tabs */
        .nav-tabs {
            display: flex;
            align-items: center;
            background: #0f172a;
            border-radius: 10px;
            padding: 4px;
            gap: 4px;
        }
        .nav-tab-item {
            text-decoration: none;
            color: #94a3b8;
            font-size: 13px;
            font-weight: 600;
            padding: 6px 14px;
            border-radius: 8px;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .nav-tab-item:hover {
            color: #f8fafc;
            background: #1e293b;
        }
        .nav-tab-item.active {
            background: #2563eb;
            color: #ffffff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        /* Options & Viewport Toolbar */
        .controls-section {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .filter-select {
            background: #0f172a;
            color: #e2e8f0;
            border: 1px solid #475569;
            border-radius: 8px;
            padding: 6px 12px;
            font-size: 12px;
            font-family: inherit;
            cursor: pointer;
            outline: none;
        }
        .filter-select:focus {
            border-color: #38bdf8;
        }
        .viewport-group {
            display: flex;
            background: #0f172a;
            border-radius: 8px;
            padding: 3px;
            gap: 2px;
        }
        .viewport-btn {
            background: transparent;
            border: none;
            color: #94a3b8;
            font-size: 12px;
            font-weight: 600;
            padding: 5px 10px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.15s;
        }
        .viewport-btn:hover {
            color: #ffffff;
        }
        .viewport-btn.active {
            background: #334155;
            color: #38bdf8;
        }
        .btn-link-tab {
            background: #334155;
            color: #f8fafc;
            text-decoration: none;
            font-size: 12px;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: background 0.2s;
        }
        .btn-link-tab:hover {
            background: #475569;
        }
        /* Preview Area */
        .preview-canvas {
            flex: 1;
            background: #cbd5e1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px 16px;
            overflow: auto;
            position: relative;
        }
        .iframe-container {
            height: 100%;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid #94a3b8;
        }
        .iframe-container iframe {
            width: 100%;
            height: 100%;
            border: none;
            background: #f8fafc;
        }
        .iframe-header-bar {
            background: #f1f5f9;
            border-bottom: 1px solid #e2e8f0;
            padding: 6px 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 11px;
            color: #64748b;
        }
        .iframe-header-dots {
            display: flex;
            gap: 5px;
        }
        .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }
        .dot-red { background: #f87171; }
        .dot-yellow { background: #fbbf24; }
        .dot-green { background: #34d399; }
    </style>
</head>
<body>

    @php
        $selectedEmail = collect($emails)->firstWhere('id', $current) ?? $emails[0];
        $currentStatus = request('status', 'interview_hr');
        $currentType = request('type', 'online');
        $currentReminder = request('reminder', '0');
    @endphp

    <!-- Header Toolbar -->
    <header class="top-navbar">
        <div class="brand-section">
            <span class="brand-badge">Preview</span>
            <span class="brand-title">Email Templates (3)</span>
        </div>

        <!-- 3 Email Tabs -->
        <nav class="nav-tabs">
            <a href="{{ route('preview.emails', ['email' => 'otp']) }}" 
               class="nav-tab-item {{ $current === 'otp' ? 'active' : '' }}">
                <span>🔑</span> Kode OTP
            </a>
            <a href="{{ route('preview.emails', ['email' => 'status-lamaran', 'status' => $currentStatus]) }}" 
               class="nav-tab-item {{ $current === 'status-lamaran' ? 'active' : '' }}">
                <span>📋</span> Status Seleksi
            </a>
            <a href="{{ route('preview.emails', ['email' => 'undangan-interview', 'type' => $currentType, 'reminder' => $currentReminder]) }}" 
               class="nav-tab-item {{ $current === 'undangan-interview' ? 'active' : '' }}">
                <span>📅</span> Undangan Interview
            </a>
        </nav>

        <!-- Dynamic Controls -->
        <div class="controls-section">
            {{-- Status Lamaran Variants --}}
            @if ($current === 'status-lamaran')
                <select class="filter-select" onchange="location.href = '{{ route('preview.emails', ['email' => 'status-lamaran']) }}&status=' + this.value">
                    <option value="interview_hr" {{ $currentStatus === 'interview_hr' ? 'selected' : '' }}>Tahap: Interview HR</option>
                    <option value="interview_user" {{ $currentStatus === 'interview_user' ? 'selected' : '' }}>Tahap: Interview User</option>
                    <option value="skill_test" {{ $currentStatus === 'skill_test' ? 'selected' : '' }}>Tahap: Skill Test</option>
                    <option value="interview_gm" {{ $currentStatus === 'interview_gm' ? 'selected' : '' }}>Tahap: Interview GM</option>
                    <option value="final_discussion" {{ $currentStatus === 'final_discussion' ? 'selected' : '' }}>Tahap: Final Discussion</option>
                    <option value="accepted" {{ $currentStatus === 'accepted' ? 'selected' : '' }}>🎉 Status: Diterima Bekerja</option>
                    <option value="rejected" {{ $currentStatus === 'rejected' ? 'selected' : '' }}>❌ Status: Tidak Lolos</option>
                </select>
            @endif

            {{-- Undangan Interview Variants --}}
            @if ($current === 'undangan-interview')
                <select class="filter-select" onchange="location.href = '{{ route('preview.emails', ['email' => 'undangan-interview', 'reminder' => $currentReminder]) }}&type=' + this.value">
                    <option value="online" {{ $currentType === 'online' ? 'selected' : '' }}>Metode: Online (Google Meet)</option>
                    <option value="offline" {{ $currentType === 'offline' ? 'selected' : '' }}>Metode: Offline (Tatap Muka)</option>
                </select>
                <select class="filter-select" onchange="location.href = '{{ route('preview.emails', ['email' => 'undangan-interview', 'type' => $currentType]) }}&reminder=' + this.value">
                    <option value="0" {{ $currentReminder === '0' ? 'selected' : '' }}>Jenis: Undangan Resmi</option>
                    <option value="1" {{ $currentReminder === '1' ? 'selected' : '' }}>Jenis: Pengingat (Reminder)</option>
                </select>
            @endif

            <!-- Responsive Viewport Switcher -->
            <div class="viewport-group">
                <button class="viewport-btn active" onclick="setViewport('desktop', this)">Desktop</button>
                <button class="viewport-btn" onclick="setViewport('tablet', this)">Tablet</button>
                <button class="viewport-btn" onclick="setViewport('mobile', this)">Mobile</button>
            </div>

            <!-- Open in New Tab -->
            <a href="{{ $selectedEmail['url'] }}" target="_blank" class="btn-link-tab" title="Buka dalam tab baru tanpa bingkai">
                <span>Tab Baru ↗</span>
            </a>
        </div>
    </header>

    <!-- Canvas Preview Area -->
    <main class="preview-canvas">
        <div id="iframeWrapper" class="iframe-container" style="width: 100%; max-width: 820px;">
            <div class="iframe-header-bar">
                <div class="iframe-header-dots">
                    <span class="dot dot-red"></span>
                    <span class="dot dot-yellow"></span>
                    <span class="dot dot-green"></span>
                </div>
                <div><strong>{{ $selectedEmail['title'] }}</strong> &bull; {{ $selectedEmail['description'] }}</div>
                <div id="viewportIndicator">Desktop (820px)</div>
            </div>
            <iframe id="emailFrame" src="{{ $selectedEmail['url'] }}"></iframe>
        </div>
    </main>

    <script>
        function setViewport(size, btn) {
            document.querySelectorAll('.viewport-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const wrapper = document.getElementById('iframeWrapper');
            const indicator = document.getElementById('viewportIndicator');

            if (size === 'desktop') {
                wrapper.style.maxWidth = '820px';
                wrapper.style.width = '100%';
                indicator.textContent = 'Desktop (820px)';
            } else if (size === 'tablet') {
                wrapper.style.maxWidth = '640px';
                wrapper.style.width = '100%';
                indicator.textContent = 'Tablet (640px)';
            } else if (size === 'mobile') {
                wrapper.style.maxWidth = '400px';
                wrapper.style.width = '100%';
                indicator.textContent = 'Mobile (400px)';
            }
        }
    </script>
</body>
</html>
