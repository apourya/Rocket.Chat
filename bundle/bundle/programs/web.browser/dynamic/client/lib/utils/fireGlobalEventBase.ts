function module(e,t,n){n.export({fireGlobalEventBase:()=>a});let a=(e,t)=>(window.dispatchEvent(new CustomEvent(e,{detail:t})),(n,a)=>{n&&parent.postMessage({eventName:e,data:t},a)})}
//# sourceMappingURL=/dynamic/client/lib/utils/715d732ba059f804e2c9a05d95bf40196d17daa3.map
