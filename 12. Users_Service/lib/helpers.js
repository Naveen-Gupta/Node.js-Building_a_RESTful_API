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
 helpers.hash = function(str){
     if(typeof str === "string" && str.length > 0){
        let hash = CRYPTO.createHmac('sha256', CONFIG.hashSecret).update(str).digest('hex');
        return hash;
     } else {
         return false;
     }
 }

 // Parse to the JSON string to an object, without throwing
 helpers.parseJsonToObject = function(str){
    try{
        let obj = JSON.parse(str);
        return obj;
    } catch (e){
        return {};
    }
 }

 // Exporting the helpers
 module.exports = helpers;
