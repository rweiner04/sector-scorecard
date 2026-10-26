// Shared data loading and the four summary-number definitions.
// Every number on both pages is computed here, in the browser, from sector_returns_2019_2026.csv.

const DATA_FILE = 'sector_returns_2019_2026.csv';

async function loadData() {
  const text = await (await fetch(DATA_FILE)).text();
  const lines = text.trim().split(/\r?\n/);
  const cols = lines[0].split(',');
  const num = new Set(['year', 'monthly_return', 'sp500_return', 'excess_return', 'beat_sp500']);
  return lines.slice(1).map(line => {
    const v = line.split(',');
    const r = {};
    cols.forEach((c, i) => { r[c] = num.has(c) ? Number(v[i]) : v[i]; });
    r.ym = r.month.slice(0, 7);
    return r;
  });
}

const mean = (rows, f) => rows.length ? rows.reduce((a, r) => a + r[f], 0) / rows.length : NaN;
function sd(rows, f) {
  if (rows.length < 2) return NaN;
  const m = mean(rows, f);
  return Math.sqrt(rows.reduce((a, r) => a + (r[f] - m) ** 2, 0) / (rows.length - 1));
}

// The four summary numbers. Each one is a plain average over the sector-months in the selection.
function summary(rows) {
  return {
    sectorMonths: rows.length,                    // 1. Sector-months counted
    avgReturn: mean(rows, 'monthly_return'),      // 2. Average monthly return, %
    avgExcess: mean(rows, 'excess_return'),       // 3. Average monthly excess return vs. S&P 500, percentage points
    beatShare: mean(rows, 'beat_sp500') * 100     // 4. Share of sector-months that beat the S&P 500, %
  };
}

// Growth of $100: compound the monthly returns in date order
function growth(rows, f = 'monthly_return') {
  const s = [...rows].sort((a, b) => a.ym.localeCompare(b.ym));
  let v = 100;
  return s.map(r => (v *= 1 + r[f] / 100, { ym: r.ym, v }));
}
const totalReturn = (rows, f = 'monthly_return') => {
  const g = growth(rows, f);
  return g.length ? g[g.length - 1].v - 100 : NaN;
};

const groupBy = (rows, f) => rows.reduce((m, r) => ((m[r[f]] ||= []).push(r), m), {});
const fmtInt = x => isFinite(x) ? Math.round(x).toLocaleString('en-US') : '—';
const fmtPct = (x, d = 2) => isFinite(x) ? (x < 0 ? '−' : '') + Math.abs(x).toFixed(d) + '%' : '—';
const fmtPP = (x, d = 2) => !isFinite(x) ? '—' : (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(x).toFixed(d) + ' pp';
const fmtSignedPct = (x, d = 1) => !isFinite(x) ? '—' : (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(x).toFixed(d) + '%';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtYM = ym => MONTHS[+ym.slice(5, 7) - 1] + ' ' + ym.slice(0, 4);

const SECTOR_COLORS = {
  'Technology': '#1f5fa8', 'Energy': '#c2571a', 'Financials': '#2a8a6b', 'Health Care': '#b0367a',
  'Consumer Discretionary': '#7a5bc4', 'Consumer Staples': '#8a6d1f', 'Industrials': '#4a4842',
  'Materials': '#5a9bd4', 'Utilities': '#d98a2b', 'Real Estate': '#9a3b3b', 'Communication Services': '#3aa3a3'
};
const COLORS = { pos: '#1f5fa8', neg: '#c2571a', spx: '#1f1e1b', grid: '#e4e2dc' };
if (window.Chart) {
  Chart.defaults.font.family = "'Source Sans 3', system-ui, sans-serif";
  Chart.defaults.font.size = 13;
  Chart.defaults.color = '#4a4842';
  Chart.defaults.borderColor = COLORS.grid;
  Chart.defaults.plugins.legend.labels.boxWidth = 12;
  Chart.defaults.maintainAspectRatio = false;
}

// Heatmap cell background: blue for positive, orange for negative, scaled to +/- max
function heatColor(x, max) {
  if (!isFinite(x)) return 'transparent';
  const a = Math.min(Math.abs(x) / max, 1) * 0.75;
  return x >= 0 ? `rgba(31,95,168,${a})` : `rgba(194,87,26,${a})`;
}
function heatText(x, max) { return isFinite(x) && Math.abs(x) / max > 0.55 ? '#fff' : 'inherit'; }
