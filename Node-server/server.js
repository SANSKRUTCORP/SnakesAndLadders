const http = require('http');
const app = require('./app');

const port = process.env.PORT || 8080;

const server = http.createServer(app);

server.listen(port, function(){
    console.log('This server is running over port '+port);
})