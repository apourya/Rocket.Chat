function module(t,r,o){o.export({secondsToHHMMSS:function(){return n}});var n=function(t){"number"!=typeof t&&(t=parseFloat(t));var r=Math.floor(t/3600),o=Math.floor((t-3600*r)/60),n=Math.round(t-3600*r-60*o);return r.toString().padStart(2,"0")+":"+o.toString().padStart(2,"0")+":"+n.toString().padStart(2,"0")}}
//# sourceMappingURL=/dynamic/lib/utils/d7fdc9b0121c847f5a40b487999749b4e1210e2d.map
