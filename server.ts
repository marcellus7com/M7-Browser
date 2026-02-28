import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("m7_browser.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    email TEXT,
    displayName TEXT,
    photoURL TEXT,
    fcmToken TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    lastLogin DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS extensions (
    id TEXT PRIMARY KEY,
    name TEXT,
    version TEXT,
    description TEXT,
    category TEXT,
    icon TEXT,
    isActive INTEGER DEFAULT 1,
    userId TEXT,
    scripts TEXT, -- JSON string of scripts
    FOREIGN KEY(userId) REFERENCES users(uid)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    text TEXT,
    sender TEXT, -- 'user' or 'admin'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    isRead INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    title TEXT,
    body TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    isRead INTEGER DEFAULT 0
  );
`);

// Migration: Ensure new columns exist in extensions table
const migrations = [
  "ALTER TABLE extensions ADD COLUMN description TEXT",
  "ALTER TABLE extensions ADD COLUMN scripts TEXT",
  "ALTER TABLE extensions ADD COLUMN userId TEXT",
  "ALTER TABLE extensions ADD COLUMN isActive INTEGER DEFAULT 1"
];

for (const m of migrations) {
  try {
    db.exec(m);
  } catch (e) {
    // Column likely already exists
  }
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Seed mandatory extensions for a specific user
  const seedUserExtensions = (userId: string) => {
    // User will add extensions manually, so we don't seed them anymore
    console.log(`Skipping auto-seeding for user: ${userId}`);
  };

  // Seed existing users and guest on start
  const seedAll = () => {
    console.log('Checking database schema...');
    const info = db.prepare("PRAGMA table_info(extensions)").all();
    console.log('Extensions table columns:', info.map((c: any) => c.name));

    // Ensure guest user exists
    db.prepare(`
      INSERT INTO users (uid, email, displayName, photoURL)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(uid) DO NOTHING
    `).run('guest', 'guest@m7.com', 'Convidado', 'https://picsum.photos/seed/guest/128');
  };
  seedAll();

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.post("/api/auth/login", (req, res) => {
    const { uid, email, displayName, photoURL } = req.body;
    const stmt = db.prepare(`
      INSERT INTO users (uid, email, displayName, photoURL, lastLogin)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(uid) DO UPDATE SET
        email = excluded.email,
        displayName = excluded.displayName,
        photoURL = excluded.photoURL,
        lastLogin = CURRENT_TIMESTAMP
    `);
    stmt.run(uid, email, displayName, photoURL);
    
    // Ensure new user has extensions
    seedUserExtensions(uid);
    
    res.json({ success: true });
  });

  app.get("/api/users/:uid/extensions", (req, res) => {
    const stmt = db.prepare("SELECT * FROM extensions WHERE userId = ?");
    const extensions = stmt.all(req.params.uid);
    res.json(extensions);
  });

  app.post("/api/extensions/upload", (req, res) => {
    const { id, name, version, description, category, icon, userId, scripts } = req.body;
    
    // Ensure user exists before inserting extension to avoid FK error
    try {
      const userExists = db.prepare("SELECT 1 FROM users WHERE uid = ?").get(userId);
      if (!userExists) {
        db.prepare("INSERT INTO users (uid, email, displayName) VALUES (?, ?, ?)").run(userId, 'unknown@m7.com', 'User ' + userId);
      }

      const stmt = db.prepare(`
        INSERT INTO extensions (id, name, version, description, category, icon, userId, scripts, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(id) DO UPDATE SET
          version = excluded.version,
          description = excluded.description,
          scripts = excluded.scripts,
          isActive = 1
      `);
      stmt.run(id, name, version, description, category, icon, userId, scripts || null);
      res.json({ success: true });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload extension' });
    }
  });

  app.get("/api/messages/:userId", (req, res) => {
    const stmt = db.prepare("SELECT * FROM messages WHERE userId = ? ORDER BY timestamp ASC");
    const messages = stmt.all(req.params.userId);
    res.json(messages);
  });

  // Admin Routes
  app.post("/api/extensions/toggle", (req, res) => {
    const { id, isActive } = req.body;
    const stmt = db.prepare("UPDATE extensions SET isActive = ? WHERE id = ?");
    stmt.run(isActive ? 1 : 0, id);
    res.json({ success: true });
  });

  app.delete("/api/extensions/:id", (req, res) => {
    const stmt = db.prepare("DELETE FROM extensions WHERE id = ?");
    stmt.run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/notifications/:userId", (req, res) => {
    const stmt = db.prepare("SELECT * FROM notifications WHERE userId = ? ORDER BY timestamp DESC");
    res.json(stmt.all(req.params.userId));
  });

  app.post("/api/notifications/read-all", (req, res) => {
    const { userId } = req.body;
    const stmt = db.prepare("UPDATE notifications SET isRead = 1 WHERE userId = ?");
    stmt.run(userId);
    res.json({ success: true });
  });

  app.post("/api/notifications/:id/read", (req, res) => {
    const stmt = db.prepare("UPDATE notifications SET isRead = 1 WHERE id = ?");
    stmt.run(req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/notifications/:id", (req, res) => {
    const stmt = db.prepare("DELETE FROM notifications WHERE id = ?");
    stmt.run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/admin/users", (req, res) => {
    const stmt = db.prepare("SELECT * FROM users ORDER BY lastLogin DESC");
    res.json(stmt.all());
  });

  app.post("/api/admin/notify", (req, res) => {
    const { userId, title, body } = req.body;
    const stmt = db.prepare("INSERT INTO notifications (userId, title, body) VALUES (?, ?, ?)");
    stmt.run(userId, title, body);
    res.json({ success: true });
  });

  // Socket.io
  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      socket.join(userId);
    });

    socket.on("sendMessage", (data) => {
      const { userId, text, sender } = data;
      const stmt = db.prepare("INSERT INTO messages (userId, text, sender) VALUES (?, ?, ?)");
      const result = stmt.run(userId, text, sender);
      
      const newMessage = {
        id: result.lastInsertRowid,
        userId,
        text,
        sender,
        timestamp: new Date().toISOString(),
        isRead: 0
      };

      io.to(userId).emit("message", newMessage);
      if (sender === 'user') {
        io.to("admin").emit("admin_message", newMessage);
      }
    });

    socket.on("admin_join", () => {
      socket.join("admin");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.get("/api/debug/db", (req, res) => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const schema: any = {};
    tables.forEach((t: any) => {
      schema[t.name] = db.prepare(`PRAGMA table_info(${t.name})`).all();
    });
    res.json(schema);
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
