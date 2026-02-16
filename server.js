const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors()); // يسمح بطلبات من أي مصدر (Roblox)
app.use(express.json());

// تخزين اللاعبين النشطين: username -> { lastPing }
const players = new Map();

// تنظيف اللاعبين غير النشطين (آخر ping أقدم من 25 ثانية)
function cleanInactive() {
    const now = Date.now();
    for (const [name, data] of players.entries()) {
        if (now - data.lastPing > 25000) { // 25 ثانية (أقل من 30 ثانية احتياطاً)
            players.delete(name);
            console.log(`🗑️ Removed ${name} (timeout)`);
        }
    }
}
setInterval(cleanInactive, 10000); // كل 10 ثواني

// نقطة نهاية ping (يسجل اللاعب النشط)
app.post('/ping', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Missing username' });
    }
    players.set(username, { lastPing: Date.now() });
    console.log(`❤️ Ping from ${username} – online: ${players.size}`);
    res.json({ status: 'ok', online: players.size });
});

// نقطة نهاية لجلب العدد الحالي
app.get('/count', (req, res) => {
    cleanInactive(); // تنظيف قبل الإرسال
    res.json({ count: players.size });
});

// نقطة نهاية لجلب قائمة الأسماء (اختياري)
app.get('/players', (req, res) => {
    cleanInactive();
    res.json(Array.from(players.keys()));
});

// الصفحة الرئيسية (للتأكد من أن الخادم شغال)
app.get('/', (req, res) => {
    res.send('✅ Roblox Online Counter Server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
});
