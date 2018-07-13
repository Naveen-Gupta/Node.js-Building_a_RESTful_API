/**
 * @author Naveen Gupta
 * @description Request handlers
 *  
 */

// Dependencies
const _data = require('./data');
const HELPERS = require('./helpers');

// Define handler object
let handlers = {};

// users handler
handlers.users = (data, callback) => {
    const ACCEPTED_METHODS = ['post', 'get', 'put', 'delete'];
    if (ACCEPTED_METHODS.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405); //method not allowed
    }
}

// Container for users methods
handlers._users = {}

// Users - POST
// Required Fields: firstName, lastName, phone, password, isAdmin
// Optional Fields: none
handlers._users.post = function (data, callback) {
    let firstName = typeof (data.payload.firstName) === "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof (data.payload.lastName) === "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let phone = typeof (data.payload.phone) === "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    let password = typeof (data.payload.password) === "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    let isAdmin = typeof (data.payload.isAdmin) === "boolean" && data.payload.isAdmin === true ? true : false;
    if (firstName && lastName && phone && password && isAdmin) {
        // checking the user before insert
        _data.read('users', phone, function (err, data) {
            if (err) {
                // Hash the password
                let hashedPassword = HELPERS.hash(password);

                if (hashedPassword) {
                    // Creating the user object
                    let userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'isAdmin': isAdmin
                    }

                    // store the user
                    _data.create('users', phone, userObject, function (err) {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, { 'Error': 'Could not create the new user' });
                        }
                    });
                }
                else {
                    callback(500, { 'Error': 'Could not hash the password' });
                }
            } else {
                // User already exists
                callback(400, { 'Error': 'A user exists with same phone number' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fields' });
    }
};


// Users - GET
// Required Field: phone
// Optional Field: none
// @TODO only authenticated user can access, not everyone
handlers._users.get = function (data, callback) {
    // check the validation of phone number
    let phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        _data.read('users', phone, function (err, d) {
            if (!err && d) {
                // removed the hashpassword field before parsing the user data
                delete d.hashedPassword;
                callback(200, d);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, { 'Error: ': 'Missing required field' });
    }
};

// Users - PUT
// Required Field: phone
// Optional Field: firstName, lastName, password (at least one must be specified)
// @TODO only authenticated user can update, not everyone
handlers._users.put = function (data, callback) {
    // Check for the required field
    let phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

    // Check for the optional fields
    let firstName = typeof (data.payload.firstName) === "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof (data.payload.lastName) === "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let password = typeof (data.payload.password) === "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if (phone) {
        // Error if nothing to update
        if (firstName || lastName || password) {
            // Lookup the user
            _data.read('users', phone, function (err, userData) {
                if (!err && userData) {
                    // Update the fields necessary
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.hashedPassword = HELPERS.hash(password);
                    }
                    // Store the new updates
                    _data.update('users', phone, userData, function (err) {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log('Error: ', err);
                            callback(500, { 'Error': 'Could not update the user' });
                        }
                    });
                } else {
                    callback(400, { 'Error': 'The specified user does not exist' });
                }
            });
        } else {
            callback(400, { 'Error': 'Missing fields to update' });
        }
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }
};

// Users - DELETE
// Required Field: phone
// Optional Field: none
// @TODO only authenticated user can delete, not everyone
handlers._users.delete = function (data, callback) {
    // check the validation of phone number
    let phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        _data.read('users', phone, function (err, d) {
            if (!err && d) {
                _data.delete('users', phone, function (err) {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, { 'Error': 'Could not delete the specified user' });
                    }
                });
            } else {
                callback(400, { 'Error': 'Could not find the specified user' });
            }
        });
    } else {
        callback(400, { 'Error: ': 'Missing required field' });
    }
};

// ping handler
handlers.ping = (data, callback) => {
    callback(200);
}

// Not Found Handler 
handlers.notFound = (data, callback) => {
    callback(404);
}

// exporting the handlers
module.exports = handlers;