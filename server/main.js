const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");

const jsonParser = bodyParser();
const app = express();

const PORT = 3000;

//Database Configuration
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "test1234",
  database: "trello_db",
});

connection.connect();

// Middleware
app.use(cors());
app.use(jsonParser);

// Routing API
app.get("/", (req, res) => {
  res.send("hellllooo!");
});

// Board APIs
app.get("/board", (req, res) => {
  const queryGetBoard = "SELECT id, name FROM boards";
  connection.query(queryGetBoard, (error, results, fields) => {
    res.send(results);
  });
});

app.post("/board", (req, res) => {
  const { name } = req.body;
  const queryPostBoard = `INSERT INTO boards(name) VALUES ('${name}')`;
  connection.query(queryPostBoard, (error, results, fields) => {
    if (error) throw error;
    res.send({ name, id: results.insertId });
  });
});

app.delete("/board/:id", (req, res) => {
  const { id } = req.params;
  const queryDeleteBoard = `DELETE FROM boards WHERE id=${id}`;
  connection.query(queryDeleteBoard, (error, results, fields) => {
    if (error) throw error;
    res.status(202).end();
  });
});

app.post("/board/:board_id/list", (req, res) => {
  const { name } = req.body;
  const { board_id } = req.params;

  if (!board_id || !name) {
    res.status(404).end();
  }

  const queryPostList = `INSERT INTO lists(name, board_id) VALUES ('${name}', ${board_id})`;
  connection.query(queryPostList, (error, results, fields) => {
    if (error) throw error;
    res.send({ name, id: results.insertId });
  });
});

app.get("/board/:board_id/lists", (req, res) => {
  const { board_id } = req.params;
  const queryGetList = `SELECT
  CONCAT('[', GROUP_CONCAT(json), ']') data
FROM
  (
    SELECT
      JSON_OBJECT(
        'list_id',
        lists.id,
        'name',
        lists.name,
        'todos',
		 IF(COUNT(todos.id) = 0, JSON_ARRAY(), JSON_ARRAYAGG(
          JSON_OBJECT(
            'id',
            todos.id,
            'content',
            todos.content,
            'isComplete',
            todos.is_complete
          )
        ))
      ) json
    FROM
      lists
      LEFT JOIN todos ON lists.id = todos.list_id
    WHERE
      lists.board_id = ${board_id}
    GROUP BY
      lists.id
  ) der;`;

  connection.query(queryGetList, (error, results, fields) => {
    if (error) throw error;
    res.send(results);
  });
});

app.delete("/board/list/:id", (req, res) => {
  const { id } = req.params;
  const queryDeleteList = `DELETE FROM lists WHERE id = ${id}`;

  connection.query(queryDeleteList, (error, results) => {
    if (error) throw error;
    res.status(202).end();
  });
});

app.post("/board/list/:list_id/todos", (req, res) => {
  const { list_id } = req.params;
  const { content } = req.body;
  const queryPostTodo = "INSERT INTO todos(content, list_id) VALUES (?)";

  connection.query(queryPostTodo, [[content, list_id]], (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

app.delete("/board/list/todos/:todo_id", (req, res) => {
  const { todo_id } = req.params;

  const queryDeleteTodo = `DELETE FROM todos WHERE id=${todo_id}`;

  connection.query(queryDeleteTodo, (error, results) => {
    if (error) throw error;
    res.status(202).end();
  });
});

app.put("/board/list/todo", (req, res) => {
  const { todo_id, list_id } = req.body;

  const queryUpdateTodo = `UPDATE todos SET list_id = ${list_id} WHERE todos.id = ${todo_id}`;

  connection.query(queryUpdateTodo, (err, results) => {
    if (err) throw err;
    res.status(204).end();
  });
});

app.listen(PORT, () => {
  console.log(`Listening to PORT ${PORT} ✅`);
});

// user: root
// DB name: mysql
