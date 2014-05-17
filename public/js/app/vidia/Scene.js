define(function(require, exports, module){
    module.exports = Scene;

    var domUtils = require("./utils/dom"),
        glMatrix = require("gl-matrix"),
        mat4 = glMatrix.mat4;

    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    function Scene(el, options){
        if(!domUtils.isCanvas(el)){
            throw "Invalid canvas element.";
        }
        this._gl = el.getContext("experimental-webgl");
        this._options = options || {};
        if(!this._options.width){
            this._options.width = el.width;
        }
        if(!this._options.height){
            this._options.height = el.height;
        }
        this._objects = [];
        this._isStarted = false;
        this._transform = mat4.create();
        mat4.identity(this._transform);
    }

    Scene.prototype.addObject = function(object){
        if(this._objects.indexOf(object) !== -1){
            return;
        }
        this._objects.push(object);
    };

    Scene.prototype.removeObject = function(object){
        var index = this._objects.indexOf(object);
        if(index === -1){
            return;
        }
        this._objects.splice(index, 1);
    }

    Scene.prototype.setCamera = function(camera){
        this._camera = camera;
    };

    Scene.prototype.getCamera = function(){
        return this._camera;
    };

    Scene.prototype.getWidth = function(){
        return this._options.width;
    };

    Scene.prototype.getHeight = function(){
        return this._options.height;
    };

    Scene.prototype.setPerspective = function(angle, min, max){
        mat4.perspective(this._transform, angle, this.getWidth()/this.getHeight(), min, max);
    };

    Scene.prototype.getTransform = function(){
        return this._transform;
    }

    Scene.prototype.start = function(){
        if(!this._camera){
            throw "The camera must be set before the scene can be started";
        }
        if(this._isStarted){
            return;
        }
        this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this._gl.enable(this._gl.DEPTH_TEST);
        this._isStarted = true;
        tick.apply(this);
    };

    Scene.prototype.stop = function(){
        this._isStarted = false;
    };

    Scene.prototype.getGL = function(){
        return this._gl;
    };

    function tick(){
        var that = this, gl = this.getGL();
        if(!this._isStarted){
            return;
        }
        gl.viewport(0, 0, this._options.width, this._options.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for(var i = 0; i < this._objects.length; i++){
            this._objects[i].render();
        }
        requestAnimationFrame(function(){
            tick.apply(that);
        });
    };
});