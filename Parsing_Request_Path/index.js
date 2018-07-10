/**
 * @author Naveen Gupta
 * @description parsing the request path
 */

 // Dependencies
 const HTTP = require('http');
 const URL = require('url');

 // 
 const PORT = process.env.PORT || 3000;
 
 // The Server should respond to all requests with a string
 const SERVER = HTTP.createServer((req, res)=>{

    // Get the URL and parse it
    let parsedUrl = URL.parse(req.url, true);//true denotes it is passed through query module
    // URL.parse(req.url, true)  {"protocol":null,"slashes":null,"auth":null,"host":null,"port":null,"hostname":null,"hash":null,"search":"","query":{},"pathname":"/jjj:666","path":"/jjj:666","href":"/jjj:666"}
    // URL.parse(req.url)        {"protocol":null,"slashes":null,"auth":null,"host":null,"port":null,"hostname":null,"hash":null,"search":null,"query":null,"pathname":"/jjj:666","path":"/jjj:666","href":"/jjj:666"}
   
    // Get the path
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g,'');
    
    // Send the response
    res.end('Hello World');

    // Log the request path
    console.log('path: '+trimmedPath);
 });

 // Start the server and listen it on defined port
 SERVER.listen(PORT, ()=>{
    console.log(`server is listening at port: ${PORT}`);
 });

 /* Output:
    node index.js             
        server is listening at port: 3000
        path: jjj:666/jhjh
        path: jjj:666/jhjh
        path: 

    curl localhost:3000/jjj:666/jhjh
        Hello World

    curl localhost:3000/jjj:666/jhjh/
        Hello World

    curl localhost:3000/
        Hello World
*/