define(function(require, exports, module){
    var math = module.exports = {};

    math.mod = {};
    math.mod.distance = function(start, end, max){
        start += max;
        end += max;
        if(Math.abs(end-start) > max){
            return end > start ? end - start - 2*max  : end + 2*max - start;
        }else{
            return end - start;
        }
    };
})