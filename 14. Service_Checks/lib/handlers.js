/**
 * @author Naveen Gupta
 * @description Request handlers
 *  
 */

// Dependencies
const _data = require('./data');
const HELPERS = require('./helpers');
const CONFIG = require('./config');

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
                _data.read('users', phone, function (err, userData) {
                    if (!err && userData) {
                        _data.delete('users', phone, function (err) {
                            if (!err) {
                                // Deleting the checks associated with user
                                let userChecks = typeof userData.checks === "object" && userData.checks instanceof Array ? userData.checks: [];
                                let checksToDelete = userChecks.length;
                                if(checksToDelete !== 0){
                                    let checkDelete = 0;
                                    let deletionError = false;
                                    // Loop through all the checks for user
                                    userChecks.forEach(function(checkId){
                                        // delete the check
                                        _data.delete('checks', checkId, function(err){
                                            if(err){
                                                deletionError = true;
                                            }
                                            checkDelete++;
                                            if(checkDelete == checksToDelete){
                                                if(!deletionError){
                                                    callback(200);
                                                } else {
                                                    callback(500, {'Error': 'Error occured while attempting to delete the check for the user'});
                                                }
                                            }
                                        });
                                    });
                                } else {
                                    callback(200);
                                }                                       
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


// checks handler
handlers.checks = (data, callback) => {
    const ACCEPTED_METHODS = ['post', 'get', 'put', 'delete'];
    if (ACCEPTED_METHODS.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback);
    } else {
        callback(405); //method not allowed
    }
}

// Container for all the checks methods
handlers._checks = {}

// Checks - POST
// Required data: protocol, url, method, successCodes, timoutSeconds
// Optional data: none
handlers._checks.post = function (data, callback) {
    // Validating inputs
    let protocol = typeof (data.payload.protocol) == 'string' && ['https', 'http'].indexOf(data.payload.protocol)>-1 ? data.payload.protocol : false;
    let url = typeof (data.payload.url) == 'string' && data.payload.url.trim().length >0 ? data.payload.url : false;
    let method = typeof (data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method)>-1 ? data.payload.method : false;
    let successCodes = typeof (data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length>0 ? data.payload.successCodes : false;
    let timoutSeconds = typeof (data.payload.timoutSeconds) == 'number' && data.payload.timoutSeconds % 1 === 0 && data.payload.timoutSeconds >= 0 && data.payload.timoutSeconds <= 5  ? data.payload.timoutSeconds : false;
    
    if(protocol && url && method && successCodes && timoutSeconds){
        // Fetching token from the header
        let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;

        _data.read('tokens', token, function(err, tokenData){
            if(!err && tokenData){
                let userPhone = tokenData.phone;

                // Lookup the phone
                _data.read('users', userPhone, function(err, userData){
                    if(!err && userData){
                        let userChecks = typeof userData.checks === "object" && userData.checks instanceof Array ? userData.checks: [];
                        // User checks to verify, the user has checks less than max-checks-per-user
                        if(userChecks.length < CONFIG.maxChecksLimit){
                            // Create the random id for check
                            let checkId = HELPERS.createRandomString(20);

                            // Create the check object and add user phone into it
                            let checkObject = {
                                'id': checkId,
                                'userPhone': userPhone,
                                'protocol': protocol,
                                'url': url,
                                'method': method,
                                'successCodes': successCodes,
                                'timoutSeconds': timoutSeconds
                            };

                            // Storing checks object
                            _data.create('checks', checkId, checkObject, function(err){
                                if(!err){
                                    // Add the checks to user data
                                    userData.checks = userChecks;
                                    userData.checks.push(checkId);

                                    // Save the new user Data
                                    _data.update('users', userPhone, userData, function(err){
                                        if(!err){
                                            // Return the whole check object
                                            callback(200, checkObject);
                                        } else {
                                            callback(500, {'Error': 'Could not update the user for check'});
                                        }
                                    });
                                } else {
                                    callback(500, {'Error': 'Could not create the new check'});
                                }
                            });

                        } else {
                            callback(400, {'Error': 'User already has maximum number of checks ('+ CONFIG.maxChecksLimit +')'});
                        }
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(403);
            }
        });
    } else {
        callback(400, {'Error': 'Missing required input or inputs are invalid'});
    }
};

// Checks - GET
// Required data: id
// Optional data: none
handlers._checks.get = function (data, callback) {
    // Check the id is valid or not
    let id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;

    if(id){
        // Lookup the check
        _data.read('checks', id, function(err, checkData){
            if(!err && checkData){
                // Get the token from headers
                let token = typeof(data.headers.token) === 'string' && data.headers.token.trim().length === 20 ? data.headers.token : false;
                console.log(checkData, token)
                // Verifying the provided token and belongs to user who created it
                handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid){
                    if(tokenIsValid){
                        // Returning the success code and check data
                        callback(200, checkData);
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};

// Checks - PUT
// Required data: protocol, url, method, successCodes, timoutSeconds (atleast one must be sent)
// Optional data: none
handlers._checks.put = function (data, callback) {
    // Check for the required field
    let id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

     // Validating inputs
    let protocol = typeof (data.payload.protocol) == 'string' && ['https', 'http'].indexOf(data.payload.protocol)>-1 ? data.payload.protocol : false;
    let url = typeof (data.payload.url) == 'string' && data.payload.url.trim().length >0 ? data.payload.url : false;
    let method = typeof (data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method)>-1 ? data.payload.method : false;
    let successCodes = typeof (data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length>0 ? data.payload.successCodes : false;
    let timoutSeconds = typeof (data.payload.timoutSeconds) == 'number' && data.payload.timoutSeconds % 1 === 0 && data.payload.timoutSeconds >= 0 && data.payload.timoutSeconds <= 5  ? data.payload.timoutSeconds : false;
    
    // Check to make sure id is valid
     if (id) {
        // Error if nothing to update
        if (protocol || url || method || successCodes || timoutSeconds) {
            // Lookup the check
            _data.read('checks', id, function(err, checkData){
                if(!err && checkData){
                     // Get the token from the headers
                    let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
                    console.log(token, checkData.userPhone)
                    // Verify that the given token is valid for given phone number
                    handlers._tokens.verifyToken(token, checkData.userPhone, function (tokenIsValid) {
                        // Checking if token is valid
                        if (tokenIsValid) {
                            // Update the fields where necessary
                            if(protocol){
                                checkData.protocol = protocol;
                            }
                            if(url){
                                checkData.url = url;
                            }
                            if(method){
                                checkData.method = method;
                            }
                            if(successCodes){
                                checkData.successCodes = successCodes;
                            }
                            if(timoutSeconds){
                                checkData.timoutSeconds = timoutSeconds;
                            }
                            // Updating the fields
                            _data.update('checks', id, checkData, function(err){
                                if(!err){
                                    callback(200);
                                } else {
                                    callback(500, 'Could not update the check');
                                }
                            });
                        } else {
                            callback(403);
                        }
                    });
                } else {
                    callback(400, {'Error': 'Check id did not match'});
                }
            });
        } else {
            callback(400, { 'Error': 'Missing fields to update' });
        }
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }  

};

// Checks - POST
// Required data: id
// Optional data: none
handlers._checks.delete = function (data, callback) {
    // check the validation of id
    let id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (id) {

        //Lookup the check
        _data.read('checks', id, function(err, checkData){
            if(!err && checkData){
                // Get the token from the headers
                let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
                // Verify that the given token is valid for given phone number
                handlers._tokens.verifyToken(token, checkData.userPhone, function (tokenIsValid) {
                    // Check if the token is valid
                    if (tokenIsValid) {
                        // Deleting the check
                        _data.delete('checks', id, function (err) {
                            if (!err) {
                                // Lookup the user
                                _data.read('users', checkData.userPhone, function(err, userData){
                                    if(!err && userData){
                                        let userChecks = typeof userData.checks === "object" && userData.checks instanceof Array ? userData.checks: [];
                                        if(userChecks.indexOf(id)>-1){
                                            let filteredUserCheck = userChecks.filter( uc => uc !== id);
                                            userData.checks = filteredUserCheck;
                                            _data.update('users', checkData.userPhone, userData, function(err){
                                                if(!err){
                                                    callback(200);
                                                } else {
                                                    callback(500, {'Error': 'Could not update the user'});
                                                }
                                            });
                                        } else {
                                            callback(500, 'Could not find the specified check for user');
                                        }
                                    } else {
                                        callback(500, {'Error': 'Could not find the user, who created the check'});
                                    }
                                });
                            } else {
                                callback(500, { 'Error': 'Could not delete the specified check' });
                            }
                        });
                    } else {
                        callback(403, { 'Error': 'Missing required token in header, or token is invalid' });
                    }
                });
            } else {
                callback(400, {'Error': 'Could not found required check id'});
            }
        });
    } else {
        callback(400, { 'Error: ': 'Missing required field' });
    }
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