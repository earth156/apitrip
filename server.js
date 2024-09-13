const { error } = require("console");
const express = require("express");
const req = require("express/lib/request");
const { request } = require("http");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());


const db = new sqlite3.Database("./db.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the tripbooking database.");
  }
});

app.use(express.json());

// API showlotto
app.get("/", (req, res) => {
  console.log("Hello LOTTO!!!");
  res.send("Hello LOTTO!!!");
});

// API showlotto - show all lotto numbers
app.get("/showlotto", (req, res) => {
  db.all("SELECT lotto_num,price,lotto_id FROM lotto_nunber", [], (err, rows) => {
    handleResponse(res, err, rows);
  });
});

// API insertlotto - insert lotto number
app.post("/insertlotto", (req, res) => {
  const { lotto_num } = req.body;

  // ตรวจสอบว่ามีข้อมูล lottonumber หรือไม่
  if (!lotto_num) {
    res.status(400).json({ error: "lottonumber is required" });
    return;
  }

  const sql = "INSERT INTO lotto_nunber (lotto_num) VALUES (?)";

  db.run(sql, [lotto_num], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // คืนค่า response พร้อมกับ ID ที่เพิ่งถูกเพิ่ม
    res.json({ message: "Lotto number inserted successfully", id: this.lastID });
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";

  db.get(sql, [username, password], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (row) {
      // User exists and password matches
      res.json({
        message: "Login successful",
        user_id: row.user_id,
        types: row.types,
        username: row.username,
        password: row.password,
        phone: row.phone,
        email: row.email,
        img: row.img // ส่งเฉพาะข้อมูลที่ต้องการ
      });
    } else {
      // User does not exist or password does not match
      res.status(401).json({ message: "กรุณาสมัครสมาชิก" });
    }
  });
});


// API register - insert user into users table
app.post("/register", (req, res) => {
  const { username, password, email, phone, img } = req.body;

  // ตรวจสอบว่าข้อมูลที่ต้องการทั้งหมดถูกส่งมาครบถ้วน
  if (!username || !password || !email || !phone) {
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบทุกช่อง" });
  }

  const sql = "INSERT INTO users (username, password, email, phone, img, types,money) VALUES (?, ?, ?, ?, ?, ?, ?)";

  db.run(sql, [username, password, email, phone, img, 'customer', '2500'], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // คืนค่า response พร้อมกับ ID ที่เพิ่งถูกเพิ่ม
    res.json({ message: "User registered successfully", id: this.lastID });
  });
});

app.get('/showUser/:user_id', (req, res) => {
  const userId = req.params.user_id; // รับค่า user_id จาก URL parameter

  // ตรวจสอบและล็อกค่า userId
  console.log('Received user_id:', userId);

  const sql = 'SELECT * FROM users WHERE user_id = ?'; // คำสั่ง SQL เพื่อดึงข้อมูลผู้ใช้ตาม user_id

  db.get(sql, [userId], (err, row) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลจากฐานข้อมูล:', err.message);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
    }
    if (row) {
      res.json(row); // ส่งข้อมูลผู้ใช้ที่ตรงกับ user_id เป็น JSON
    } else {
      res.status(404).json({ error: 'ไม่พบผู้ใช้ที่มี user_id นี้' });
    }
  });
});
;
app.put('/editUser/:user_id', (req, res) => {
  const userId = req.params.user_id; // รับค่า user_id จาก URL parameter
  const { username, email, phone, password, img, types, money } = req.body; // รับข้อมูลที่ต้องการอัพเดตจาก request body

  // ตรวจสอบและล็อกค่า userId และข้อมูลอื่นๆ
  console.log('Received user_id:', userId);
  console.log('Received data:', { username, email, phone, password, img, types, money });

  // ตรวจสอบค่าที่รับมาว่ามีข้อมูลที่ต้องการอัพเดตหรือไม่
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // ตรวจสอบค่าของ img
  const getUserQuery = 'SELECT img FROM users WHERE user_id = ?';
  db.get(getUserQuery, [userId], (err, row) => {
    if (err) {
      console.error('Error fetching user data:', err);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }

    const currentImg = row?.img || ''; // ใช้ค่าปัจจุบันถ้ามี

    const updateQuery = `
      UPDATE users
      SET username = ?, email = ?, phone = ?, password = ?, img = ?, types = ?, money = ?
      WHERE user_id = ?
    `;
    
    const updateValues = [username, email, phone, password, img || currentImg, types, money, userId];

    db.run(updateQuery, updateValues, function (err) {
      if (err) {
        console.error('Error updating user:', err);
        return res.status(500).json({ error: 'Failed to update user' });
      }

      res.json({ message: 'User updated successfully', result: this.changes });
    });
  });
});







// Helper function to handle API responses
function handleResponse(res, err, data) {
  if (err) {
    res.status(500).json({ error: err.message });
    return;
  }
  res.json(data);
}

function handleResponse(
  res,
  err,
  data,
  notFoundStatusCode = 404,
  notFoundMessage = "Not found",
  changes = null
) {
  if (err) {
    res.status(500).json({ error: err.message });
    return;
  }
  if (!data && !changes) {
    res.status(notFoundStatusCode).json({ error: notFoundMessage });
    return;
  }
  res.json(data);
}

var os = require("os");
const internal = require("stream");
var ip = "0.0.0.0";
var ips = os.networkInterfaces();
Object.keys(ips).forEach(function (_interface) {
  ips[_interface].forEach(function (_dev) {
    if (_dev.family === "IPv4" && !_dev.internal) ip = _dev.address;
  });
});

app.listen(port, () => {
  console.log(`Lotto API listening at http://${ip}:${port}`);
});

