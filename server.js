const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 3000;
const API_KEY = '2a7c13d4c3e808edfee52512ef14bff4';
const BASE_URL = 'https://api.openweathermap.org/data/3.0/onecall';
app.use(express.static('public'));
app.get('/api/weather', async (req, res) => {
    const { location } = req.query;
    const response = await fetch(`${BASE_URL}weather?q=${location}&units=imperial&appid=${API_KEY}`);
    const data = await response.json();
    res.json(data);
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
