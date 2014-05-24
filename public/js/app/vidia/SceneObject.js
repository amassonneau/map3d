define(function(require, exports, module){
    module.exports = SceneObject;

    var glMatrix = require("gl-matrix"),
        mat4 = glMatrix.mat4;

    function SceneObject(scene, options){
        if(!scene){
            throw "You must initialize a scene object within a scene.";
        }
        this._options = options || {};
        this._scene = scene;
        this._transform = mat4.create();
        this._shader = null;
        this._geometry = null;
        this._texture = null;
        this.reset();
        this.setGeometry(options.geometry);
        this.setShader(options.shader);
        this.setTexture(options.texture);
    }

    SceneObject.prototype.setGeometry = function(geometry){
        this._geometry = geometry;
    };

    SceneObject.prototype.setShader = function(shader){
        this._shader = shader;
    };

    SceneObject.prototype.setTexture = function(texture){
        this._texture = texture;
    };

    SceneObject.prototype.reset = function(){
        mat4.identity(this._transform);
    };

    SceneObject.prototype.translate = function(definition){
        mat4.translate(this._transform, [definition.x || 0, definition.y || 0, definition.z || 0]);
    };

    SceneObject.prototype.rotate = function(angle, axis){
        mat4.rotate(this._transform, this._transform, angle, axis);
    };

    SceneObject.prototype.getGeometry = function(){
        return this._geometry;
    };

    SceneObject.prototype.getTexture = function(){
        return this._texture;
    };

    SceneObject.prototype.render = function(){
        this._shader.render(this);
    };

    SceneObject.prototype.getTransform = function(){
        return this._transform;
    };

    SceneObject.prototype.destroy = function(){
        this._options = null;
        this._transform = null;
        this._shader = null;
        this._geometry = null;
    };
});