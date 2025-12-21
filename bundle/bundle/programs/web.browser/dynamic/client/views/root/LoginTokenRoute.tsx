function module(e,t,o){let n,u,r;o.link("@rocket.chat/ui-contexts",{useLoginWithTokenRoute(e){n=e},useRouter(e){u=e}},0),o.link("react",{useEffect(e){r=e}},1),o.exportDefault(()=>{let e=u(),t=n();return r(()=>{t(e.getRouteParameters().token,t=>{console.error(t),e.navigate("/")})},[t,e]),null})}
//# sourceMappingURL=/dynamic/client/views/root/709f0131b942f6b2f18511b016f75bb617b2bfec.map
