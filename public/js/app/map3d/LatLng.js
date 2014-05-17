define(function(require, exports, module){
    module.exports = LatLng;

    var glMatrix = require("gl-matrix"),
        vec4 = glMatrix.vec4,
        vec3 = glMatrix.vec3,
        mat4 = glMatrix.mat4,
        geometryUtils = require("./utils/geometry");

    function LatLng(lat, lng){
        if(!lat && lat !== 0){
            throw "Invalid arguments for the LatLng constructor";
        }
        if(lat.lat){
            lng = lat.lng;
            lat = lat.lat;
        }
        else if(lat instanceof Array){
            lng = lat[1];
            lat = lat[0];
        }
        this.lat = parseFloat(lat);
        this.lng = parseFloat(lng);
        if(isNaN(this.lat) || isNaN(this.lng)){
            throw "Invalid arguments for the LatLng constructor";
        }
    }

    LatLng.fromXY = function(map, x, y){
        var centerX = map.getWidth()/ 2,
            centerY = map.getHeight()/ 2,
            glx = (x - centerX)/centerX,
            gly = (centerY - y)/centerY,
            vec4near = [], vec4far= [], camera = [], cameraInverse = [],
            vec3near, vec3far, intersects, point, latRad, lngRad, projIntersects = [[], []];



        mat4.multiply(camera, map._scene.getTransform(), map.getCamera().getTransform());
        mat4.invert(cameraInverse, camera);

        vec4.transformMat4(vec4far, [glx, gly, -1, 1], cameraInverse);
        vec4.transformMat4(vec4near, [glx, gly, 1, 1], cameraInverse);
        vec3near = [vec4near[0]/vec4near[3], vec4near[1]/vec4near[3], vec4near[2]/vec4near[3]];
        vec3far = [vec4far[0]/vec4far[3], vec4far[1]/vec4far[3], vec4far[2]/vec4far[3]];

        var x1 = vec3near, x2 = vec3far, cross = [], dot = [],
            sub1 = [], sub2 = [], sub3 = [], d, t = [], xyz = [];
        vec3.negate(sub1, x1);
        vec3.negate(sub2, x2);
        vec3.subtract(sub3, x2, x1);
        vec3.cross(cross, sub1, sub2);
        d = vec3.length(cross)/vec3.length(sub3);
        if(d > 1){
            vec4.transformMat4(vec4far, [glx/d, gly/d, -1, 1], cameraInverse);
            vec4.transformMat4(vec4near, [glx/d, gly/d, 1, 1], cameraInverse);
            vec3near = [vec4near[0]/vec4near[3], vec4near[1]/vec4near[3], vec4near[2]/vec4near[3]];
            vec3far = [vec4far[0]/vec4far[3], vec4far[1]/vec4far[3], vec4far[2]/vec4far[3]];
            x1 = vec3near;
            x2 = vec3far;
            vec3.subtract(sub3, x2, x1);
            t = -vec3.dot(x1, sub3)/Math.pow(vec3.length(sub3),2);
            xyz[0] = x1[0] + (x2[0] - x1[0])*t;
            xyz[1] = x1[1] + (x2[1] - x1[1])*t;
            xyz[2] = x1[2] + (x2[2] - x1[2])*t;
            point = [];
            vec3.normalize(point, xyz);
        }else{
            intersects = geometryUtils.intersectSphereLine([0, 0, 0], 1, vec3near, vec3far);
            if(!intersects || intersects.length !== 2){
                return false;
            }
            intersects[0].push(1);
            intersects[1].push(1);
            vec4.transformMat4(projIntersects[0], intersects[0], camera);
            vec4.transformMat4(projIntersects[1], intersects[1], camera);

            point = projIntersects[0][2] < projIntersects[1][2] ? intersects[0] : intersects[1];
        }

        lngRad = Math.atan(point[0]/point[2]),
        latRad = Math.atan(point[1]/Math.sqrt(Math.pow(point[0], 2) + Math.pow(point[2], 2)));
        if(point[0] > 0 && point[2] < 0){
            lngRad += Math.PI;
        }else if(point[0] < 0 && point[2] < 0){
            lngRad -= Math.PI;
        }
        var latlng = new LatLng(geometryUtils.radToDeg(latRad), geometryUtils.radToDeg(lngRad));

            console.log(latlng);

        return latlng;
    }

    //What if the tile size were to change?
    LatLng.fromTileCoordinates = function(x, y, zoom){
        var axisTilesCount = geometryUtils.mercator.getAxisTilesCount(zoom),
            offset = axisTilesCount/2,
            lng = (x - offset)*(360/axisTilesCount),
            lat = (offset - y)*(180/axisTilesCount);

        return new LatLng(lat, lng);
    }


    LatLng.subtract = function(latlng1, latlng2){
        return new LatLng(latlng1.lat - latlng2.lat, latlng1.lng - latlng2.lng)
    }

    LatLng.add = function(latlng1, latlng2){
        return new LatLng(latlng1.lat + latlng2.lat, latlng1.lng + latlng2.lng)
    }

    LatLng.prototype.subtract = function(latlng){
        return LatLng.subtract(this, latlng);
    }

    LatLng.prototype.add = function(latlng){
        return LatLng.add(this, latlng);
    }

    LatLng.prototype.copy = function(){
        return new LatLng(this.lat, this.lng);
    }
});