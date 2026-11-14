import express from 'express';
import cors from 'cors';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

let db;

async function initDB() {
  db = await open({
    filename: './ewise.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    DROP TABLE IF EXISTS requests;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      userId TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('recycler', 'management')) NOT NULL,
      city TEXT DEFAULT 'Mumbai',
      points INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      streak INTEGER DEFAULT 0,
      hasSeenOnboarding INTEGER DEFAULT 0
    );

    CREATE TABLE requests (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      devices TEXT NOT NULL,
      action TEXT NOT NULL,
      status TEXT NOT NULL,
      points INTEGER NOT NULL,
      date TEXT NOT NULL,
      city TEXT NOT NULL,
      area TEXT NOT NULL,
      pickupDate TEXT NOT NULL,
      timeSlot TEXT NOT NULL,
      assignedWorker TEXT DEFAULT '',
      rejectionReason TEXT DEFAULT '',
      deviceImage TEXT DEFAULT '',
      qrCode TEXT DEFAULT '',
      verifiedByQR INTEGER DEFAULT 0,
      FOREIGN KEY(userId) REFERENCES users(userId)
    );
  `);

  await db.run(
    `INSERT INTO users (name, email, userId, password, role, city, points, level, streak, hasSeenOnboarding) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Aarav Sharma', 'aarav@ewise.org', 'recycler1', 'pass123', 'recycler', 'Mumbai', 100, 1, 2, 0]
  );

  await db.run(
    `INSERT INTO users (name, email, userId, password, role, city, points, level, streak, hasSeenOnboarding) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Priya Patel', 'priya@ewise.org', 'recycler2', 'pass123', 'recycler', 'Delhi', 280, 2, 4, 1]
  );

  await db.run(
    `INSERT INTO users (name, email, userId, password, role, city, points, level, streak, hasSeenOnboarding) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Sarah Jenkins', 'admin@ewise.org', 'admin1', 'admin123', 'management', 'Mumbai', 0, 1, 0, 1]
  );

  await db.run(
    `INSERT INTO requests (id, userId, devices, action, status, points, date, city, area, pickupDate, timeSlot, assignedWorker, rejectionReason, deviceImage, qrCode, verifiedByQR) VALUES 
     ('EW-9021', 'recycler1', 'Dell XPS 13 (laptop)', 'Recycle', 'Pending Verification', 50, '2026-11-12', 'Mumbai', 'Andheri West', '2026-11-15', 'Morning (9 AM - 12 PM)', '', '', '', 'QR-EW-9021', 0),
     ('EW-8812', 'recycler1', 'iPhone 11 Pro (smartphone)', 'Donate / Reuse', 'Accepted', 100, '2026-11-05', 'Mumbai', 'Bandra West', '2026-11-08', 'Afternoon (12 PM - 4 PM)', 'Vijay Salunkhe (Andheri / Bandra West Hub)', '', '', 'QR-EW-8812', 1)`
  );
}

initDB().then(() => {
  console.log('E-Wise Database Connected.');
});

app.post('/api/signup', async (req, res) => {
  const { name, email, userId, password, role, city } = req.body;
  try {
    const existing = await db.get(`SELECT * FROM users WHERE userId = ? OR email = ?`, [userId, email]);
    if (existing) return res.status(400).json({ error: 'User ID or Email already exists.' });

    await db.run(
      `INSERT INTO users (name, email, userId, password, role, city, points, level, streak, hasSeenOnboarding) 
       VALUES (?, ?, ?, ?, ?, ?, 0, 1, 0, 0)`,
      [name, email, userId, password, role, city || 'Mumbai']
    );

    const newUser = await db.get(`SELECT id, name, email, userId, role, city, points, level, streak, hasSeenOnboarding FROM users WHERE userId = ?`, [userId]);
    res.json({ user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { userId, password, role } = req.body;
  try {
    const user = await db.get(
      `SELECT id, name, email, userId, role, city, points, level, streak, hasSeenOnboarding 
       FROM users WHERE userId = ? AND password = ? AND role = ?`,
      [userId, password, role]
    );

    if (!user) return res.status(401).json({ error: 'Invalid credentials or role selection.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/onboarding-complete', async (req, res) => {
  const { userId } = req.body;
  await db.run(`UPDATE users SET hasSeenOnboarding = 1 WHERE userId = ?`, [userId]);
  res.json({ success: true });
});

app.get('/api/requests/:userId', async (req, res) => {
  const userRequests = await db.all(`SELECT * FROM requests WHERE userId = ? ORDER BY date DESC`, [req.params.userId]);
  res.json(userRequests);
});

app.get('/api/admin/requests', async (req, res) => {
  const allRequests = await db.all(`SELECT * FROM requests ORDER BY date DESC`);
  res.json(allRequests);
});

app.post('/api/requests', async (req, res) => {
  const { userId, devices, action, points, city, area, pickupDate, timeSlot, deviceImage } = req.body;
  const requestId = `EW-${Math.floor(1000 + Math.random() * 9000)}`;
  const qrCode = `QR-${requestId}`;
  const date = new Date().toISOString().split('T')[0];

  await db.run(
    `INSERT INTO requests (id, userId, devices, action, status, points, date, city, area, pickupDate, timeSlot, assignedWorker, rejectionReason, deviceImage, qrCode, verifiedByQR) 
     VALUES (?, ?, ?, ?, 'Pending Verification', ?, ?, ?, ?, ?, ?, '', '', ?, ?, 0)`,
    [requestId, userId, devices, action, points, date, city, area, pickupDate, timeSlot, deviceImage || '', qrCode]
  );

  const updatedRequests = await db.all(`SELECT * FROM requests WHERE userId = ? ORDER BY date DESC`, [userId]);
  res.json({ requests: updatedRequests });
});

// Admin Accepts & Assigns Worker (Points NOT credited yet; credited upon QR verification)
app.post('/api/admin/verify-request', async (req, res) => {
  const { requestId, status, assignedWorker, rejectionReason } = req.body;

  const targetReq = await db.get(`SELECT * FROM requests WHERE id = ?`, [requestId]);
  if (!targetReq) return res.status(404).json({ error: 'Request not found' });

  if (status === 'Accepted') {
    await db.run(
      `UPDATE requests SET status = 'Accepted', assignedWorker = ? WHERE id = ?`,
      [assignedWorker, requestId]
    );
  } else if (status === 'Rejected') {
    await db.run(
      `UPDATE requests SET status = 'Rejected', rejectionReason = ? WHERE id = ?`,
      [rejectionReason, requestId]
    );
  }

  const allRequests = await db.all(`SELECT * FROM requests ORDER BY date DESC`);
  res.json({ success: true, requests: allRequests });
});

// QR Verification Endpoint — Credits Points & Level Up to Recycler
app.post('/api/verify-qr', async (req, res) => {
  const { requestId } = req.body;
  const targetReq = await db.get(`SELECT * FROM requests WHERE id = ?`, [requestId]);
  if (!targetReq) return res.status(404).json({ error: 'Request not found' });

  if (targetReq.verifiedByQR === 0) {
    await db.run(`UPDATE requests SET verifiedByQR = 1, status = 'Accepted' WHERE id = ?`, [requestId]);

    const user = await db.get(`SELECT points FROM users WHERE userId = ?`, [targetReq.userId]);
    const newPoints = (user?.points || 0) + targetReq.points;
    const newLevel = Math.floor(newPoints / 200) + 1;

    await db.run(`UPDATE users SET points = ?, level = ? WHERE userId = ?`, [newPoints, newLevel, targetReq.userId]);
  }

  const allRequests = await db.all(`SELECT * FROM requests ORDER BY date DESC`);
  res.json({ success: true, requests: allRequests });
});

app.post('/api/claim-reward', async (req, res) => {
  const { userId, cost } = req.body;
  try {
    const user = await db.get(`SELECT points FROM users WHERE userId = ?`, [userId]);
    if (!user || user.points < cost) {
      return res.status(400).json({ error: 'Insufficient E-Points balance.' });
    }

    const newPoints = user.points - cost;
    await db.run(`UPDATE users SET points = ? WHERE userId = ?`, [newPoints, userId]);

    const updatedUser = await db.get(
      `SELECT id, name, email, userId, role, city, points, level, streak, hasSeenOnboarding FROM users WHERE userId = ?`, 
      [userId]
    );

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));