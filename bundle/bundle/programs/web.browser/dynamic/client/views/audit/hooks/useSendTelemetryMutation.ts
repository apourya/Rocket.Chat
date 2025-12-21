function module(t,e,n){let o,r;n.export({useSendTelemetryMutation:()=>u}),n.link("@rocket.chat/ui-contexts",{useEndpoint(t){o=t}},0),n.link("@tanstack/react-query",{useMutation(t){r=t}},1);let u=()=>{let t=o("POST","/v1/statistics.telemetry");return r({mutationFn:t,onError:t=>{console.warn(t)}})}}
//# sourceMappingURL=/dynamic/client/views/audit/hooks/05af92d036d73e647533dd9ccc20d67c764bcea1.map
