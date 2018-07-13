/**
 * @author Naveen Gupta
 * @description library for storing and editing the data
 * 
 */

 // Dependencies
 const FS = require('fs');
 const PATH = require('path');
 const HELPERS = require('./helpers');

 // Container for module
 let lib = {};

 // Base directory for data folder
 lib.baseDir = PATH.join(__dirname, '/../.data/');

 // Write data to file
 lib.create = function(dir, file, data, callback){

    //open the file for writing
    FS.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function(err, fileDescriptor){
        if(!err && fileDescriptor){

            // Convert data to string
            let stringData = JSON.stringify(data);

            // Writing to file and closing it
            FS.writeFile(fileDescriptor, stringData, function(err){
                if(!err){
                    // Closing the file
                    FS.close(fileDescriptor, function(err){
                        if(!err){
                            callback(false);
                        } else{
                            callback('Error in closing the file');
                        }
                    });
                } else{
                    callback('Error writing to file');
                }
            });            
        } else{
            callback('Could not create the new file, it may already exists');
        }
    });
 }

// Read the data from file
lib.read = function(dir, file, callback){
    FS.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', function(err, data){
        if(!err && data){
            let parsedData = HELPERS.parseJsonToObject(data);
            callback(false, data);
        } else{
            callback(err, data);
        }        
    });
}

// Update the data of file
lib.update = function(dir, file, data, callback){
    //open the file for writing
    FS.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function(err, fileDescriptor){
        if(!err && fileDescriptor){

            // Convert data to string
            let stringData = JSON.stringify(data);

            // Truncating the data from file
            FS.truncate(fileDescriptor, function(err){
                if(!err){
                     // Writing to file and closing it
                        FS.writeFile(fileDescriptor, stringData, function(err){
                            if(!err){
                                // Closing the file
                                FS.close(fileDescriptor, function(err){
                                    if(!err){
                                        callback(false);
                                    } else{
                                        callback('Error in closing the file');
                                    }
                                });
                            } else{
                                callback('Error writing to existing file');
                            }
                        });  
                } else{
                    callback('Could not truncate the file');
                }
            });                     
        } else{
            callback('Could not open the file, it may not exists');
        }
    });
}

// Deleting the file
    lib.delete = function(dir, file, callback){
        // Unlink the file
        FS.unlink(lib.baseDir + dir + '/' + file + '.json', function(err){
           if(!err){
               callback(false);
           }
           else{
               callback('Could not delete the file, or file may not exists');
           }
        });
    }
 // Exporting the module
 module.exports = lib;



