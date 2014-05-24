define(function(require, exports, module){
    module.exports = Sphere;

    var Geometry = require("../Geometry"),
        objectUtils = require("../utils/objects");

    objectUtils.inherit(Sphere, Geometry);

    function Sphere(options){
        Geometry.call(this, options);
        if(!this._options.min){
            this._options.min = {}
        }
        if(isNaN(this._options.min.lat)){
            this._options.min.lat = 0;
        }
        if(isNaN(this._options.min.lng)){
            this._options.max.lng = 0;
        }
        if(!this._options.max){
            this._options.max = {}
        }
        if(isNaN(this._options.max.lat)){
            this._options.max.lat = 180;
        }
        if(isNaN(this._options.max.lng)){
            this._options.max.lng = 360;
        }
    }

    var barycentricDefinitions = [
        [1.0,  0.0,  0.0],
        [0.0, 1.0,  0.0],
        [0.0, 0.0,  1.0]
    ];

    Sphere.prototype.generate = function(){
        var vertices = [], bcVertices = [], uvVertices = [],
            isLngOdd = false, isLatOdd = false, total = 0, lat, lng, latInc, lngInc, x, y , z, u, v, relj;

        latInc = (this._options.max.lat - this._options.min.lat)/this._options.bands.lat;
        lngInc = (this._options.max.lng - this._options.min.lng)/this._options.bands.lng;

        for (var i = 0; i < this._options.bands.lat; i++) {
            for (var j = 0; j <= this._options.bands.lng; j++) {
                relj = isLatOdd ? this._options.bands.lng - j : j;
                lat = this._options.min.lat + i*latInc;
                lng = this._options.min.lng + relj*lngInc;

                x = Math.cos(lat*Math.PI/180) * Math.sin(lng*Math.PI/180);
                y = Math.sin(lat*Math.PI/180);
                z = Math.cos(lat*Math.PI/180) * Math.cos(lng*Math.PI/180);

                u = 1 - ((this._options.bands.lng - relj) / this._options.bands.lng);
                v = 1 - ((this._options.bands.lat - i) / this._options.bands.lat);

                vertices.push(this._options.radius * x);
                vertices.push(this._options.radius * y);
                vertices.push(this._options.radius * z);

                uvVertices.push(u);
                uvVertices.push(v);

                bcVertices = bcVertices.concat(barycentricDefinitions[total % 3]);
                if(!isLngOdd){
                    i++;
                    j--;
                    isLngOdd = true;
                }else{
                    i--;
                    isLngOdd = false;
                }
                total++;
            }
            isLatOdd = !isLatOdd;
        }
        this._data = {vertices: vertices, bcVertices: bcVertices, uvVertices: uvVertices};
    };
});