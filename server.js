const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;
const gamesDirectory = path.join(__dirname, 'games');

// Middleware to serve each game as a static path
const serveGames = () => {
  // Scan the 'games' directory for each game folder
  fs.readdirSync(gamesDirectory).forEach(gameFolder => {
    const gamePath = path.join(gamesDirectory, gameFolder);
    if (fs.statSync(gamePath).isDirectory()) {
      // Serve each game under its folder name as a route
      app.use(`/${gameFolder}`, express.static(gamePath));
    }
  });
};

// Function to generate HTML for the main page
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

// Automatically serve the games
serveGames();

// Main route that lists all games
app.get('/', (req, res) => {
  const mainPage = generateMainPage();
  res.send(mainPage);
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});