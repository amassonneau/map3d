(function(){
    var Earth = window.Leaflet3d.Earth = function(leaflet){
        this.leaflet = leaflet;
        this.glm = this.leaflet.glm;
        this.gl = this.glm.gl;
        this._latitudeBands = this._longitudeBands = 30;
        this._radius = 1;
        this.leaflet.glm.add(this);
    }

    Earth.prototype.setZoomLevel = function(zoomLevel){
        this._zoomLevel = zoomLevel;
        this.buffer();
    }

    Earth.prototype.render = function(){
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._triangleVertexPositionBuffer);
        this.gl.vertexAttribPointer(this.glm.getShaderProgram().vertexPositionAttribute, this._triangleVertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._triangleBarycentricPositionBuffer);
        this.gl.vertexAttribPointer(this.glm.getShaderProgram().vertexBarycentricAttribute, this._triangleBarycentricPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

        this.glm.setMatrixUniforms();
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this._triangleVertexPositionBuffer.numItems);
    }

    var barycentricDefinitions = [
        [1.0,  0.0,  0.0],
        [0.0, 1.0,  0.0],
        [0.0, 0.0,  1.0]
    ];

    Earth.prototype.buffer = function(){
        var vertices = [], barycentric = [], odd = false, index = 0;
        for (var latNumber=0; latNumber < this._latitudeBands; latNumber++) {
            for (var longNumber=0; longNumber <= this._longitudeBands; longNumber++) {
                var theta = latNumber * Math.PI / this._latitudeBands;
                var sinTheta = Math.sin(theta);
                var cosTheta = Math.cos(theta);

                var phi = longNumber * 2 * Math.PI / this._longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;

                vertices.push(this._radius * x);
                vertices.push(this._radius * y);
                vertices.push(this._radius * z);
                barycentric = barycentric.concat(barycentricDefinitions[index % 3]);
                if(!odd){
                    latNumber++;
                    longNumber--;
                    odd = true;
                }else{
                    latNumber--;
                    odd = false;
                }
                index++;
            }
        }

        this._triangleVertexPositionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._triangleVertexPositionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        this._triangleVertexPositionBuffer.itemSize = 3;
        this._triangleVertexPositionBuffer.numItems = vertices.length/3;

        this._triangleBarycentricPositionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._triangleBarycentricPositionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(barycentric), this.gl.STATIC_DRAW);
        this._triangleBarycentricPositionBuffer.itemSize = 3;
    };
})()