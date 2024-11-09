const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Указываем папку для обслуживания статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Обрабатываем запрос на корневой маршрут и отправляем index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обрабатываем запрос на корневой маршрут и отправляем index.html
app.get('/start', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'start.html'));
});

// Запускаем сервер
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
