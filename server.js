const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors()); // مهم جداً لـ Roblox
app.use(express.json());

const players = new Map(); // username -> lastPing

// تنظيف غير النشطين (أقدم من 25 ثانية)
function cleanInactive() {
    const now = Date.now();
    for (const [name, time] of players.entries()) {
        if (now - time > 25000) {
            players.delete(name);
            console.log(`Removed ${name} (timeout)`);
        }
    }
}
setInterval(cleanInactive, 10000);

// نقطة نهاية Ping (POST)
app.post('/ping', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Missing username' });
    }
    players.set(username, Date.now());
    console.log(`Ping from ${username} – online: ${players.size}`);
    res.json({ status: 'ok', online: players.size });
});

// نقطة نهاية Count (GET)
app.get('/count', (req, res) => {
    cleanInactive();
    res.json({ count: players.size });
});

// نقطة نهاية Players (GET) اختيارية
app.get('/players', (req, res) => {
    cleanInactive();
    res.json(Array.from(players.keys()));
});

// نقطة نهاية رئيسية للتأكد من عمل الخادم
app.get('/', (req, res) => {
    res.send('✅ Roblox Online Counter Server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
