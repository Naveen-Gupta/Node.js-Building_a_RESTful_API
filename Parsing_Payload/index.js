/**
 * @author Naveen Gupta
 * @description parsing payload
 */

 // Dependencies
 const HTTP = require('http');
 const STRING_DECODER = require('string_decoder').StringDecoder;
 // 
 const PORT = process.env.PORT || 3000;
 
 // The Server should respond to all requests with a string
 const SERVER = HTTP.createServer((req, res)=>{

    // Get the payload, if any
    const DECODER = new STRING_DECODER('utf-8');//decode streams to utf-8
    let buffer = '';
    // streams has two methods on data it will stream the data
    req.on('data', (data)=>{
        buffer += DECODER.write(data);//decode the stream data and write to buffer 
    }); 

    // when streams the done streaming and it will be called whether data function is called or not.
    req.on('end', ()=>{

        buffer += DECODER.end();

        // Send the response
        res.end('Hello World');

        // Log the request path
        console.log('Payload: ' + buffer);
    });  
    
 });

 // Start the server and listen it on defined port
 SERVER.listen(PORT, ()=>{
    console.log(`server is listening at port: ${PORT}`);
 });

 /* Output:
    Terminal:       node index.js
    POSTMAN:        localhost:3000

    Body: (text)    I am streaming this string it can be any text or json data.
    server is listening at port: 3000
    Payload: I am streaming this string it can be any text or json data.

    Body: X
    server is listening at port: 3000
    Payload:

*/