define(function(require, exports, module){
    module.exports = Texture;

    var Shader = require("../Shader"),
        glMatrix = require("gl-matrix"),
        mat4 = glMatrix.mat4,
        objectUtils = require("../utils/objects");

    objectUtils.inherit(Texture, Shader);

    function Texture(){
        this._transform = mat4.create();
        Shader.apply(this, arguments);
    }

    Texture.prototype.compile = function(){
        var gl = this._scene.getGL();

        Shader.prototype.compile.call(this);
        this._vertices = gl.getAttribLocation(this._program, "vertices");
        gl.enableVertexAttribArray(this._vertices);

        this._uvVertices = gl.getAttribLocation(this._program, "textureCoordinates");
        gl.enableVertexAttribArray(this._uvVertices);

        this._transformMatrix = gl.getUniformLocation(this._program, "tMatrix");
        this._texture = gl.getUniformLocation(this._program, "texture");
    };

    Texture.prototype.buffer = function(geometry){
        var gl = this._scene.getGL(),
            vertices = geometry.getVertices(),
            uvVertices = geometry.getUVVertices(),
            buffers = {};

        buffers.vertices = gl.createBuffer();
        buffers.vertices.size = 3;
        buffers.vertices.count = vertices.length/buffers.vertices.size;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


        buffers.uvVertices = gl.createBuffer();
        buffers.uvVertices.size = 2;
        buffers.uvVertices.count = uvVertices.length / 2;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uvVertices);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvVertices), gl.STATIC_DRAW);


        return buffers;
    };

    Texture.prototype.bufferTexture = function(texture){
        var gl = this._scene.getGL(),
            buffers = {};

        buffers.texture = gl.createTexture();

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture(gl.TEXTURE_2D, buffers.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.getImage());
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);

        return buffers;
    };

    Texture.prototype.unbuffer = function(geometry){
        if(!geometry.getBuffers()){
            return;
        }
        var gl = this._scene.getGL();
        gl.deleteBuffer(geometry.getBuffers().vertices);
        gl.deleteBuffer(geometry.getBuffers().bcVertices);
    };


    Texture.prototype.render = function(sceneObject){
        if(Shader.prototype.render.call(this, sceneObject) === false){
            return;
        }

        var gl = this._scene.getGL(),
            buffers = sceneObject.getGeometry().getBuffers(),
            textureBuffers = sceneObject.getTexture().getBuffers();

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        mat4.identity(this._transform);
        mat4.multiply(this._transform, this._scene.getTransform(), this._scene.getCamera().getTransform());
        mat4.multiply(this._transform, this._transform, sceneObject.getTransform());

        gl.uniformMatrix4fv(this._transformMatrix, false, this._transform);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureBuffers.texture);
        gl.uniform1i(this._texture, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
        gl.vertexAttribPointer(this._vertices, buffers.vertices.size, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uvVertices);
        gl.vertexAttribPointer(this._uvVertices, buffers.uvVertices.size, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffers.vertices.count);
    };
});