function module(e,n,o){o.export({getAvatarURL:function(){return a}}),o.link("./getURL",{getURL:function(e){t=e}},0);var t,a=function(e){var n=e.username,o=e.roomId,a=e.cache;return n?t("/avatar/"+encodeURIComponent(n)+(a?"?etag="+a:"")):o?t("/avatar/room/"+encodeURIComponent(o)+(a?"?etag="+a:"")):void 0}}
//# sourceMappingURL=/dynamic/app/utils/client/352ea06e6ce05ad63ca25418986772741d25042c.map
