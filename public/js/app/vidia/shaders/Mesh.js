define(function(require, exports, module){
    module.exports = Mesh;

    var Shader = require("../Shader"),
        glMatrix = require("gl-matrix"),
        mat4 = glMatrix.mat4,
        objectUtils = require("../utils/objects");

    objectUtils.inherit(Mesh, Shader);

    function Mesh(){
        this._transform = mat4.create();
        Shader.apply(this, arguments);
    }

    Mesh.prototype.compile = function(){
        var gl = this._scene.getGL();

        Shader.prototype.compile.call(this);
        this._vertices = gl.getAttribLocation(this._program, "aVertexPosition");
        gl.enableVertexAttribArray(this._vertices);

        this._bcVertices = gl.getAttribLocation(this._program, "aVertexBarycentric");
        gl.enableVertexAttribArray(this._bcVertices);

        this._transformMatrix = gl.getUniformLocation(this._program, "tMatrix");
    };

    Mesh.prototype.buffer = function(geometry){
        var gl = this._scene.getGL(),
            vertices = geometry.getVertices(),
            barycentricVertices = geometry.getBarycentricVertices(),
            buffers = {};

        buffers.vertices = gl.createBuffer();
        buffers.vertices.size = 3;
        buffers.vertices.count = vertices.length/buffers.vertices.size;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


        buffers.bcVertices = gl.createBuffer();
        buffers.bcVertices.size = 3;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.bcVertices);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(barycentricVertices), gl.STATIC_DRAW);

        return buffers;
    }

    Mesh.prototype.unbuffer = function(geometry){
        if(!geometry.getBuffers()){
            return;
        }
        var gl = this._scene.getGL();
        gl.deleteBuffer(geometry.getBuffers().vertices);
        gl.deleteBuffer(geometry.getBuffers().bcVertices);
    }


    Mesh.prototype.render = function(sceneObject){
        Shader.prototype.render.call(this, sceneObject);

        var gl = this._scene.getGL(),
            buffers = sceneObject.getGeometry().getBuffers();

        mat4.identity(this._transform);
        mat4.multiply(this._transform, this._scene.getTransform(), this._scene.getCamera().getTransform());
        mat4.multiply(this._transform, this._transform, sceneObject.getTransform());

        gl.uniformMatrix4fv(this._transformMatrix, false, this._transform);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
        gl.vertexAttribPointer(this._vertices, buffers.vertices.size, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.bcVertices);
        gl.vertexAttribPointer(this._bcVertices, buffers.bcVertices.size, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffers.vertices.count);
    }
});