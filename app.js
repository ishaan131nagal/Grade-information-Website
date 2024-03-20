const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'newuser',
  password: 'Chetan@0161',
  database: 'colleges'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

app.get('/', (req, res) => {
  res.send(`
    <form method="POST" action="/add">
      Name: <input type="text" name="name" /><br />
      Course: <input type="text" name="course" /><br />
      Grade: <input type="text" name="grade" /><br />
      <button type="submit">Add Grade</button>
    </form>
  `);
});

app.post('/add', (req, res) => {
  const { name, course, grade } = req.body;
  const query = 'INSERT INTO students (name, course, grade) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT * FROM students WHERE name = ? AND course = ?)';
  connection.query(query, [name, course, grade, name, course], (err, results) => {
    if (err) throw err;
    if (results.affectedRows === 0) {
      // A record with the same name and course already exists
      res.send('A record with the same name and course already exists');
    } else {
      // Record inserted successfully
      res.redirect('/grades');
    }
  });
});

app.get('/grades', (req, res) => {
  const query = 'SELECT * FROM students';
  connection.query(query, (err, results) => {
    if (err) throw err;
    let html = '<h1>Grades:</h1><ul>';
    results.forEach((student) => {
      html += `
        <li>
          ${student.name} - ${student.course} - ${student.grade}
          <form method="POST" action="/delete">
            <input type="hidden" name="id" value="${student.id}" />
            <button type="submit">Delete</button>
          </form>
        </li>
      `;
    });
    html += '</ul><a href="/">Add another grade</a>';
    res.send(html);
  });
});

app.post('/delete', (req, res) => {
  const { id } = req.body;
  const query = 'DELETE FROM students WHERE name = name and course=course';
  connection.query(query, [id], (err, results) => {
    if (err) throw err;
    res.redirect('/grades');
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
