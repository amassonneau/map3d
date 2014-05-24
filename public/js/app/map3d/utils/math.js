define(function(require, exports, module){
    var math = module.exports = {};

    math.quadratic = function(A, B, C){
        var  RT = Math.sqrt(Math.pow(B, 2) - (4 * A * C));
        return [(-B + RT) / (2 * A),(-B - RT) / (2 * A)]
    };

    math.mod = {};
    math.mod.distance = function(start, end, max){
        if(Math.abs(end-start) > (max/2)){
            return end > start ? end - start - max  : end + max - start;
        }else{
            return end - start;
        }
    };
})