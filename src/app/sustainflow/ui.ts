/**
 * SustainFlow Autonomous Investigation & Industrial Sustainability Center
 * Design System: Vercel / shadcn/ui inspired
 * - Geist / Inter typography with tight tracking (-0.03em)
 * - Deep dark zinc/neutral palette: #000000 base, #09090b surface, #18181b elevated
 * - Precision 1px borders (#27272a, #3f3f46) with subtle card top-highlight borders
 * - Minimalist monochrome buttons with crisp hover states (white-on-black, subtle rings)
 * - Sleek badges, tabs, and monospace data badges (Geist Mono style)
 * - Clean tabular data layout with minimal divider lines
 */

export function renderSustainFlowHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SustainFlow — Industrial Intelligence & Autonomous Operations</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --background: #000000;
      --foreground: #EDEDED;
      --card: #0A0A0A;
      --card-foreground: #EDEDED;
      --card-subtle: #111111;
      --card-hover: #141414;
      --border: #222222;
      --border-subtle: #1A1A1A;
      --border-hover: #333333;
      --muted: #171717;
      --muted-foreground: #888888;
      --muted-dim: #555555;
      
      --accent: #FFFFFF;
      --accent-foreground: #000000;
      
      --badge-bg: #18181B;
      --badge-border: #27272A;
      
      --success: #10B981;
      --success-bg: rgba(16, 185, 129, 0.08);
      --success-border: rgba(16, 185, 129, 0.25);
      
      --warning: #F59E0B;
      --warning-bg: rgba(245, 158, 11, 0.08);
      --warning-border: rgba(245, 158, 11, 0.25);
      
      --destructive: #EF4444;
      --destructive-bg: rgba(239, 68, 68, 0.08);
      --destructive-border: rgba(239, 68, 68, 0.25);
      
      --blue: #3B82F6;
      --blue-bg: rgba(59, 130, 246, 0.08);
      --blue-border: rgba(59, 130, 246, 0.25);

      --radius: 8px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--background);
      color: var(--foreground);
      min-height: 100vh;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      letter-spacing: -0.015em;
    }

    /* Subdued Vercel-style subtle background grid */
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 64px 64px;
      pointer-events: none;
      z-index: 0;
    }

    /* Top Navigation - Vercel / shadcn navbar */
    nav {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-subtle);
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
    }

    .nav-left {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      text-decoration: none;
      color: var(--foreground);
    }

    .brand-triangle {
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-title {
      font-size: 0.92rem;
      font-weight: 600;
      letter-spacing: -0.03em;
      color: #FFFFFF;
    }

    .nav-divider {
      width: 1px;
      height: 18px;
      background: var(--border);
    }

    .nav-badge-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 6px;
      background: var(--card-subtle);
      border: 1px solid var(--border);
      color: var(--muted-foreground);
    }

    .nav-badge.live {
      color: #D4D4D8;
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--success);
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    /* Buttons - shadcn / Vercel style */
    .btn {
      font-family: inherit;
      font-size: 0.8125rem;
      font-weight: 500;
      line-height: 1;
      height: 34px;
      padding: 0 12px;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      transition: all 0.15s ease;
      text-decoration: none;
      outline: none;
    }

    .btn-default {
      background: #FFFFFF;
      color: #000000;
      border: 1px solid #FFFFFF;
    }
    .btn-default:hover:not(:disabled) {
      background: #E5E5E5;
      border-color: #E5E5E5;
    }

    .btn-secondary {
      background: var(--card-subtle);
      color: var(--foreground);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover:not(:disabled) {
      background: var(--muted);
      border-color: var(--border-hover);
    }

    .btn-outline {
      background: transparent;
      color: var(--muted-foreground);
      border: 1px solid var(--border);
    }
    .btn-outline:hover:not(:disabled) {
      background: var(--card-subtle);
      color: var(--foreground);
      border-color: var(--border-hover);
    }
    .btn-outline.active {
      background: var(--muted);
      color: #FFFFFF;
      border-color: #444444;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Main Container */
    main {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 1.5rem 1.5rem 4rem;
      box-sizing: border-box;
    }

    /* Page Header */
    .page-header {
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 1rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    .page-title {
      font-size: clamp(1.2rem, 3vw, 1.5rem);
      font-weight: 600;
      letter-spacing: -0.035em;
      color: #FFFFFF;
      margin-bottom: 0.25rem;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: var(--muted-foreground);
    }

    /* 2-Column Grid - minmax(0, 1fr) prevents content blowout */
    .dashboard-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 1.5rem;
      align-items: start;
    }

    .dashboard-grid > div {
      min-width: 0;
    }

    @media (max-width: 1024px) {
      .dashboard-grid { grid-template-columns: minmax(0, 1fr); }
    }

    /* Cards - shadcn border-subtle, sharp radius, card-subtle headers */
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      position: relative;
      overflow: hidden;
    }

    .card-header {
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-subtle);
    }

    .card-title {
      font-size: 0.9375rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: #FFFFFF;
    }

    .card-description {
      font-size: 0.8125rem;
      color: var(--muted-foreground);
      margin-top: 0.15rem;
    }

    .card-content {
      padding: 1.5rem;
    }

    /* Telemetry Metric Cards - shadcn stat card style */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 640px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
    }

    .stat-box {
      background: var(--card-subtle);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1rem 1.1rem;
      transition: border-color 0.15s ease;
    }

    .stat-box:hover {
      border-color: var(--border-hover);
    }

    .stat-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--muted-foreground);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.4rem;
    }

    .stat-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.03em;
      color: #FFFFFF;
      line-height: 1;
    }

    .stat-value.alert { color: var(--destructive); }
    .stat-value.good { color: var(--success); }

    /* Trace Items - Terminal / Geist aesthetic */
    .trace-feed {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 600px;
      overflow-y: auto;
      padding-right: 0.25rem;
    }

    .trace-card {
      background: var(--card-subtle);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 1rem 1.15rem;
      transition: border-color 0.15s ease;
    }

    .trace-card:hover {
      border-color: var(--border-hover);
    }

    .trace-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.35rem;
    }

    .trace-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6875rem;
      font-weight: 500;
      text-transform: uppercase;
      padding: 1px 6px;
      border-radius: 4px;
      background: var(--muted);
      border: 1px solid var(--border);
      color: var(--muted-foreground);
      letter-spacing: 0.04em;
    }

    .trace-tag.plan { color: #A78BFA; border-color: rgba(167, 139, 250, 0.3); background: rgba(167, 139, 250, 0.08); }
    .trace-tag.query { color: #60A5FA; border-color: rgba(96, 165, 250, 0.3); background: rgba(96, 165, 250, 0.08); }
    .trace-tag.critic { color: #FBBF24; border-color: rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.08); }
    .trace-tag.finding { color: #34D399; border-color: rgba(52, 211, 153, 0.3); background: rgba(52, 211, 153, 0.08); }
    .trace-tag.recommendation { color: #38BDF8; border-color: rgba(56, 189, 248, 0.3); background: rgba(56, 189, 248, 0.08); }

    .trace-time {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6875rem;
      color: var(--muted-dim);
    }

    .trace-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #EDEDED;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .trace-desc {
      font-size: 0.8125rem;
      color: var(--muted-foreground);
      line-height: 1.5;
      margin-top: 0.25rem;
    }

    /* SQL Codeblock */
    .sql-container {
      margin-top: 0.65rem;
      background: #000000;
      border: 1px solid var(--border);
      border-radius: 6px;
      overflow: hidden;
    }

    .sql-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 10px;
      background: var(--muted);
      border-bottom: 1px solid var(--border-subtle);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6875rem;
      color: var(--muted-foreground);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .sql-code {
      padding: 0.65rem 0.85rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: #93C5FD;
      line-height: 1.4;
      overflow-x: auto;
    }

    /* Table Component - shadcn style */
    .table-container {
      width: 100%;
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: 6px;
      margin-top: 0.6rem;
    }

    .data-table {
      width: 100%;
      caption-side: bottom;
      font-size: 0.8125rem;
      border-collapse: collapse;
      text-align: left;
    }

    .data-table th {
      border-bottom: 1px solid var(--border);
      padding: 8px 12px;
      color: var(--muted-foreground);
      font-weight: 500;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: var(--card-subtle);
    }

    .data-table td {
      padding: 8px 12px;
      border-bottom: 1px solid var(--border-subtle);
      color: var(--foreground);
      font-size: 0.8125rem;
    }

    .data-table tr:last-child td {
      border-bottom: none;
    }

    .data-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    /* Hypothesis Cards */
    .hyp-item {
      background: var(--card-subtle);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 0.75rem;
    }

    .hyp-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.35rem;
    }

    .badge-refuted {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 4px;
      background: var(--destructive-bg);
      border: 1px solid var(--destructive-border);
      color: #F87171;
    }

    .badge-confirmed {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 4px;
      background: var(--success-bg);
      border: 1px solid var(--success-border);
      color: #34D399;
    }

    /* Intervention Radio Selector (shadcn Card Radio) */
    .intervention-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      margin-bottom: 1.5rem;
    }

    .interv-card {
      background: var(--card-subtle);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.9rem 1.1rem;
      cursor: pointer;
      transition: all 0.15s ease;
      position: relative;
    }

    .interv-card:hover {
      border-color: var(--border-hover);
      background: var(--card-hover);
    }

    .interv-card.selected {
      border-color: #FFFFFF;
      background: #141414;
    }

    .interv-card-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #FFFFFF;
      margin-bottom: 0.2rem;
      padding-right: 80px;
    }

    .interv-card-desc {
      font-size: 0.8125rem;
      color: var(--muted-foreground);
      line-height: 1.45;
    }

    .badge-recommended {
      position: absolute;
      top: 12px;
      right: 12px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 1px 6px;
      border-radius: 4px;
      background: #FFFFFF;
      color: #000000;
    }

    /* Impact Callout Banner - shadcn alert */
    .alert-banner {
      border: 1px solid var(--border);
      background: var(--card-subtle);
      border-radius: 6px;
      padding: 1rem 1.25rem;
      margin-top: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .alert-title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: #34D399;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .alert-desc {
      font-size: 0.8125rem;
      color: var(--muted-foreground);
    }

    .alert-footnote {
      font-size: 0.75rem;
      color: var(--muted-dim);
      margin-top: 0.3rem;
    }

    /* Loading spinner */
    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner {
      display: inline-block;
      width: 13px;
      height: 13px;
      border: 2px solid rgba(128, 128, 128, 0.3);
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes pulse-subtle {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .updating { animation: pulse-subtle 1s ease infinite; }
  </style>
</head>
<body>

  <!-- Top Navigation (Vercel-like) -->
  <nav>
    <div class="nav-left">
      <a href="/" class="brand-logo">
        <span class="brand-title">SustainFlow</span>
      </a>
      <div class="nav-divider"></div>
      <div class="nav-badge-group">
        <span class="nav-badge live">
          <span class="pulse-dot"></span>
          Zetaris Telemetry
        </span>
        <span class="nav-badge">
          Markovian Flat Engine
        </span>
      </div>
    </div>
    <div class="nav-right">
      <button id="btnReplay" class="btn btn-outline" onclick="toggleReplay()">
        Replay
      </button>
      <button id="btnInvestigate" class="btn btn-default" onclick="startInvestigation()">
        Investigate Line Spike
      </button>
    </div>
  </nav>

  <!-- Main Content -->
  <main>
    <div class="page-header">
      <div>
        <h1 class="page-title">Operational Telemetry &amp; Root-Cause Analysis</h1>
        <p class="page-subtitle">Autonomous diagnostics across packaging lines, energy telemetry, and water waste.</p>
      </div>
      <div id="runStatusBadge" class="nav-badge" style="font-family: 'JetBrains Mono', monospace; font-size: 0.8125rem; padding: 4px 10px;">
        STATUS: READY
      </div>
    </div>

    <!-- 4 Stats Cards in Header -->
    <div class="stats-row">
      <div class="stat-box">
        <div class="stat-label">Quarterly Volume</div>
        <div id="mUnits" class="stat-value">104.2k</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Line Stoppages</div>
        <div id="mStops" class="stat-value alert">3,020</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Idle Energy Lost</div>
        <div id="mEnergy" class="stat-value">2,275 kWh</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Restart Rinse Water</div>
        <div id="mWater" class="stat-value">75.5k L</div>
      </div>
    </div>

    <!-- 2-Column Section -->
    <div class="dashboard-grid">
      <!-- Left Column: Investigation Stream & Critic Matrix -->
      <div>
        <!-- Live Agent Stream -->
        <div class="card" style="margin-bottom: 1.5rem;">
          <div class="card-header">
            <div>
              <div class="card-title">Live Agent Trace Stream</div>
              <div class="card-description">Sequential tool-calling and deterministic SQL verification.</div>
            </div>
          </div>
          <div class="card-content">
            <div id="traceFeed" class="trace-feed">
              <div style="text-align: center; color: var(--muted-foreground); padding: 3rem 1rem;">
                <p style="font-weight: 500; color: #FFFFFF; margin-bottom: 0.25rem;">Autonomous Diagnostics Inactive</p>
                <p style="font-size: 0.8125rem;">Click <strong>"Investigate Line Spike"</strong> above to launch SQL queries against Zetaris.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Hypothesis Matrix & Critic Refutation -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Hypothesis Matrix &amp; Critic Refutation</div>
              <div class="card-description">Formal Markovian evaluation of competing fault hypotheses.</div>
            </div>
          </div>
          <div class="card-content" id="hypothesisList">
            <div class="hyp-item">
              <div class="hyp-top">
                <strong style="font-size: 0.875rem;">1. Production Volume Surge</strong>
                <span class="badge-refuted">REFUTED BY CRITIC</span>
              </div>
              <p style="font-size: 0.8125rem; color: var(--muted-foreground);">
                Refuted: Monthly units in Sep–Nov (34.7k) were lower than July (38.2k). High speed was not the driver.
              </p>
            </div>
            <div class="hyp-item">
              <div class="hyp-top">
                <strong style="font-size: 0.875rem;">2. 5L Container Infeed Instability</strong>
                <span class="badge-confirmed">SUPPORTED BY DATA</span>
              </div>
              <p style="font-size: 0.8125rem; color: var(--muted-foreground);">
                Confirmed: 5L bottle run exhibits 60.1 stops/1k units (double the 3L rate) and accounts for 88% of micro-stoppages.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Operator Intervention & Tradeoff Matrix -->
      <div>
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Human-in-the-Loop Operator Authorization</div>
              <div class="card-description">Select an intervention to simulate energy and downtime abatement.</div>
            </div>
          </div>
          <div class="card-content">
            <!-- Intervention Radio Cards -->
            <div class="intervention-list" id="interventionGrid">
              <div class="interv-card selected" id="card_opt_5l_feed_guide" onclick="selectIntervention('opt_5l_feed_guide')">
                <div class="badge-recommended">RECOMMENDED</div>
                <div class="interv-card-title">5L Line Infeed Guide Realignment &amp; Sensor Cal.</div>
                <div class="interv-card-desc">Recalibrate photoelectric sensors and widen infeed guide rail. −40% stoppages, +5% tech workload.</div>
              </div>
              <div class="interv-card" id="card_opt_smart_idle_standby" onclick="selectIntervention('opt_smart_idle_standby')">
                <div class="interv-card-title">Automated Idle Conveyor Standby Mode</div>
                <div class="interv-card-desc">Drop conveyors and heating elements to low-power after 90s idle. −25% stoppages, +2% tech workload.</div>
              </div>
              <div class="interv-card" id="card_opt_speed_governor" onclick="selectIntervention('opt_speed_governor')">
                <div class="interv-card-title">Dynamic Speed Governor for Viscous Fill Cycles</div>
                <div class="interv-card-desc">Throttle filler velocity by 4% on high-volume runs. −20% stoppages, −1.5% throughput.</div>
              </div>
            </div>

            <!-- Trade-off Table -->
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Baseline</th>
                    <th>Post-Intervention</th>
                    <th>Delta</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Line Stoppages</td>
                    <td id="baseStops" style="font-family: 'JetBrains Mono', monospace;">3,020</td>
                    <td id="simStops" style="font-family: 'JetBrains Mono', monospace;">2,228</td>
                    <td id="deltaStops" style="color: var(--success); font-weight: 600; font-family: 'JetBrains Mono', monospace;">-792 (-26%)</td>
                  </tr>
                  <tr>
                    <td>Idle Power Loss (kWh)</td>
                    <td id="baseEnergy" style="font-family: 'JetBrains Mono', monospace;">2,275</td>
                    <td id="simEnergy" style="font-family: 'JetBrains Mono', monospace;">1,848</td>
                    <td id="deltaEnergy" style="color: var(--success); font-weight: 600; font-family: 'JetBrains Mono', monospace;">-428 kWh</td>
                  </tr>
                  <tr>
                    <td>CO2 Emissions</td>
                    <td style="font-family: 'JetBrains Mono', monospace;">910 kg</td>
                    <td id="simCo2" style="font-family: 'JetBrains Mono', monospace;">739 kg</td>
                    <td id="deltaCo2" style="color: var(--success); font-weight: 600; font-family: 'JetBrains Mono', monospace;">-171 kg CO2</td>
                  </tr>
                  <tr>
                    <td>Restart Rinse Water</td>
                    <td id="baseWater" style="font-family: 'JetBrains Mono', monospace;">75,500 L</td>
                    <td id="simWater" style="font-family: 'JetBrains Mono', monospace;">55,700 L</td>
                    <td id="deltaWater" style="color: var(--success); font-weight: 600; font-family: 'JetBrains Mono', monospace;">-19,800 L</td>
                  </tr>
                  <tr>
                    <td>Technician Workload</td>
                    <td>Nominal</td>
                    <td id="simWorkload">+5% inspection</td>
                    <td id="deltaWorkload" style="color: var(--warning); font-weight: 500;">Accepted</td>
                  </tr>
                  <tr>
                    <td>Throughput Target</td>
                    <td>100%</td>
                    <td id="simThroughput">+0.2%</td>
                    <td id="deltaThroughput" style="color: var(--success); font-weight: 600;">Meets &gt;95%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Impact Banner (shadcn Callout) -->
            <div class="alert-banner">
              <div class="alert-title">
                <span id="bannerTitle">Verified Net Impact: $356 Quarterly / $1,425 Annualized Savings</span>
              </div>
              <div class="alert-desc" id="bannerText">
                Calculated on reduced power standby and municipal rinse water. Fully satisfies factory throughput targets (&gt;95%).
              </div>
              <div class="alert-footnote">
                * Grounded on Zetaris telemetry and verified domain assumptions (18 kW idle draw, 25 L restart rinse).
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="margin-top: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
              <span id="approvalStatus" style="font-size: 0.8125rem; color: var(--muted-foreground);">
                Status: Pending Operator Decision
              </span>
              <button id="btnApprove" class="btn btn-default" onclick="approveIntervention()">
                Authorize Intervention
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    let isReplay = false;
    let lastSimData = null;
    let selectedIntervention = 'opt_5l_feed_guide';

    const INTERVENTIONS = {
      opt_5l_feed_guide:        { name: '5L Guide Realign', reductionPct: 40, workloadPct: 5, throughputPct: 0.2 },
      opt_smart_idle_standby:   { name: 'Idle Standby',    reductionPct: 25, workloadPct: 2, throughputPct: 0.0 },
      opt_speed_governor:       { name: 'Speed Governor',  reductionPct: 20, workloadPct: 1, throughputPct: -1.5 }
    };

    async function loadLatest(replay = false) {
      try {
        const res = await fetch('/api/sustain/cases/latest' + (replay ? '?replay=1' : ''));
        const json = await res.json();
        if (json && json.data) renderRun(json.data);
      } catch (e) { console.error('Failed to load latest run', e); }
    }

    async function startInvestigation() {
      const btn = document.getElementById('btnInvestigate');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Querying...';
      const badge = document.getElementById('runStatusBadge');
      badge.innerText = 'STATUS: RUNNING';
      badge.style.color = '#F59E0B';
      
      ['mUnits','mStops','mEnergy','mWater'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('updating');
      });
      
      try {
        const res = await fetch('/api/sustain/cases/investigate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ runId: 'run_' + Date.now() })
        });
        const json = await res.json();
        if (json && json.data) renderRun(json.data);
      } catch (err) {
        alert('Investigation error: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerText = 'Investigate Line Spike';
        ['mUnits','mStops','mEnergy','mWater'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.classList.remove('updating');
        });
      }
    }

    async function approveIntervention() {
      const btn = document.getElementById('btnApprove');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Authorizing...';
      try {
        const res = await fetch('/api/sustain/cases/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            interventionId: selectedIntervention,
            notes: 'Authorized by Plant Lead for Line 2 calibration window'
          })
        });
        const json = await res.json();
        if (json && json.data) {
          renderRun(json.data);
          document.getElementById('approvalStatus').innerHTML =
            '<strong style="color: var(--success); font-weight: 500;">\u2713 Authorized &amp; Scheduled</strong>';
          btn.innerText = 'Authorized';
        }
      } catch (e) {
        alert('Approval failed: ' + e.message);
        btn.disabled = false;
        btn.innerText = 'Authorize Intervention';
      }
    }

    function selectIntervention(id) {
      selectedIntervention = id;
      document.querySelectorAll('.interv-card').forEach(c => c.classList.remove('selected'));
      const card = document.getElementById('card_' + id);
      if (card) card.classList.add('selected');
      
      if (lastSimData && lastSimData.simulation && lastSimData.simulation.baseline) {
        const base = lastSimData.simulation.baseline;
        const interv = INTERVENTIONS[id];
        const reductPct = interv.reductionPct / 100;
        const modeledStops = Math.round(base.totalStoppages * (1 - reductPct));
        const modeledEnergy = base.idleEnergyKwh * (1 - reductPct);
        const modeledCo2 = modeledEnergy * 0.4;
        const modeledWater = Math.round(modeledStops * 25);
        const savedStops = base.totalStoppages - modeledStops;
        const savedKwh = (base.idleEnergyKwh - modeledEnergy).toFixed(1);
        const savedCo2 = (base.co2EmissionsKg - modeledCo2).toFixed(1);
        const savedWater = base.waterLossLiters - modeledWater;
        const annualSavings = Math.round((parseFloat(savedKwh) * 0.12 + savedWater * 0.003) * 4);

        document.getElementById('simStops').innerText = modeledStops.toLocaleString();
        document.getElementById('deltaStops').innerText = '-' + savedStops.toLocaleString() + ' (-' + interv.reductionPct + '%)';
        document.getElementById('simEnergy').innerText = Math.round(modeledEnergy).toLocaleString();
        document.getElementById('deltaEnergy').innerText = '-' + savedKwh + ' kWh';
        document.getElementById('simCo2').innerText = Math.round(modeledCo2) + ' kg';
        document.getElementById('deltaCo2').innerText = '-' + savedCo2 + ' kg CO2';
        document.getElementById('simWater').innerText = modeledWater.toLocaleString() + ' L';
        document.getElementById('deltaWater').innerText = '-' + savedWater.toLocaleString() + ' L';
        document.getElementById('simWorkload').innerText = '+' + interv.workloadPct + '% inspection';
        const throughput = interv.throughputPct;
        document.getElementById('simThroughput').innerText = (throughput >= 0 ? '+' : '') + throughput + '%';
        document.getElementById('deltaThroughput').innerText = throughput >= -1.5 ? 'Meets >95%' : 'Review Needed';
        document.getElementById('deltaThroughput').style.color = throughput >= -1.5 ? 'var(--success)' : 'var(--destructive)';
        document.getElementById('bannerTitle').innerText =
          'Projected Net Impact: $' + Math.round(annualSavings / 4) + ' Quarterly / $' + annualSavings.toLocaleString() + ' Annualized';
      }
    }

    function toggleReplay() {
      isReplay = !isReplay;
      const btn = document.getElementById('btnReplay');
      if (isReplay) {
        btn.classList.add('active');
        btn.innerText = 'Replay (Active)';
        loadLatest(true);
      } else {
        btn.classList.remove('active');
        btn.innerText = 'Replay';
        loadLatest(false);
      }
    }

    function buildRowsTable(rows) {
      if (!rows || rows.length === 0) return '';
      const cols = Object.keys(rows[0]);
      const thead = '<thead><tr>' + cols.map(c => '<th>' + escapeHtml(c) + '</th>').join('') + '</tr></thead>';
      const tbody = '<tbody>' + rows.map(r =>
        '<tr>' + cols.map(c => '<td>' + escapeHtml(String(r[c] ?? '')) + '</td>').join('') + '</tr>'
      ).join('') + '</tbody>';
      return '<div class="table-container"><table class="data-table">' + thead + tbody + '</table></div>';
    }

    function renderRun(data) {
      if (!data) return;
      lastSimData = data;
      const feed = document.getElementById('traceFeed');
      const statusBadge = document.getElementById('runStatusBadge');
      const isApproved = data.status === 'approved';
      statusBadge.innerText = 'STATUS: ' + (data.status || 'COMPLETED').toUpperCase().replace('_', ' ');
      statusBadge.style.color = isApproved ? 'var(--success)' : '#EDEDED';

      if (data.traces && data.traces.length > 0) {
        feed.innerHTML = data.traces.map(t => {
          let sqlHtml = '';
          if (t.sql) {
            const rowsTable = buildRowsTable(t.rows);
            sqlHtml = '<div class="sql-container"><div class="sql-bar"><span>SQL &middot; Zetaris Live</span></div><div class="sql-code">' + escapeHtml(t.sql) + '</div></div>' + rowsTable;
          }
          let confHtml = t.confidence
            ? '<span style="font-family:JetBrains Mono, monospace; font-size:0.6875rem; color:var(--success); font-weight:500; margin-left:6px;">[' + Math.round(t.confidence * 100) + '% confidence]</span>'
            : '';
          return '<div class="trace-card">' +
            '<div class="trace-header">' +
              '<span class="trace-tag ' + t.type + '">' + t.type + '</span>' +
              '<span class="trace-time">' + new Date(t.timestamp).toLocaleTimeString() + '</span>' +
            '</div>' +
            '<div class="trace-title">' + escapeHtml(t.title) + confHtml + '</div>' +
            '<div class="trace-desc">' + escapeHtml(t.text) + '</div>' +
            sqlHtml +
          '</div>';
        }).join('');
        feed.scrollTop = feed.scrollHeight;
      }

      if (data.hypotheses && data.hypotheses.length > 0) {
        const hypContainer = document.getElementById('hypothesisList');
        hypContainer.innerHTML = data.hypotheses.map((h, i) => {
          const isRefuted = h.status === 'refuted';
          return '<div class="hyp-item">' +
            '<div class="hyp-top">' +
              '<strong style="font-size: 0.875rem;">' + (i + 1) + '. ' + escapeHtml(h.title) + '</strong>' +
              '<span class="' + (isRefuted ? 'badge-refuted' : 'badge-confirmed') + '">' +
                (isRefuted ? 'REFUTED BY CRITIC' : 'SUPPORTED BY DATA') +
              '</span>' +
            '</div>' +
            '<p style="font-size:0.8125rem; color:var(--muted-foreground);">' + escapeHtml(h.reason) + '</p>' +
          '</div>';
        }).join('');
      }

      if (data.simulation) {
        const sim = data.simulation;
        if (sim.baseline) {
          document.getElementById('mUnits').innerText = (sim.baseline.totalUnits / 1000).toFixed(1) + 'k';
          document.getElementById('mStops').innerText = sim.baseline.totalStoppages.toLocaleString();
          document.getElementById('mEnergy').innerText = Math.round(sim.baseline.idleEnergyKwh).toLocaleString() + ' kWh';
          document.getElementById('mWater').innerText = (sim.baseline.waterLossLiters / 1000).toFixed(1) + 'k L';
          document.getElementById('baseStops').innerText = sim.baseline.totalStoppages.toLocaleString();
          document.getElementById('baseEnergy').innerText = Math.round(sim.baseline.idleEnergyKwh).toLocaleString();
          document.getElementById('baseWater').innerText = sim.baseline.waterLossLiters.toLocaleString() + ' L';
        }
        if (sim.modeled && sim.savings) {
          document.getElementById('simStops').innerText = sim.modeled.totalStoppages.toLocaleString();
          document.getElementById('deltaStops').innerText = '-' + sim.savings.stoppagesReduced + ' (-' + sim.savings.energyPctSaved + '%)';
          document.getElementById('simEnergy').innerText = Math.round(sim.modeled.idleEnergyKwh).toLocaleString();
          document.getElementById('deltaEnergy').innerText = '-' + sim.savings.energyKwhSaved + ' kWh';
          document.getElementById('simCo2').innerText = Math.round(sim.modeled.co2EmissionsKg) + ' kg';
          document.getElementById('deltaCo2').innerText = '-' + sim.savings.co2KgAvoided + ' kg CO2';
          document.getElementById('simWater').innerText = sim.modeled.waterLossLiters.toLocaleString() + ' L';
          document.getElementById('deltaWater').innerText = '-' + sim.savings.waterLitersSaved.toLocaleString() + ' L';
          document.getElementById('bannerTitle').innerText =
            'Verified Net Impact: $' + Math.round(sim.savings.annualizedCostSavingsUsd / 4) +
            ' Quarterly / $' + sim.savings.annualizedCostSavingsUsd.toLocaleString() + ' Annualized Savings';
        }
      }

      if (isApproved) {
        document.getElementById('approvalStatus').innerHTML =
          '<strong style="color:var(--success); font-weight:500;">\u2713 Authorized &amp; Scheduled</strong>';
        const btn = document.getElementById('btnApprove');
        btn.disabled = true;
        btn.innerText = 'Authorized';
      }
    }

    function escapeHtml(str) {
      return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    window.addEventListener('DOMContentLoaded', () => loadLatest(false));
  </script>
</body>
</html>`;
}
