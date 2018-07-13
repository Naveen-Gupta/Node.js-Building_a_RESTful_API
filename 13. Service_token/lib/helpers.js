/**
 * @author Naveen Gupta
 * @description helpers for various tasks
 */

// Dependencies
const CRYPTO = require('crypto');
const CONFIG = require('./config');

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

// Exporting the helpers
module.exports = helpers;
