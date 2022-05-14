const express = require('express');
// Import and require mysql2
const mysql = require('mysql2');
const cTable = require('console.table');
const questions = require('./questions');
const inquirer = require('inquirer');


const PORT = process.env.PORT || 3001;
const app = express();


// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // TODO: Add MySQL password here
        password: 'PASSWORD',
        database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
);



const viewAllEmployees = () => {

    db.query(`SELECT
    e.first_name, 
    e.last_name, 
    role.title,
    department.name AS Department,
    role.salary,
    CONCAT(m.first_name, " ", m.last_name) Manager
    FROM employee e
    INNER JOIN role ON e.role_id=role.id
    INNER JOIN department ON role.department_id = department.id
    LEFT JOIN employee m ON m.id = e.manager_id
    ORDER BY e.id`, function (err, result) {
        if (err) {
            console.log("err");
        } else {
            console.table(result);
        };
    });
    questions();
}
// Create a movie
app.post('/api/new-movie', ({ body }, res) => {
    const sql = `INSERT INTO movies (movie_name)
      VALUES (?)`;
    const params = [body.movie_name];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: body
        });
    });
});

// Read all movies
app.get('/api/movies', (req, res) => {
    const sql = `SELECT id, movie_name AS title FROM movies`;

    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

// Delete a movie
app.delete('/api/movie/:id', (req, res) => {
    const sql = `DELETE FROM movies WHERE id = ?`;
    const params = [req.params.id];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.statusMessage(400).json({ error: res.message });
        } else if (!result.affectedRows) {
            res.json({
                message: 'Movie not found'
            });
        } else {
            res.json({
                message: 'deleted',
                changes: result.affectedRows,
                id: req.params.id
            });
        }
    });
});

// Read list of all reviews and associated movie name using LEFT JOIN
app.get('/api/movie-reviews', (req, res) => {
    const sql = `SELECT movies.movie_name AS movie, reviews.review FROM reviews LEFT JOIN movies ON reviews.movie_id = movies.id ORDER BY movies.movie_name;`;
    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

// BONUS: Update review name
app.put('/api/review/:id', (req, res) => {
    const sql = `UPDATE reviews SET review = ? WHERE id = ?`;
    const params = [req.body.review, req.params.id];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message });
        } else if (!result.affectedRows) {
            res.json({
                message: 'Movie not found'
            });
        } else {
            res.json({
                message: 'success',
                data: req.body,
                changes: result.affectedRows
            });
        }
    });
});

// Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


module.exports = viewAllEmployees