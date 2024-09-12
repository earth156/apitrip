const { error } = require("console");
const express = require("express");
const req = require("express/lib/request");
const { request } = require("http");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 3000;


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
  db.all("SELECT * FROM lotto_nunber", [], (err, rows) => {
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

  // Query to check if the user exists and the password matches
  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";

  db.get(sql, [username, password], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (row) {
      // User exists and password matches
      res.json({
        message: "Login successful"
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

  const sql = "INSERT INTO users (username, password, email, phone, img, types) VALUES (?, ?, ?, ?, ?, ?)";

  db.run(sql, [username, password, email, phone, img, 'customer'], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // คืนค่า response พร้อมกับ ID ที่เพิ่งถูกเพิ่ม
    res.json({ message: "User registered successfully", id: this.lastID });
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

