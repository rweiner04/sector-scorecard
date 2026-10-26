# Tableau Public build guide

This guide rebuilds `dashboard.html` in Tableau Public from `sector_returns_2019_2026.csv`. Keep the website dashboard open beside Tableau while you work.

Menu names change between Tableau versions. When a step doesn't match your screen, trust the screen.

Every **Check** value below assumes no filters are applied: all 1,023 sector-months, January 2019 – September 2026.

## 1. Connect to the data

1. Open Tableau Public. Under **Connect → To a File**, choose **Text file** and open `sector_returns_2019_2026.csv`.
2. On the Data Source tab, confirm 1,023 rows and 8 columns.
3. **Month** should show a calendar icon, meaning it is a date. If it shows `Abc`, click the icon and choose **Date**.
4. **Year** may load as a number measure. Drag it up into the dimensions, then right-click it and choose **Convert to Discrete**.
5. **Beat Sp500** may also load as a number measure. Leave it as a measure, because you will average it.

## 2. Calculated fields (Analysis → Create Calculated Field)

Write these fields first, before building any chart. Name them exactly as shown.

| Name | Formula | Serves |
|---|---|---|
| `Sector-Months` | `COUNT([Ticker])` | Summary number 1, table |
| `Avg Monthly Return` | `AVG([Monthly Return]) / 100` | Summary number 2, bar, table |
| `Avg Excess Return` | `AVG([Excess Return])` | Summary number 3, bar, heatmap, down-month chart |
| `Beat Share` | `AVG([Beat Sp500])` | Summary number 4, bar, table |
| `Volatility` | `STDEV([Monthly Return]) / 100` | Bar, table |
| `Market Direction` | `IF [Sp500 Return] < 0 THEN "S&P 500 fell" ELSE "S&P 500 rose" END` | Filter, down-month chart |
| `Growth of $100` | `100 * EXP(RUNNING_SUM(SUM(LN(1 + [Monthly Return] / 100))))` | Growth chart |

Set number formats by right-clicking each field and choosing **Default Properties → Number Format**:

- **Avg Monthly Return** and **Volatility:** Percentage, 2 decimals.
- **Beat Share:** Percentage, 1 decimal.
- **Avg Excess Return:** Custom, `+0.00" pp";-0.00" pp"`.
- **Growth of $100:** Currency, 0 decimals.

**Check:** drag each of the four summary fields onto the Text mark of a blank sheet, one at a time. You should see:

| Field | Value |
|---|---|
| `Sector-Months` | 1,023 |
| `Avg Monthly Return` | 1.20% |
| `Avg Excess Return` | −0.24 pp |
| `Beat Share` | 45.9% |

If these four don't match, stop and fix them before going on.

## 3. Parameter for the bar chart's measure

1. In the Data pane, click the arrow at the top and choose **Create Parameter**. Set it up as follows:
   - **Name:** `Bar Measure`
   - **Data type:** String
   - **Allowable values:** List, with four values: `Excess return`, `Beat rate`, `Avg return`, `Volatility`
   - **Current value:** `Excess return`
2. Create a calculated field named `Selected Measure`:
   ```
   CASE [Bar Measure]
   WHEN "Excess return" THEN [Avg Excess Return]
   WHEN "Beat rate" THEN [Beat Share] * 100
   WHEN "Avg return" THEN [Avg Monthly Return] * 100
   WHEN "Volatility" THEN [Volatility] * 100
   END
   ```
3. Right-click the parameter and choose **Show Parameter**.

## 4. Worksheets

### The four KPI sheets

Make four sheets: "KPI Months", "KPI Return", "KPI Excess" and "KPI Beat".

- On each sheet, drag its field onto **Text** on the Marks card.
- Click **Text** and edit the label. Put the number on line 1 and the label on line 2, using the same words as the website:
  - `Sector-months counted`
  - `Average monthly return`
  - `Average monthly excess return vs. S&P 500`
  - `Share of sector-months that beat the S&P 500`
- **Check:** 1,023 · 1.20% · −0.24 pp · 45.9%.

### Sheet "Growth of $100"

1. Drag **Month** to Columns. Right-click it and choose the continuous **Month** option (the green one with a year shown, e.g. "May 2015").
2. Drag **Growth of $100** to Rows. Set Marks to **Line**.
3. Drag **Sector** to **Color**.
4. Right-click **Growth of $100** on Rows and choose **Compute Using → Month**. This makes each sector compound on its own.
5. Title: `Growth of $100 over the selected months`.
6. **Check:** hover the last point of each line in September 2026:
   - Technology: $676
   - Energy: $301
   - Industrials: $294
   - Real Estate: $171
7. Optional S&P 500 line, to match the dashed line on the website:
   1. Create a field `S&P Growth of $100` with the formula `100 * EXP(RUNNING_SUM(LN(1 + MIN([Sp500 Return]) / 100)))`.
   2. Add it to Rows and choose **Dual Axis**.
   3. On that axis's Marks card, remove **Sector** from Color.
   4. Set **Compute Using → Month**.
   5. **Synchronize Axis**.
   6. **Check:** the September 2026 value is $342.

### Sheet "Sector Bar"

1. Rows: **Sector**. Columns: **Selected Measure**. Marks: **Bar**.
2. Sort descending by Selected Measure.
3. Title: insert the parameter so the title reads `<Bar Measure> by sector`.
4. **Check (Excess return):**
   - Top: Technology, +0.84 pp. Next: Energy, +0.19.
   - Bottom: Real Estate, −0.72.
5. **Check (Beat rate):** Technology 54.8 at the top, Real Estate 38.7 at the bottom.
6. **Check (Volatility):** Energy 9.37 at the top, Consumer Staples 3.90 at the bottom.

### Sheet "Excess by Year" (the heatmap)

1. Columns: **Year**. Rows: **Sector**. Marks: **Square**.
2. Drag **Avg Excess Return** to **Color** and also to **Label**.
3. Edit the colors:
   - Palette: **Orange-Blue Diverging**.
   - Check **Use Full Color Range**.
   - Under Advanced, set **Center** to 0.
4. Sort Sector descending by Avg Excess Return.
5. Title: `Average monthly excess return vs. S&P 500 by year (2026 = Jan–Sep)`.
6. **Check:**
   - Energy 2022: +6.32
   - Energy 2020: −3.43
   - Technology 2023: +1.89
   - Utilities 2023: −2.57

### Sheet "Down vs Up Months"

1. Rows: **Sector**. Columns: **Avg Excess Return**. Marks: **Bar**.
2. Drag **Market Direction** to **Color**, and also onto Rows to the right of Sector. This puts the two bars side by side.
3. Use orange for "fell" and blue for "rose".
4. Title: `Average monthly excess return when the S&P 500 fell vs. rose`.
5. **Check (S&P 500 fell):**
   - Utilities +2.07
   - Consumer Staples +1.66
   - Health Care +1.10
   - Consumer Discretionary −1.03
6. Note: do not apply the Market Direction filter to this sheet (see step 5 below).

### Sheet "Sector Table"

1. Rows: **Sector**.
2. Drag **Measure Values** to Text. Keep only these fields on the Measure Values card: Sector-Months, Avg Monthly Return, Avg Excess Return, Beat Share, Volatility.
3. Title: `Numbers behind the current view`.
4. **Check (Technology row):** 93 · 2.28% · +0.84 pp · 54.8% · 6.53%.

## 5. The controls that change several charts

1. Drag **Month** to the Filters shelf and choose **Range of Dates**.
2. Drag **Sector** and **Market Direction** to the Filters shelf.
3. Right-click each of the three filters and choose **Show Filter**.
4. Right-click **Month** and **Sector** and choose **Apply to Worksheets → All Using This Data Source**.
5. Apply **Market Direction** to every sheet *except* "Down vs Up Months", because that chart already splits by direction. Use **Apply to Worksheets → Selected Worksheets…** to pick the sheets.
6. **Check:** set Month to January–December 2022. The KPI sheets should read:

   | KPI | Value |
   |---|---|
   | Sector-months counted | 132 |
   | Average monthly return | −0.75% |
   | Average monthly excess return | +0.71 pp |
   | Beat share | 56.1% |

7. **Check:** reset Month to the full range and set Market Direction to "S&P 500 fell". The KPI sheets should read:

   | KPI | Value |
   |---|---|
   | Sector-months counted | 341 |
   | Average monthly return | −3.60% |
   | Average monthly excess return | +0.23 pp |
   | Beat share | 48.7% |

   Both checks should match the website with the same filters.

## 6. Dashboard

1. Choose **Dashboard → New Dashboard**. Set Size to **Automatic**, or Fixed 1200 × 1700.
2. Add a **Text** object at the top as the title:
   `Which S&P 500 sectors beat the market? Monthly sector returns, January 2019 – September 2026`
   Put `Robert Weiner` under it.
3. Below the title, add a **Horizontal** container. Drop the four KPI sheets into it side by side and hide their titles.
4. Add a **Text** object containing the finding in one sentence:
   `Technology was the only sector to out-compound the S&P 500 ($100 grew to $676 vs. $342), while Utilities, Consumer Staples and Health Care beat the index by 1.61 pp a month in the 31 months it fell.`
5. Below that, add the remaining sheets in this order:
   1. **Growth of $100**
   2. **Sector Bar**, with the Bar Measure parameter control beside it
   3. **Excess by Year**
   4. **Down vs Up Months**
   5. **Sector Table**
6. Put the Month, Market Direction and Sector filter cards on the left, matching the website.
7. Click through each filter and the parameter. All four numbers and every chart should respond.

## 7. Publish

1. Choose **File → Save to Tableau Public As…**, sign in, and name the workbook `S&P 500 Sector Scorecard 2019-2026`.
2. Open the link from a browser where you are not logged in and confirm it loads.
3. Send the four Tableau numbers back so they can go into the agreement table on the report page.
