function module(e,t,n){let o,u;n.export({useE2EERoom:()=>r}),n.link("@tanstack/react-query",{useQuery(e){o=e}},0),n.link("../../../lib/e2ee",{e2e(e){u=e}},1);let r=e=>{let{data:t}=o({queryKey:["e2eRoom",e],queryFn:()=>u.getInstanceByRoomId(e)});return t}}
//# sourceMappingURL=/dynamic/client/views/room/hooks/2d3b9adfaa0df82a03f989ae73ac0a825306e306.map
