define(function(require, exports, module){
    module.exports = SurfaceTile;

    var vidia = require("vidia/index"),
        objectUtils = require("./utils/objects"),
        SceneObject = vidia.SceneObject;

    objectUtils.inherit(SurfaceTile, SceneObject);

    function SurfaceTile(scene, options){
        SceneObject.call(this, scene, options);
    }

    SurfaceTile.prototype.getX = function(){
        return this._options.x;
    };

    SurfaceTile.prototype.getY = function(){
        return this._options.y;
    };
});