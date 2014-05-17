define(function(require, exports, module){
    module.exports = Camera;

    var glMatrix = require("gl-matrix"),
        mat4 = glMatrix.mat4;

    function Camera(options){
        this._options = options || {};
        this._transform = mat4.create();
        mat4.identity(this._transform);
    }

    Camera.prototype.lookAt = function(position, direction, up){
        mat4.identity(this._transform);
        mat4.lookAt( this._transform, position, direction, up);
    };

    Camera.prototype.getTransform = function(){
        return this._transform;
    };

})