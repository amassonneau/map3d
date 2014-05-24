define(function(require, exports, module){
    module.exports = {
        Scene: require("./Scene"),
        SceneObject: require("./SceneObject"),
        Geometry: require("./Geometry"),
        Shader: require("./Shader"),
        Camera: require("./Camera"),
        Texture: require("./Texture"),
        Transition: require("./Transition"),
        geometries: require("./geometries/index"),
        shaders: require("./shaders/index"),
        cameras: require("./cameras/index")
    };
});