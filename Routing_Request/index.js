/**
 * @author Naveen Gupta
 * @description routing requests
 */

 // Dependencies
 const HTTP = require('http');
 const URL = require('url');
 const STRING_DECODER = require('string_decoder').StringDecoder;

 const PORT = process.env.PORT || 3000;
 
 // The Server should respond to all requests with a string
 const SERVER = HTTP.createServer((req, res)=>{

    // Get the headers
    let headers = req.headers;    

    // Get the request method
    let requestedMethod = req.method.toLowerCase();

    // Get the requested path
    let parsedUrl = URL.parse(req.url, true);
    // Get the path
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Get the query object
    let queryStringObject = parsedUrl.query;    

    // Get the payload, if any
    const DECODER = new STRING_DECODER('utf-8');//decode streams to utf-8
    let buffer = '';

    // streams has two methods on data it will stream the data and end when straming is done
    req.on('data', (data)=>{
        buffer += DECODER.write(data);//decode the stream data and write to buffer 
    }); 

    // when streams the done streaming and it will be called whether data function is called or not.
    req.on('end', ()=>{
        // adding to buffer when straming is done 
        buffer += DECODER.end();

        // choose the handler where request should go to, if one is not found then not found handler
        let choosenHandler = typeof (ROUTER[trimmedPath]) !== 'undefined' ? ROUTER[trimmedPath]: handlers.notFound;
      
        // construct the data object to send it to handler
        let data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': requestedMethod,
            'headers': headers,
            'payload': buffer
        };

        choosenHandler(data, (statusCode, payload)=>{
            // use the status code called back by handler, or default 200
            statusCode = typeof (statusCode) === 'number' ? statusCode : 200;

            //use the payload called back by handler, or default empty object
            payload = typeof (payload) === 'object' ? payload : {};

            // payload to string
            let payloadString = JSON.stringify(payload);

            // returing the response
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log('Returing the response', statusCode, payloadString);

        });
    });   

 });

 // Start the server and listen it on defined port
 SERVER.listen(PORT, ()=>{
    console.log(`server is listening at port: ${PORT}`);
 });

 // Define handler object
 let handlers = {};

 // Sample Handlet
 handlers.sample = (data, callback) => {
    callback(406, { 'name': 'Sample Handler'});
 }

 // Not Found Handler 
 handlers.notFound = (data, callback) =>{
     callback(404);
 }

 // Define the router
 const ROUTER = {
    'sample': handlers.sample,
 };

 /* Output:
    node index.js     
        localhost:3000/sample/api        
            server is listening at port: 3000
            Returing the response 404 {}

        localhost:3000/       
            server is listening at port: 3000
            Returing the response 404 {}

        localhost:3000/sample
            server is listening at port: 3000
            Returing the response 406 {"name":"Sample Handler"}       

*/