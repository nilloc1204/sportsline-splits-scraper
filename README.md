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

1. Click the "Start Scraping" button
2. Wait for the scraping process to complete (may take 5-10 minutes)
3. Click the "Download CSV" button when it appears
4. Find your CSV file in your downloads folder

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