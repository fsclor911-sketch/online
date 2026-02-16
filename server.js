const express = require('express');
const app = express();
app.use(express.json());

// تخزين معرفات اللاعبين النشطين
let activePlayers = new Set();

// نقطة نهاية واحدة للدخول والخروج
app.post('/update', (req, res) => {
    const { playerId, action } = req.body;
    if (!playerId || !action) {
        return res.status(400).json({ error: 'Missing data' });
    }

    if (action === 'join') {
        activePlayers.add(playerId);
    } else if (action === 'leave') {
        activePlayers.delete(playerId);
    } else {
        return res.status(400).json({ error: 'Invalid action' });
    }

    const count = activePlayers.size;
    console.log(`👤 Player ${playerId} ${action} → Online: ${count}`);
    res.json({ count });
});

// نقطة نهاية لجلب العدد الحالي (للعرض)
app.get('/count', (req, res) => {
    res.json({ count: activePlayers.size });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
