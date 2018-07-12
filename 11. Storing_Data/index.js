/**
 * @author Naveen Gupta
 * @description storing, reading and updating the data 
 * 
 */

 // Dependencies
 const HTTP = require('http');
 const LIB = require('./lib/data');

 const PORT = process.env.PORT || 3000;
// Creating file newFile
    LIB.create('test', 'newFile', {'foo': 'bar'}, function(err){
        console.log('error: ', err);
    });

// Reading the file
    LIB.read('test', 'newFile', function(err, data){
        console.log('error: ', err, data);
    });

// Updating the file
    LIB.update('test', 'newFile', {'fizz': 'buzz'}, function(err){
        console.log('error: ', err);
    });

// Deleting the file
    LIB.delete('test', 'newFile', function(err){
        console.log('error: ', err);
    });


 const SERVER = HTTP.createServer(function(req, res){
    res.end('Hello World');
 });

 SERVER.listen(PORT, function(){
     console.log(`Server has been started at port: ${PORT}`);
 });