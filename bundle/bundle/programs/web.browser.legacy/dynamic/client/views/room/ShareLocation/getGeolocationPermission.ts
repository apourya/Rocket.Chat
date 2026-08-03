function module(n,o,e){e.export({getGeolocationPermission:function(){return t}});var t=function(){return new Promise(function(n){navigator.permissions||n("granted"),navigator.permissions.query({name:"geolocation"}).then(function(o){n(o.state)})})}}
//# sourceMappingURL=/dynamic/client/views/room/ShareLocation/db5406a9cdbf6ff7ed98b50ae140c6662f03b057.map
