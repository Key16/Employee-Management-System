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

//asks the main menu of questionns
const questions = () => {

    return inquirer.prompt([

        {
            type: "list",
            name: "choice",
            choices: ["View All Employees", "View All Departments", "View All Roles", "Add a Department", "Add a Role", "Add an Employee", "Update an Employee Role", "Quit"],
            message: "How can I help you today?",
        },

    ])
        //diverts to differennt paths depending on choice
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
                console.log("Add Employee Chosen")
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

//view all employees function

const viewAllEmployees = () => {
    //sql query that uses a join table to reference the 3 tables at once
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
            console.table(result);
            questions();
        };

    });

}

//view all department funnction
const viewAllDepartments = () => {

    db.query(`SELECT * from department`, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.table(result);
            questions();
        };

    });

}

//view all role function
const viewAllRoles = () => {
    //sql query to join departmenn and role id, also ordered by id
    db.query(`SELECT 
    r.id,
    r.title AS Title,
    department.name AS Department,
    r.salary AS Salary
     FROM role r
     JOIN department ON r.department_id = department.id
     ORDER BY r.id`, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.table(result);
            questions();
        };

    });

}

//add department set of questions
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
            //promise to returnn the functionn below
            addDepartment(answer);
        })
};

//add department function from the questionsn asked above
const addDepartment = (answer) => {

    db.query(`INSERT INTO department (name)
    VALUES (?)`, answer.department, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log(`Added ${answer.department} to the database. View all Departments to see a list of all departments`)
            questions();
        };
    });
}

//add role set of questions
const addRoleQ = () => {

    //array to hold the list of departmennts
    let departmentList = []

    //to make an array as the tabble comes through as an object so that inquirer can read all the options

    db.query(`SELECT name from department`, function (err, result) {
        if (err) {
            console.log(err);
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

//add role function
const addRole = (answer) => {

    let depID = ""
    // to returnn the id of the department based on nthe title shown in the question above
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
                console.log(`Added ${answer.title} to the database. View all Roles to see a list of all roles`)
                questions();
            };
        });
    }
}

//add employee questionsn
const addEmployeeQ = () => {

    let roleList = []
    let employeeList = []

    //to create the array used in the questionns for inquirer

    db.query(`SELECT title FROM role`, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            for (let y = 0; y < result.length; y++) {
                const array = result[y].title;
                roleList.push(array)
            }
        };
    });

    db.query(`SELECT first_name, last_name FROM employee`, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            for (let y = 0; y < result.length; y++) {
                const array = result[y].first_name + " " + result[y].last_name;
                employeeList.push(array)
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
            choices: employeeList,
            message: "Who is their manager?",
        },
    ])
        .then((answer) => {
            console.log("finish employee questions")
            addEmployee(answer);
        })
};


const addEmployee = (answer) => {

    let roleID = ""
    let managerID = ""

    const findRoleID = () => {
        db.query(`SELECT * from role WHERE title = "${answer.title}"`, function (err, result) {

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



        db.query(`SELECT * from employee WHERE first_name = "${mName[0]}" AND last_name = "${mName[1]}"`, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                managerID = result[0].id;

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


//function to update employees and ask inquirer questions
const updateEmployeeQ = () => {
    //empty array to create the list of employees and roles from the db query
    let roleList = []
    let empList = []

    const getEmpList = () => {
        db.query(`SELECT * FROM employee`, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                for (let y = 0; y < result.length; y++) {
                    const array = result[y].first_name + " " + result[y].last_name;
                    empList.push(array)
                } getRoleList();
            };
        });
    }
    getEmpList();

    const getRoleList = () => {
        db.query(`SELECT title FROM role`, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                for (let y = 0; y < result.length; y++) {
                    const array = result[y].title;
                    roleList.push(array)
                }
            }; inquireQ();
        });
    }

    const inquireQ = () => {
        return inquirer.prompt([

            {
                type: "list",
                name: "employee",
                choices: empList,
                message: "Who's role are you looking to update?",
            },
            {
                type: "list",
                name: "role",
                choices: roleList,
                message: "Which role are you looking to assign them to?",
            },
        ])
            //the .then function that passes all the inquirer answers to the update employee function
            .then((answer) => {
                updateEmployee(answer);
            })
    }

};

//the update employee function
const updateEmployee = (answer) => {

    //need to find the role ID of the employee 
    let roleID = ""


    const findRoleID = () => {
        db.query(`SELECT * from role WHERE title = "${answer.role}"`, function (err, result) {

            if (err) {
                console.log(err);
            } else {
                roleID = result[0].id;
                findManagerID();
            }

        });
    }

    findRoleID();
    //find the employee id from the first and last name of the employee
    const findManagerID = () => {

        let eName = answer.employee.split(' ')

        db.query(`SELECT * from employee WHERE first_name ="${eName[0]}" AND last_name ="${eName[1]}"`, function (err, result) {

            if (err) {
                console.log(err);
            } else {
                managerID = result[0].id;
                insertUpdatedEmployee(answer, eName);
            }

        });
    }


    const insertUpdatedEmployee = (answer, eName) => {
        db.query(`UPDATE employee
        SET role_id= ${roleID}
        WHERE first_name ="${eName[0]}" AND last_name ="${eName[1]}"`, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(`Updated ${answer.employee} in the database. View all Employees to see a list of all Employees`)
                questions();
            };
        });
    }
}



module.exports = questions