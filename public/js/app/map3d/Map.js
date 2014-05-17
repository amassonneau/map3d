define(function(require, exports, module){
    module.exports = Map;

    var vidia = require("vidia/index"),
        Surface = require("./Surface"),
        LatLng = require("./LatLng"),
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


        this._scene = new vidia.Scene(this.canvas, {
            width: this.getWidth(),
            height: this.getHeight()
        });
        this._scene.setPerspective(45, 0.001, 100.0);

        this._camera = new vidia.cameras.Spherical({
            max: {lng: null, lat: 45},
            min: {lng: null, lat: 45}
        });

        this._shader = new vidia.shaders.Mesh(this._scene, {
            url: "/assets/shaders/mesh"
        });
        this._scene.setCamera(this._camera);

        this._input = new InputHandler(this);
        this._surface = new Surface(this);

        this.setZoom(0, {noTransition: true});

        this._scene.start();
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

    Map.prototype.getCenter = function(){
        return this._center;
    }

    Map.prototype.getZoom = function(){
        return this._zoom;
    }

    Map.prototype.setZoom = function(zoom, options){
        this._zoom = zoom;
        setZoom.call(this, options);
    }

    Map.prototype.zoomIn = function(options){
        this._zoom++;
        setZoom.call(this, options);
    }

    Map.prototype.zoomOut = function(options){
        this._zoom--;
        setZoom.call(this, options);
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
        this._center = latlng;
        if(!transition && !options.noTransition){
            transition = new vidia.Transition(vidia.Transition.LINEAR, 500, {});
        }
        this._camera.setLatitudeLongitude(latlng.lat, latlng.lng, transition);
        this._surface.update();
    }

    function setZoom(options){
        if(this._zoom > this._maxZoom){
            this._zoom = this._maxZoom;
        }
        if(this._zoom < this._minZoom){
            this._zoom = this._minZoom;
        }
        var glZoom = 1.001 + 4 * 1/Math.pow(4, this._zoom),
            transition;
        options || (options = {});
        transition = options.transition;
        if(!transition && !options.noTransition){
            transition = new vidia.Transition(vidia.Transition.LINEAR, 200, {});
        }
        this._camera.setZoom(glZoom, transition);
        this._surface.update();
    }
});