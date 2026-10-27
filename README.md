# SustainFlow: Autonomous Industrial Sustainability & Root-Cause Agent

> **Submission for Hackathon Track 01: Solving Fragmented Intelligence**  
> Built with **Zetaris** federated data virtualization, **NVIDIA Nemotron** LLM reasoning, **Mastra.ai** agentic framework, and the **Meterless Markovian Context Engine**.

---

## 🌟 The Problem
Industrial bottling plants generate millions of data points across disconnected operational silos (PLC/SCADA stoppage event logs, batch run summaries, hourly production throughput, and corporate sustainability targets). 

When line efficiency drops and idle power spikes:
1. **Engineers drown in fragmented tables** and jump to false conclusions (e.g. blaming throughput surges or isolated mechanical breakdowns).
2. **Resource waste is invisible** in raw equipment logs—idle motor drag and restart rinse cycles silently waste megawatt-hours and tens of thousands of liters of treated water.
3. **Investigation takes days**, during which avoidable carbon emissions accumulate.

---

## 💡 The Solution: SustainFlow
**SustainFlow** is an autonomous root-cause and sustainability intelligence agent that:
- **Federates fragmented factory silos in place via Zetaris** (no expensive ETL pipelines required).
- **Employs the Meterless Markovian Engine** to maintain bounded, flat-context hypothesis tracking without LLM token bloat.
- **Applies Critic Refutation reasoning** using NVIDIA Nemotron to disprove spurious correlations before proposing interventions.
- **Computes deterministic Before vs. After resource savings** (Idle kWh, CO₂ footprint, rinse water, and dollar cost).
- **Keeps humans in the loop** by presenting transparent SQL queries, trade-off scorecards, and operator sign-off.

---

## 💻 Environment & Platform Note (Night Shift)
> **Note on Night Shift**: We do not use or support Night Shift in our workflow because our development and target production execution environments run on **Linux** (Debian GNU/Linux servers / cloud instances) without macOS or Windows machines available.

---

## 🏗️ Architecture & Technology Stack

```
   ┌────────────────────────────────────────────────────────┐
   │             SustainFlow Investigation UI               │
   │  (Live Trace Feed | SQL Drawer | Human Approval Panel) │
   └──────────────────────────▲─────────────────────────────┘
                              │ REST / SSE
   ┌──────────────────────────┴─────────────────────────────┐
   │                  Mastra.ai Orchestrator                │
   │  ┌──────────────────────────────────────────────────┐  │
   │  │ Meterless Markovian Engine (Bounded State Loop)   │  │
   │  └──────────────────────────────────────────────────┘  │
   │  ┌─────────────────────────┐  ┌─────────────────────┐  │
   │  │  NVIDIA Nemotron LLM    │  │ Deterministic       │  │
   │  │  (Hypothesis & Critic)  │  │ Simulator Engine    │  │
   │  └─────────────────────────┘  └─────────────────────┘  │
   └──────────────────────────▲─────────────────────────────┘
                              │ SQL REST Proxy
   ┌──────────────────────────┴─────────────────────────────┐
   │                   Zetaris Platform                     │
   │           Catalog: PRODUCTION_RAW (Federated)          │
   │  - daily_metrics                                       │
   │  - downtime_event_log (1,388 events, micro/med/long)   │
   │  - daily_operation_summary                             │
   │  - resource_assumptions (18 kW idle, 25 L rinse)       │
   └────────────────────────────────────────────────────────┘
```

## 🗃️ Zetaris Data
To load the industrial production dataset into Zetaris, follow the step-by-step guide in [docs/zetaris/README.md](docs/zetaris/README.md). It covers creating the `production_raw` file source, uploading JSON files into the NDP file-store folder, and creating the JSON-backed tables that SustainFlow queries via `PRODUCTION_RAW.*`.

### 1. Zetaris Data Virtualization
SustainFlow connects to Zetaris via its authenticated HTTP Proxy (`/api/proxy/query/sql/start`), issuing federated analytical queries directly across production tables:
- `PRODUCTION_RAW.daily_metrics`: Aggregated runs, pause hours, units, stops per 1k units.
- `PRODUCTION_RAW.downtime_event_log`: Individual stoppage durations, start/end timestamps, and stop classifications (`micro`, `medium`, `long`).
- `PRODUCTION_RAW.resource_assumptions`: Team engineering assumptions (idle kW, CO₂ factor, rinse water).

### 2. Meterless Markovian Context Engine
Rather than bloating LLM context with raw message history, SustainFlow integrates the **Meterless Markovian pattern** (`engines/markovian`):
- Operates on a bounded state transition: $S_{t+1} = f(S_t, \text{Observation}_t)$.
- Maintains compact hypothesis matrices, verified SQL proofs, and refuted counter-evidence.
- Verified with Vitest suite: `tests/markovian.test.ts`.

### 3. NVIDIA Nemotron AI Reasoner
Powers multi-turn root-cause investigation:
- **Fast Lane**: Initial telemetry parsing and table schema routing.
- **Deep Lane**: Critic refutation and trade-off intervention evaluation.

---

## 📊 The Real Data Story (Investigated by SustainFlow)

1. **The Anomaly**: During Sep–Nov 2022, line stoppage rate surged from ~15 stops/1k units to **29 stops/1k units**, causing **126.4 cumulative pause hours** and **2,275 kWh of wasted idle energy**.
2. **Hypothesis 1 (Refuted)**: The agent tested whether higher production throughput caused mechanical fatigue. **Critic Refuted**: Zetaris query proved monthly unit volume (34.7k) was lower than July (38.2k).
3. **Hypothesis 2 (Confirmed)**: The agent isolated container formats and discovered the new **5L bottle SKU** (introduced Sep 2) ran at **60.1 stops/1k units**—over double the 3L rate (28.3).
4. **Distinguishing Noise**: The agent queried `downtime_event_log` and proved that **88% of lost time was systemic micro-stoppages** (<5 mins) from infeed sensor chatter, refuting the belief that December's single 350-minute breakdown was the primary problem.
5. **Modeled Intervention Savings**:
   - Stoppages reduced: **-792 stops (-26%)**
   - Idle electricity saved: **-427.7 kWh**
   - Carbon emissions avoided: **-171.1 kg CO₂**
   - Rinse water saved: **-19,800 Liters**
   - Annualized cost savings: **$1,425 USD**

*Note: All resource figures are explicitly labeled as modeled engineering estimates based on team assumptions (18 kW idle conveyor draw, 0.40 kg CO₂/kWh, 25 L/restart rinse).*

---

## 🚀 Running the Project

### Prerequisites
- Node.js >= 22 or Bun
- Running Zetaris Docker stack on `http://localhost:3000` (see `cloud.enterprise.zetaris.com` for instructions)
- NVIDIA API Key configured in `.env`

### Quick Start
```bash
# 1. Clone repository
git clone https://github.com/Sustain-Flow/Sustain-Flow.git
cd Sustain-Flow

# 2. Install dependencies
npm install

# 3. Start the SustainFlow Application
npm run dev
```
Open **`http://localhost:3001`** in your browser to interact with the **Investigation Center UI**.

And open **`http://localhost:4111`** to open Mastra Studio.

### Demo Replay Mode
To ensure guaranteed stability during demo recordings, click the **"Replay Mode"** button or pass `?replay=1` to the API.

---

## Pre-existing components
- Mastra framework and its `security-incident-triage-and-response` template (Apache-2.0): workflow and approval-step structure
- Meterless Markovian engine reference code (Apache-2.0)
- Dataset: "Industrial Production Time-Series Dataset from a Beverage Bottling Line",
  David, Monson and Soares Junior, Zenodo, DOI 10.5281/zenodo.18146866 (CC BY 4.0)
- Everything else (tools, agents, critic, modelling, UI) was built during the hackathon.

---

## 👥 Team & Contributions
- **Ibrahim**: Data & Backend Lead — Zetaris catalog registration, REST queries, deterministic simulation engine (`simulate(intervention)`), backend API endpoints.
- **Talent**: Power Layer & Agent Lead — Mastra tools (`run_sql`, `get_assumptions`), Markovian context engine, NVIDIA Nemotron prompt loops.
- **Tasneem**: Product, Evaluation & Demo Lead — Scenario design, engineering resource assumptions, demo video and presentation.
- **Jala**: Simulation & Data Modeling Lead — Synthetic industrial telemetry generation and factory data simulation pipelines with Python.
