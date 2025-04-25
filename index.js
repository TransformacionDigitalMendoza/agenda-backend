require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const app = express();

const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;

app.use(cors({
  origin: (origin, callback) => {
    if (origin === ALLOWED_ORIGIN || !origin) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  }
}));

app.get('/events', async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SHEET_ID;
    const range = 'A2:C'; // Ajusta al rango de tus datos

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const events = response.data.values.map(row => ({
      title: row[0],
      start: row[1],
      end: row[2]
    }));

    res.json(events);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).send('Error al obtener datos');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
