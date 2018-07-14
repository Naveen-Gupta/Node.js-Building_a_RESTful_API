/**
 * @author Naveen Gupta
 * @description helpers for various tasks
 */

// Dependencies
const CRYPTO = require('crypto');
const CONFIG = require('./config');
const HTTPS = require('https');
const QUERY_STRING = require('querystring');

// Container to helpers
let helpers = {};

// Hashing the string
helpers.hash = function (str) {
    if (typeof str === "string" && str.length > 0) {
        let hash = CRYPTO.createHmac('sha256', CONFIG.hashSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
}

// Parse to the JSON string to an object, without throwing
helpers.parseJsonToObject = function (str) {
    try {
        let obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
}

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = function (strLength) {
    strLength = typeof strLength == "number" && strLength > 0 ? strLength : false;
    if (strLength) {
        // Define all the possible characters that could go string
        let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';

        //start the final string
        let str = '';
        for (let i = 1; i <= strLength; i++) {
            // Get the rendom character from possible characters
            let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

            // Append this character to the final string
            str += randomCharacter;
        }
        // Return the final string
        return str;
    } else {
        return false;
    }
}

// Send an SMS via twilio
helpers.sendTwilioSms = function(phone, msg, callback){
    // Validating parameters
    phone = typeof(phone) === "string" && phone.trim().length === 10 ? phone.trim() : false;
    msg = typeof(msg) === "string" && msg.trim().length > 0 && msg.trim().length < 1600 ? msg.trim() : false;

    if(phone && msg){
        // Configure the twilio configuration
        let payload = {
            'From': CONFIG.twilio.fromPhone,
            'To': '+91' + phone,
            'Body': msg
        };
        // Stringify the payload
        let stringPayload = QUERY_STRING.stringify(payload);

        // Configure the request details
        let requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': '/2010-04-01/Accounts/' + CONFIG.twilio.accountSid + '/Messages.json',
            'auth': CONFIG.twilio.accountSid + ':' + CONFIG.twilio.authToken,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        };

        // Instantiate the request object
        let req = HTTPS.request(requestDetails, function(res){
            // Grab the status of sent request
            let status = res.statusCode;
            // Callback successfully if the request went through
            if(status ==  200 || status == 201){
                callback(false);
            } else {
                callback('Status code returned '+ status);
            }
        });

        // Bind to the error event so does not get through
        req.on('error', function(e){
            callback(e);
        });

        // Add the payload
        req.write(stringPayload);

        // Ending the request
        req.end();

    } else {
        callback("Missing parameters required by twilio");
    }
}

// Exporting the helpers
module.exports = helpers;
