import numpy as np
from scipy.integrate import odeint

def _sir(y, t, beta, gamma, N):
    S, I, R = y
    dS=-beta*S*I/N; dI=beta*S*I/N-gamma*I; dR=gamma*I
    return [dS, dI, dR]

def run_monte_carlo(population, initial_infected, beta, gamma, days,
                    n_simulations=300, beta_std_pct=0.20, gamma_std_pct=0.15, seed=42):
    np.random.seed(seed)
    N=population; I0=min(initial_infected,N-1); S0=N-I0
    t=np.linspace(0,days,days*5)
    all_I=[]; r0_values=[]
    for _ in range(n_simulations):
        b=max(0.01,np.random.normal(beta,  beta *beta_std_pct))
        g=max(0.01,np.random.normal(gamma, gamma*gamma_std_pct))
        r0_values.append(b/g)
        try:
            sol=odeint(_sir,[S0,I0,0],t,args=(b,g,N))
            all_I.append(sol[:,1])
        except: continue
    all_I=np.array(all_I); r0_values=np.array(r0_values)
    return {"t":t.tolist(), "I_mean":np.mean(all_I,axis=0).tolist(),
            "I_p5":np.percentile(all_I,5,axis=0).tolist(),
            "I_p95":np.percentile(all_I,95,axis=0).tolist(),
            "peak_mean":float(np.mean(np.max(all_I,axis=1))),
            "peak_std":float(np.std(np.max(all_I,axis=1))),
            "r0_values":r0_values.tolist(), "r0_mean":float(np.mean(r0_values)),
            "r0_std":float(np.std(r0_values)), "n_simulations":len(all_I)}

def run_r0_sweep(population, initial_infected, gamma, days, beta_min=0.05, beta_max=0.80, n_steps=60):
    N=population; I0=min(initial_infected,N-1); S0=N-I0
    t=np.linspace(0,days,days*5)
    betas=np.linspace(beta_min,beta_max,n_steps); peaks=[]
    for b in betas:
        try:
            sol=odeint(_sir,[S0,I0,0],t,args=(b,gamma,N))
            peaks.append(float(np.max(sol[:,1])))
        except: peaks.append(0.0)
    return {"beta_values":betas.tolist(), "r0_values":(betas/gamma).tolist(), "peak_infected":peaks}
