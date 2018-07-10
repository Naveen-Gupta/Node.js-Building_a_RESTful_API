/**
 * @author Naveen Gupta
 * @description starting the server on defined port
 */

 // Dependencies
 const HTTP = require('http');
 const CONFIG = require('./config');
 // 
 const PORT = CONFIG.port;
 const ENV  = CONFIG.envName;

 // The Server should respond to all requests with a string
 const SERVER = HTTP.createServer((req, res)=>{
    res.end('Hello World');
 });

 // Start the server and listen it on defined port
 SERVER.listen(PORT, ()=>{
    console.log(`server is listening at port: ${PORT} with environment: ${ENV}`);
 });

 /*
    Output:
        node index.js  
            server is listening at port: 3000 with environment: staging
        curl localhost:3000       Hello World

        NODE_ENV=staging node index.js
            server is listening at port: 3000 with environment: staging
        curl localhost:3000       Hello World

        NODE_ENV=production node index.js
            server is listening at port: 5000 with environment: production
        curl localhost:5000       Hello World
*/
