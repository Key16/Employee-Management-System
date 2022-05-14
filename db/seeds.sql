INSERT INTO department (name)
VALUES ("Sales"),
       ("Legal"),
       ("Finance"),
       ("Engineering"),

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", 150000, 1),
       ("Salesperson", 120000, 1),
       ("Lead Engineer", 190000, 4),
       ("Software Engineer", 160000, 4),
       ("Account Manager", 150000, 3),
       ("Accountant", 120000, 3),
       ("Legal Team Lead", 250000, 2),
       ("Lawyer", 180000, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Doe", 1, NULL ),
       ("Arnold", "Schwarzenegger", 2, 1),
       ("Jim","Carrey", 3, NULL),
       ("Emma","Watson", 4, 3),
       ("Brad", "Pitt", 5, NULL),
       ("Morgan", "Freeman", 6, 5),
       ("Idinia", "Menzel", 7, NULL),
       ("Jackie","Chan", 8, 7);
