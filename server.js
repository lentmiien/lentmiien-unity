const express = require('express');
const path = require('path');
const fs = require('fs');
const expressStaticGzip = require('express-static-gzip');

const app = express();
const port = 3000;
const gamesDirectory = path.join(__dirname, 'games');

// Helper function to determine Content-Type based on file extension
const getContentType = (filepath) => {
  const ext = path.extname(filepath).toLowerCase();
  switch (ext) {
    case '.html':
      return 'text/html';
    case '.js':
      return 'application/javascript';
    case '.css':
      return 'text/css';
    case '.data':
      return 'application/octet-stream';
    case '.wasm':
      return 'application/wasm';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.ico':
      return 'image/x-icon';
    default:
      return 'application/octet-stream';
  }
};

// Middleware to serve each game with gzip support
const serveGames = () => {
  fs.readdirSync(gamesDirectory).forEach(gameFolder => {
    const gamePath = path.join(gamesDirectory, gameFolder);
    if (fs.statSync(gamePath).isDirectory()) {
      app.use(`/${gameFolder}`, expressStaticGzip(gamePath, {
        enableBrotli: true, // Enable Brotli if you have .br files
        orderPreference: ['br', 'gz'], // Prioritize Brotli over gzip
        setHeaders: (res, filepath) => {
          if (filepath.endsWith('.gz') || filepath.endsWith('.br')) {
            // Determine the original file extension
            let originalExt = path.extname(filepath.slice(0, filepath.lastIndexOf('.')));
            if (!originalExt) originalExt = path.extname(filepath);

            // Set the correct Content-Type
            const contentType = getContentType(filepath.slice(0, filepath.lastIndexOf('.')));
            if (contentType) {
              res.setHeader('Content-Type', contentType);
            }

            // Set Content-Encoding based on the compression
            if (filepath.endsWith('.gz')) {
              res.setHeader('Content-Encoding', 'gzip');
            } else if (filepath.endsWith('.br')) {
              res.setHeader('Content-Encoding', 'br');
            }
          }
        }
      }));
    }
  });
};

// Function to generate the main page listing all games
const generateMainPage = () => {
  const gameLinks = fs.readdirSync(gamesDirectory)
    .filter(gameFolder => fs.statSync(path.join(gamesDirectory, gameFolder)).isDirectory())
    .map(gameFolder => `<li><a href="/${gameFolder}">${gameFolder}</a></li>`)
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Available Games</title>
    </head>
    <body>
        <h1>Available Games</h1>
        <ul>
            ${gameLinks}
        </ul>
    </body>
    </html>
  `;
};

// Initialize serving of games
serveGames();

// Main route to display all available games
app.get('/', (req, res) => {
  const mainPage = generateMainPage();
  res.send(mainPage);
});

// Serve favicon.ico globally (optional)
app.get('/favicon.ico', (req, res) => {
  const faviconPath = path.join(__dirname, 'favicon.ico');
  if (fs.existsSync(faviconPath)) {
    res.sendFile(faviconPath);
  } else {
    res.status(204).end(); // No Content
  }
});

// Handle 404 for other routes
app.use((req, res, next) => {
  res.status(404).send('404 Not Found');
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});