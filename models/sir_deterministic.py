import numpy as np
from scipy.integrate import odeint

def sir_ode(y, t, beta, gamma, N):
    S, I, R = y
    dS = -beta * S * I / N
    dI =  beta * S * I / N - gamma * I
    dR =  gamma * I
    return [dS, dI, dR]

def seir_ode(y, t, beta, gamma, sigma, N):
    S, E, I, R = y
    dS = -beta * S * I / N
    dE =  beta * S * I / N - sigma * E
    dI =  sigma * E - gamma * I
    dR =  gamma * I
    return [dS, dE, dI, dR]

def run_sir(population, initial_infected, beta, gamma, days):
    N = population
    I0 = min(initial_infected, N - 1)
    S0 = N - I0
    t = np.linspace(0, days, days * 10)
    sol = odeint(sir_ode, [S0, I0, 0], t, args=(beta, gamma, N))
    S, I, R = sol.T
    peak_idx = int(np.argmax(I))
    return {"t": t.tolist(), "S": S.tolist(), "I": I.tolist(), "R": R.tolist(),
            "peak_day": float(t[peak_idx]), "peak_infected": float(I[peak_idx]),
            "r0": round(beta / gamma, 4), "total_infected": float(N - S[-1]), "model": "SIR"}

def run_seir(population, initial_infected, beta, gamma, sigma, days):
    N = population
    I0 = min(initial_infected, N - 1)
    S0 = N - I0
    t = np.linspace(0, days, days * 10)
    sol = odeint(seir_ode, [S0, 0, I0, 0], t, args=(beta, gamma, sigma, N))
    S, E, I, R = sol.T
    peak_idx = int(np.argmax(I))
    return {"t": t.tolist(), "S": S.tolist(), "E": E.tolist(), "I": I.tolist(), "R": R.tolist(),
            "peak_day": float(t[peak_idx]), "peak_infected": float(I[peak_idx]),
            "r0": round(beta / gamma, 4), "total_infected": float(N - S[-1]), "model": "SEIR"}
