function module(e,l,n){let t,i;n.export({fetchFeatures:()=>o}),n.link("./loggedIn",{whenLoggedIn(e){t=e}},0),n.link("../../app/utils/client/lib/SDKClient",{sdk(e){i=e}},1);let o=()=>t().then(()=>i.call("license:getModules"))}
//# sourceMappingURL=/dynamic/client/lib/85d5c5e963bf21435060ec9835d708355c06613a.map
