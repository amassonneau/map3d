define(function(require, exports, module){
    module.exports = Geometry;

    function Geometry(options){
        this._options = options || {};
        this._data = null;
        this._buffers = null;
        this._shader = this._options.shader || null;
    }

    Geometry.prototype.getVertices = function(){
        if(!this._data){
            this.generate();
        }
        if(!this._data || !this._data.vertices){
            throw "This geometry cannot generate vertices. Odd right?";
        }
        return this._data.vertices;
    };

    Geometry.prototype.getBarycentricVertices = function(){
        if(!this._data){
            this.generate();
        }
        if(!this._data || !this._data.bcVertices){
            throw "This geometry cannot generate barycentric vertices.";
        }
        return this._data.bcVertices;
    };

    Geometry.prototype.getUVVertices = function(){
        if(!this._data){
            this.generate();
        }
        if(!this._data || !this._data.uvVertices){
            throw "This geometry cannot generate uv vertices.";
        }
        return this._data.uvVertices;
    };

    Geometry.prototype.generate = function(){
        throw "This method should be overriden";
    };

    Geometry.prototype.setShader = function(shader){
        this.shader = shader;
    }

    Geometry.prototype.buffer = function(shader){
        if(shader){
            this._shader = shader;
        }
        if(!this._shader){
            throw "A shader must be set before the the Geometry can be buffered";
        }
        this._buffers = this._shader.buffer(this);
        this._data = null;
    }

    Geometry.prototype.getBuffers = function(){
        return this._buffers;
    }

    Geometry.prototype.isBuffered = function(){
        return !!this._buffers;
    }

    Geometry.prototype.destroy = function(){
        if(this._shader){
            this._shader.unbuffer(this);
        }
        this._options = null;
        this._data = null
        this._buffers = null;
        this._shader = null;
    }
});