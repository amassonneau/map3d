define(function(require, exports, module){
    module.exports = Surface;

    var SurfaceTile = require("./SurfaceTile"),
        LatLng = require("./LatLng"),
        vidia = require("vidia/index"),
        geometryUtils = require("./utils/geometry"),
        mercatorUtils = geometryUtils.mercator;

    function Surface(map){
        this._map = map;
        this._zoom = map.getZoom();
        this._tiles = [];
    }

    Surface.prototype.update = function(force){
        if(this._zoom !== this._map.getZoom() || force){
            generateTiles.call(this);
        }
    }

    function generateTiles(){
        var axisTilesCount = mercatorUtils.getAxisTilesCount(this._map.getZoom()),
            tile, geometry, startLatlng, endLatlng;

        for(var i = 0; i < this._tiles.length; i++){
            this._map.getScene().removeObject(this._tiles[i]);
            this._tiles[i].getGeometry().destroy();
            this._tiles[i].destroy();
        }
        this._tiles = [];
        for(var y = 0; y < axisTilesCount; y++){
            startLatlng = LatLng.fromTileCoordinates(0, y+1, this._map.getZoom());
            endLatlng = startLatlng.add({lat: 180/axisTilesCount, lng: 360/axisTilesCount})
            geometry = new vidia.geometries.Sphere({
                radius: 1,
                bands: {lng: 8, lat: 4},
                min: startLatlng,
                max: endLatlng
            });
            for(var x = 0; x < axisTilesCount; x++){
                tile = new SurfaceTile(this._map.getScene(), {
                    geometry: geometry,
                    shader: this._map.getShader()
                });
                tile.rotate(x*Math.PI*2/axisTilesCount, [0,1,0]);
                this._map.getScene().addObject(tile);
                this._tiles.push(tile);
            }
        }
        this._zoom = this._map.getZoom();
    }
});