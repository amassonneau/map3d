var express = require('express'),
    http = require("http");

var app = express();

app.use(express.static(__dirname + '/public'));
app.get('/map/*', function(req, res){
    var proxy_request = http.get('http://a.tile.openstreetmap.org' + req.url.replace("/map", ""), function(proxy_response){
//        res._headers = proxy_response.headers;
        res.setHeader("Expires",  (new Date((new Date()).getTime() + 3600*24*1000)).toString());
        proxy_response.pipe(res);
    });
    proxy_request.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
});

app.listen(3000);