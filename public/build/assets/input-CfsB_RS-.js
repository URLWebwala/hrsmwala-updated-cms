import{r as o,j as e}from"./ui-Dc_0HCyE.js";import{c as a}from"./utils-BEilrgaf.js";import{c as d}from"./createLucideIcon-Dovszg4y.js";/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=d("EyeOff",[["path",{d:"M9.88 9.88a3 3 0 1 0 4.24 4.24",key:"1jxqfv"}],["path",{d:"M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68",key:"9wicm4"}],["path",{d:"M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61",key:"1jreej"}],["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}]]);/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=d("Eye",[["path",{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",key:"rwhkz3"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]),m=o.forwardRef(({className:n,type:t,error:c,...i},l)=>{const[s,u]=o.useState(!1),r=t==="password";return e.jsxs("div",{className:a(r&&"relative"),children:[e.jsx("input",{type:r?s?"text":"password":t,className:a("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50",c&&"border-destructive",r&&"pr-10",n),ref:l,...i}),r&&e.jsx("button",{type:"button",onClick:()=>u(!s),className:"absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none",children:s?e.jsx(f,{className:"h-4 w-4"}):e.jsx(p,{className:"h-4 w-4"})})]})});m.displayName="Input";export{p as E,m as I,f as a};
