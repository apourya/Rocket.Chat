function module(e,r,n){n.export({createAsyncTransformChain:()=>t});let t=function(){for(var e=arguments.length,r=Array(e),n=0;n<e;n++)r[n]=arguments[n];let t=r;return Object.assign(e=>t.reduce((e,r)=>e.then(r),Promise.resolve(e)),{use:e=>(t.push(e),()=>{t=t.filter(r=>r!==e)})})}}
//# sourceMappingURL=/dynamic/lib/89ee0083c07e2f2c0d181d6babcd0beecc16d1f6.map
