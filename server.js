// MLB Season Splits Scraper Backend - WITH PRODUCTION FIXES
// Node.js + Express + Puppeteer

const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store scraping progress for real-time updates
let scrapingProgress = {
  isActive: false,
  step: '',
  progress: 0,
  games: [],
  data: []
};

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get current scraping progress
app.get('/api/progress', (req, res) => {
  res.json(scrapingProgress);
});

// DEBUG: View extracted data 
app.get('/api/debug', (req, res) => {
  res.json({
    hasData: !!scrapingProgress.data,
    dataLength: scrapingProgress.data ? scrapingProgress.data.length : 0,
    sampleData: scrapingProgress.data ? scrapingProgress.data.slice(0, 2) : null,
    isActive: scrapingProgress.isActive
  });
});

// Start scraping process
app.post('/api/scrape', async (req, res) => {
  if (scrapingProgress.isActive) {
    return res.status(429).json({ error: 'Scraping already in progress' });
  }

  // Reset progress
  scrapingProgress = {
    isActive: true,
    step: 'Initializing browser...',
    progress: 0,
    games: [],
    data: []
  };

  res.json({ message: 'Scraping started', progress: scrapingProgress });

  // Start scraping in background
  performScraping().catch(error => {
    console.error('Scraping error:', error);
    scrapingProgress.isActive = false;
    scrapingProgress.step = 'Error occurred during scraping';
  });
});

// Download CSV endpoint
app.get('/api/download', (req, res) => {
  console.log('Download requested. Data available:', scrapingProgress.data ? scrapingProgress.data.length : 0);
  
  if (!scrapingProgress.data || scrapingProgress.data.length === 0) {
    console.log('No data available for download');
    return res.status(404).json({ error: 'No data available for download' });
  }

  try {
    console.log('Converting data to CSV...');
    const csv = convertToCSV(scrapingProgress.data);
    
    if (!csv || csv.length === 0) {
      console.log('CSV conversion failed - empty result');
      return res.status(500).json({ error: 'Failed to generate CSV content' });
    }
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
    
    console.log(`Sending CSV file with ${csv.length} characters`);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="mlb_season_splits_${timestamp}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ error: 'Error generating CSV file' });
  }
});

async function performScraping() {
  let browser;
  
  try {
    // Step 1: Launch browser with PRODUCTION-OPTIMIZED settings
    updateProgress(5, 'Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images',
        '--disable-javascript-harmony-shipping',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-field-trial-config',
        '--disable-back-forward-cache',
        '--disable-ipc-flooding-protection'
      ],
      timeout: 0
    });

    const page = await browser.newPage();
    
    // Set more realistic browser settings for production
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Add extra headers to look more like a real browser
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    });

    // Step 2: Navigate to SportsLine MLB odds page with increased timeout
    updateProgress(10, 'Finding MLB games on SportsLine.com...');
    await page.goto('https://www.sportsline.com/mlb/odds/', { 
      waitUntil: 'networkidle2',
      timeout: 120000  // Increased to 2 minutes
    });

    // Add extra wait time for page to fully load
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 3: Extract game URLs
    updateProgress(20, 'Extracting game URLs...');
    const gameUrls = await extractGameUrls(page);
    
    if (gameUrls.length === 0) {
      throw new Error('No MLB games found for today');
    }

    scrapingProgress.games = gameUrls.map(url => ({
      url,
      teams: extractTeamsFromUrl(url),
      status: 'pending'
    }));

    updateProgress(25, `Found ${gameUrls.length} games for today`);

    // Step 4: Scrape ALL games
    const gamesToScrape = gameUrls;
    const allSeasonSplitsData = [];

    if (gamesToScrape.length === 0) {
      throw new Error('No MLB games found for today');
    }

    for (let i = 0; i < gamesToScrape.length; i++) {
      const gameUrl = gamesToScrape[i];
      const teams = extractTeamsFromUrl(gameUrl);
      const progressBase = 30 + (i * (65 / gamesToScrape.length));

      updateProgress(progressBase, `Fetching data for ${teams.away} @ ${teams.home}...`);
      
      try {
        // Add longer wait between games for production
        if (i > 0) {
          updateProgress(progressBase + 5, `Waiting before processing game ${i + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 8000)); // Increased wait
        }

        const gameData = await scrapeGameSeasonSplitsWithSelectors(page, gameUrl, teams);
        
        if (gameData.length > 0) {
          const gameDataWithDate = gameData.map(row => ({
            'Game Date': teams.date,
            ...row
          }));
          
          allSeasonSplitsData.push(...gameDataWithDate);
          updateProgress(progressBase + 30, `Completed ${teams.away} @ ${teams.home} - extracted ${gameData.length} splits`);
        } else {
          updateProgress(progressBase + 30, `No data found for ${teams.away} @ ${teams.home}`);
        }
        
        // Update game status
        const gameIndex = scrapingProgress.games.findIndex(g => g.url === gameUrl);
        if (gameIndex !== -1) {
          scrapingProgress.games[gameIndex].status = gameData.length > 0 ? 'completed' : 'no_data';
        }
        
      } catch (error) {
        console.error(`Error scraping ${gameUrl}:`, error);
        updateProgress(progressBase + 30, `Error scraping ${teams.away} @ ${teams.home}`);
        
        const gameIndex = scrapingProgress.games.findIndex(g => g.url === gameUrl);
        if (gameIndex !== -1) {
          scrapingProgress.games[gameIndex].status = 'error';
        }
      }
    }

    // Step 5: Store data and finalize
    scrapingProgress.data = allSeasonSplitsData;
    console.log(`Final data stored: ${allSeasonSplitsData.length} rows`);
    console.log('Sample data:', allSeasonSplitsData[0]);
    
    if (allSeasonSplitsData.length === 0) {
      updateProgress(100, `Scraping completed. No season splits data found on available pages.`);
    } else {
      updateProgress(100, `Scraping completed successfully! ${allSeasonSplitsData.length} data rows extracted.`);
    }
    
    scrapingProgress.isActive = false;
    console.log('Scraping process completed, server ready for download requests');

  } catch (error) {
    console.error('Scraping failed:', error);
    updateProgress(0, `Error: ${error.message}`);
    scrapingProgress.isActive = false;
  } finally {
    if (browser) {
      try {
        console.log('Closing browser...');
        await browser.close();
        console.log('Browser closed successfully');
      } catch (browserError) {
        console.error('Error closing browser:', browserError);
      }
    }
    console.log('Server remains active for downloads');
  }
}

async function extractGameUrls(page) {
  try {
    // Increased wait time for production
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    const gameUrls = await page.evaluate(() => {
      const urls = [];
      
      const selectors = [
        'a[href*="/mlb/game-forecast/"]',
        'a[href*="game-forecast"]',
        '[data-testid="game-card"] a',
        '.game-card a',
        'a[href*="MLB_"]'
      ];
      
      for (const selector of selectors) {
        const links = document.querySelectorAll(selector);
        links.forEach(link => {
          const href = link.getAttribute('href');
          if (href && href.includes('game-forecast') && href.includes('MLB_') && !href.includes('/expert-picks/')) {
            const fullUrl = href.startsWith('/') ? 'https://www.sportsline.com' + href : href;
            if (!urls.includes(fullUrl)) {
              urls.push(fullUrl);
            }
          }
        });
        
        if (urls.length > 0) break;
      }
      
      return urls;
    });

    console.log(`Found ${gameUrls.length} game URLs:`, gameUrls);
    return gameUrls;
  } catch (error) {
    console.error('Error extracting game URLs:', error);
    return [];
  }
}

function extractTeamsFromUrl(url) {
  const match = url.match(/MLB_(\d{8})_([A-Z]+)@([A-Z]+)/);
  if (match) {
    const dateStr = match[1];
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const formattedDate = `${year}-${month}-${day}`;
    
    return {
      date: formattedDate,
      away: match[2],
      home: match[3]
    };
  }
  return { date: '2025-01-01', away: 'AWAY', home: 'HOME' };
}

async function scrapeGameSeasonSplitsWithSelectors(page, gameUrl, teams) {
  try {
    console.log(`\n=== SCRAPING GAME: ${teams.away} @ ${teams.home} ===`);
    console.log(`URL: ${gameUrl}`);
    
    // Navigate with increased timeout for production
    await page.goto(gameUrl, { 
      waitUntil: 'networkidle0',
      timeout: 120000  // 2 minutes
    });

    console.log('Page loaded, waiting for content to render...');
    await new Promise(resolve => setTimeout(resolve, 10000)); // Increased wait

    // Scroll to make sure all content is loaded
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(resolve => setTimeout(resolve, 3001));

    // Extract data using the exact selectors
    const seasonSplitsData = await page.evaluate((awayTeam, homeTeam) => {
      const data = [];
      
      console.log('Using HTML selectors to extract clean data...');
      
      const xpath = '/html/body/div[1]/div[1]/div[5]/div/div/div[2]/main/section[4]';
      const seasonSplitsSection = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;

      if (seasonSplitsSection) {
        console.log('Found Season Splits section, extracting with clean selectors...');
        
        const percentageElements = seasonSplitsSection.querySelectorAll('.sc-2d876bef-0.jbGCWn');
        const recordPLElements = seasonSplitsSection.querySelectorAll('.sc-2d876bef-0.eoDCvc');
        const pitcherElements = seasonSplitsSection.querySelectorAll('.sc-2d876bef-0.vVAPS');
        
        console.log(`Found ${percentageElements.length} percentage elements`);
        console.log(`Found ${recordPLElements.length} record+P/L elements`);
        console.log(`Found ${pitcherElements.length} pitcher elements`);
        
        const percentages = Array.from(percentageElements).map(el => el.textContent.trim());
        const recordsAndPL = Array.from(recordPLElements).map(el => el.textContent.trim());
        const pitcherTexts = Array.from(pitcherElements).map(el => el.textContent.trim());
        
        console.log('Percentages:', percentages);
        console.log('Records + P/L:', recordsAndPL);
        console.log('Pitcher texts:', pitcherTexts);
        
        const extractPitcherName = (text) => {
          console.log(`Parsing pitcher from: "${text}"`);
          const match = text.match(/when\s+(.+?)\s+starts/i);
          if (match) {
            console.log(`Extracted pitcher: ${match[1]}`);
            return match[1].toUpperCase();
          }
          return null;
        };
        
        const pitcherNames = pitcherTexts
          .map(extractPitcherName)
          .filter(name => name !== null);
        
        console.log('Extracted pitcher names:', pitcherNames);
        
        const splitTypes = [
          { type: 'ALL', awayCategory: 'ALL GAMES', homeCategory: 'ALL GAMES' },
          { type: 'LOCATION', awayCategory: 'ON ROAD', homeCategory: 'AT HOME' },
          { type: 'STATUS', awayCategory: 'AS FAVORITE', homeCategory: 'AS UNDERDOG OR EVEN' },
          { type: 'MONEY LINE', awayCategory: 'WHEN LINE WAS -182 TO -152', homeCategory: 'WHEN LINE WAS +126 TO +156' },
          { type: 'LOCATION & STATUS', awayCategory: 'AS ROAD FAVORITE', homeCategory: 'AS HOME UNDERDOG' },
          { type: 'OPP WIN%', awayCategory: 'VS TEAMS THAT WIN <46% OF GAMES', homeCategory: 'VS TEAMS THAT WIN >54% OF GAMES' },
          { type: 'OPP DEFENSE', awayCategory: 'VS TEAMS ALLOWING >4.2 RUNS', homeCategory: 'VS TEAMS ALLOWING 3.0 TO 4.2 RUNS' },
          { type: 'REST', awayCategory: '3RD GAME WITHOUT A DAY OFF', homeCategory: '3RD GAME WITHOUT A DAY OFF' },
          { type: 'HEAD TO HEAD', awayCategory: `VS ${homeTeam}`, homeCategory: `VS ${awayTeam}` },
          { type: 'PROJECTED STARTER', awayCategory: 'WHEN STARTER STARTS', homeCategory: 'WHEN STARTER STARTS' }
        ];
        
        for (let i = 0; i < Math.min(splitTypes.length, Math.floor(percentages.length / 2), Math.floor(recordsAndPL.length / 2)); i++) {
          const splitType = splitTypes[i];
          
          const awayPercentage = percentages[i * 2] || '0%';
          const awayRecordPL = recordsAndPL[i * 2] || '0-0, +0';
          
          const homePercentage = percentages[i * 2 + 1] || '0%';
          const homeRecordPL = recordsAndPL[i * 2 + 1] || '0-0, +0';
          
          const parseRecordPL = (text) => {
            console.log(`Parsing record/P/L from: "${text}"`);
            const match = text.match(/(\d+)-(\d+),\s*([+-]\d+)/);
            if (match) {
              console.log(`Extracted: wins=${match[1]}, losses=${match[2]}, pl=${match[3]}`);
              return {
                wins: match[1],
                losses: match[2],
                pl: match[3]
              };
            }
            console.log('No match found, using defaults');
            return { wins: '0', losses: '0', pl: '+0' };
          };
          
          const awayData = parseRecordPL(awayRecordPL);
          const homeData = parseRecordPL(homeRecordPL);
          
          let awayCategory = splitType.awayCategory;
          let homeCategory = splitType.homeCategory;
          
          if (splitType.type === 'PROJECTED STARTER' && pitcherNames.length >= 2) {
            awayCategory = `WHEN ${pitcherNames[0]} STARTS`;
            homeCategory = `WHEN ${pitcherNames[1]} STARTS`;
            
            console.log(`Using pitcher names: Away="${awayCategory}", Home="${homeCategory}"`);
          }
          
          console.log(`Creating entry with: awayWins=${awayData.wins}, awayLosses=${awayData.losses}`);
          
          const entry = {
            'Split Type': splitType.type,
            'Away Category': awayCategory,
            'Away Team': awayTeam,
            'Away Wins': awayData.wins,
            'Away Losses': awayData.losses,
            'Away Win %': awayPercentage,
            'Away P/L': awayData.pl,
            'Home Category': homeCategory,
            'Home Team': homeTeam,
            'Home Wins': homeData.wins,
            'Home Losses': homeData.losses,
            'Home Win %': homePercentage,
            'Home P/L': homeData.pl
          };
          
          console.log('Entry created:', entry);
          
          data.push(entry);
          console.log(`✅ Added ${splitType.type}:`, entry);
        }
      } else {
        console.log('❌ Could not find Season Splits section');
      }
      
      return data;
    }, teams.away, teams.home);

    console.log(`✅ Game extraction completed: ${seasonSplitsData.length} splits found`);
    return seasonSplitsData;
    
  } catch (error) {
    console.error(`❌ Error scraping game ${gameUrl}:`, error);
    return [];
  }
}

function updateProgress(progress, step) {
  scrapingProgress.progress = progress;
  scrapingProgress.step = step;
  console.log(`[${progress}%] ${step}`);
}

function convertToCSV(data) {
  if (!data || data.length === 0) {
    console.log('No data to convert to CSV');
    return '';
  }
  
  console.log(`Converting ${data.length} rows to CSV`);
  console.log('Sample data:', data[0]);
  
  try {
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = (row[header] || '').toString();
        return `"${value.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const csvContent = csvRows.join('\n');
    console.log('CSV generation successful, length:', csvContent.length);
    return csvContent;
  } catch (error) {
    console.error('Error converting to CSV:', error);
    return '';
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`MLB Season Splits Scraper server running on port ${PORT}`);
  console.log(`Access the application at: http://localhost:${PORT}`);
});

module.exports = app;