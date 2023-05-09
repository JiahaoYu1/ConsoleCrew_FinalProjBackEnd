const { response } = require('express');
const express = require('express');
const { send } = require('express/lib/response');
const router = express.Router();

// Uses /users to make database requests
const routeRoot = '/users';

const logger = require("../logger")

const { DatabaseError } = require("../models/DatabaseError");
const { InvalidInputError } = require("../models/InvalidInputErrors");

const usersModel = require("../models/userModelMongoDb");
let requestJson;

/**
 * Validates creating a new user and adds it to the database. Input is processed with body parameters. Sends a response back to the server
 * on whether it succeeded or failed
 * @param {string} request body of name and description to add to database
 * @param {string} response result on whether we succeeded in adding to database
 */
router.post('/', handleAddUser);
async function handleAddUser(request, response) {
    requestJson = request.body;
    try {
        const added = await usersModel.addUser(requestJson.id, requestJson.name, requestJson.password);
        if(added.acknowledged) {
            logger.info("User ["+requestJson.name+"] with password ["+requestJson.password+"] was added successfully!");
            response.status(200);
            let addedUser = await usersModel.getSingleUserById(requestJson.id);
            response.send(addedUser);
        }
        else if(added == false) {
            logger.error("User controller | Unexpected failure when adding user; should not happen!");
            response.status(400);
            response.send("User controller | Failed to add user for unknown reason!");
        }
    }
    catch(err) {
        logger.error("User controller | Failed to add a user: " + err.message)
        if(err instanceof DatabaseError) {
            response.status(500);
            response.send({errorMessage: "There was a system error: " + err.message});
        }
        else if(err instanceof InvalidInputError) {
            response.status(400);
            response.send({errorMessage: "There was a validation error: " + err.message});
        }
        else {
            response.status(500);
            response.send({errorMessage: "There was an unexpected error: " + err.message});
        }
    }
}

/**
 * Validates reading an existing user in the database with url parameters and sends a response back to the server
 * on whether it succeeded or failed
 * @param {string} request parameter of name of the user to get
 * @param {string} response result on whether or not the user was successfully retrieved
 */
router.get('/:id', handleGetSingleUser);
async function handleGetSingleUser(request, response) {
    try {
        let usersObject = (await usersModel.getSingleUserById(request.params.id));
        if(usersObject != null) {
            logger.info("User controller | User ["+usersObject.id+"] was retrieved successfully!");
            response.status(200);
            response.send(usersObject);
        }
        else {
            logger.error("User controller | Failed to retrieve user ["+request.params.id+"]");
            response.status(400);
            response.send("User controller | Failed to retrieve user ["+request.params.id+"]");
        }
    }
    catch(err) {
        logger.error("User controller | Failed to get a single user: " + err.message)
        if(err instanceof DatabaseError) {
            response.status(500);
            response.send({errorMessage: "There was a system error: " + err.message});
        }
        else if(err instanceof InvalidInputError) {
            response.status(400);
            response.send({errorMessage: "There was a validation error: " + err.message});
        }
        else {
            response.status(500);
            response.send({errorMessage: "There was an unexpected error: " + err.message});
        }
    }
}

/**
 * Validates reading all existing users in the database and sends a response back to the server
 * on whether it succeeded or failed
 * @param {string} request parameter of name of the user to get
 * @param {string} response result on whether or not the user was successfully retrieved
 */
router.get('/', handleGetAllUsers);
async function handleGetAllUsers(request, response) {
    try {
        let usersObject = (await usersModel.getAllUsers());
        if(usersObject != null) {
            logger.info("User controller | Retrieved successfully!");
            response.status(200);
            response.send(usersObject);
        }
        else {
            logger.error("User controller | Failed to retrieve all users");
            response.status(400);
            response.send("User controller | Failed to retrieve all users");
        }
    }
    catch(err) {
        logger.error("User controller | Failed to get all users: " + err.message)
        if(err instanceof DatabaseError) {
            response.status(500);
            response.send({errorMessage: "There was a system error: " + err.message});
        }
        else {
            response.status(500);
            response.send({errorMessage: "There was an unexpected error: " + err.message});
        }
    }
}

/**
 * Validates updating an existing user in the database with body parameters and sends a response back to the server
 * on whether it succeeded or failed
 * @param {string} request body of old name, new name and new description for update
 * @param {string} response result on whether the user was successfully updated
 */
router.put('/', handleUpdateUser);
async function handleUpdateUser(request, response) {
    requestJson = request.body;
    try{
        const result = await usersModel.updateUser(requestJson.id, requestJson.newName, requestJson.newPassword);
        if(result.acknowledged) {
            logger.info("User controller | Attempt to update user [" + requestJson.id + "] to name [" + requestJson.newName + "] was successful!");
            response.status(200);
            let updatedObject = await usersModel.getSingleUserById(requestJson.id);
            response.send(updatedObject);
        }
        else if(result == false) {
            logger.error("User controller | Unexpected failure when updating user; should not happen!");
            response.status(400);
            response.send("User controller | Unexpected failure when updating user; should not happen!");
        }
    }
    catch(err) {
        logger.error("User controller | Failed to update user: " + err.message)
        if(err instanceof DatabaseError) {
            response.status(500);
            response.send({errorMessage: "There was a system error: " + err.message});
        }
        else if(err instanceof InvalidInputError) {
            response.status(400);
            response.send({errorMessage: "There was a validation error: " + err.message});
        }
        else {
            response.status(500);
            response.send({errorMessage: "There was an unexpected error: " + err.message});
        }
    }
}


/**
 * Validates deleting an existing user in the database with url parameters and sends a response back to the server
 * on whether it succeeded or failed
 * @param {string} request parameter name of the user to delete
 * @param {string} response result on whether the user was successfully deleted
 */
 router.delete('/:id', handleDeleteUser);
 async function handleDeleteUser(request, response) {
    try{
        const deletedItem = await usersModel.getSingleUserById(request.params.id);
        const result = await usersModel.deleteUser(request.params.id);
        if(result) {
            logger.info("User controller | Attempt to delete user " + request.params.id + " was successful!");
            response.status(200);
            response.send(deletedItem);
        }
        else {
            logger.info("User controller | Unexpected failure when adding user; should not happen!");
            response.status(400);
            response.send("User controller | Unexpected failure when adding user; should not happen!");
        }
    }
    catch(err) {
        logger.error("User controller | Failed to delete user: " + err.message)
        if(err instanceof DatabaseError) {
            response.status(500);
            response.send({errorMessage: "There was a system error: " + err.message});
        }
        else if(err instanceof InvalidInputError) {
            response.status(400);
            response.send({errorMessage: "There was a validation error: " + err.message});
        }
        else {
            response.status(500);
            response.send({errorMessage: "There was an unexpected error: " + err.message});
        }
    }
}


module.exports = {
    router,
    routeRoot
}