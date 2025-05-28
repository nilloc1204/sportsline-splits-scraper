# MLB Season Splits Scraper — End-to-End Workflow Documentation

## 1. User Interaction: Starting the Scraper

- **User Action:**  
  The user clicks the **Start Scraping** button on the web interface (or sends a request to the server’s `/scrape` endpoint).

- **What Happens:**  
  - The front-end sends a request to the Express server (Node.js backend).
  - The backend starts the scraping process and provides progress updates (if implemented).

---

## 2. Game URLs Extraction

- **Step 1: Launch Puppeteer**  
  - The backend launches a headless browser using Puppeteer.

- **Step 2: Navigate to SportsLine MLB Page**  
  - Puppeteer navigates to the main SportsLine MLB forecast page.

- **Step 3: Wait for Content**  
  - The script waits for the page to fully render (using selectors or a timeout).

- **Step 4: Extract Game URLs**  
  - The script queries the DOM for all MLB game forecast links for the target date(s).
  - Example selector: all anchor tags or elements with URLs matching `/mlb/game-forecast/MLB_YYYYMMDD_*`.
  - Collects and deduplicates all found URLs into an array.

---

## 3. Scraping Each Game’s Splits

For each game URL:

- **Step 1: Load Game Page**  
  - Puppeteer navigates to the individual game’s forecast page.

- **Step 2: Wait for Splits Section**  
  - The script waits for the “Season Splits” section to appear.

- **Step 3: Extract Split Rows**  
  - The script selects all split rows using their unique container class (e.g., `.sc-8f3095e9-0.fWvXUD.sc-5b7e5402-6.begGYC`).

- **Step 4: For Each Split Row (10 per game):**
  - **Extract Categories & Split Type:**
    - The first `.vVAPS` span: **Away Category** (e.g., "On Road", "As Favorite").
    - The second `.vVAPS` span: **Split Type** (e.g., "LOCATION", "STATUS").
    - The third `.vVAPS` span: **Home Category** (e.g., "At Home", "As Underdog or Even").
  - **Extract Stats:**
    - Away stats: percentage and record/P&L, using the correct indices (i*2 for away, i*2+1 for home).
    - Home stats: same as above.
    - Stats are extracted from `.jbGCWn` (percentage) and `.eoDCvc` (record, P/L) elements.
  - **Parse and Structure Data:**
    - Parse record/P&L strings into wins, losses, and profit/loss.
    - Build a data object for each split row with all fields.

- **Step 5: Repeat for All 10 Splits**
  - Always output exactly 10 rows per game, one for each split type.

---

## 4. Aggregating and Formatting Data

- **Step 1: Aggregate All Split Rows**
  - Collect all split data objects from all games into a single array.

- **Step 2: Prepare for CSV**
  - Define the CSV header:
    ```
    Game Date,Split Type,Away Category,Away Team,Away Wins,Away Losses,Away Win %,Away P/L,Home Category,Home Team,Home Wins,Home Losses,Home Win %,Home P/L
    ```
  - Ensure all data objects follow this structure.

---

## 5. CSV Generation

- **Step 1: Convert Data to CSV**
  - Use a CSV library or manual string concatenation to convert the array of objects into a CSV string.
  - Each object becomes one row in the CSV.
  - Fields are quoted and comma-separated.

- **Step 2: Save CSV File**
  - The CSV is saved to the `/examples/` directory with a timestamped filename (e.g., `mlb_season_splits_YYYYMMDD_HHMM.csv`).

---

## 6. Output and Download

- **Step 1: Notify User**
  - The server notifies the user that scraping is complete and provides a download link for the CSV.

- **Step 2: User Downloads CSV**
  - The user downloads the CSV file and can open it in Excel, Python, or any data tool.

---

## 7. Error Handling & Logging

- **Progress Logging:**  
  - The server logs each step: browser launch, URL extraction, each game’s scraping, splits found, and final row count.
- **Error Handling:**  
  - If a game’s splits section is missing or a selector fails, the script logs an error and skips to the next game.
  - If the DOM structure changes, selectors may need to be updated—refer to the documentation and inspect the page structure.

---

## 8. Troubleshooting Guide

- **If the CSV has wrong/misaligned data:**  
  - Check the DOM selectors for split rows and stat elements.
  - Ensure you are extracting the correct `.vVAPS` elements for Away Category, Split Type, and Home Category.
  - Check that you always output exactly 10 rows per game.

- **If you get variable redeclaration or ReferenceErrors:**  
  - Ensure variables are declared only once in each scope.
  - Move all declarations above their first use.

- **If SportsLine changes their HTML:**  
  - Inspect the new HTML structure.
  - Update selectors in the scraper logic accordingly.

---

## 9. Example Output

A sample row:
```
"2025-05-28","LOCATION","On Road","LAD","14","13","51%","-291","At Home","CLE","14","9","60%","+238"
```
- This means: On May 28, 2025, for the split type "LOCATION", the away team LAD had "On Road" stats and CLE had "At Home" stats, with all associated win/loss/P&L data.

---

# Summary Table

| Step                | User Action / System Process                | Key Selectors / Logic                         | Output / Next Step                 |
|---------------------|---------------------------------------------|-----------------------------------------------|------------------------------------|
| Start Scraping      | User clicks button or hits endpoint         | `/scrape` endpoint                            | Triggers backend process           |
| Extract URLs        | Puppeteer loads SportsLine, finds URLs      | Anchor tags with `/mlb/game-forecast/`        | Array of game URLs                 |
| Scrape Each Game    | Puppeteer loads each game page              | `.sc-8f3095e9-0.fWvXUD.sc-5b7e5402-6.begGYC`  | 10 split rows per game             |
| Extract Splits      | For each split row, extract all fields      | `.vVAPS`, `.jbGCWn`, `.eoDCvc`                | Data object per split              |
| Aggregate Data      | Collect all rows                            | Data array                                    | Ready for CSV conversion           |
| Generate CSV        | Convert array to CSV string                 | CSV library or manual                         | CSV file in `/examples/`           |
| Download Output     | User downloads CSV                          | HTTP download endpoint                        | CSV for analysis                   |

---

## Final Note

**If you ever need to update or debug the scraper:**
- Start by inspecting the SportsLine page for the latest HTML structure.
- Update selectors in the scraping logic.
- Use this documentation as a reference for the end-to-end process and troubleshooting.

---

If you want this as a markdown file or want to add diagrams, let me know!
