/**
 * @author Naveen Gupta
 * @description parsing the request method
 */

 // Dependencies
 const HTTP = require('http');
 // 
 const PORT = process.env.PORT || 3000;
 
 // The Server should respond to all requests with a string
 const SERVER = HTTP.createServer((req, res)=>{

    // Get the request method
    let requestedMethod = req.method.toLowerCase();
    
    // Send the response
    res.end('Hello World');

    // Log the request path
    console.log('Requested Method: ' + requestedMethod);
 });

 // Start the server and listen it on defined port
 SERVER.listen(PORT, ()=>{
    console.log(`server is listening at port: ${PORT}`);
 });

 /* Output:
    node index.js             
        server is listening at port: 3000
        Requested Method: get

    curl localhost:3000/
        Hello World

*/