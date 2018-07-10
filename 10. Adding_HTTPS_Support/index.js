/**
 * @author Naveen Gupta
 * @description Adding HTTPS Support
 */

 // Dependencies
 const HTTP = require('http');
 const HTTPS = require('https');
 const URL = require('url');
 const STRING_DECODER = require('string_decoder').StringDecoder;
 const FS = require('fs');
 const CONFIG = require('./config');

 const HTTP_PORT = CONFIG.httpPort;
 const HTTPS_PORT = CONFIG.httpsPort;
 const ENV = CONFIG.envName;
 
 // Instantiate http server
 const HTTP_SERVER = HTTP.createServer((req, res)=>{
    unifiedServer(req, res);   
 });

 // listening http server
 HTTP_SERVER.listen(HTTP_PORT, ()=>{
    console.log(`server is listening at port: ${HTTP_PORT}`);
 });

// Instantiate https server
const HTTPS_SERVER_OPTIONS = {
    'key':  FS.readFileSync('./https/key.pem'),
    'cert': FS.readFileSync('./https/cert.pem')
}
const HTTPS_SERVER = HTTPS.createServer(HTTPS_SERVER_OPTIONS, (req, res)=>{
    unifiedServer(req, res);   
 });

 // listening http server
 HTTPS_SERVER.listen(HTTPS_PORT, ()=>{
    console.log(`server is listening at port: ${HTTPS_PORT}`);
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


 // Making unified server to handle both http and https requests
 let unifiedServer = (req, res) => {
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
 }

 /* 
    Output:
        node index.js
            server is listening at port: 3000
            server is listening at port: 3001
        https://localhost:3001/sample       {"name":"Sample Handler"}   (unsafe mode)

        NODE_ENV=production node index.js
            server is listening at port: 5000
            server is listening at port: 5001
        https://localhost:5001/sample       {"name":"Sample Handler"}   (unsafe mode)
 */