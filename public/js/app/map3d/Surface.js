define(function(require, exports, module){
    module.exports = Surface;

    var SurfaceTile = require("./SurfaceTile"),
        LatLng = require("./LatLng"),
        vidia = require("vidia/index"),
        mathUtils = require("./utils/math"),
        geometryUtils = require("./utils/geometry"),
        mercatorUtils = geometryUtils.mercator;

    function Surface(map){
        this._map = map;
        this._zoom = null;
        this._tiles = {};
        this._geometries = {};
    }

    Surface.prototype.update = function(force){
        var zoom = mercatorUtils.getZoom(this._map.getZoom()),
            bounds = getBoundsCoordinates.call(this);

        if(this._map.getZoom() !== this._zoom){
            generate.call(this, bounds, zoom);
        }else if(this._bounds[0][0] !== bounds[0][0] || this._bounds[0][1] !== bounds[0][1] ||
                    this._bounds[1][0] !== bounds[1][0] || this._bounds[1][1] !== bounds[1][1]){
            updateBounds.call(this, bounds, zoom);
        }
        this._bounds = bounds;
        this._zoom = this._map.getZoom();
    };

    function generate(bounds, zoom, skipClean){
        var axisTilesCount = mercatorUtils.getAxisTilesCount(zoom),
            y = bounds[0][1], x;

        !skipClean && cleanAll.call(this);
        do{
            x = bounds[0][0];
            do{
                createTile.call(this, x, y, zoom, axisTilesCount);
                x = (x+1)%axisTilesCount;
            }while(x !== bounds[1][0])
            y = (y+1)%axisTilesCount;
        } while(y !== bounds[1][1])
    }

    function updateBounds(bounds, zoom){
        var tile, axisTilesCount = mercatorUtils.getAxisTilesCount(zoom);
        generate.call(this, bounds, zoom, true);
        for(var i in this._tiles){
            tile = this._tiles[i];
            if((bounds[0][0] < bounds[1][0] && (tile.getX() < bounds[0][0] || tile.getX() >= bounds[1][0])) ||
                (bounds[0][0] > bounds[1][0] && (tile.getX() < bounds[0][0] && tile.getX() >= bounds[1][0]))){

                cleanTile.call(this, tile.getX(), tile.getY(), axisTilesCount);
                continue;
            }
            if(tile.getY() < bounds[0][1] || tile.getY() >= bounds[1][1]){
                cleanTile.call(this, tile.getX(), tile.getY(), axisTilesCount);
                continue;
            }
        }
    }

    function cleanTile(x, y, axisTilesCount){
        var index = x*axisTilesCount + y;
        if(!this._tiles[index]){
            return;
        }
        this._map.getScene().removeObject(this._tiles[index]);
        this._tiles[index].destroy();
        delete this._tiles[index]
    }

    function cleanAll(){
        for(var i in  this._tiles){
            this._map.getScene().removeObject(this._tiles[i]);
            this._tiles[i].destroy();
        }
        for(var i in this._geometries){
            this._geometries[i].destroy();
        }
        this._tiles = {};
        this._geometries = {};
    }

    function createTile(x, y, zoom, axisTilesCount){
        var image, texture, tile, geometry;
        if(this._tiles[x*axisTilesCount + y]){
            return this._tiles[x*y];
        }
        if(!this._geometries[y]){
            this._geometries[y] = new vidia.geometries.Sphere({
                radius: 1,
                bands: {lng: 16, lat: 8},
                min: LatLng.fromTileCoordinates(0, y+1, zoom),
                max: LatLng.fromTileCoordinates(1, y, zoom)
            });
        }
        geometry = this._geometries[y];
        image = new Image();
        image.src = "/map/"+ (zoom || 1) +"/"+x+"/"+y+".png";
        texture = new vidia.Texture(this._map.getScene(), {
            image: image
        });
        tile = new SurfaceTile(this._map.getScene(), {
            x: x,
            y: y,
            zoom: zoom,
            geometry: geometry,
            shader: this._map.getShader(),
            texture: texture
        });
        tile.rotate(x*Math.PI*2/axisTilesCount, [0,1,0]);
        this._map.getScene().addObject(tile);
        this._tiles[x*axisTilesCount + y] = tile;
        return tile;
    }

    function getBoundsCoordinates(){
        var bounds = [[],[]], mapBounds = this._map.getBounds(),
            axisTilesCount = geometryUtils.mercator.getAxisTilesCount(this._map.getZoom()),
            startXY = mapBounds.getNorthWest().toTileCoordinates(this._map.getZoom()),
            endXY = mapBounds.getSouthEast().toTileCoordinates(this._map.getZoom());

        bounds[0][0] = Math.floor(startXY[0]);
        bounds[0][0] < 0 && (bounds[0][0]+= axisTilesCount);
        bounds[0][1] = Math.floor(startXY[1]);
        bounds[0][1] < 0 && (bounds[0][1]+= axisTilesCount);
        bounds[1][0] = Math.ceil(endXY[0]) % axisTilesCount;
        bounds[1][1] = Math.ceil(endXY[1]) % axisTilesCount;

        return bounds;

    }
});