(function(){
    window.Leaflet3d = {};
    var Leaflet3d =  window.Leaflet3d.Main = function($el){
        this.$el = $el;
        this.glm = new window.Leaflet3d.GLManager(this.$el);
        this.earth = new window.Leaflet3d.Earth(this);
        this.earth.buffer();
        this.glm.startLoop();
    }
})();