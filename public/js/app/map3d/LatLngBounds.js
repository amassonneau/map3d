define(function(require, exports, module){
    module.exports = LatLngBounds;

    var LatLng = require("./LatLng");

    function LatLngBounds(southWest, northEast){
        if(southWest instanceof Array){
            southWest = southWest[0];
            northEast = northEast[1];
        }
        this._southWest = southWest;
        this._northEast = northEast;
        this._northWest = new LatLng(northEast.lat, southWest.lng);
        this._southEast = new LatLng(southWest.lat, northEast.lng);
    }

    LatLngBounds.prototype.getSouthWest = function(){
        return this._southWest;
    }

    LatLngBounds.prototype.getNorthEast = function(){
        return this._northEast;
    }

    LatLngBounds.prototype.getNorthWest = function(){
        return this._northWest;
    }

    LatLngBounds.prototype.getSouthEast = function(){
        return this._southEast;
    }

    LatLngBounds.prototype.getWest = function(){
        return this._southWest.lng;
    }

    LatLngBounds.prototype.getSouth = function(){
        return this._southWest.lat;
    }

    LatLngBounds.prototype.getEast = function(){
        return this._northEast.lng;
    }

    LatLngBounds.prototype.getNorth = function(){
        return this._northEast.lat;
    }
});