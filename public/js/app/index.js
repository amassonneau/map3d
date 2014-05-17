requirejs.config({
    baseUrl: '/js/lib',
    paths: {
        "vidia": '/js/app/vidia',
        "map3d": '/js/app/map3d'
    }
});

requirejs(['jquery', 'map3d/index'], function($, map3d){
    $(document).ready(function(){
        var $globe = $(".globe"),
            map = new map3d.Map($globe[0]);
    });
});