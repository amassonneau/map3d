define(function(require, exports, module){
    module.exports = Texture;

    function Texture(scene, options){
        this._options = options || {};
        this._scene = scene;
        if(this._options.image){
            this.setImage(this._options.image);
        }
    }

    Texture.prototype.setImage = function(image){
        var that = this;
        this._image = image;
        if(image.complete){
            this._isLoaded = true;
            return;
        }
        this._image.onload = function(){
            that._image.onload = null;
            that._isLoaded = true;
        }
    };

    Texture.prototype.getImage = function(){
        return this._image;
    }

    Texture.prototype.isLoaded = function(){
        return this._isLoaded;
    };

    Texture.prototype.setShader = function(shader){
        this.shader = shader;
    };

    Texture.prototype.buffer = function(shader){
        if(shader){
            this._shader = shader;
        }
        if(!this._shader){
            throw "A shader must be set before the the Texture can be buffered";
        }
        this._buffers = this._shader.bufferTexture(this);
        this._image = null;
    };

    Texture.prototype.getBuffers = function(){
        return this._buffers;
    };

    Texture.prototype.isBuffered = function(){
        return !!this._buffers;
    };
})