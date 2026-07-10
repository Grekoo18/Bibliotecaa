const { writeFileSync } = require('fs');

const apiUrl = process.env.VITE_API_URL || 'http://localhost:3001';

writeFileSync(
  'config.js',
  `window.BIBLIOTECA_API_URL = ${JSON.stringify(apiUrl)};\n`,
);
