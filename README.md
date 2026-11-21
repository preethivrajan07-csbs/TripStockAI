# TripStock AI — Intelligent Travel Inventory & Budget Optimization Platform

> **Official Solution for TBO.com Travel Inventory & Budget Optimization Challenge**  
> Built for national-level hackathon demonstration with a production-ready, dark glassmorphic UI matching enterprise travel intelligence platforms.

---

## 🌟 Executive Overview

TripStock AI is a full-stack decision-support system designed specifically for **TBO.com inventory directors and procurement leadership**. It transforms raw search logs, historical bookings, sold-out patterns, look-to-book ratios, and supplier allotments into **actionable, risk-adjusted procurement decisions** that strictly respect user-defined budget caps.

### Official Problem Solved
1. **What inventory to target**: Automatically flags high-demand, undersupplied hotel rooms and airline seats across key domestic and international hubs (Goa, Dubai, Mumbai, Delhi, Bengaluru, Jaipur, Kochi, Singapore, Hyderabad, Chennai).
2. **When to procure it**: Forecasts demand shifts 72 hours and 30-60 days ahead using ensemble machine learning.
3. **How much inventory to purchase**: Recommends exact physical integer quantities (room nights and seat blocks).
4. **How to allocate available budget**: Solves bounded linear programming (SciPy HiGHS) to guarantee zero budget overruns.
5. **Which opportunities offer superior profitability**: Evaluates net risk-adjusted margins after cancellation buffers and unsold inventory loss penalties.
6. **How to minimize financial risk**: Real-time stress testing, Value-at-Risk (VaR 95%), and dynamic mitigation strategies.

---

## 🎨 Design System & UI

The user interface matches the reference dark glassmorphic design:
- **Canvas**: Deep Obsidian & Midnight Navy (`#07090e`, `#0d121f`).
- **Cards**: Frosted glass panels (`backdrop-filter: blur(16px)`) with subtle 1px border.
- **Accents**: Luminous Neon Teal (`#05d5aa`), Cyan Glow (`#00f2fe`), and Cyber Violet (`#8b5cf6`).
- **Signature Reference Components**:
  - Live Signal Feed Tag (`[ LIVE SIGNAL FEED — 06:14 EST ]`)
  - Hero: *"See demand before it books."*
  - **REVPAR LIFT** (`+14.2%`) with mini weekly bar chart
  - **72-HR ACCURACY** (`94.3% vs 71.5% industry baseline`)
  - **OCCUPANCY MAP** Matrix Heatmap
  - **FARE ELASTICITY** optimal parabolic revenue curve (`BOM_DXB`)
  - **INVENTORY REBALANCES** live pulse (`2,848 across active properties`)
  - **UNSOLD RECOVERY** (`89% of distressed`, `+$2.4M`)

---

## 📐 Mathematical Formulation & Core Algorithms

### 1. Demand Forecasting Engine (`RandomForestRegressor` + `GradientBoostingRegressor`)
* Evaluates lag features: `day_of_week`, `seasonality_index`, `searches` (search velocity), `look_to_book`, and `lead_time_days`.
* Real out-of-sample evaluation metrics: **MAE**, **RMSE**, and **MAPE**.
* Dynamic 95% Gaussian uncertainty envelopes for risk hedging.

### 2. Multi-Factor Opportunity Scoring (0 - 100)
$$\text{Score} = 0.25 \times \text{MarginScore} + 0.30 \times \text{SellThrough} + 0.20 \times \text{Undersupply} + 0.15 \times \text{SupplierReliability} + 0.10 \times \text{Demand} - \text{CancellationPenalty}$$

### 3. SciPy Mixed-Integer Bounded Linear Programming (HiGHS Solver)
$$\max \sum_{i} \left[ x_i \cdot \left(\text{ST}_i \cdot P_i - C_i - \text{CancelLoss}_i\right) - (1 - \text{ST}_i) \cdot \text{UnsoldPenalty} \cdot C_i \right]$$
**Subject to:**
1. **Strict Budget Bound**: $\sum_{i} x_i \cdot C_i \le \text{User Budget}$ *(never exceeds available capital)*
2. **Capacity Bounds**: $0 \le x_i \le \min(\text{SupplierCapacity}_i, \text{ForecastDemand}_i \times \text{RiskFactor})$
3. **Integer Guarantees**: $x_i \in \mathbb{Z}_{\ge 0}$ *(whole room nights and seat allotments)*

---

## 🚀 1-Click Launch Instructions

### Option 1: Double-click Startup Script (Windows)
Double-click `start_all.bat` in the project root. This starts both the FastAPI backend and React frontend automatically.

### Option 2: Manual Terminal Launch

#### Step 1: Start Backend (FastAPI + SQLite)
```powershell
cd backend
& "C:\ProgramData\anaconda3\python.exe" run.py
```
> Server running at: `http://127.0.0.1:8000` (API documentation at `/docs`)

#### Step 2: Start Frontend (React + Vite)
```powershell
cd frontend
npm run dev
```
> Web application opens at: `http://localhost:5173`

---

## 🔑 Demo Login Credentials

The application includes a secure demo authentication flow:
* **Work Email**: `inventory.director@tbo.com`
* **Password**: `TripStock@2026`
* Or simply click the **"Instant Demo Sign-In (Director Role)"** button on the login screen.

---

## 📋 Comprehensive Page Directory

| # | Page Name | Core Functionality |
|---|---|---|
| **1** | **Login Page** | Executive authentication, credentials helper, 1-click demo bypass. |
| **2** | **Executive Dashboard** | Signature hero from reference image, 7 widgets, capital summary, and 30-day demand trends. |
| **3** | **Demand Forecasting** | Model selector (Ensemble, RF, GB, Moving Average), confidence envelope, MAE/RMSE/MAPE benchmark. |
| **4** | **Inventory Discovery** | Scored opportunities table, filtering by flight/hotel/risk, detail drawer with explainable AI rationale. |
| **5** | **Budget Optimizer** | **THE CORE**: Enter budget (e.g. ₹50,00,000), SciPy integer solver, ROI, "Why Selected" explanations, scenario save. |
| **6** | **Risk Analysis** | Downside stress-testing sliders (demand shock, cancellation surge, inflation), VaR 95%, mitigation strategies. |
| **7** | **Scenario Simulator** | Scenarios A, B, C, D, E side-by-side comparison + custom hypothetical sandbox builder. |
| **8** | **Supplier Network** | Full CRUD operations for hotel chains and airline allotments persisted in SQLite. |
| **9** | **Data Management** | Drag-and-drop CSV upload, schema validator, missing value check, and downloadable CSV template. |
| **10** | **Reports & Exports** | Full executive audit text dossier, CSV export download, and printable PDF preview. |
| **11** | **Platform Settings** | Profile viewer, currency switcher (INR / USD), solver defaults, and 1-click demo database reset. |

---

## 🛡️ Synthetic Dataset Disclaimer
The historical bookings, searches, look-to-book ratios, and supplier contracts bundled in the demo database are realistic synthetic travel records generated for hackathon benchmarking purposes. Users can upload their own live TBO.com CSV files via Page 9 at any time.
