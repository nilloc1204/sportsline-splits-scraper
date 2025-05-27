# MLB Season Splits Scraper - Context Prompt

Hi! I have a **fully working MLB Season Splits scraper** that extracts data from SportsLine.com. We built this together in a previous conversation and I need to continue working on UI improvements.

## What We Built (WORKING SOLUTION)
- **Node.js + Express + Puppeteer scraper** that processes MLB games from SportsLine.com
- **Extracts Season Splits data** from game forecast pages  
- **Exports to CSV** with 14 columns including Game Date, wins/losses split separately
- **Successfully tested** with 15+ games (170 rows of data)
- **Production ready** - handles all games from daily schedule

## Key Technical Details (PROVEN TO WORK)
**HTML Selectors that work:**
- Percentages: `.sc-2d876bef-0.jbGCWn`
- Records + P/L: `.sc-2d876bef-0.eoDCvc` 
- Pitcher names: `.sc-2d876bef-0.vVAPS`
- Season Splits section: XPath `/html/body/div[1]/div[1]/div[5]/div/div/div[2]/main/section[4]`

**Data extraction approach:**
- Extract percentages and records+P/L separately using CSS selectors
- Parse "32-19, +73" into wins="32", losses="19", pl="+73"
- Pair data: every 2 elements = 1 split (away team, home team)
- Extract game date from URL: `MLB_20250525_` → `2025-05-25`

## Current CSV Output (14 columns)
1. Game Date (YYYY-MM-DD)
2. Split Type 
3. Away Category
4. Away Team
5. Away Wins (number only)
6. Away Losses (number only) 
7. Away Win %
8. Away P/L
9. Home Category
10. Home Team
11. Home Wins (number only)
12. Home Losses (number only)
13. Home Win %
14. Home P/L

## Current File Structure
```
mlb-season-splits-scraper/
├── server.js (working scraper code)
├── package.json
├── scraper_documentation.md (complete technical docs)
├── public/
│   └── index.html (current UI)
├── examples/
│   └── mlb_season_splits_20250525_2357.csv (sample output)
└── data/ (for future downloads)
```

## What Works Perfectly
✅ Finds all MLB games from SportsLine odds page  
✅ Navigates to individual game forecast pages  
✅ Extracts all 10 split types per game (ALL, LOCATION, STATUS, MONEY LINE, LOCATION & STATUS, OPP WIN%, OPP DEFENSE, REST, HEAD TO HEAD, PROJECTED STARTER)  
✅ Includes pitcher names in PROJECTED STARTER rows  
✅ Splits wins/losses into separate columns  
✅ Adds game dates extracted from URLs  
✅ Generates clean CSV with 14 columns  
✅ Handles 15+ games reliably (~170 rows of data)  
✅ Proper error handling and progress tracking  

## Current Dependencies
```json
{
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2", 
    "puppeteer": "^24.9.0"
  }
}
```

## What I Need Help With
I want to improve the **UI/frontend experience**. The scraper backend is perfect and shouldn't be changed. I need help with:
- [Describe your specific UI improvements here]

## Important Notes
- **Don't modify the core scraping logic** - it works perfectly
- **The HTML selectors are tested and reliable** - they extract clean data
- **I'm not technical/not a programmer** - please explain things clearly
- **We spent a lot of time getting the parsing right** - the current approach using separate CSS selectors is the only method that works

Please help me improve the UI while keeping the working scraper code intact!