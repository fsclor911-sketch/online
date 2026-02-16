const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10kb' }));

// تخزين اللاعبين النشطين: username -> { placeId, jobId, lastPing }
const players = new Map();

// تنظيف اللاعبين غير النشطين (آخر Ping أقدم من 30 ثانية)
function cleanInactivePlayers() {
    const now = Date.now();
    for (const [name, data] of players.entries()) {
        if (now - data.lastPing > 30000) {
            players.delete(name);
        }
    }
}
setInterval(cleanInactivePlayers, 30000);

// نقطة نهاية Ping – يسجل اللاعب النشط
app.post('/ping', (req, res) => {
    const { username, placeId, jobId } = req.body;
    if (!username || !placeId || !jobId) {
        return res.status(400).json({ error: 'Missing data' });
    }
    players.set(username, {
        placeId,
        jobId,
        lastPing: Date.now()
    });
    res.json({ status: 'ok', online: players.size });
});

// نقطة نهاية لجلب قائمة اللاعبين النشطين (لحساب العدد)
app.get('/players', (req, res) => {
    cleanInactivePlayers();
    const playerList = Array.from(players.keys());
    res.json(playerList);
});

// نقطة نهاية إضافية: العدد مباشرة (اختيارية، لكن تسهل الأمور)
app.get('/count', (req, res) => {
    cleanInactivePlayers();
    res.json({ count: players.size });
});

app.get('/', (req, res) => {
    res.send('Roblox Player Counter Server is running ✅');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
