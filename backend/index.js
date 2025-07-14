const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, 'database.db');
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // ✅ Users table: now uses INTEGER AUTOINCREMENT
    await db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        password TEXT NOT NULL
      )`
    );

    await db.run(
      `CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        ticket_date TEXT,
        name TEXT,
        description TEXT,
        status TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`
    );

    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/');
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// ✅ Signup - auto-increment ID
app.post('/signup', async (req, res) => {
  const { name, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await db.run(
    'INSERT INTO users (name, password) VALUES (?, ?)',
    [name, hashedPassword]
  );

  const newUserId = result.lastID; // SQLite gives you the auto ID
  res.json({ message: 'User signed up successfully', userId: newUserId });
});

// ✅ Login
app.post('/login', async (req, res) => {
  const { name, password } = req.body;

  const user = await db.get(
    'SELECT * FROM users WHERE name = ?',
    [name]
  );

  if (!user) {
    res.status(401).send('Invalid credentials');
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).send('Invalid credentials');
    return;
  }

  res.json({ message: 'Login successful', userId: user.id });
});

// ✅ Create ticket
app.post('/tickets', async (req, res) => {
  const { user_id, ticket_date, name, description, status } = req.body;

  await db.run(
    'INSERT INTO tickets (user_id, ticket_date, name, description, status) VALUES (?, ?, ?, ?, ?)',
    [user_id, ticket_date, name, description, status]
  );

  res.send('Ticket created');
});

// ✅ Get tickets for a user
app.get('/tickets/:userId', async (req, res) => {
  const { userId } = req.params;

  const tickets = await db.all(
    'SELECT * FROM tickets WHERE user_id = ?',
    [userId]
  );

  res.json(tickets);
});

// ✅ Update ticket
app.put('/tickets/:ticketId', async (req, res) => {
  const { ticketId } = req.params;
  const { ticket_date, name, description, status } = req.body;

  await db.run(
    'UPDATE tickets SET ticket_date = ?, name = ?, description = ?, status = ? WHERE id = ?',
    [ticket_date, name, description, status, ticketId]
  );

  res.send('Ticket updated');
});

// ✅ Delete ticket
app.delete('/tickets/:ticketId', async (req, res) => {
  const { ticketId } = req.params;

  await db.run('DELETE FROM tickets WHERE id = ?', [ticketId]);

  res.send('Ticket deleted');
});