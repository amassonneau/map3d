(function(){
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    window.Leaflet3d.GLManager = GLManager;
    function GLManager($el){
        this.viewport = $el[0];
        try{
            this.gl = this.viewport.getContext("experimental-webgl");
        }catch(ex){
            throw "WebGL is not supported in your browser";
            return ;
        }

        this._objects = [];
        this._mvMatrix = window.mat4.create();
        this._pMatrix = window.mat4.create();
        this._width = this.viewport.width = this.viewport.clientWidth;
        this._height = this.viewport.height = this.viewport.clientHeight;
        this._shaderProgram = initShaders(this.gl);
    }

    GLManager.prototype.add = function(object){
        if(this._objects.indexOf(object) !== -1){
            return;
        }
        this._objects.push(object);
    }

    GLManager.prototype.startLoop = function(){
        if(this._isStarted){
            return;
        }
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this._isStarted = true;
        tick.apply(this);
    }

    GLManager.prototype.stopLoop = function(){
        this._isStarted = false;
    }

    GLManager.prototype.getShaderProgram = function(){
        return this._shaderProgram;
    }

    GLManager.prototype.setMatrixUniforms = function() {
        this.gl.uniformMatrix4fv(this._shaderProgram.pMatrixUniform, false, this._pMatrix);
        this.gl.uniformMatrix4fv(this._shaderProgram.mvMatrixUniform, false, this._mvMatrix);
    }

    function tick(){
        var min = -4, step = 0.02, max = -1;
        if(!this._isStarted){
            return;
        }
        var time = (new Date()).getTime();
        if(!this._lastTick){
            this.angle = 0;
            this._lastTick = time;
        }
        else if(this._lastTick < time-40){
            this._lastTick = time;
            this.angle = (this.angle - min + step)%(max - min) + min;
            console.log(this.angle);
        }
        this.gl.viewport(0, 0, this._width, this._height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, this._width / this._height, 0.1, 100.0, this._pMatrix);
        mat4.identity(this._mvMatrix);
        mat4.translate(this._mvMatrix, [0, 0, this.angle]);

        for(var i = 0; i < this._objects.length; i++){
            this._objects[i].render();
        }
        window.requestAnimationFrame($.proxy(tick, this));
    }

    function initShaders(gl) {
        var fragmentShader = fetchShader(gl, "shader-fs");
        var vertexShader = fetchShader(gl, "shader-vs");
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexBarycentricAttribute = gl.getAttribLocation(shaderProgram, "aVertexBarycentric");
        gl.enableVertexAttribArray(shaderProgram.vertexBarycentricAttribute);

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        return shaderProgram;
    }

    function fetchShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }
})()