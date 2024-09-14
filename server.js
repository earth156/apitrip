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

app.get("/showlottoInCart/:user_id", (req, res) => {
  const userId = req.params.user_id;

  if (!userId) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  const query = `
    SELECT lotto_num, price, lotto_id
    FROM lotto_nunber
    WHERE user_id = ? AND (sold IS NULL OR sold = " ")
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('Error retrieving lotto numbers:', err);
      return res.status(500).json({ error: 'Failed to retrieve lotto numbers' });
    }

    console.log('Lotto numbers retrieved:', rows);  // เพิ่มบรรทัดนี้เพื่อดูข้อมูลที่ได้รับ
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No lotto numbers found for this user' });
    }

    res.json({ lottoNumbers: rows });
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

// API Endpoint สำหรับการเพิ่มหมายเลขลอตเตอรี่ไปยังตะกร้า
app.post('/lottoToCart/:user_id', (req, res) => {
  const user_id = req.params.user_id; // รับค่า user_id จากพารามิเตอร์ใน URL
  const { lotto_id } = req.body; // รับค่า lotto_id จาก body

  if (!user_id || !lotto_id) {
    return res.status(400).json({ error: 'user_id and lotto_id are required' });
  }

  const checkLottoQuery = 'SELECT * FROM lotto_nunber WHERE lotto_id = ?';
  db.get(checkLottoQuery, [lotto_id], (err, row) => {
    if (err) {
      console.error('Error checking lotto number:', err);
      return res.status(500).json({ error: 'Failed to check lotto number' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Lotto number not found' });
    }

    const updateQuery = `
      UPDATE lotto_nunber
      SET user_id = ?
      WHERE lotto_id = ?
    `;

    db.run(updateQuery, [user_id, lotto_id], function (err) {
      if (err) {
        console.error('Error updating lotto number:', err);
        return res.status(500).json({ error: 'Failed to update lotto number' });
      }

      res.json({ message: 'Lotto number updated successfully', result: this.changes });
    });
  });
});

app.post('/soldLotto/:user_id', (req, res) => {
  const user_id = req.params.user_id;
  const { lotto_id } = req.body;

  if (!user_id || !lotto_id) {
    return res.status(400).json({ error: 'Missing user_id or lotto_id' });
  }

  const query = 'UPDATE lotto_nunber SET sold = "ขายแล้ว" WHERE user_id = ? AND lotto_id = ?';

  db.run(query, [user_id, lotto_id], function (err) {
    if (err) {
      console.error('Error updating lotto status:', err);
      return res.status(500).json({ error: 'Failed to update lotto status' });
    }

    if (this.changes > 0) {
      res.status(200).json({ message: 'Successfully updated lotto status' });
    } else {
      res.status(404).json({ error: 'Lotto not found or not updated' });
    }
  });
});

// app.post('/insertLotto', (req, res) => {
//   const lottoNumbers = req.body.lottoNumbers;

//   // ตรวจสอบว่า `lottoNumbers` มีอยู่และเป็น Array
//   if (!Array.isArray(lottoNumbers)) {
//     return res.status(400).json({ error: 'lottoNumbers is required' });
//   }

//   // ตรวจสอบข้อมูลแต่ละรายการใน `lottoNumbers`
//   if (lottoNumbers.some(item => !item.lottoNum)) {
//     return res.status(400).json({ error: 'Invalid lotto number format' });
//   }

//   // เตรียมคำสั่ง SQL โดยใส่เฉพาะ `lotto_num`
//   const query = `
//     INSERT INTO lotto_nunber (lotto_num, sold, user_id, winning_num, prize_money, price) 
//     VALUES ?`;

//   // แปลง `lottoNumbers` เป็นรูปแบบที่พร้อมสำหรับการแทรกในฐานข้อมูล
//   const values = lottoNumbers.map(item => [
//     item.lottoNum, // ใส่ค่า lotto_num
//     null,         // ค่า `sold` เป็น NULL
//     null,         // ค่า `user_id` เป็น NULL
//     null,         // ค่า `winning_num` เป็น NULL
//     null,         // ค่า `prize_money` เป็น NULL
//     null          // ค่า `price` เป็น NULL
//   ]);

//   // แทรกข้อมูลลงในฐานข้อมูล
//   connection.query(query, [values], (err, results) => {
//     if (err) {
//       console.error('Error inserting data:', err.stack);
//       return res.status(500).json({ message: 'Database error' });
//     }

//     res.status(200).json({ message: 'Lotto numbers inserted successfully' });
//   });
// });




app.post("/insertlottos", (req, res) => {
  const generateRandomNumber = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a random 6-digit number
  };

  const generateUniqueNumbers = (count) => {
    const numbers = new Set();
    while (numbers.size < count) {
      numbers.add(generateRandomNumber()); // Add unique numbers to the Set
    }
    return Array.from(numbers); // Convert Set to Array
  };

  const lottoNumbers = generateUniqueNumbers(100); // Generate 100 unique numbers

  const sql = "INSERT INTO lotto_nunber (lotto_num, price) VALUES (?, ?)"; // Modified to include price

  // To handle asynchronous database operations
  const insertAllLottoNumbers = (numbers, callback) => {
    let completed = 0;
    let errors = [];
    
    numbers.forEach((lotto_num) => {
      const price = 100; // Set price to 100 for each lotto_num
      
      db.run(sql, [lotto_num, price], function (err) { // Insert both lotto_num and price
        completed++;
        if (err) {
          errors.push({ lotto_num, error: err.message });
        }
        
        // Check if all numbers have been processed
        if (completed === numbers.length) {
          if (errors.length > 0) {
            callback({ message: "Some numbers failed to insert", errors });
          } else {
            callback(null, { message: "Lotto numbers inserted successfully" });
          }
        }
      });
    });
  };

  // Call the insert function and send the response
  insertAllLottoNumbers(lottoNumbers, (error, result) => {
    if (error) {
      return res.status(500).json(error);
    } else {
      return res.status(200).json(result);
    }
  });
});



// ลบข้อมูลทั้งหมดใน  lotto_nunber  http://192.168.1.3:3000/deletealllotto
app.get("/deletealllotto", (req, res) => {
  const sql = "DELETE FROM lotto_nunber";

  db.run(sql, [], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Return a success message
    res.json({ message: "All lotto numbers deleted successfully" });
  });
});

app.post('/winningLotto', (req, res) => {
  const prizeMoney = req.body.prizeMoney; // ปรับเปลี่ยนชื่อให้ตรงกับข้อมูลที่ส่ง

  const selectQuery = `
    SELECT lotto_id, lotto_num FROM lotto_nun
    ORDER BY RANDOM() LIMIT 5
  `;

  db.all(selectQuery, (selectErr, selectedLottos) => {
    if (selectErr) {
      return res.status(500).json({ error: selectErr.message });
    }

    const updates = selectedLottos.map(lotto => {
      return new Promise((resolve, reject) => {
        const updateQuery = `
          UPDATE lotto_nun
          SET winning_num = ?, prize_money = ?
          WHERE lotto_id = ?
        `;

        db.run(updateQuery, [lotto.lotto_num, prizeMoney, lotto.lotto_id], function(updateErr) {
          if (updateErr) {
            return reject(updateErr);
          }
          resolve({
            lotto_id: lotto.lotto_id,
            winning_num: lotto.lotto_num,
            prize_money: prizeMoney
          });
        });
      });
    });

    Promise.all(updates)
      .then(updatedLottos => {
        res.status(200).json({
          message: 'Lotto numbers updated successfully',
          winningNumbers: updatedLottos
        });
      })
      .catch(updateErr => {
        res.status(500).json({ error: updateErr.message });
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

