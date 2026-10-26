# Which S&P 500 sectors beat the market? January 2019 – September 2026

FINN 43303 Financial Data Analytics II, Project B. Robert Weiner.

- **Question:** Which S&P 500 sectors beat the S&P 500, and which held up best in the months the index fell?
- **Reader:** A portfolio manager deciding which sectors to overweight and which to hold as a hedge.
- **Rows counted:** 1,023 sector-months: one row per sector per calendar month (11 sectors × 93 months).
- **Period:** January 2019 through September 2026.

## Files

| File | What it is |
|---|---|
| `index.html` | Report page: the answer, four summary numbers, four findings with charts, and notes on the data |
| `dashboard.html` | Dashboard page: month range, market-direction and sector filters; the same four summary numbers; charts, a heatmap and a table that change with the filters |
| `sector_returns_2019_2026.csv` | The data file both pages load and compute from (1,023 rows) |
| `common.js` | Shared code: loads the CSV and defines the four summary numbers |
| `style.css` | Shared fonts, colors and layout for both pages |
| `chart.umd.js` | Chart.js 4.4.1 (MIT license), the charting library, kept in the repository so the site has no outside dependency |
| `TABLEAU_GUIDE.md` | Step-by-step guide for rebuilding the dashboard in Tableau Public |
| `README.md` | This file |

## Where the data came from

Monthly adjusted closing prices from Yahoo Finance (finance.yahoo.com), retrieved October 25, 2026, for the eleven Select Sector
SPDR ETFs (one per S&P 500 sector) and the SPDR S&P 500 ETF (SPY) as the S&P 500 benchmark:

| Sector | Ticker |
|---|---|
| Technology | XLK |
| Financials | XLF |
| Energy | XLE |
| Health Care | XLV |
| Consumer Discretionary | XLY |
| Consumer Staples | XLP |
| Industrials | XLI |
| Materials | XLB |
| Utilities | XLU |
| Real Estate | XLRE |
| Communication Services | XLC |

Adjusted prices include dividends, so returns are total returns. The file stores only the monthly returns computed from the prices:

- `monthly_return` = adjusted close ÷ previous month's adjusted close − 1, in percent
- `sp500_return` = the same for SPY
- `excess_return` = `monthly_return` − `sp500_return`, in percentage points
- `beat_sp500` = 1 if `monthly_return` > `sp500_return`, else 0

December 2018 serves only as the base price for January 2019. October 2026 is excluded because the month was incomplete.

## Summary numbers

1. **Sector-months counted** = number of rows.
2. **Average monthly return** = average of `monthly_return`.
3. **Average monthly excess return vs. S&P 500** = average of `excess_return`.
4. **Share of sector-months that beat the S&P 500** = average of `beat_sp500`, as a percent.

With no filters: 1,023 · 1.20% · −0.24 pp · 45.9%.

This is a class analysis of past returns, not investment advice.
