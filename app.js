const express = require('express');
const path = require('path');
require('dotenv').config(); // Загружаем переменные окружения из .env

const app = express();
const port = 3000;

// Указываем директорию для статических файлов и для EJS шаблонов
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public', 'views'));  // Указываем EJS искать шаблоны в public/views

// Главный маршрут с рендерингом EJS
app.get('/', (req, res) => {
  res.render('index', {
    title: process.env.SITE_TITLE,
    description: process.env.SITE_DESCRIPTION,
    keywords: process.env.SITE_KEYWORDS,
    url: process.env.SITE_URL,
    image: process.env.SITE_IMAGE,
    twitter: process.env.TWITTER_URL,
    telegram: process.env.TELEGRAM_URL,
    channel: process.env.CHANNEL_URL
  });
});

// Главный маршрут с рендерингом EJS
app.get('/start', (req, res) => {
  res.render('start', {
    title: process.env.SITE_TITLE,
    description: process.env.SITE_DESCRIPTION,
    keywords: process.env.SITE_KEYWORDS,
    url: process.env.SITE_URL,
    image: process.env.SITE_IMAGE,
    twitter: process.env.TWITTER_URL,
    telegram: process.env.TELEGRAM_URL,
    channel: process.env.CHANNEL_URL
  });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
