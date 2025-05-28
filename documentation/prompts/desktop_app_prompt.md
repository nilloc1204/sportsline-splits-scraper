# MLB Season Splits Scraper - Desktop App Development Context

## 🎯 Project Summary
I have a **fully working MLB Season Splits scraper** that extracts data from SportsLine.com. It works perfectly locally but we've hit deployment issues with hosting providers. I want to package it as a **desktop app** that I can send to friends to use.

## ✅ What Currently Works Perfectly
- **Local Node.js + Express + Puppeteer scraper** runs flawlessly on localhost:3000
- **Extracts all 10 season split types** from MLB games on SportsLine.com 
- **Clean UI** with blue start button → progress tracking → green download CSV button
- **14-column CSV output** with Game Date, split wins/losses separately, all data properly formatted
- **Proven reliable** - tested with 15+ games, 170+ rows of data

## 🚫 Hosting Issues We Tried and Failed
1. **Railway** - SportsLine blocked their IP addresses (timeout errors)
2. **Render** - Chrome installation issues in production
3. **Heroku** - Chrome installation issues despite buildpacks
4. **Cloudflare Workers** - Browser launch timeouts, platform limitations

## 📁 Current File Structure (Working Locally)
```
mlb-season-splits-scraper/
├── server.js (Node.js + Express + Puppeteer backend)
├── package.json (cors, express, puppeteer dependencies)
├── public/
│   └── index.html (final UI with blue/green buttons)
└── examples/
    └── mlb_season_splits_YYYYMMDD_HHMM.csv (sample output)
```

## 🔑 Critical Technical Details That Work
- **HTML Selectors**: Uses exact CSS selectors (`.sc-2d876bef-0.jbGCWn`, `.sc-2d876bef-0.eoDCvc`, `.sc-2d876bef-0.vVAPS`)
- **Data Parsing**: Splits "32-19, +73" into wins="32", losses="19", pl="+73" 
- **Game URL Pattern**: `https://www.sportsline.com/mlb/game-forecast/MLB_YYYYMMDD_AWAY@HOME/`
- **CSV Structure**: 14 columns including Game Date, separate win/loss columns
- **UI Flow**: Start Scraping (blue) → Progress Bar → Download CSV (green)

## 🎯 What I Want Now
**Package this working scraper as a desktop executable** that:
- Friends can **download and double-click to run**
- **No technical setup required** (includes Node.js, Chrome, everything)
- **Same exact UI and functionality** as the local version
- **Works on Windows and Mac** if possible
- **Single file or simple installer** I can send via email/Dropbox

## 💻 Technical Preferences
- I'm **not a programmer** - need clear step-by-step instructions
- Currently using **Cursor IDE** 
- Prefer **simplest approach** that actually works
- **Electron** sounds good if it's the easiest route
- Want to **keep all existing code** - just package it differently

## 📋 Requirements
- **Must include browser/Chrome** (for Puppeteer)
- **Must be portable** (no installation of Node.js required)
- **Must preserve exact UI** (blue start button, progress bar, green download)
- **Must work offline** once downloaded
- **File size under 500MB** if possible

## ❌ What NOT to Change
- **Don't modify server.js** - the scraping logic is perfect
- **Don't modify index.html** - the UI works exactly as desired  
- **Don't change data parsing** - the CSV output is correct
- **Don't change HTML selectors** - they're proven to work

## 🚀 Expected Outcome
**A single .exe (Windows) or .app (Mac) file** that friends can:
1. Download from email/Dropbox
2. Double-click to launch
3. See the same MLB scraper interface in their browser
4. Click "Start Scraping" and get CSV downloads
5. Use without any technical knowledge

**The scraper itself is production-ready and tested. I just need help packaging it as a desktop app that friends can easily use without hosting/deployment issues.**