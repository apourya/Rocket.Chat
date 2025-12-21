function module(e,t,r){let s,l,i;r.export({watchUserId:()=>n,watchUser:()=>u}),r.link("./watch",{watch(e){s=e}},0),r.link("../lib/user",{userIdStore(e){l=e}},1),r.link("../stores",{Users(e){i=e}},2);let n=()=>s(l,e=>e),u=()=>{let e=n();if(e)return s(i.use,t=>t.get(e))}}
//# sourceMappingURL=/dynamic/client/meteor/b056e2468ec43df87616416e2fef524c55da8a26.map
