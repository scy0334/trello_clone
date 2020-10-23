INSERT INTO
  boards(name)
VALUES
  ("board1"),
  ("board2"),
  ("board3"),
  ("board4");

INSERT INTO
  lists(name, board_id)
VALUES
  ("Watch and Learn", 18),
  ("MOOC", 19),
  ("Curriculum", 20),
  ("Personal", 18);

INSERT INTO
  todos(content, list_id)
VALUES
  ('Finish Node with React', 5),
  ('Finish Toy 20', 6),
  ('Refactor Portfolio', 7),
  ('Finish Blog2', 8);

`SELECT
  GROUP_CONCAT('[',json,']') data
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
            todos.content
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