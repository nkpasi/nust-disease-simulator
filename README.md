# NUST Campus Disease Spread Simulator
### SCS 2209 Computational Modelling | T. Taapatsa | NUST Zimbabwe 2025

A Flask web application that simulates disease spread through a university campus population
using SIR, SEIR, Stochastic, and Monte Carlo models. Runs entirely on localhost — no cloud, no cost.

---

## Quick Start

### 1. Install dependencies
```bash
pip install flask numpy scipy
```

### 2. Run the app
```bash
cd nust_disease_sim
python app.py
```

### 3. Open in browser
```
http://localhost:5000
```

---

## Project Structure

```
nust_disease_sim/
├── app.py                        # Flask app — all API routes
├── requirements.txt              # Python dependencies
├── models/
│   ├── __init__.py
│   ├── sir_deterministic.py      # Nathanael — SIR + SEIR ODE models
│   ├── sir_stochastic.py         # Stochastic Binomial SIR
│   └── monte_carlo.py            # Monte Carlo sensitivity + R0 sweep
├── templates/
│   └── index.html                # Main dashboard page
└── static/
    ├── css/style.css             # Dark theme styling
    └── js/main.js                # Plotly charts + API calls
```

---

## Team Work Breakdown

| Person | Student Number | Role | Files |
|--------|------|------|-------|
| Nathanael Pasipamire | N0241970M | Model Developer — SIR/SEIR deterministic ODE | `models/sir_deterministic.py` |
| Ryan Musuka | N02425277T | Monte Carlo sensitivity analysis | `models/monte_carlo.py` |
| Adam Dzitiro | N02422752S | Flask backend + routing + integration | `app.py` |
| Blessings Mazenge | N02423594T | Frontend dashboard — HTML/CSS/Plotly | `templates/index.html`, `static/` |

---

## Models Implemented

### 1. SIR (Deterministic)
Three compartments: **Susceptible → Infected → Recovered**

```
dS/dt = -β·S·I/N
dI/dt =  β·S·I/N − γ·I
dR/dt =  γ·I
```

Solved numerically using `scipy.integrate.odeint`.
Returns S, I, R curves + peak day + R₀ + total infected.

### 2. SEIR (Deterministic)
Adds **Exposed** compartment for incubation period:

```
dS/dt = -β·S·I/N
dE/dt =  β·S·I/N − σ·E
dI/dt =  σ·E − γ·I
dR/dt =  γ·I
```

σ = 1 / incubation_period_in_days (default 0.33 ≈ 3-day incubation)

### 3. Stochastic SIR
Discrete-time Binomial method. At each day:
```
new_infections  ~ Binomial(S, 1 − exp(−β·I/N))
new_recoveries  ~ Binomial(I, 1 − exp(−γ))
```
Each run produces a different curve. Demonstrates randomness in real outbreaks.

### 4. Monte Carlo Sensitivity Analysis
Runs 300 independent SIR simulations with β and γ drawn randomly:
- β ~ Normal(β_base, 20% std)
- γ ~ Normal(γ_base, 15% std)

Returns mean ± 5th/95th percentile confidence bands.
Shows the uncertainty corridor around the deterministic prediction.

### 5. R₀ Sweep
Sweeps β from 0.05 → 0.80 (γ fixed) and records peak infected for each β.
Demonstrates the epidemic threshold at R₀ = 1.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sir` | Run deterministic SIR |
| POST | `/api/seir` | Run deterministic SEIR |
| POST | `/api/stochastic` | Run stochastic SIR |
| POST | `/api/monte_carlo` | Run Monte Carlo analysis |
| POST | `/api/r0_sweep` | Run R₀ sensitivity sweep |

### Request body (all endpoints)
```json
{
  "population":       15000,
  "initial_infected": 10,
  "beta":             0.30,
  "gamma":            0.10,
  "sigma":            0.33,
  "days":             160,
  "n_simulations":    300
}
```

---

## Parameters — Zimbabwean Context

| Parameter | Symbol | Typical value | Meaning |
|-----------|--------|---------------|---------|
| Transmission rate | β | 0.25–0.40 | Rate at which S contacts I and becomes infected |
| Recovery rate | γ | 0.07–0.14 | 1/γ = average days to recover |
| Incubation rate | σ | 0.20–0.50 | 1/σ = average incubation days |
| Basic reproduction number | R₀ = β/γ | >1 for epidemic | Average infections caused by one case |

For NUST campus (≈15,000 students), reasonable starting values:
- β = 0.30, γ = 0.10 → R₀ = 3 (similar to seasonal flu)
- β = 0.20, γ = 0.10 → R₀ = 2 (moderate outbreak)

---

## Syllabus Coverage

This project covers the following SCS 2209 chapters:

| Chapter | Topic | Where used |
|---------|-------|------------|
| 4 | Population & Epidemiological Modelling (SIR) | `sir_deterministic.py` |
| 5 | Monte Carlo Methods | `monte_carlo.py` |
| 8 | Deterministic Modelling with ODEs | `sir_deterministic.py` |
| 9 | Stochastic Modelling | `sir_stochastic.py` |
| 6 | Python as modelling software | Entire codebase |
| 7 | Data-Driven context (Zim population data) | Parameters, README |

---

## Dependencies

```
flask>=2.3
numpy>=1.24
scipy>=1.10
```

Plotly is loaded from CDN in the browser — no install needed.

---

## Running on a different port

```bash
python app.py --port 8080
```

Or edit the last line of `app.py`:
```python
app.run(debug=True, port=8080)
```

---

*Built for SCS 2209 Computational Modelling — NUST Zimbabwe 2025*
