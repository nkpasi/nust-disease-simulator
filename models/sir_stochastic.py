import numpy as np

def run_stochastic_sir(population, initial_infected, beta, gamma, days, seed=None):
    if seed is not None:
        np.random.seed(seed)
    N = population
    I = min(initial_infected, N - 1)
    S = N - I
    R = 0
    t_arr=[0]; S_arr=[float(S)]; I_arr=[float(I)]; R_arr=[float(R)]

    for day in range(1, days + 1):
        if I == 0:
            remaining = days - day + 1
            t_arr += list(range(day, days + 1))
            S_arr += [float(S)] * remaining
            I_arr += [0.0] * remaining
            R_arr += [float(R)] * remaining
            break
        p_infect  = 1 - np.exp(-beta * I / N)
        p_recover = 1 - np.exp(-gamma)
        new_infected  = np.random.binomial(int(S), p_infect)
        new_recovered = np.random.binomial(int(I), p_recover)
        S = max(0, S - new_infected)
        I = max(0, I + new_infected - new_recovered)
        R = N - S - I
        t_arr.append(float(day)); S_arr.append(float(S))
        I_arr.append(float(I)); R_arr.append(float(R))

    I_np = np.array(I_arr); S_np = np.array(S_arr); t_np = np.array(t_arr)
    peak_idx = int(np.argmax(I_np))
    return {"t": t_np.tolist(), "S": S_np.tolist(), "I": I_np.tolist(),
            "R": np.array(R_arr).tolist(), "peak_day": float(t_np[peak_idx]),
            "peak_infected": float(I_np[peak_idx]), "r0": round(beta / gamma, 4),
            "total_infected": float(N - S_np[-1]), "model": "SIR_stochastic"}
