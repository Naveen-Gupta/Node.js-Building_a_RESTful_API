/**
 * @author Naveen Gupta
 * @description parsing the query string
 */

 // Dependencies
 const HTTP = require('http');
 const URL = require('url');
 // 
 const PORT = process.env.PORT || 3000;
 
 // The Server should respond to all requests with a string
 const SERVER = HTTP.createServer((req, res)=>{

    let parsedUrl = URL.parse(req.url, true);
    let queryStringObject = parsedUrl.query;
    
    // Send the response
    res.end('Hello World');

    // Log the request path
    console.log('Requested Query Object: ' , queryStringObject);
 });

 // Start the server and listen it on defined port
 SERVER.listen(PORT, ()=>{
    console.log(`server is listening at port: ${PORT}`);
 });

 /* Output:
    node index.js             
        server is listening at port: 3000
        Requested Query Object:  { foo: 'foo' }
        Requested Query Object:  {}

    curl localhost:3000/api?foo='foo'
        Hello World

    curl localhost:3000/api
        Hello World

    In Case
    let parsedUrl = URL.parse(req.url);
        server is listening at port: 3000
        Requested Query Object:  foo=foo

*/