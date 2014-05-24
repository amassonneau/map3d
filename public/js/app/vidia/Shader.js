define(function(require, exports, module){
    module.exports = Shader;

    var jQuery = require("jquery");

    function Shader(scene, options){
        if(!scene){
            throw "You must initialize a shader within a scene.";
        }
        this._scene = scene;
        this._options = options;
        this._fragmentStr = null;
        this._vertexStr = null;
        this._program = null;
        this._error = null;
        this._isFetched = false;
        this._isCompiled = false;
    }

    Shader.prototype.fetch = function(){
        var that = this;
        if(this._isFetched || this._error){
            return finalize(this._error);
        }
        this._isFetched = true;
        jQuery.ajax(this._options.url, {
            async: false,
            success: function(data){
                onload(null, data);
            },
            error: function(data){
                onload(data);
            }
        });

        function onload(err, data){
            if(err){
                return finalize("Error loading the shader");
            }
            var codes = data.replace(":vertex", "").split(":fragment");
            if(codes.length !== 2){
                return finalize("The shader is in an invalid format")
            }
            that._vertexStr = codes[0];
            that._fragmentStr = codes[1];
            finalize();
        }

        function finalize(err){
            if(err){
                that._error = err;
                throw err
            }
        }
    };

    Shader.prototype.compile = function(){
        if(this._error){
            throw this._error;
        }
        if(!this._isFetched){
            this.fetch();
        }
        if(this._isCompiled){
            return;
        }
        var gl = this._scene.getGL(),
            fragmentShader = gl.createShader(gl.FRAGMENT_SHADER),
            vertexShader = gl.createShader(gl.VERTEX_SHADER);

        gl.shaderSource(fragmentShader, this._fragmentStr);
        gl.compileShader(fragmentShader);

        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            this._error = gl.getShaderInfoLog(fragmentShader);
            throw this._error;
        }

        gl.shaderSource(vertexShader, this._vertexStr);
        gl.compileShader(vertexShader);

        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            this._error = gl.getShaderInfoLog(vertexShader);
            throw this._error;
        }

        this._program = gl.createProgram();
        gl.attachShader(this._program, vertexShader);
        gl.attachShader(this._program, fragmentShader);
        gl.linkProgram(this._program);

        if (!gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
            this._error = "Could not initialize the shaders";
            throw this._error;
        }
        gl.useProgram(this._program);
        this._isCompiled = true;
    };

    Shader.prototype.render = function(sceneObject){
        if(!this.isCompiled()){
            this.compile();
        }
        if(!sceneObject.getGeometry().isBuffered()){
            sceneObject.getGeometry().buffer(this);
        }
        if(sceneObject.getTexture()){
            if(!sceneObject.getTexture().isLoaded()){
                return false;
            }
            if(!sceneObject.getTexture().isBuffered()){
                sceneObject.getTexture().buffer(this);
            }
        }
    }

    Shader.prototype.buffer = function(geometry){
        throw "This method should be overriden";
    }

    Shader.prototype.bufferTexture = function(texture){
        throw "This method should be overriden";
    }

    Shader.prototype.unbuffer = function(geometry){
        throw "This method should be overriden";
    }


    Shader.prototype.isCompiled = function(){
        return !!this._isCompiled;
    }

    Shader.prototype.isFetched = function(){
        return !!this._isFetched;
    }

});