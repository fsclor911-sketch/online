const express = require('express');
const app = express();
app.use(express.json());

// تخزين بيانات اللاعبين: { playerId: lastHeartbeat }
let players = new Map();

// نقطة نهاية للتسجيل وإرسال نبضات الحياة
app.post('/heartbeat', (req, res) => {
    const { playerId } = req.body;
    if (!playerId) return res.status(400).json({ error: 'Missing playerId' });

    const now = Date.now();
    players.set(playerId, now);

    // تنظيف اللاعبين الذين لم يرسلوا نبضات خلال آخر 20 ثانية
    for (let [id, time] of players.entries()) {
        if (now - time > 20000) { // 20 ثانية
            players.delete(id);
            console.log(`🗑️ Player ${id} removed (timeout)`);
        }
    }

    console.log(`❤️ Heartbeat from ${playerId}, current online: ${players.size}`);
    res.json({ count: players.size });
});

// نقطة نهاية لجلب العدد الحالي
app.get('/count', (req, res) => {
    res.json({ count: players.size });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
