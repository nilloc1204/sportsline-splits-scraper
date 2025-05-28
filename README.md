# MLB Season Splits Scraper

A web scraper that extracts MLB season splits data from SportsLine.com game forecast pages and exports to CSV.

## Overview

This scraper uses Node.js with Express and Puppeteer to:
- Find MLB games listed on SportsLine.com
- Extract season splits data for each game
- Provide a clean UI with real-time progress tracking
- Generate a downloadable CSV with detailed split statistics

## Features

- Extracts 10 different split types for each game
- Formats data into a 14-column CSV structure
- Includes game date, team names, win/loss records, and profit/loss stats
- Provides real-time progress updates during scraping
- Simple web interface with intuitive start and download buttons

## Requirements

- Node.js v18+ (recommended: latest LTS)
- Chrome or Chromium browser (Puppeteer will download a compatible version automatically, but you can use your system Chrome if preferred)
- Internet connection (to access SportsLine and download dependencies)

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```
4. Open your browser and navigate to: `http://localhost:3001`

## Usage

1. **Start the server:**
   ```
   node server.js
   ```
   The server will start on port 3001 by default.

2. **Access the web interface:**
   - Open your browser and go to: [http://localhost:3001](http://localhost:3001)

3. **Start scraping:**
   - Click the **Start Scraping** button in the UI.
   - The app will show progress as it scrapes all MLB games for the day.

4. **Download CSV:**
   - Once scraping is complete, click the **Download CSV** button to save the results.
   - The CSV will include all split types and stats for every game found.

5. **CSV Output:**
   - The file will be saved in the `/examples/` directory and available for download via the UI.

## CSV Structure

The generated CSV includes the following columns:
1. Game Date (YYYY-MM-DD)
2. Split Type (ALL, LOCATION, STATUS, etc.)
3. Away Category (ALL GAMES, ON ROAD, etc.)
4. Away Team (Team abbreviation)
5. Away Wins (Number)
6. Away Losses (Number)
7. Away Win % (Percentage)
8. Away P/L (Profit/Loss)
9. Home Category (ALL GAMES, AT HOME, etc.)
10. Home Team (Team abbreviation)
11. Home Wins (Number)
12. Home Losses (Number)
13. Home Win % (Percentage)
14. Home P/L (Profit/Loss)

## Split Types Extracted

The scraper extracts the following split types for each game:
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

## Dependencies

- express - Web server framework
- puppeteer - Headless Chrome browser automation
- cors - Cross-origin resource sharing support

## Documentation

See the `documentation` folder for detailed development history and technical details. 