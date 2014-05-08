(function(){
    var OrbitControls = THREE.OrbitControls;

    var zoomLevelInfo = {
        1: {
            radius: 300,
            rotateSpeed: 0.75
        },
        2: {
            radius: 120,
            rotateSpeed: 0.07
        },
        3: {
            radius: 115,
            rotateSpeed: 0.06
        },
        4: {
            radius: 112,
            rotateSpeed: 0.06
        },
        5: {
            radius: 110,
            rotateSpeed: 0.05
        },
        6: {
            radius: 107,
            rotateSpeed: 0.04
        },
        7: {
            radius: 105,
            rotateSpeed: 0.03
        },
        8: {
            radius: 104,
            rotateSpeed: 0.03
        },
        9: {
            radius: 103,
            rotateSpeed: 0.02
        },
        10: {
            radius: 102,
            rotateSpeed: 0.02
        }
    }

    var EarthControls = window.Leaflet3d.EarthControls = function(){
        this.animationTime = 1000;
        this.animationSteps = 100;
        OrbitControls.apply(this, arguments);
        this.setZoomLevel(1);
    }
    _.extend(EarthControls.prototype, OrbitControls.prototype);

    EarthControls.prototype.setZoomLevel = function(zoomlevel){
        if(!zoomlevel){
            zoomlevel = this._zoomLevel;
        }
        if(!zoomLevelInfo[zoomlevel]){
            return;
        }
        var zoominfo = zoomLevelInfo[zoomlevel]
        this._zoomLevel = zoomlevel;
        this.rotateSpeed = zoominfo.rotateSpeed;
        if(!this.radius){
            this.radius = zoominfo.radius;
        }else{
            this._animateZoom(zoominfo.radius);
        }
        this.update();
    }

    EarthControls.prototype.getZoomLevel = function(){
        return this._zoomLevel;
    }

    EarthControls.prototype.dollyIn = EarthControls.prototype.zoomOut = function(){
        if(!zoomLevelInfo[this._zoomLevel-1]){
            return;
        }
        this._zoomLevel--;
        this.setZoomLevel();
    }

    EarthControls.prototype.dollyOut = EarthControls.prototype.zoomIn = function(){
        if(!zoomLevelInfo[this._zoomLevel+1]){
            return;
        }
        this._zoomLevel++;
        this.setZoomLevel();
    }

    EarthControls.prototype._animateZoom = function(radius){
        var that = this, step = 0, increment = (radius - this.radius)/100;
        clearTimeout(that._animateZoomTimeout);
        that.trigger("zoomstart", this._zoomLevel);
        doStep();
        function doStep(){
            that._animateZoomTimeout = setTimeout(function(){
                that.radius += increment;
                that.update();
                if(step++ < that.animationSteps){
                    doStep();
                }else{
                    that.trigger("zoomend", that._zoomLevel);
                }
            }, this.animationTime/this.animationSteps);
        }
    }

})()