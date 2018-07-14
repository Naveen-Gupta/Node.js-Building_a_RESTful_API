/**
 * @author Naveen Gupta
 * @description making service checks that service is up or down 
 * 
 */

// Dependencies
const HTTP = require('http');
const LIB = require('./lib/data');
const URL = require('url');
const STRING_DECODER = require('string_decoder').StringDecoder;
const HANDLERS = require('./lib/handlers');
const HELPERS = require('./lib/helpers');

const PORT = process.env.PORT || 5000;

// The Server should respond to all requests with a string
const SERVER = HTTP.createServer((req, res) => {

    // Get the headers
    let headers = req.headers;

    // Get the request method
    let requestedMethod = req.method.toLowerCase();

    // Get the requested path
    let parsedUrl = URL.parse(req.url, true);
    // Get the path
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query object
    let queryStringObject = parsedUrl.query;

    // Get the payload, if any
    const DECODER = new STRING_DECODER('utf-8');//decode streams to utf-8
    let buffer = '';

    // streams has two methods on data it will stream the data and end when straming is done
    req.on('data', (data) => {
        buffer += DECODER.write(data);//decode the stream data and write to buffer 
    });
    // when streams the done streaming and it will be called whether data function is called or not.
    req.on('end', () => {
        // adding to buffer when straming is done 
        buffer += DECODER.end();
        // choose the handler where request should go to, if one is not found then not found handler
        let choosenHandler = typeof (ROUTER[trimmedPath]) !== 'undefined' ? ROUTER[trimmedPath] : HANDLERS.notFound;
        // construct the data object to send it to handler
        let data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': requestedMethod,
            'headers': headers,
            'payload': HELPERS.parseJsonToObject(buffer)
        };

        choosenHandler(data, (statusCode, payload) => {
            // use the status code called back by handler, or default 200
            statusCode = typeof (statusCode) === 'number' ? statusCode : 200;

            //use the payload called back by handler, or default empty object
            payload = typeof (payload) === 'object' ? payload : {};

            // payload to string
            let payloadString = JSON.stringify(payload);

            // returning the response
            res.setHeader('content-type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log('Returning the response', statusCode, payloadString);
        });
    });

});

// Define the router
const ROUTER = {
    'ping': HANDLERS.ping,
    'users': HANDLERS.users,
    'tokens': HANDLERS.tokens,
    'checks': HANDLERS.checks
};

// Listening to server at defined port
SERVER.listen(PORT, function () {
    console.log(`Server has been started at port: ${PORT}`);
});