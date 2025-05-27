# SportsLine MLB Season Splits Scraper - Final Working Solution

## Overview
Successfully built a Node.js scraper that extracts MLB Season Splits data from SportsLine.com game forecast pages and exports to CSV.

## Key Technical Details

### HTML Selectors That Work
- **Percentages**: `.sc-2d876bef-0.jbGCWn` (contains values like "62%", "44%")
- **Records + P/L**: `.sc-2d876bef-0.eoDCvc` (contains values like "32-19, +73", "23-29, -662")
- **Pitcher Names**: `.sc-2d876bef-0.vVAPS` (contains text like "when Christopher Sanchez starts")
- **Season Splits Section**: XPath `/html/body/div[1]/div[1]/div[5]/div/div/div[2]/main/section[4]`

### Critical Parsing Logic
1. **Extract percentages and records+P/L separately** using distinct CSS selectors
2. **Parse record+P/L strings** using regex: `(\d+)-(\d+),\s*([+-]\d+)` 
3. **Split wins/losses**: "32-19" becomes wins="32", losses="19"
4. **Extract P/L**: "+73" from "32-19, +73"
5. **Pair data**: Every 2 elements = 1 split (away team, home team)

### Game URL Pattern
- URLs follow pattern: `https://www.sportsline.com/mlb/game-forecast/MLB_YYYYMMDD_AWAY@HOME/`
- Extract date from URL: `MLB_20250525_` → `2025-05-25`
- Extract teams: `PHI@ATH` → away="PHI", home="ATH"

## Final CSV Structure (14 columns)
1. **Game Date** - Formatted as YYYY-MM-DD (extracted from URL)
2. Split Type - ALL, LOCATION, STATUS, etc.
3. Away Category - ALL GAMES, ON ROAD, etc.
4. Away Team - Team abbreviation (PHI, ATH, etc.)
5. **Away Wins** - Just the number (32)
6. **Away Losses** - Just the number (19)
7. Away Win % - Percentage (62%)
8. Away P/L - Profit/Loss (+73, -662)
9. Home Category - ALL GAMES, AT HOME, etc.
10. Home Team - Team abbreviation
11. **Home Wins** - Just the number (23)
12. **Home Losses** - Just the number (29)
13. Home Win % - Percentage (44%)
14. Home P/L - Profit/Loss (-662, +125)

## Split Types Extracted (10 per game)
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

## Major Lessons Learned

### What DIDN'T Work
❌ **Text parsing with regex on concatenated strings** - Led to incorrect number extraction
❌ **Complex regex trying to parse everything at once** - Too error-prone
❌ **Assuming HTML structure matched visual layout** - HTML was more complex

### What DID Work
✅ **Using exact CSS selectors from browser inspect** - Most reliable approach
✅ **Separating data extraction by type** (percentages vs records vs pitcher names)
✅ **Simple regex on clean, individual strings** - Much more accurate
✅ **User-provided HTML selectors** - Let non-technical user find exact elements
✅ **Splitting records into separate win/loss columns** - Better for analysis

### Key Debugging Technique
**Have user inspect HTML elements and provide exact selectors** rather than trying to guess or parse complex structures. This was the breakthrough moment.

## Technical Architecture
- **Backend**: Node.js + Express + Puppeteer
- **Frontend**: Simple HTML + JavaScript
- **Data Flow**: SportsLine URL detection → Game page navigation → HTML selector extraction → CSV generation
- **Reliability**: Handles 15+ games successfully (~170 rows of data)

## Browser Configuration
```javascript
browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox', 
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu'
    // Other optimization flags as needed
  ]
});
```

This configuration is optimized for running in a local environment with puppeteer.

## Critical Success Factors
1. **User collaboration** - Non-technical user provided exact HTML selectors
2. **Iterative approach** - Built and tested incrementally
3. **Real browser automation** - Puppeteer handled JavaScript rendering
4. **Flexible data structure** - Easy to add game dates and split wins/losses
5. **Proper error handling** - Server stays alive for downloads

## Performance
- **Processing time**: ~5-10 minutes for 15+ games
- **Success rate**: 100% when Season Splits section exists
- **Data accuracy**: Spot-checked and verified correct
- **Scalability**: Handles all games from daily schedule

## Future Enhancements Discussed
- Date filtering (though adding Game Date column solved this)
- UI improvements for user experience
- Expanding to other sports/sites using same techniques

---

**Bottom Line**: The key to success was abandoning complex text parsing in favor of precise HTML element selection using CSS selectors provided by the user through browser inspection tools.