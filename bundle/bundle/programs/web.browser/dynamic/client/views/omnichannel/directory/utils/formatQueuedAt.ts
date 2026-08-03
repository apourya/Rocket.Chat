function module(t,e,o){let m;o.export({formatQueuedAt:()=>r}),o.link("moment",{default(t){m=t}},0);let r=t=>{let{servedBy:e,closedAt:o,open:r,queuedAt:f,ts:l}=t||{},u=f||l;return e?m(e.ts).from(m(u),!0):r?m(u).fromNow(!0):o&&u?m(o).from(m(u),!0):""}}
//# sourceMappingURL=/dynamic/client/views/omnichannel/directory/utils/e4f3dfc08353b077d50a56a36f2928ca1f4b4e30.map
