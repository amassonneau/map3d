define(function(require, exports, module){
    module.exports = InputHandler;

    var $ = require("jquery"),
        LatLng = require("./LatLng"),
        KEY_ARROW_LEFT = 37,
        KEY_ARROW_UP = 38,
        KEY_ARROW_RIGHT = 39,
        KEY_ARROW_DOWN = 40,
        WHEEL_THRESHOLD = 0.1;

    function InputHandler(map){
        var that = this;

        this.map = map;
        this._isMouseDown = false;
        this._hasMoved = true;
        this._startPoint = null;
        this._startCenter = null;


        window.addEventListener("mousedown",  function(){
            onMouseDown.apply(that, arguments);
        });
        window.addEventListener("mousemove", function(){
            onMouseMove.apply(that, arguments);
        });
        window.addEventListener("mouseup", function(){
            onMouseUp.apply(that, arguments);
        });
        window.addEventListener("click", function(){
            onClick.apply(that, arguments);
        });
        window.addEventListener("keyup",  function(){
            onKeyUp.apply(that, arguments);
        });
        window.addEventListener("mousewheel",  function(){
            onMouseWheel.apply(that, arguments);
        });
    }


    function onClick(e){
        var latlng;
        if(this._hasMoved){
            this._hasMoved = false;
            return;
        }
        latlng = LatLng.fromXY(this.map, e.clientX, e.clientY);
        if(!latlng){
            return;
        }
        this.map.panTo(latlng);
    }

    function onMouseDown(e){
        this._isMouseDown = true;
    }

    function onMouseMove(e){
        var latlng;
        if(!this._isMouseDown){
            return;
        }
        latlng = LatLng.fromXY(this.map, e.clientX, e.clientY);
        if(!latlng){
            return;
        }
        if(!this._startPoint){
            this._startPoint = latlng;
            this._startCenter = this.map.getCenter();
            return;
        }
        var rotation = this.map.getCenter().subtract(this._startCenter),
            diff = latlng.subtract(rotation).subtract(this._startPoint);
        this.map.panTo(this._startCenter.subtract(diff), {noTransition: true});
        this._hasMoved = true;
    }

    function onMouseUp(e){
        //onClick takes care of unsetting hasmoved
        this._isMouseDown = false;
        this._startPoint = null;
        this._startCenter = null;
        console.log(this.map.getCenter());

        return false;
    }

    function onKeyUp(e){
        e.preventDefault();
        if(e.keyCode === KEY_ARROW_RIGHT){
            this.map.moveRight();
        }else if(e.keyCode === KEY_ARROW_LEFT){
            this.map.moveLeft();
        }else if(e.keyCode === KEY_ARROW_UP){
            this.map.moveUp();
        }else if(e.keyCode === KEY_ARROW_DOWN){
            this.map.moveDown();
        }
    }

    function onMouseWheel(e){
        if(e.deltaY < -WHEEL_THRESHOLD){
            this.map.zoomIn();
        }else if(e.deltaY > WHEEL_THRESHOLD){
            this.map.zoomOut();
        }
        if(e.deltaX < -WHEEL_THRESHOLD){
            this.map.moveUp();
        }else if(e.deltaX > WHEEL_THRESHOLD){
            this.map.moveDown();
        }
    }

});