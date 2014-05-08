(function(){
    var textureFlare0 = THREE.ImageUtils.loadTexture( "textures/lensflare0.png" );
    var textureFlare2 = THREE.ImageUtils.loadTexture( "textures/lensflare2.png" );
    var textureFlare3 = THREE.ImageUtils.loadTexture( "textures/lensflare3.png" );

    var Light = window.Leaflet3d.Light = function(leaflet){
        this.leaflet = leaflet;

        this.ambient = new THREE.AmbientLight( 0xffffff );
        this.ambient.color.setHSL( 0.08, 0.1, 0.1 );
        this.leaflet.scene.add(this.ambient );

        this.directional = new THREE.DirectionalLight( 0xffffff, 0.125 );
        this.directional.position.x = -5000;
        this.directional.color.setHSL( 0.1, 0.7, 0.5 );
        this.leaflet.scene.add( this.directional );

    }


    Light.prototype.add = function( h, s, l, x, y, z ) {
        var light = new THREE.PointLight( 0xffffff, 1.5, 4500),
            flareColor = new THREE.Color( 0xffffff),
            lensFlare = new THREE.LensFlare( textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor );

        light.color.setHSL( h, s, l );
        light.position.set( x, y, z );
        this.leaflet.scene.add( light );

        flareColor.setHSL( h, s, l + 0.5 );

        lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
        lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
        lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );

        lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
        lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
        lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
        lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );

        lensFlare.customUpdateCallback = $.proxy(function( object ) {

            var f, fl = object.lensFlares.length;
            var flare;
            var vecX = -object.positionScreen.x * 2;
            var vecY = -object.positionScreen.y * 2;


            for( f = 0; f < fl; f++ ) {

                flare = object.lensFlares[ f ];

                flare.x = object.positionScreen.x + vecX * flare.distance;
                flare.y = object.positionScreen.y + vecY * flare.distance;

                flare.rotation = 0;

            }

            object.lensFlares[ 2 ].y += 0.025;
            object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );

        }, this);
        lensFlare.position = light.position;

        this.leaflet.scene.add( lensFlare );

    }
})()