// Ext packages required

const inquirer = require('inquirer');
const viewAllEmployees = require("./Connections");


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
                console.log("View All Employees chosen")
                return viewAllEmployees();
                // return engineerQ();
            } else if (answer.choice === "View All Departments") {
                console.log("View All Departments chosen")
                // return internQ();

            } else if (answer.choice === "View All Roles") {
                console.log("View All Roles Chosen")
                // return internQ();
            } else {
                console.log("Thank you for using EM, see you next time. ")
            }
        })



};



module.exports = questions