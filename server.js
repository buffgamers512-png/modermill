
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Python Free Fire nickname API
const PLAYER_API = 'http://127.0.0.1:5000/nickname?uid=';

app.use(express.json());
app.use(express.static(__dirname));

// Asosiy sahifa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Player ID va nickname tekshirish
app.get('/api/player/:id', async (req, res) => {
  const id = req.params.id;

  if (!/^\d{8,12}$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Player ID 8–12 ta raqamdan iborat bo‘lishi kerak.'
    });
  }

  try {
    const response = await fetch(
      PLAYER_API + encodeURIComponent(id),
      {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(12000)
      }
    );

    const data = await response.json();

    if (!response.ok || data.success !== true ||
        typeof data.nickname !== 'string' || !data.nickname.trim()) {
      return res.status(502).json({
        success: false,
        message: data.error || data.message ||
          'Nickname topilmadi. API vaqtincha ishlamayotgan bo‘lishi mumkin.'
      });
    }

    return res.json({
      success: true,
      id,
      nickname: data.nickname.trim(),
      region: data.region || 'Noma’lum'
    });
  } catch (error) {
    console.error('Player API xatosi:', error.message);

    return res.status(502).json({
      success: false,
      message: 'Python API ishlayotganini tekshiring: http://127.0.0.1:5000'
    });
  }
});

// Noma’lum API manzillari
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API manzili topilmadi.'
  });
});

app.listen(PORT, () => {
  console.log(`MODERMILL: http://localhost:${PORT}`);
});
