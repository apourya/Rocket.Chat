function module(e,t,u){let c,n;u.export({useSmtpQuery:()=>r}),u.link("@rocket.chat/ui-contexts",{useEndpoint(e){c=e}},0),u.link("@tanstack/react-query",{useQuery(e){n=e}},1);let r=()=>{let e=c("GET","/v1/smtp.check");return n({queryKey:["smtp.check"],queryFn:async()=>e()})}}
//# sourceMappingURL=/dynamic/client/views/admin/users/hooks/87770d7ddcaf04328c78dede847e6c2fa4ad3285.map
