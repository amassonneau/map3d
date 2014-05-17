define(function(require, exports, module){
    var domUtils = module.exports = {};

    domUtils.isCanvas =  function(el){
        return el && isDOMElement(el) && el.nodeName.toLowerCase() === "canvas";
    }

    function isDOMElement(o){
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
                o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
            );
    }
});