define(function(require, exports, module){
    module.exports = Spherical;

    var Camera = require("../Camera"),
        objectUtils = require("../utils/objects"),
        mathUtils = require("../utils/math");

    var DEG_TO_RAD = Math.PI/180,
        RAD_TO_DEG = 180/Math.PI;

    objectUtils.inherit(Spherical, Camera);

    function Spherical(options){
        Camera.call(this, options);
        this._transition = null;
        this._lat = null;
        this._lng = null;
        this._zoom = null;

        this._options.min || (this._options.min = {});
        isNaN(this._options.min.lat) && (this._options.min.lat = -400);
        isNaN(this._options.min.lng) && (this._options.min.lng = -400);
        this._options.min.lat = this._options.min.lat * DEG_TO_RAD;
        this._options.min.lng = this._options.min.lng * DEG_TO_RAD;

        this._options.max || (this._options.max = {});
        isNaN(this._options.max.lat) && (this._options.max.lat = 400);
        isNaN(this._options.max.lng) && (this._options.max.lng = 400);
        this._options.max.lat = this._options.max.lat * DEG_TO_RAD;
        this._options.max.lng = this._options.max.lng * DEG_TO_RAD;

        this.setLatitude(this._options.latitude);
        this.setLongitude(this._options.longitude);
        this.setZoom(this._options.zoom);
    }

    Spherical.prototype.latitude = function(deg, transition){
        this.setLatitude(this._lat *RAD_TO_DEG + deg, transition);
    };

    Spherical.prototype.longitude = function(deg, transition){
        this.setLongitude(this._lng * RAD_TO_DEG + deg, transition);
    };

    Spherical.prototype.setLatitude = function(deg, transition){
        compute.call(this, deg*DEG_TO_RAD, this._lng, this._zoom, transition);
    };

    Spherical.prototype.setLongitude = function(deg, transition){
        compute.call(this, this._lat, deg*DEG_TO_RAD, this._zoom, transition);
    };

    Spherical.prototype.setLatitudeLongitude = function(lat, lng, transition){
        compute.call(this, lat*DEG_TO_RAD, lng*DEG_TO_RAD, this._zoom, transition);
    }

    Spherical.prototype.setZoom = function(zoom, transition){
        compute.call(this, this._lat, this._lng, zoom, transition);
    };

    Spherical.prototype.getZoom = function(){
        return this._zoom;
    }


    function compute (lat, lng, zoom, transition, fromTransition){
        lng || (lng = 0);
        lat || (lat = 0);
        zoom || (zoom = 0);

        lng = ((lng + Math.PI) % (Math.PI*2)) - Math.PI;
        lat = ((lat + Math.PI/2) % Math.PI) - Math.PI/2;
        (lat < this._options.min.lat) && (lat = this._options.min.lat);
        (lat > this._options.max.lat) && (lat = this._options.max.lat);
        (lng < this._options.min.lng) && (lng = this._options.min.lng);
        (lng > this._options.max.lng) && (lng = this._options.max.lng);

        if(!fromTransition && this._transition){
            this._transition.stop();
            this._transition = null;
        }
        if(transition){
            this._transition = transition;
            return startTransition.call(this, lat, lng, zoom, transition);
        }

        this._lat = lat;
        this._lng = lng;
        this._zoom = zoom;
        lookAt.call(this, lat, lng, zoom);
    }

    function startTransition(lat, lng, zoom, transition){
        var startLat = this._lat,
            startLng = this._lng,
            startZoom = this._zoom,
            diffLat = mathUtils.mod.distance(startLat, lat, Math.PI/2),
            diffLng = mathUtils.mod.distance(startLng, lng, Math.PI),
            diffZoom = zoom-startZoom,
            that = this;

        console.log("Transition lng diff: " + diffLng * RAD_TO_DEG);
        return transition.start(function(step){
            compute.call(that,
                startLat + diffLat*step,
                startLng + diffLng*step,
                startZoom + diffZoom*step,
                null, true
            )
        }, this)
    }

    function lookAt(lat, lng, zoom){
        var x = Math.sin(lng) * Math.cos(lat) * zoom || 0,
            y = Math.sin(lat) * zoom || 0,
            z = Math.cos(lng) * Math.cos(lat) * zoom || 0;

        this.lookAt([x, y, z], [0, 0, 0], [0,1,0]);
    }
});