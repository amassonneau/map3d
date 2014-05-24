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
        this.lat = (parseFloat(lat) + 90) % 180 - 90;
        this.lng = (parseFloat(lng) + 180) % 360 - 180;
        if(isNaN(this.lat) || isNaN(this.lng)){
            throw "Invalid arguments for the LatLng constructor";
        }
    }

    LatLng.prototype.toTileCoordinates = function(zoom){
        var axisTilesCount = geometryUtils.mercator.getAxisTilesCount(zoom),
            offset = axisTilesCount/ 2,
            x = this.lng * axisTilesCount/360 + offset,
            siny = bound(Math.sin(geometryUtils.degToRad(this.lat)), -0.9999, 0.9999),
            y = -0.5 * Math.log((1 + siny) / (1 - siny)) * axisTilesCount/(Math.PI*2) + offset;

        return [Math.max(0, x), Math.min(Math.max(0, y), axisTilesCount-1)];
    };

    function bound(value, opt_min, opt_max) {
        if (opt_min != null) value = Math.max(value, opt_min);
        if (opt_max != null) value = Math.min(value, opt_max);
        return value;
    }

    LatLng.getBounds = function(map){
        var camera = [], cameraInverse = [], vec4top = [], vec4right = [],
            cameraPosition = map.getCamera().getPosition(),
            cameraDistance = vec3.distance(cameraPosition, [0,0,0]),
            radiusTop, radiusRight, bounds, cameraAngle = Math.atan(cameraPosition[1]/cameraPosition[2]);

        //This is the same as the angle between the camera and the top/left of the sphere
        var lat = Math.acos(1/cameraDistance),
            lng = Math.acos(1/cameraDistance);

        //Start in the scene coordinate system
        //scSphereY is the maximum visible y position of the sphere at x=0
        //scSphereX same as scSphereY at y = 0
        //scViewportY is the maximum visible y position in the viewport. It's at the same z,x as scSphereY
        //scViewportX same as scSphereX
        var scSphereY, scSphereX = scSphereY = Math.sin(lat),
            scViewportY = Math.tan(map.getScene().getPerspectiveAngle()/2)*(cameraDistance-Math.cos(lat)),
            scViewportX = scViewportY * map.getScene().getRatio(),
            northEast, southWest, north, east, south, west, glRadiusY, glX, glY;

        if (scViewportY > scSphereY && scViewportX > scSphereX){
            north = map.getCenter().lat + lat * 180/Math.PI;
            south = map.getCenter().lat - lat * 180/Math.PI;

            if(cameraPosition[1] < 1 && cameraPosition[1] > -1) {
                var cameraAngleY = Math.atan(cameraPosition[1]/cameraPosition[2]),
                    scD = Math.sqrt(Math.pow(cameraDistance,2) - 1);
                glY = Math.sin(cameraAngleY) * scD /scViewportY;
                glRadiusY = scSphereY / scViewportY;
                glX = Math.sqrt(Math.pow(glRadiusY, 2) - Math.pow(glY, 2)) /map.getScene().getRatio();
                east = LatLng.fromGLXY(map, glX-0.0001, glY).lng;
                west = map.getCenter().lng * 2 - east;
            }else{
                if(cameraPosition[1] >= 1){
                    north = 90;
                }else{
                    south = -90;
                }
                east = map.getCenter().lng + 180;
                west = map.getCenter().lng - 180;
            }
            northEast = new LatLng(north, east);
            southWest = new LatLng(south, west);
        } else if (scViewportY < scSphereY && scViewportX < scSphereX){
            northEast = LatLng.fromGLXY(map, 1, 1, true);
            southWest = LatLng.fromGLXY(map, -1, -1, true);
        } else if (scViewportY < scSphereY && scViewportX > scSphereX){
            north = 180 - 45/2 - (180 - Math.asin(Math.sin(45/2 * Math.PI/180)*cameraDistance)*180/Math.PI);
            console.log(north);
            south = map.getCenter().lat - lat * 180/Math.PI;
            //Switch to the view port coordinate system.
            //We draw a circle with a radius of equal to sphereY and find the x coordinate where it
            //intersects the top of the screen (at y = 1)
            var cameraAngleY = Math.atan(cameraPosition[1]/cameraPosition[2]),
                scD = Math.sqrt(Math.pow(cameraDistance,2) - 1);

            glY = Math.sin(cameraAngleY) * scD /scViewportY;
            glRadiusY = scSphereY / scViewportY;
            glX = Math.sqrt(Math.pow(glRadiusY, 2) - Math.pow(glY, 2)) /map.getScene().getRatio();
            east = LatLng.fromGLXY(map, glX-0.0001, glY).lng;

            glX = Math.sqrt(Math.pow(scSphereY/scViewportY,2) - 1)/map.getScene().getRatio();
            var top = LatLng.fromGLXY(map, 0, 1, true),
                topRight = LatLng.fromGLXY(map, glX, 1, true),
                bottom = LatLng.fromGLXY(map, 0, -1, true),
                bottomLeft = LatLng.fromGLXY(map, -glX, -1, true);

            northEast = new LatLng(Math.max(top.lat, topRight.lat), map.getCenter().lng + lng * 180/Math.PI);
            southWest = new LatLng(Math.min(bottom.lat, bottomLeft.lat), map.getCenter().lng - lng * 180/Math.PI);
            if(Math.abs(northEast.lng - southWest.lng) > 178){
                southWest.lng = -180;
                northEast.lng = 180;
                if(Math.abs(north.lat) > Math.abs(south.lat)){
                    northEast.lat = 90;
                }else{
                    southWest.lat = -90;
                }
            }

        }else if(scViewportY > scSphereY && scViewportX < scSphereX){
            north = LatLng.fromGLXY(map, 1, 1, true).lat - map.getCenter().lat;
        }
        console.log("Bounds:", southWest, northEast);
        return [southWest, northEast];
    };

    function getBoundsNoFit(map){
        var southWest = LatLng.fromXY(map, 0, map.getHeight(), true),
            northEast = LatLng.fromXY(map, map.getWidth(), 0, true);

        return [southWest, northEast];
    }

    function getBoundsFitAll(map){
        var north = LatLng.fromXY(map, map.getWidth()/2, 0, true),
            east = LatLng.fromXY(map, map.getWidth(), map.getHeight()/2, true),
            west = LatLng.fromXY(map, 0, map.getHeight()/2, true),
            south = LatLng.fromXY(map, map.getWidth()/2, map.getHeight(), true),
            southWest = new LatLng(south.lat, west.lng),
            northEast = new LatLng(north.lat, east.lng);

        if(Math.abs(north.lng - south.lng) > 178){
            southWest.lng = -180;
            northEast.lng = 180;
            if(Math.abs(north.lat) > Math.abs(south.lat)){
                northEast.lat = 89;
            }else{
                southWest.lat = -89;
            }
        }
        return [southWest, northEast];
    }

    //What if the tile size were to change?
    LatLng.fromTileCoordinates = function(x, y, zoom){
        var axisTilesCount = geometryUtils.mercator.getAxisTilesCount(zoom),
            offset = axisTilesCount/2,
            lng = (x - offset)*(360/axisTilesCount),
            latRad = (offset - y)*(Math.PI*2/axisTilesCount),
            lat = geometryUtils.radToDeg(2 * Math.atan(Math.exp(latRad)) - Math.PI / 2);

        return new LatLng(lat, lng);
    };

    LatLng.fromXY = function(map, x, y, allowOutside){
        var centerX = map.getWidth()/ 2,
            centerY = map.getHeight()/ 2;
        return LatLng.fromGLXY(map, (x - centerX)/centerX, (centerY - y)/centerY, allowOutside);
    };


    LatLng.fromGLXY = function(map, glx, gly, allowOutside){
        var vec4near = [], vec4far= [], camera = [], cameraInverse = [], d, t, sub = [],
            vec3near, vec3far, intersects, point, latRad, lngRad, projIntersects = [[], []];

        mat4.multiply(camera, map._scene.getTransform(), map.getCamera().getTransform());
        mat4.invert(cameraInverse, camera);

        //Project the x, y (in GLViewPort projection) onto the close plan and the far plan to (SceneObject projection) give
        //The difference between these vectors gives us a vector going through the scene, possible the sphere.
        vec4.transformMat4(vec4far, [glx, gly, -1, 1], cameraInverse);
        vec4.transformMat4(vec4near, [glx, gly, 1, 1], cameraInverse);
        //Normalize the Scene projection coordinates.
        vec3near = [vec4near[0]/vec4near[3], vec4near[1]/vec4near[3], vec4near[2]/vec4near[3]];
        vec3far = [vec4far[0]/vec4far[3], vec4far[1]/vec4far[3], vec4far[2]/vec4far[3]];

        //
        if(allowOutside && (d = isOutside(vec3near, vec3far))){
            //Reposition the click to the edge of the sphere
            vec4.transformMat4(vec4far, [glx/d, gly/d, -1, 1], cameraInverse);
            vec4.transformMat4(vec4near, [glx/d, gly/d, 1, 1], cameraInverse);
            vec3near = [vec4near[0]/vec4near[3], vec4near[1]/vec4near[3], vec4near[2]/vec4near[3]];
            vec3far = [vec4far[0]/vec4far[3], vec4far[1]/vec4far[3], vec4far[2]/vec4far[3]];

            vec3.subtract(sub, vec3far, vec3near);
            t = -vec3.dot(vec3near, sub)/Math.pow(vec3.length(sub),2);
            point = [];
            point[0] = vec3near[0] + (vec3far[0] - vec3near[0])*t;
            point[1] = vec3near[1] + (vec3far[1] - vec3near[1])*t;
            point[2] = vec3near[2] + (vec3far[2] - vec3near[2])*t;
            vec3.normalize(point, point);
        }
        else{
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
        return latlng;
    };

    //Determines whether the vector (from x1 to x2) goes through a sphere centered at 0,0 with radius 1
    //The SceneObject projection should be used for x1 and x2
    function isOutside(x1, x2){
        var cross = [], sub1 = [], sub2 = [], sub3 = [], d;
        vec3.negate(sub1, x1);
        vec3.negate(sub2, x2);
        vec3.subtract(sub3, x2, x1);
        vec3.cross(cross, sub1, sub2);
        d = vec3.length(cross)/vec3.length(sub3);
        return d > 1 ? d : false;
    }


    LatLng.subtract = function(latlng1, latlng2){
        return new LatLng(latlng1.lat - latlng2.lat, latlng1.lng - latlng2.lng)
    };

    LatLng.add = function(latlng1, latlng2){
        return new LatLng(latlng1.lat + latlng2.lat, latlng1.lng + latlng2.lng)
    };

    LatLng.prototype.subtract = function(latlng){
        return LatLng.subtract(this, latlng);
    };

    LatLng.prototype.add = function(latlng){
        return LatLng.add(this, latlng);
    };

    LatLng.prototype.copy = function(){
        return new LatLng(this.lat, this.lng);
    };
});