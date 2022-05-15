// Ext packages required

const inquirer = require('inquirer');
const cTable = require('console.table');
const express = require('express');
// Import and require mysql2
const mysql = require('mysql2');

// const PORT = process.env.PORT || 3001;
const app = express();


// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


const questions = () => {

    return inquirer.prompt([

        {
            type: "list",
            name: "choice",
            choices: ["View All Employees", "View All Departments", "View All Roles", "Add a Department", "Add a Role", "Add an Employee", "Update an Employee Role", "Quit"],
            message: "How can I help you today?",
        },

    ])
        .then((answer) => {
            if (answer.choice === ("View All Employees")) {
                console.log("Here are a list of all your Employees")
                return viewAllEmployees();
            } else if (answer.choice === "View All Departments") {
                console.log("Presenting a view of all departments")
                return viewAllDepartments();
            } else if (answer.choice === "View All Roles") {
                console.log("Here are a list of all roles")
                return viewAllRoles();
            } else if (answer.choice === "Add a Department") {
                console.log("Add Department Chosen")
                return addDepartmentQ();
            } else if (answer.choice === "Add a Role") {
                console.log("Add Role Chosen")
                return addRoleQ();
            } else if (answer.choice === "Add an Employee") {
                console.log("Add Role Chosen")
                return addEmployeeQ();
            } else if (answer.choice === "Update an Employee Role") {
                console.log("Add Role Chosen")
                return updateEmployeeQ();
            } else {
                console.log("Thank you for using EM, see you next time. ")
            }
        })



};



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
    console.log(`Connected to the employee database.`)
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
            console.log(err);
        } else {
            console.log('\n')
            console.table(result);
            questions();
        };

    });

}


const viewAllDepartments = () => {

    db.query(`SELECT * from department`, function (err, result) {
        if (err) {
            console.log("err");
        } else {
            console.log('\n')
            console.table(result);
            questions();
        };

    });

}


const viewAllRoles = () => {


    db.query(`SELECT 
    r.id,
    r.title AS Title,
    department.name AS Department,
    r.salary AS Salary
     FROM role r
     JOIN department ON r.department_id = department.id
     ORDER BY r.id`, function (err, result) {
        if (err) {
            console.log("err");
        } else {
            console.log('\n')
            console.table(result);
            questions();
        };

    });

}

const addDepartmentQ = () => {

    return inquirer.prompt([

        {
            type: 'input',
            name: 'department',
            message: 'What is the name of the new department?',
            validate(answer) {
                if (!answer) {
                    return "Department name can not be empty!"
                }
                return true
            }
        },
    ])
        .then((answer) => {
            addDepartment(answer);
        })
};

const addDepartment = (answer) => {

    db.query(`INSERT INTO department (name)
    VALUES ("?")`, answer.department, function (err, result) {
        if (err) {
            console.log("error");
        } else {
            console.log(`Added ${answer.department} to the database. View all Departments to see a list of all departments`)
            questions();
        };
    });
}

let departmentList = []

const addRoleQ = () => {

    db.query(`SELECT name from department`, function (err, result) {
        if (err) {
            console.log("error");
        } else {
            for (let y = 0; y < result.length; y++) {
                const array = result[y].name;
                departmentList.push(array)
            }
        };
    });

    return inquirer.prompt([

        {
            type: 'input',
            name: 'title',
            message: 'What is the title of the new role?',
            validate(answer) {
                if (!answer) {
                    return "role title can not be empty!"
                }
                return true
            }
        },
        {
            type: 'input',
            name: 'salary',
            message: 'What is the salary?',
            validate(answer) {
                var letterRegex = /^[0-9]*$/
                if (!answer) {
                    return "Salary can't be empty!"
                }
                if (!letterRegex.test(answer)) {
                    return "Please fill in using numbers only"
                };
                return true
            }
        },
        {
            type: "list",
            name: "departmentName",
            choices: departmentList,
            message: "Which department is this under?",
        },
    ])
        .then((answer) => {
            addRole(answer);
        })
};


const addRole = (answer) => {

    let depID = ""

    const findDepID = () => {
        db.query(`SELECT * from department WHERE name = ?`, answer.departmentName, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                depID = result[0].id;
                insertRole(answer);
            }

        });
    }

    findDepID();

    const insertRole = (answer) => {
        db.query(`INSERT INTO role (title, salary, department_id)
    VALUES ("${answer.title}", ${answer.salary}, ${depID})`, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(`Added ${answer.title} to the database. View all Roles to see a list of all departments`)
                questions();
            };
        });
    }
}


let roleList = []
let managerList = []

const addEmployeeQ = () => {

    db.query(`SELECT title FROM role`, function (err, result) {
        if (err) {
            console.log("error");
        } else {
            for (let y = 0; y < result.length; y++) {
                const array = result[y].title;
                roleList.push(array)
            }
        };
    });

    db.query(`SELECT first_name, last_name FROM employee`, function (err, result) {
        if (err) {
            console.log("error");
        } else {
            for (let y = 0; y < result.length; y++) {
                const array = result[y].first_name + " " + result[y].last_name;
                managerList.push(array)
            }
        };
    });

    return inquirer.prompt([

        {
            type: 'input',
            name: 'firstName',
            message: 'What is the first name of the employee?',
            validate(answer) {
                if (!answer) {
                    return "Name can not be empty!"
                }
                return true
            }
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'What is the last name of the employee?',
            validate(answer) {
                if (!answer) {
                    return "Name can not be empty!"
                }
                return true
            }
        },

        {
            type: "list",
            name: "title",
            choices: roleList,
            message: "Which role is this under?",
        },
        {
            type: "list",
            name: "managerName",
            choices: managerList,
            message: "Who is their manager?",
        },
    ])
        .then((answer) => {
            console.log("finish employee questions")
            console.log("Role title is " + answer.title)
            addEmployee(answer);
        })
};


const addEmployee = (answer) => {

    let roleID = ""
    let managerID = ""

    const findRoleID = () => {
        db.query(`SELECT * from role WHERE title = "${answer.title}"`, function (err, result) {
            console.log(result)
            if (err) {
                console.log(err);
            } else {
                roleID = result[0].id;
                findManagerID();
            }

        });
    }

    findRoleID();

    const findManagerID = () => {

        let mName = answer.managerName.split(' ')
        console.log(mName)


        db.query(`SELECT * from employee WHERE first_name = "${mName[0]}" AND last_name = "${mName[1]}"`, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                managerID = result[0].id;
                console.log("the manager ID is" + managerID)
                insertEmployee(answer);
            }

        });
    }


    const insertEmployee = (answer) => {
        db.query(`
        INSERT INTO employee(first_name, last_name, role_id, manager_id)
        VALUES("${answer.firstName}", "${answer.lastName}", ${roleID}, ${managerID})`, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(`Added ${answer.firstName} ${answer.lastName} to the database. View all Employees to see a list of all Employees`)
                questions();
            };
        });
    }
}







module.exports = questions