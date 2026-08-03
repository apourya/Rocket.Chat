function module(e,o,n){n.export({getGeolocationPermission:()=>i});let i=()=>new Promise(e=>{navigator.permissions||e("granted"),navigator.permissions.query({name:"geolocation"}).then(o=>{let{state:n}=o;e(n)})})}
//# sourceMappingURL=/dynamic/client/views/room/ShareLocation/5f187414a82ec51af24330ff76ab0cda3a799494.map
