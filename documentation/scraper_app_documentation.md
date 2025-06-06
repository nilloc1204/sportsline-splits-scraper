# SportsLine MLB Season Splits Scraper — Comprehensive Documentation

## Overview

A Node.js web scraper that extracts MLB season splits data from SportsLine.com game forecast pages and exports to CSV.  
Features a clean web interface, real-time progress tracking, and robust CSV output for every MLB game and split.

---

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [End-to-End Workflow](#end-to-end-workflow)
3. [Technical Details](#technical-details)
4. [Selectors & Parsing Logic](#selectors--parsing-logic)
5. [CSV Structure](#csv-structure)
6. [Split Types](#split-types)
7. [Usage](#usage)
8. [Troubleshooting & Lessons Learned](#troubleshooting--lessons-learned)
9. [Summary Table](#summary-table)
10. [Final Notes](#final-notes)

---

## Project Architecture

### Backend (`server.js`)
- **Node.js + Express + Puppeteer** for browser automation and scraping.
- **Precise HTML selectors** for robust data extraction.
- **API endpoints**: `/api/progress`, `/api/scrape`, `/api/download`.
- **CSV generation**: Always outputs 10 splits per game, 14 columns per row.

### Frontend
- **Simple, modern UI**: Start Scraping, Progress, Download CSV.
- **Real-time progress**: Polls backend during scraping.
- **Mobile responsive**: Works on all device sizes.

---

## End-to-End Workflow

### 1. User Starts Scraping
- User clicks **Start Scraping** in the web UI (or hits `/scrape` endpoint).
- Frontend sends request to backend; backend starts Puppeteer and logs progress.

### 2. Extract Game URLs
- Puppeteer loads SportsLine MLB forecast page.
- Waits for content to load.
- Finds all MLB game URLs for the target date.

### 3. Scrape Each Game’s Splits
For each game:
- Loads game page and waits for “Season Splits” section.
- Finds all split rows (10 per game).
- For each split row:
  - Extracts Away Category, Split Type, Home Category from `.vVAPS` spans.
  - Extracts stats from `.jbGCWn` (percentage) and `.eoDCvc` (record/P&L).
  - Parses stats into wins, losses, and profit/loss.
- Always outputs exactly 10 rows per game.

### 4. Aggregate & Format Data
- Collects all split data into an array.
- Prepares CSV with 14 columns per row.

### 5. Generate & Download CSV
- Converts data array to CSV string.
- Saves file in `/examples/` with timestamped filename.
- User downloads CSV via UI.

---

## Technical Details

### HTML Selectors
- **Percentages:** `.sc-2d876bef-0.jbGCWn`
- **Records + P/L:** `.sc-2d876bef-0.eoDCvc`
- **Categories/Split Type:** `.sc-2d876bef-0.vVAPS` (within each split row)
- **Split Row Container:** `.sc-8f3095e9-0.fWvXUD.sc-5b7e5402-6.begGYC`

### Parsing Logic
- **Record/P&L Regex:** `/( 5c 5cd+)-(\d+),\s*([+-]\d+)/`
- **Pairing:** Every split row yields Away and Home stats, mapped by index.

### Game URL Pattern
- `https://www.sportsline.com/mlb/game-forecast/MLB_YYYYMMDD_AWAY@HOME/`
- Extracts date and team abbreviations for each row.

---

## CSV Structure

| Column # | Field            | Description                           |
|----------|------------------|---------------------------------------|
| 1        | Game Date        | YYYY-MM-DD (from URL)                 |
| 2        | Split Type       | ALL, LOCATION, STATUS, etc.           |
| 3        | Away Category    | e.g. All Games, On Road               |
| 4        | Away Team        | Team abbreviation                     |
| 5        | Away Wins        | Number                                |
| 6        | Away Losses      | Number                                |
| 7        | Away Win %       | Percentage                            |
| 8        | Away P/L         | Profit/Loss                           |
| 9        | Home Category    | e.g. All Games, At Home               |
| 10       | Home Team        | Team abbreviation                     |
| 11       | Home Wins        | Number                                |
| 12       | Home Losses      | Number                                |
| 13       | Home Win %       | Percentage                            |
| 14       | Home P/L         | Profit/Loss                           |

---

## Split Types

1. ALL - All Games
2. LOCATION - On Road vs At Home
3. STATUS - As Favorite vs As Underdog or Even
4. MONEY LINE - Specific line ranges
5. LOCATION & STATUS - Combined location and betting status
6. OPP WIN% - vs Teams That Win X% of Games
7. OPP DEFENSE - vs Teams Allowing X Runs
8. REST - Games Without a Day Off
9. HEAD TO HEAD - Team vs Team historical
10. PROJECTED STARTER - When specific pitcher starts (includes pitcher names)

---

## Usage

1. **Install dependencies:**
   ```
   npm install
   ```
2. **Start the server:**
   ```
   node server.js
   ```
   The server runs on port 3001 by default.

3. **Access the UI:**
   - Open [http://localhost:3001](http://localhost:3001) in your browser.

4. **Start scraping:**
   - Click **Start Scraping** in the UI.
   - Wait for scraping to finish (progress is shown).

5. **Download CSV:**
   - Click **Download CSV**.
   - File is saved to `/examples/` and available for download.

---

## Troubleshooting & Lessons Learned

### What DIDN'T Work
- ❌ Parsing concatenated strings with regex — led to incorrect extraction.
- ❌ Assuming HTML structure matched visual layout — selectors were more reliable.
- ❌ Complex regex for all fields at once — too error-prone.

### What DID Work
- ✅ Using exact CSS selectors from browser inspect.
- ✅ Separating data extraction by type (percentages, records, categories).
- ✅ Simple regex on clean, individual strings.
- ✅ User-provided HTML selectors.

### Debugging & Success Factors
- Have the user inspect HTML and provide selectors.
- Build and test incrementally.
- Use real browser automation for dynamic content.
- Always output 10 splits per game.
- If SportsLine changes HTML, update selectors as needed.

---

## Summary Table

| Step                | User/System Action                          | Key Selectors/Logic                           | Output/Next Step                   |
|---------------------|---------------------------------------------|-----------------------------------------------|------------------------------------|
| Start Scraping      | User clicks button or hits endpoint         | `/scrape` endpoint                            | Triggers backend process           |
| Extract URLs        | Puppeteer loads SportsLine, finds URLs      | Anchor tags with `/mlb/game-forecast/`        | Array of game URLs                 |
| Scrape Each Game    | Puppeteer loads each game page              | `.sc-8f3095e9-0.fWvXUD.sc-5b7e5402-6.begGYC`  | 10 split rows per game             |
| Extract Splits      | For each split row, extract all fields      | `.vVAPS`, `.jbGCWn`, `.eoDCvc`                | Data object per split              |
| Aggregate Data      | Collect all rows                            | Data array                                    | Ready for CSV conversion           |
| Generate CSV        | Convert array to CSV string                 | CSV library or manual                         | CSV file in `/examples/`           |
| Download Output     | User downloads CSV                          | HTTP download endpoint                        | CSV for analysis                   |

---

## Final Notes

- If you need to update or debug the scraper, start by inspecting the latest SportsLine HTML structure and update selectors as needed.
- For major changes, consult this doc for architecture, logic, and troubleshooting tips.
