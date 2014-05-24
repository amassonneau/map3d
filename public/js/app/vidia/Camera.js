define(function(require, exports, module){
    module.exports = Camera;

    var glMatrix = require("gl-matrix"),
        mat4 = glMatrix.mat4;

    function Camera(options){
        this._options = options || {};
        this._transform = mat4.create();
        this._position = null;
        this._direction = null;
        this._up = null;
        mat4.identity(this._transform);
    }

    Camera.prototype.lookAt = function(position, direction, up){
        mat4.identity(this._transform);
        this._position = position;
        this._direction = direction;
        this._up = up;
        mat4.lookAt( this._transform, position, direction, up);
    };

    Camera.prototype.getTransform = function(){
        return this._transform;
    };

    Camera.prototype.getPosition = function(){
        return this._position;
    };

    Camera.prototype.getDirection = function(){
        return this._direction;
    };

    Camera.prototype.getUp = function(){
        return this._up;
    };

})