const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const mysql = require('mysql');

const app = express();
app.use(bodyParser.json());

// Create MySQL connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'L2HYTo237!',
  database: 'job',
});



// Login API
// Login API
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Create a database connection
  const connection = pool

  // Query the database for the username and password
  const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
  connection.query(query, [username, password], (err, results) => {
    connection.end(); // Close the database connection

    if (err) {
      return res.status(500).json({ error: 'An error occurred during login' });
    }

    // Check if the username and password match
    if (results.length === 1) {
      // Generate a JWT token
      const token = jwt.sign({ username }, 'secret_key', { expiresIn: '1h' });

      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Middleware to check JWT authorization
function authenticateToken(req, res, next) {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, 'secret_key', (err, decoded) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.username = decoded.username;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

app.get('/jobs', authenticateToken, (req, res) => {
  const { description, location, full_time, page } = req.query;
  const url = `http://dev3.dansmultipro.co.id/api/recruitment/positions.json`;
console.log("v2");
  axios.get(url, {
    params: {
      description,
      location,
      full_time,
      page,
    },
  })
    .then(response => {
      res.json(response.data);
    })
    .catch(error => {
      res.status(500).json({ error: 'An error occurred while fetching jobs' });
    });
});

app.get('/jobs/:id', authenticateToken, (req, res) => {
  console.log("v3");
  const url = `http://dev3.dansmultipro.co.id/api/recruitment/positions/${req.params.id}`;
console.log(url);
  axios.get(url)
    .then(response => {
      res.json(response.data);
    })
    .catch(error => {
      res.status(500).json({ error: 'An error occurred while fetching job detail' });
    });
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});

