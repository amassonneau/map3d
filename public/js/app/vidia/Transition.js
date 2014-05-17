define(function(require, exports, module){
    module.exports = Transition;

    Transition.LINEAR = "linear";

    var map = {},
        INTERVAL = 1000/60;
    map[Transition.LINEAR] = linear;

    function Transition(type, duration, transitionOptions){
        this._type = type;
        this._steps = duration/INTERVAL;
        this._step = 0;
        this._transitionOptions = transitionOptions;
        this._isStarted = false;
    }

    Transition.prototype.start = function(callback, context){
        var that = this;
        if(this._isStarted){
            return;
        }
        this._isStarted = true;
        this._handle = setInterval(function(){
            if(that._step >= that._steps){
                return that.stop();
            }
            that._step++;
            callback.call(context, map[that._type](that._step/that._steps, that._transitionOptions));
        }, INTERVAL);
    };

    Transition.prototype.stop = function(){
        clearInterval(this._handle);
    }

    function linear(step){
        return step;
    }
});