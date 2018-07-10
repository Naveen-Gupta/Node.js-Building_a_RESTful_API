/**
 * @author Naveen Gupta
 * @description parsing the request headers
 */

 // Dependencies
 const HTTP = require('http');
 // 
 const PORT = process.env.PORT || 3000;
 
 // The Server should respond to all requests with a string
 const SERVER = HTTP.createServer((req, res)=>{

    let headers = req.headers;
    
    // Send the response
    res.end('Hello World');

    // Log the request path
    console.log('Requested Headers: ', headers);
 });

 // Start the server and listen it on defined port
 SERVER.listen(PORT, ()=>{
    console.log(`server is listening at port: ${PORT}`);
 });

 /** Output:
    Postman            :Headers:    key        |       value
                                    WWE              John Cena  
                                    Cricket          Sachin Tendulkar
                                    Football         Ronaldo
        server is listening at port: 3000
        Requested Headers:  
        {   
            wwe: 'John Cena',
            cricket: 'Sachin Tendulkar',
            football: 'Ronaldo',
            'cache-control': 'no-cache',
            'postman-token': 'cb48f005-5b8f-47ca-bc80-c49c61985fed',
            'user-agent': 'PostmanRuntime/7.1.5',
            accept: *\/*",
            host: 'localhost:3000',
            'accept-encoding': 'gzip, deflate',
            connection: 'keep-alive' 
        }

*/