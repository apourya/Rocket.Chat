function module(e,t,u){let r,a;u.export({useFeaturedApps:()=>n}),u.link("@rocket.chat/ui-contexts",{useEndpoint(e){r=e}},0),u.link("@tanstack/react-query",{useQuery(e){a=e}},1);let n=()=>{let e=r("GET","/apps/featured-apps");return a({queryKey:["featured-apps"],queryFn:()=>e()})}}
//# sourceMappingURL=/dynamic/client/views/marketplace/hooks/d96e4cb068f2e9477c0166c5335443012a94e36a.map
