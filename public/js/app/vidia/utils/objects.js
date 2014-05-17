define(function(require, exports, module){
    var objectUtils = module.exports = {};

    var breaker = {},
        ArrayProto = Array.prototype;

    //Thank you underscore
    objectUtils.inherit = function(obj) {
        each(ArrayProto.slice.call(arguments, 1), function(source) {
            if (source && source.prototype) {
                for (var prop in source.prototype) {
                    obj.prototype[prop] = source.prototype[prop];
                }
            }
        });
        return obj;
    };

    var each = function(obj, iterator, context) {
        if (obj == null) return obj;
        if (ArrayProto.forEach && obj.forEach === ArrayProto.forEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, length = obj.length; i < length; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            var keys = _.keys(obj);
            for (var i = 0, length = keys.length; i < length; i++) {
                if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
            }
        }
        return obj;
    };
});