
let currentMode = 'SIR';

function setMode(mode, btn) {
  currentMode = mode;
  document.querySelectorAll('.mbtn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function updateR0() {
  const beta  = parseFloat(document.getElementById('beta').value);
  const gamma = parseFloat(document.getElementById('gamma').value);
  const r0    = beta / gamma;
  document.getElementById('r0live').textContent = r0.toFixed(2);
  const badge = document.getElementById('r0badge');
  if (r0 < 1)      { badge.textContent = 'Below epidemic threshold'; badge.className = 'badge low'; }
  else if (r0 < 2) { badge.textContent = 'Moderate spread'; badge.className = 'badge medium'; }
  else             { badge.textContent = 'High spread'; badge.className = 'badge high'; }
}

function getParams() {
  return {
    population:       parseInt(document.getElementById('population').value),
    initial_infected: parseInt(document.getElementById('initial_infected').value),
    beta:             parseFloat(document.getElementById('beta').value),
    gamma:            parseFloat(document.getElementById('gamma').value),
    sigma:            parseFloat(document.getElementById('sigma').value),
    days:             parseInt(document.getElementById('days').value),
  };
}

function fmt(n) {
  if (n === undefined || n === null) return '-';
  return Math.round(n).toLocaleString();
}

function showStats(data) {
  document.getElementById('statsbar').style.display = 'flex';
  document.getElementById('st_r0').textContent    = data.r0 !== undefined ? data.r0 : (data.r0_mean ? data.r0_mean.toFixed(2) : '-');
  document.getElementById('st_peak').textContent  = fmt(data.peak_infected  || data.peak_mean);
  document.getElementById('st_day').textContent   = data.peak_day !== undefined ? Math.round(data.peak_day) : '-';
  document.getElementById('st_total').textContent = fmt(data.total_infected);
}

function showError(msg) {
  const box = document.getElementById('errbox');
  box.textContent = 'Error: ' + msg;
  box.style.display = 'block';
}

function hideError() {
  document.getElementById('errbox').style.display = 'none';
}

function showExplain(html) {
  const box = document.getElementById('explainbox');
  box.innerHTML = html;
  box.style.display = 'block';
}

const PLOTLY_LAYOUT = {
  paper_bgcolor: '#13151f',
  plot_bgcolor:  '#13151f',
  font:          { color: '#ccc', family: 'Segoe UI, Arial' },
  xaxis:         { gridcolor: '#2a2d42', zerolinecolor: '#2a2d42', title: 'Days' },
  yaxis:         { gridcolor: '#2a2d42', zerolinecolor: '#2a2d42' },
  legend:        { bgcolor: '#1e2030', bordercolor: '#3a3f6e', borderwidth: 1 },
  margin:        { t: 40, l: 60, r: 30, b: 50 },
  hovermode:     'x unified',
};

// SIR / SEIR plot
function plotSIR(data) {
  const traces = [
    { x: data.t, y: data.S, name: 'Susceptible (S)', line: { color: '#4caf8a', width: 2.5 } },
    { x: data.t, y: data.I, name: 'Infected (I)',    line: { color: '#f07070', width: 2.5 } },
    { x: data.t, y: data.R, name: 'Recovered (R)',   line: { color: '#5b6af0', width: 2.5 } },
  ];
  if (data.E) {
    traces.splice(1, 0, { x: data.t, y: data.E, name: 'Exposed (E)', line: { color: '#f0b429', width: 2.5 } });
  }
  const layout = Object.assign({}, PLOTLY_LAYOUT, {
    title: data.model + ' Model: NUST Campus Population',
    yaxis: Object.assign({}, PLOTLY_LAYOUT.yaxis, { title: 'Number of People' }),
  });
  Plotly.newPlot('chart', traces, layout, { responsive: true });
  showExplain(explainSIR(data));
  showStats(data);

}

// ── Stochastic plot ──────────────────────────────────────────────────────────
function plotStochastic(data) {
  const traces = [
    { x: data.t, y: data.S, name: 'Susceptible (S)', line: { color: '#4caf8a', width: 2 } },
    { x: data.t, y: data.I, name: 'Infected (I)',    line: { color: '#f07070', width: 2.5 } },
    { x: data.t, y: data.R, name: 'Recovered (R)',   line: { color: '#5b6af0', width: 2 } },
  ];
  const layout = Object.assign({}, PLOTLY_LAYOUT, {
    title: 'Stochastic SIR: Random draw ',
    yaxis: Object.assign({}, PLOTLY_LAYOUT.yaxis, { title: 'Number of People' }),
  });
  Plotly.newPlot('chart', traces, layout, { responsive: true });
  showStats(data);
  showExplain(`<h3>Stochastic SIR Model</h3>
    Each run draws random infection and recovery events using the Binomial distribution.
    <strong>Re-run to see a different epidemic curve</strong>. This randomness is realistic:
    two identical outbreaks in the same population will never unfold identically.
    <br><br>Compare this to the deterministic SIR: the deterministic curve is the <em>average</em>
    of many stochastic runs.`);
}

// ── Monte Carlo plot ─────────────────────────────────────────────────────────
function plotMonteCarlo(data) {
  const upper = data.I_p95;
  const lower = data.I_p5;
  const t     = data.t;

  const traces = [
    {
      x: [...t, ...t.slice().reverse()],
      y: [...upper, ...lower.slice().reverse()],
      fill: 'toself', fillcolor: 'rgba(91,106,240,0.15)',
      line: { color: 'transparent' },
      name: '90% confidence band', showlegend: true, hoverinfo: 'skip',
    },
    { x: t, y: data.I_mean, name: 'Mean Infected', line: { color: '#f07070', width: 3 } },
    { x: t, y: upper,       name: '95th percentile', line: { color: '#5b6af0', width: 1.5, dash: 'dot' } },
    { x: t, y: lower,       name: '5th percentile',  line: { color: '#5b6af0', width: 1.5, dash: 'dot' } },
  ];
  const layout = Object.assign({}, PLOTLY_LAYOUT, {
    title: 'Monte Carlo Sensitivity: ' + data.n_simulations + ' simulations',
    yaxis: Object.assign({}, PLOTLY_LAYOUT.yaxis, { title: 'Infected (I)' }),
  });
  Plotly.newPlot('chart', traces, layout, { responsive: true });

  document.getElementById('statsbar').style.display = 'flex';
  document.getElementById('st_r0').textContent    = data.r0_mean.toFixed(2) + ' ± ' + data.r0_std.toFixed(2);
  document.getElementById('st_peak').textContent  = fmt(data.peak_mean) + ' ± ' + fmt(data.peak_std);
  document.getElementById('st_day').textContent   = '-';
  document.getElementById('st_total').textContent = '-';

  showExplain(`<h3>Monte Carlo Sensitivity Analysis</h3>
    Ran <strong>${data.n_simulations} simulations</strong>, each with &beta; and &gamma;
    drawn randomly (±20% / ±15% std) around your slider values.
    <br><br>
    Mean R&#8320; = <strong>${data.r0_mean.toFixed(2)}</strong> &nbsp;|&nbsp;
    Std R&#8320; = <strong>${data.r0_std.toFixed(2)}</strong><br>
    Mean peak = <strong>${fmt(data.peak_mean)}</strong> &nbsp;|&nbsp;
    Peak std = <strong>${fmt(data.peak_std)}</strong>
    <br><br>The shaded band shows the 90% uncertainty corridor;
    real-world epidemic outcomes would fall inside this band most of the time.`);
}

//R0 Sweep plot
function plotR0Sweep(data) {
  const traces = [
    {
      x: data.r0_values, y: data.peak_infected,
      name: 'Peak Infected vs R&#8320;',
      mode: 'lines+markers',
      line: { color: '#f0b429', width: 2.5 },
      marker: { size: 4, color: '#f0b429' },
    },
    {
      x: [1, 1], y: [0, Math.max(...data.peak_infected)],
      name: 'R&#8320; = 1 (epidemic threshold)',
      mode: 'lines',
      line: { color: '#f07070', width: 2, dash: 'dash' },
    },
  ];
  const layout = Object.assign({}, PLOTLY_LAYOUT, {
    title: 'R&#8320; Sensitivity Sweep: Peak Infected vs R&#8320;',
    xaxis: Object.assign({}, PLOTLY_LAYOUT.xaxis, { title: 'Basic Reproduction Number R&#8320;' }),
    yaxis: Object.assign({}, PLOTLY_LAYOUT.yaxis, { title: 'Peak Infected' }),
  });
  Plotly.newPlot('chart', traces, layout, { responsive: true });
  document.getElementById('statsbar').style.display = 'none';
  showExplain(`<h3>R&#8320; Sensitivity Sweep</h3>
    This sweeps &beta; from low to high (keeping &gamma; fixed) and records
    the peak number of infected people for each value of R&#8320; = &beta;/&gamma;.
    <br><br>The red dashed line marks <strong>R&#8320; = 1</strong> the epidemic threshold.
    Below it, the disease fades out. Above it, it spreads through the population.
    The steeper the curve above R&#8320;=1, the more sensitive the epidemic is to transmission rate.`);
}

//  Main run function
async function runSim() {
  hideError();
  const btn = document.querySelector('.runbtn');
  btn.disabled = true;
  btn.textContent = '⏳ Running...';

  const p = getParams();
  const endpointMap = {
    SIR:         '/api/sir',
    SEIR:        '/api/seir',
    stochastic:  '/api/stochastic',
    montecarlo:  '/api/monte_carlo',
    r0sweep:     '/api/r0_sweep',
  };
  const url = endpointMap[currentMode];

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    });
    const json = await resp.json();
    if (json.status !== 'ok') throw new Error(json.message);

    const data = json.data;
    document.getElementById('chart').innerHTML = '';   // clear placeholder

    document.querySelector('.results').scrollTop = 0;

    if      (currentMode === 'SIR'  || currentMode === 'SEIR') plotSIR(data);
    else if (currentMode === 'stochastic')  plotStochastic(data);
    else if (currentMode === 'montecarlo')  plotMonteCarlo(data);
    else if (currentMode === 'r0sweep')     plotR0Sweep(data);

  } catch (err) {
    showError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '\u25B6 Run Simulation';
  }
}

// Explanation helper
function explainSIR(data) {
  const r0class = data.r0 >= 2 ? 'high' : data.r0 >= 1 ? 'medium' : 'low';
  return `<h3>${data.model} Model Results</h3>
  <strong>R&#8320; = ${data.r0}</strong> ; ${data.r0 < 1 ? 'Below epidemic threshold. Disease will fade out.' : data.r0 < 2 ? 'Moderate spread. Each infected person infects on average ' + data.r0 + ' others.' : 'High spread. Each infected person infects on average ' + data.r0 + ' others.'}
  <br><br>
  Peak of <strong>${fmt(data.peak_infected)} infected</strong> on approximately day <strong>${Math.round(data.peak_day)}</strong>.
  <br>
  Total people ever infected: <strong>${fmt(data.total_infected)}</strong>
  (${((data.total_infected / parseInt(document.getElementById('population').value)) * 100).toFixed(1)}% of population).
  ${data.model === 'SEIR' ? '<br><br>SEIR adds an <strong>Exposed (E)</strong> compartment for the incubation period, people who are infected but not yet infectious. This delays and flattens the peak compared to SIR.' : ''}`;
}

// Initialise R0 display on load
updateR0();
