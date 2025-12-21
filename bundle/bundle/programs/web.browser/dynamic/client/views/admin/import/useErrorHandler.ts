function module(e,t,r){let o,s;r.export({useErrorHandler:()=>l}),r.link("@rocket.chat/fuselage-hooks",{useEffectEvent(e){o=e}},0),r.link("@rocket.chat/ui-contexts",{useToastMessageDispatch(e){s=e}},1);let l=()=>{let e=s();return o((t,r)=>{console.error(t),e({type:"error",message:null!=t?t:r})})}}
//# sourceMappingURL=/dynamic/client/views/admin/import/f0c37f31acd81a450e278fb2b4b17a25c7af455d.map
