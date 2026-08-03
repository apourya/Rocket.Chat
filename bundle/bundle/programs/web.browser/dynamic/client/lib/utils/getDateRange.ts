function module(t,e,n){let a;n.export({getDateRange:()=>o}),n.link("moment",{default(t){a=t}},0);let o=()=>{let t=a(new Date),e=a(new Date(t.year(),t.month(),t.date(),0,0,0)),n=a(new Date(t.year(),t.month(),t.date(),23,59,59));return{start:e.toISOString(),end:n.toISOString()}}}
//# sourceMappingURL=/dynamic/client/lib/utils/755f46ef37abf89254cee246b1f57c7df82e2553.map
