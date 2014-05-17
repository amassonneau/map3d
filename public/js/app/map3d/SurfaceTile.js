define(function(require, exports, module){
    module.exports = SurfaceTile;

    var vidia = require("vidia/index"),
        objectUtils = require("./utils/objects"),
        SceneObject = vidia.SceneObject;

    objectUtils.inherit(SurfaceTile, SceneObject);

    function SurfaceTile(scene, options){
        SceneObject.call(this, scene, options);
    }
})