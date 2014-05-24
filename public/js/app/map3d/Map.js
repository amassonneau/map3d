define(function(require, exports, module){
    module.exports = Map;

    var vidia = require("vidia/index"),
        Surface = require("./Surface"),
        LatLng = require("./LatLng"),
        LatLngBounds = require("./LatLngBounds"),
        InputHandler = require("./InputHandler");

    function Map(canvas, options){
        this.canvas = canvas;

        this._width = canvas.clientWidth;
        this._height = canvas.clientHeight;

        this.canvas.width = this._width;
        this.canvas.height = this._height;

        this._center = new LatLng(0,0);
        this._maxZoom = 24;
        this._minZoom = 0;
        this._maxCenter = {lat: 360, lng: 360};
        this._minCenter = {lat: -360, lng: -360};
        this._bounds = null;


        this._scene = new vidia.Scene(this.canvas, {
            width: this.getWidth(),
            height: this.getHeight()
        });
        this._scene.setPerspective(45, 0.001, 100.0);

        this._camera = new vidia.cameras.Spherical({});

        this._shader = new vidia.shaders.Texture(this._scene, {
            url: "/assets/shaders/texture"
        });
        this._scene.setCamera(this._camera);

        this._input = new InputHandler(this);
        this._surface = new Surface(this);

        this.setZoom(0, {noTransition: true});

        this._scene.start();
    }

    //Leaflet API
    Map.prototype.getCenter = function(){
        return this._center;
    }

    Map.prototype.getZoom = function(){
        return this._zoom;
    }

    Map.prototype.getMinZoom = function(){

    }

    Map.prototype.getMaxZoom = function(){

    }

    Map.prototype.getBounds = function(){

    }

    Map.prototype.getBounds = function(){
        return this._bounds;
    }


    Map.prototype.getCamera = function(){
        return this._camera;
    }

    Map.prototype.getScene = function(){
        return this._scene;
    }

    Map.prototype.getShader = function(){
        return this._shader;
    }

    Map.prototype.getWidth = function(){
        return this._width;
    }

    Map.prototype.getHeight = function(){
        return this._height;
    }

    Map.prototype.getMaxCenter = function(){
        return this._maxCenter;
    }

    Map.prototype.getMinCenter = function(){
        return this._minCenter
    }

    Map.prototype.setMaxCenter = function(maxCenter){
        this._maxCenter = maxCenter;
    }

    Map.prototype.setMinCenter = function(minCenter){
        this._minCenter = minCenter;
    }

    Map.prototype.zoomIn = function(options){
        this.setZoom(this._zoom + 1, options);
    }

    Map.prototype.zoomOut = function(options){
        this.setZoom(this._zoom - 1, options);
    }

    var LAT_INC = 20,
        LNG_INC = 30.1;

    Map.prototype.moveUp = function(){
        this.panBy({lat: LAT_INC, lng: 0});
    }

    Map.prototype.moveDown = function(){
        this.panBy({lat: -LAT_INC, lng: 0});
    }

    Map.prototype.moveRight = function(){
        this.panBy({lat: 0, lng: LNG_INC});
    }

    Map.prototype.moveLeft = function(){
        this.panBy({lat: 0, lng: -LNG_INC});
    }


    Map.prototype.panBy = function(latlng, options){
        this.panTo(this._center.add(latlng), options);
    }

    Map.prototype.panTo = function(latlng, options){
        var transition;
        options || (options = {});
        transition = options.transition;
        (latlng.lat > this._maxCenter.lat) && (latlng.lat = this._maxCenter.lat);
        (latlng.lat < this._minCenter.lat) && (latlng.lat = this._minCenter.lat);
        (latlng.lng > this._maxCenter.lng) && (latlng.lng = this._maxCenter.lng);
        (latlng.lng < this._minCenter.lng) && (latlng.lng = this._minCenter.lng);
        this._center = latlng;
        if(!transition && !options.noTransition){
            transition = new vidia.Transition(vidia.Transition.LINEAR, 500, {});
        }
        updateBounds.call(this);
        this._camera.setLatitudeLongitude(latlng.lat, latlng.lng, transition);
        this._surface.update();
    }

    Map.prototype.setZoom = function(zoom, options){
        var glZoom, transition;

        zoom > this._maxZoom && (zoom = this._maxZoom);
        zoom < this._minZoom && (zoom = this._minZoom);

        if(zoom < 2 && (this._zoom >= 2 || this._zoom === undefined)){
            this._exMinCenter = this._minCenter;
            this._exMaxCenter = this._maxCenter;
            this.setMaxCenter({lng: 360, lat: 45});
            this.setMinCenter({lng: -360, lat: -45});
        }else if(zoom >=2 && this._zoom < 2){
            this.setMaxCenter(this._exMinCenter);
            this.setMaxCenter(this._exMaxCenter);
        }
        this._zoom = zoom;

        glZoom = 1.001 + 3 * 1/Math.pow(2, this._zoom);
        options || (options = {});
        transition = options.transition;
        if(!transition && !options.noTransition){
            transition = new vidia.Transition(vidia.Transition.LINEAR, 200, {});
        }
        this._camera.setZoom(2);
        updateBounds.call(this);
        this._surface.update();
    }

    function updateBounds(){
        var north = LatLng.fromXY(this, this._width/2, 0, true),
            east = LatLng.fromXY(this, this._width, this._height/2, true),
            west = LatLng.fromXY(this, 0, this._height/2, true),
            south = LatLng.fromXY(this, this._width/2, this._height, true),
            southWest = new LatLng(south.lat, west.lng),
            northEast = new LatLng(north.lat, east.lng);

        try{
            LatLng.getBounds(this);
        }catch(ex){
            console.log(ex);
        }
        if(Math.abs(north.lng - south.lng) > 178){
            southWest.lng = -180;
            northEast.lng = 180;
            if(Math.abs(north.lat) > Math.abs(south.lat)){
                northEast.lat = 89;
            }else{
                southWest.lat = -89;
            }
        }
        this._bounds = new LatLngBounds(southWest, northEast);
//        console.log(southWest, northEast);
    }
});