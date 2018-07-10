/**
 * @author Naveen Gupta
 * @description starting the server on defined port
 */

 // Dependencies
 const HTTP = require('http');
var x=0;
 // 
 const PORT = process.env.PORT || 3000;
 
 // The Server should respond to all requests with a string
 const SERVER = HTTP.createServer((req, res)=>{
     x= x+1;

    res.end('Hello World'+ x);
 });

 // Start the server and listen it on defined port
 SERVER.listen(PORT, ()=>{
    console.log(`server is listening at port: ${PORT}`);
 });

 // Output:
 // node index.js             server is listening at port: 3000
 // curl localhost:3000       Hello World