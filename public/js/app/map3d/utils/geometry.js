define(function(require, exports, module){
    var geometry = module.exports = {};

    var math = require("./math"),
        DEG_TO_RAD = Math.PI/180,
        RAD_TO_DEG = 180/Math.PI;

    geometry.degToRad = function(deg){
        return DEG_TO_RAD * deg;
    };

    geometry.radToDeg = function(rad){
        return RAD_TO_DEG * rad;
    };

    geometry.intersectSphereLine = function(sCenter, sRadius, lStart, lEnd){
        var C = Math.pow(lStart[0]-sCenter[0],2)    + Math.pow(lStart[1]-sCenter[1],2)  + Math.pow(lStart[2]-sCenter[2], 2) - Math.pow(sRadius, 2),
            A = Math.pow(lStart[0]-lEnd[0],2)       + Math.pow(lStart[1]-lEnd[1],2)     + Math.pow(lStart[2]-lEnd[2], 2),
            B = Math.pow(lEnd[0]-sCenter[0],2)      + Math.pow(lEnd[1]-sCenter[1],2)    + Math.pow(lEnd[2]-sCenter[2], 2) - A - C - Math.pow(sRadius, 2),
            t = math.quadratic(A,B,C),
            res = [];

        if(!isNaN(t[0])){
            res.push(result(t[0]));
        }
        if(!isNaN(t[1])){
            res.push(result(t[1]));
        }
        function result(t){
            return [
                lStart[0]*(1-t) + t*lEnd[0],
                lStart[1]*(1-t) + t*lEnd[1],
                lStart[2]*(1-t) + t*lEnd[2]
            ]
        }
        return res;
    };

    geometry.mercator = {};
    geometry.mercator.getAxisTilesCount = function(zoom){
        if(!zoom || zoom < 1){
            zoom = 1;
        }
        return (1 << zoom);
    };

    geometry.mercator.getTilesCount = function(zoom){
        if(!zoom || zoom < 1){
            zoom = 1;
        }
        return (1 << (zoom*2));
    }
})