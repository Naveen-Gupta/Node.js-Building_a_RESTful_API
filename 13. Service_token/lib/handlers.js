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

        // Get the token from the headers
        let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
        // Verify that the given token is valid for given phone number
        handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
            if (tokenIsValid) {
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
                callback(403, { 'Error': 'Missing required token in header, or token is invalid' });
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

            // Get the token from the headers
            let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
            // Verify that the given token is valid for given phone number
            handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
                if (tokenIsValid) {
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
                }
                else {
                    callback(403, { 'Error': 'Missing required token in header, or token is invalid' });
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
        // Get the token from the headers
        let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
        // Verify that the given token is valid for given phone number
        handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
            if (tokenIsValid) {
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
                callback(403, { 'Error': 'Missing required token in header, or token is invalid' });
            }
        });

    } else {
        callback(400, { 'Error: ': 'Missing required field' });
    }
};

// tokens handler
handlers.tokens = (data, callback) => {
    const ACCEPTED_METHODS = ['post', 'get', 'put', 'delete'];
    if (ACCEPTED_METHODS.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405); //method not allowed
    }
}

// Container for all the tokens methods
handlers._tokens = {}

// Tokens - POST
// Required data: phone, password
// Optional data: none
handlers._tokens.post = function (data, callback) {
    let phone = typeof (data.payload.phone) === "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    let password = typeof (data.payload.password) === "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if (phone && password) {
        // Lookup the user that matches that phone
        _data.read('users', phone, function (err, userData) {
            if (!err && userData) {
                // Hash the sent password and compare it with the specified password in user object
                let hashedPassword = HELPERS.hash(password);
                if (hashedPassword == userData.hashedPassword) {
                    // If valid, create a new token with a random string
                    let tokenId = HELPERS.createRandomString(20);
                    let expires = Date.now() + 1000 * 60 * 60;
                    let tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };

                    // Store the token
                    _data.create('tokens', tokenId, tokenObject, function (err) {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, { 'Error': 'Could not create token' });
                        }
                    });
                } else {
                    callback(400, { 'Error': 'Password did not match the specified user\'s stored password' });
                }
            } else {
                callback(400, { 'Error': 'Could not find the specified user' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fields' });
    }
};

// Tokens - GET
// Required data: id
// Optional data: none
handlers._tokens.get = function (data, callback) {
    // Check for validity of id
    let id = typeof (data.queryStringObject.id) == 'string' ? data.queryStringObject.id.trim() : false;
    if (id) {
        // lookup for the token
        _data.read('tokens', id, function (err, tokenData) {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, { 'Error: ': 'Missing required field' });
    }
};

// Tokens - PUT
// Required data: id, extend
// Optional data: none
handlers._tokens.put = function (data, callback) {
    // Check for validity of id
    let id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    let extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? data.payload.extend : false;
    console.log(id, extend)
    if (id && extend) {
        // Lookup the token
        _data.read('tokens', id, function (err, tokenData) {
            if (!err && tokenData) {
                // Check to make sure the token in't already expired
                if (tokenData.expires > Date.now()) {
                    // Set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    // Store the new updates
                    _data.update('tokens', id, tokenData, function (err) {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, { 'Error': 'Could not update the token\'s expiration' });
                        }
                    });
                }
                else {
                    callback(400, { 'Error': 'The token has already been expired, can not be extended' });
                }
            } else {
                callback(400, { 'Error': 'Specified token does not exist' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field(s) or field(s) are invalid' });
    }
};

// Tokens - DELETE
// Required data: id
// Optional data: none
handlers._tokens.delete = function (data, callback) {

    // check the validation of id
    let id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        _data.read('tokens', id, function (err, tokenData) {
            if (!err && tokenData) {
                _data.delete('tokens', id, function (err) {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, { 'Error': 'Could not delete the specified token' });
                    }
                });
            } else {
                callback(400, { 'Error': 'Could not find the specified token' });
            }
        });
    } else {
        callback(400, { 'Error: ': 'Missing required field' });
    }
};

// Verify if the given token id is currently valid for a given user
handlers._tokens.verifyToken = function (id, phone, callback) {
    // Lookup the token
    _data.read('tokens', id, function (err, tokenData) {
        if (!err && tokenData) {
            // Check that the token is for the given user && has not expired
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

// ping handler
handlers.ping = (data, callback) => {
    callback(200);
};

// Not Found Handler 
handlers.notFound = (data, callback) => {
    callback(404);
};

// exporting the handlers
module.exports = handlers;