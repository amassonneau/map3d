(function(){
    var EPS = 0.000001;
    var STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

    var changeEvent = { type: 'change' };
    var startEvent = { type: 'start'};
    var endEvent = { type: 'end'};

    THREE.OrbitControls = function ( camera, domElement ) {
        var that = this;
        this.camera = camera;
        this.domElement = ( domElement !== undefined ) ? domElement : document;

        // API

        // Set to false to disable this control
        this.enabled = true;

        // "target" sets the location of focus, where the control orbits around
        // and where it pans with respect to.
        this.target = new THREE.Vector3();

        // center is old, deprecated; use "target" instead
        this.center = this.target;

        // This option actually enables dollying in and out; left as "zoom" for
        // backwards compatibility
        this.noZoom = false;
        this.zoomSpeed = 1.0;

        // Limits to how far you can dolly in and out
        this.minDistance = 0;
        this.maxDistance = Infinity;

        // Set to true to disable this control
        this.noRotate = false;
        this.rotateSpeed = 1.0;

        // Set to true to disable this control
        this.noPan = false;
        this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

        // Set to true to automatically rotate around the target
        this.autoRotate = false;
        this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

        // How far you can orbit vertically, upper and lower limits.
        // Range is 0 to Math.PI radians.
        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians

        // Set to true to disable use of the keys
        this.noKeys = false;

        // The four arrow keys
        this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

        ////////////
        // internals

        this.rotateStart = new THREE.Vector2();
        this.rotateEnd = new THREE.Vector2();
        this.rotateDelta = new THREE.Vector2();

        this.panStart = new THREE.Vector2();
        this.panEnd = new THREE.Vector2();
        this.panDelta = new THREE.Vector2();
        this.panOffset = new THREE.Vector3();

        this.offset = new THREE.Vector3();

        this.dollyStart = new THREE.Vector2();
        this.dollyEnd = new THREE.Vector2();
        this.dollyDelta = new THREE.Vector2();

        this.pan = new THREE.Vector3();
        this.lastPosition = new THREE.Vector3();



        this.state = STATE.NONE;

        // for reset

        this.scale = 1;
        this.phiDelta = 0;
        this.thetaDelta = 0;

        this.target0 = this.target.clone();
        this.position0 = this.camera.position.clone();



        this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
        this.domElement.addEventListener( 'mousedown', function(event){
            that._onMouseDown(event);
        }, false );
        this.domElement.addEventListener( 'mouseup', function(event){
            that._onMouseUp(event);
        }, false );
        this.domElement.addEventListener( 'mousemove', function(event){
            that._onMouseMove(event);
        }, false );
        this.domElement.addEventListener( 'mousewheel', function(event){
            that._onMouseWheel(event);
        }, false );
        this.domElement.addEventListener( 'DOMMouseScroll', function(event){
            that._onMouseWheel(event);
        }, false );
        this.domElement.addEventListener( 'touchstart', function(event){
            that._onTouchStart(event);
        }, false );
        this.domElement.addEventListener( 'touchend', function(event){
            that._onTouchEnd(event);
        }, false );
        this.domElement.addEventListener( 'touchmove', function(event){
            that._onTouchMove(event);
        }, false );
        window.addEventListener( 'keydown', function(event){
            that._onKeyDown(event);
        }, false );

    };

    THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
    _.extend(THREE.OrbitControls.prototype, window.EventEmitter2.prototype);

    THREE.OrbitControls.prototype.rotateLeft = function ( angle ) {
        if ( angle === undefined ) {
            angle = this.getAutoRotationAngle();
        }
        if(angle){
            this.trigger("rotate", angle, 0);
        }
        this.thetaDelta -= angle;
    };

    THREE.OrbitControls.prototype.rotateUp = function ( angle ) {
        if ( angle === undefined ) {
            angle = this.getAutoRotationAngle();
        }
        if(angle){
            this.trigger("rotate", 0, angle);
        }
        this.phiDelta -= angle;
    };

    // pass in distance in world space to move left
    THREE.OrbitControls.prototype.panLeft = function ( distance ) {
        var te = this.camera.matrix.elements;
        // get X column of matrix
        this.panOffset.set( te[ 0 ], te[ 1 ], te[ 2 ] );
        this.panOffset.multiplyScalar( - distance );

        this.pan.add( this.panOffset );
    };

    // pass in distance in world space to move up
    THREE.OrbitControls.prototype.panUp = function ( distance ) {
        var te = this.camera.matrix.elements;
        // get Y column of matrix
        this.panOffset.set( te[ 4 ], te[ 5 ], te[ 6 ] );
        this.panOffset.multiplyScalar( distance );

        this.pan.add( this.panOffset );
    };

    // pass in x,y of change desired in pixel space,
    // right and down are positive
    THREE.OrbitControls.prototype.pan = function ( deltaX, deltaY ) {
        var element = this.domElement === document ? this.domElement.body : this.domElement;

        if ( this.camera.fov !== undefined ) {
            // perspective
            var position = this.camera.position;
            var offset = position.clone().sub( this.target );
            var targetDistance = offset.length();

            // half of the fov is center to top of screen
            targetDistance *= Math.tan( ( this.camera.fov / 2 ) * Math.PI / 180.0 );

            // we actually don't use screenWidth, since perspective camera is fixed to screen height
            this.panLeft( 2 * deltaX * targetDistance / element.clientHeight );
            this.panUp( 2 * deltaY * targetDistance / element.clientHeight );

        } else if ( this.camera.top !== undefined ) {
            // orthographic
            this.panLeft( deltaX * (this.camera.right - this.camera.left) / element.clientWidth );
            this.panUp( deltaY * (this.camera.top - this.camera.bottom) / element.clientHeight );
        } else {
            // camera neither orthographic or perspective
            console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
        }
    };

    THREE.OrbitControls.prototype.dollyIn = function ( dollyScale ) {
        if ( dollyScale === undefined ) {
            dollyScale = this.getZoomScale();
        }
        this.scale /= dollyScale;
    };

    THREE.OrbitControls.prototype.dollyOut = function ( dollyScale ) {
        if ( dollyScale === undefined ) {
            dollyScale = this.getZoomScale();
        }
        this.scale *= dollyScale;
    };

    THREE.OrbitControls.prototype.update = function () {
        var position = this.camera.position;

        this.offset.copy( position ).sub( this.target );

        // angle from z-axis around y-axis

        var theta = Math.atan2( this.offset.x, this.offset.z );

        // angle from y-axis

        var phi = Math.atan2( Math.sqrt( this.offset.x * this.offset.x + this.offset.z * this.offset.z ), this.offset.y );

        if ( this.autoRotate ) {
            this.rotateLeft( this.getAutoRotationAngle() );
        }

        theta += this.thetaDelta;
        phi += this.phiDelta;

        // restrict phi to be between desired limits
        phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

        // restrict phi to be betwee EPS and PI-EPS
        phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

        var radius;

        // restrict radius to be between desired limits
        radius = Math.max( this.minDistance, Math.min( this.maxDistance,  this.radius ) );

        // move target to panned location
        this.target.add( this.pan );

        this.offset.x = radius * Math.sin( phi ) * Math.sin( theta );
        this.offset.y = radius * Math.cos( phi );
        this.offset.z = radius * Math.sin( phi ) * Math.cos( theta );

        position.copy( this.target ).add( this.offset );

        this.camera.lookAt( this.target );

        this.thetaDelta = 0;
        this.phiDelta = 0;
        this.scale = 1;
        this.pan.set( 0, 0, 0 );

        if ( this.lastPosition.distanceTo( this.camera.position ) > 0 ) {
            this.trigger( "change", changeEvent );
            this.lastPosition.copy( this.camera.position );
        }

    };

    THREE.OrbitControls.prototype.reset = function () {
        this.state = STATE.NONE;

        this.target.copy( this.target0 );
        this.camera.position.copy( this.position0 );

        this.update();

    };


    THREE.OrbitControls.prototype.getAutoRotationAngle = function() {
        return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
    }

    THREE.OrbitControls.prototype.getZoomScale = function() {
        return Math.pow( 0.95, this.zoomSpeed );
    }

    THREE.OrbitControls.prototype._onMouseDown = function( event ) {
        if ( this.enabled === false ) return;
        event.preventDefault();

        if ( event.button === 0 ) {
            if ( this.noRotate === true ) return;

            this.state = STATE.ROTATE;

            this.rotateStart.set( event.clientX, event.clientY );

        } else if ( event.button === 1 ) {
            if ( this.noZoom === true ) return;

            this.state = STATE.DOLLY;

            this.dollyStart.set( event.clientX, event.clientY );

        } else if ( event.button === 2 ) {
            if ( this.noPan === true ) return;

            this.state = STATE.PAN;

            this.panStart.set( event.clientX, event.clientY );

        }
        this.trigger( startEvent );
    }

    THREE.OrbitControls.prototype._onMouseMove = function( event ) {
        if ( this.enabled === false ) return;

        event.preventDefault();

        var element = this.domElement === document ? this.domElement.body : this.domElement;

        if ( this.state === STATE.ROTATE ) {
            if ( this.noRotate === true ) return;

            this.rotateEnd.set( event.clientX, event.clientY );
            this.rotateDelta.subVectors( this.rotateEnd, this.rotateStart );

            // rotating across whole screen goes 360 degrees around
            this.rotateLeft( 2 * Math.PI * this.rotateDelta.x / element.clientWidth * this.rotateSpeed );

            // rotating up and down along whole screen attempts to go 360, but limited to 180
            this.rotateUp( 2 * Math.PI * this.rotateDelta.y / element.clientHeight * this.rotateSpeed );

            this.rotateStart.copy( this.rotateEnd );

        } else if ( this.state === STATE.DOLLY ) {
            if ( this.noZoom === true ) return;

            this.dollyEnd.set( event.clientX, event.clientY );
            this.dollyDelta.subVectors( this.dollyEnd, this.dollyStart );

            if ( this.dollyDelta.y > 0 ) {
                this.dollyIn();
            } else {
                this.dollyOut();
            }
            this.dollyStart.copy( this.dollyEnd );

        } else if ( this.state === STATE.PAN ) {

            if ( this.noPan === true ) return;

            this.panEnd.set( event.clientX, event.clientY );
            this.panDelta.subVectors( this.panEnd, this.panStart );

            this.pan( this.panDelta.x, this.panDelta.y );

            this.panStart.copy( this.panEnd );

        }

        this.update();

    }

    THREE.OrbitControls.prototype._onMouseUp = function( /* event */ ) {

        if ( this.enabled === false ) return;

        this.trigger( endEvent );
        this.state = STATE.NONE;
    }

    THREE.OrbitControls.prototype._onMouseWheel = function( event ) {

        if ( this.enabled === false || this.noZoom === true ) return;

        event.preventDefault();

        var delta = 0;

        if ( event.wheelDelta !== undefined ) { // WebKit / Opera / Explorer 9

            delta = event.wheelDelta;

        } else if ( event.detail !== undefined ) { // Firefox

            delta = - event.detail;

        }

        if ( delta > 0 ) {

            this.dollyOut();

        } else {

            this.dollyIn();

        }

        this.update();
        this.trigger( startEvent );
        this.trigger( endEvent );

    }

    THREE.OrbitControls.prototype._onKeyDown = function( event ) {

        if ( this.enabled === false || this.noKeys === true || this.noPan === true ) return;

        switch ( event.keyCode ) {

            case this.keys.UP:
                this.pan( 0, this.keyPanSpeed );
                this.update();
                break;

            case this.keys.BOTTOM:
                this.pan( 0, - this.keyPanSpeed );
                this.update();
                break;

            case this.keys.LEFT:
                this.pan( this.keyPanSpeed, 0 );
                this.update();
                break;

            case this.keys.RIGHT:
                this.pan( - this.keyPanSpeed, 0 );
                this.update();
                break;

        }

    }

    THREE.OrbitControls.prototype._onTouchStart = function( event ) {

        if ( this.enabled === false ) return;

        switch ( event.touches.length ) {

            case 1:	// one-fingered touch: rotate

                if ( this.noRotate === true ) return;

                this.state = STATE.TOUCH_ROTATE;

                this.rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                break;

            case 2:	// two-fingered touch: dolly

                if ( this.noZoom === true ) return;

                this.state = STATE.TOUCH_DOLLY;

                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                var distance = Math.sqrt( dx * dx + dy * dy );
                this.dollyStart.set( 0, distance );
                break;

            case 3: // three-fingered touch: pan

                if ( this.noPan === true ) return;

                this.state = STATE.TOUCH_PAN;

                this.panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                break;

            default:

                this.state = STATE.NONE;

        }
        this.trigger( startEvent );
    }

    THREE.OrbitControls.prototype._onTouchMove = function( event ) {
        if ( this.enabled === false ) return;

        event.preventDefault();
        event.stopPropagation();

        var element = this.domElement === document ? this.domElement.body : this.domElement;

        switch ( event.touches.length ) {

            case 1: // one-fingered touch: rotate

                if ( this.noRotate === true ) return;
                if ( this.state !== STATE.TOUCH_ROTATE ) return;

                this.rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                this.rotateDelta.subVectors( this.rotateEnd, this.rotateStart );

                // rotating across whole screen goes 360 degrees around
                this.rotateLeft( 2 * Math.PI * this.rotateDelta.x / element.clientWidth * this.rotateSpeed );
                // rotating up and down along whole screen attempts to go 360, but limited to 180
                this.rotateUp( 2 * Math.PI * this.rotateDelta.y / element.clientHeight * this.rotateSpeed );

                this.rotateStart.copy( this.rotateEnd );

                this.update();
                break;

            case 2: // two-fingered touch: dolly

                if ( this.noZoom === true ) return;
                if ( this.state !== STATE.TOUCH_DOLLY ) return;

                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                var distance = Math.sqrt( dx * dx + dy * dy );

                this.dollyEnd.set( 0, distance );
                this.dollyDelta.subVectors( this.dollyEnd, this.dollyStart );

                if ( this.dollyDelta.y > 0 ) {
                    this.dollyOut();
                } else {
                    this.dollyIn();
                }
                this.dollyStart.copy( this.dollyEnd );

                this.update();
                break;

            case 3: // three-fingered touch: pan

                if ( this.noPan === true ) return;
                if ( this.state !== STATE.TOUCH_PAN ) return;

                this.panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                this.panDelta.subVectors( this.panEnd, this.panStart );

                this.pan( this.panDelta.x, this.panDelta.y );

                this.panStart.copy( this.panEnd );

                this.update();
                break;
            default:
                this.state = STATE.NONE;
        }

    }

    THREE.OrbitControls.prototype._onTouchEnd = function( /* event */ ) {
        if ( this.enabled === false ) return;

        this.trigger( endEvent );
        this.state = STATE.NONE;
    }
})()
