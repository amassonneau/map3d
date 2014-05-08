var express = require('express'),
    http = require("http");

var app = express();

app.use(express.static(__dirname + '/public'));
app.get('/wHeat', function(req, res){
    var proxy_request = http.get({
        hostname: "localhost",
        port: 8080,
        path: req.url
    }, function(proxy_response){
        proxy_response.addListener('data', function(chunk) {
            res.write(chunk, 'binary');
        });
        proxy_response.addListener('end', function() {
            res.end();
        });
        proxy_response.headers.location = "http://" + req.host + req.url;
        res.writeHead(200, proxy_response.headers);
    });
    proxy_request.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
});

app.listen(3000);