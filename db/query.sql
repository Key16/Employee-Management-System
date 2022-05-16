-- View all employees

SELECT
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
ORDER BY e.id;


-- View all roles

SELECT 
r.id,
r.title AS Title,
department.name AS Department,
r.salary AS Salary
 FROM role r
 JOIN department ON r.department_id = department.id;

-- View departments 

SELECT * from department

-- Add into departmnent

INSERT INTO department (name)
VALUES ("Marketing")

-- Add into role

INSERT INTO role (title, salary, department_id)
VALUES ("Test title", 150000, 1),
      
-- Add a enw employee

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Doe", 1, NULL ),

--Update an employee
UPDATE employee
SET role_id=2
WHERE first_name = "John" AND last_name ="Doe"