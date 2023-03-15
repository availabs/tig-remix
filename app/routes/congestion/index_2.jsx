// import React, { useEffect } from "react";
// import { useLoaderData } from "@remix-run/react";
// import { falcor } from "~/utils/falcor.server";
// import { get, map, find } from "lodash";
// import {interpolateYlGn, interpolatePuBu} from "d3-scale-chromatic";
// import * as d3 from "d3";
// // import {interpolateYlGn} from "https://cdn.skypack.dev/d3-scale-chromatic@3";
// // import fetch from "node-fetch";

// export async function loader({ request, params }) {
//   const year = 2021;
//   const geo = "COUNTY|36001";
//   let roads = await falcor.get(["geo", geo, year, "tmclinear"]);
//   let road = get(roads, ["json", "geo", geo, year, "tmclinear", 4], {});

//   console.log(roads);

//   let tmcs = await falcor.get([
//     "tmc",
//     "tmclinear",
//     year,
//     geo,
//     road.tmclinear,
//     road.direction,
//   ]);
//   let tmcArray = get(tmcs, [
//     "json",
//     "tmc",
//     "tmclinear",
//     year,
//     geo,
//     road.tmclinear,
//     road.direction,
//   ])
//     .sort((a, b) => a.road_order - b.road_order)
//     .map((d) => d.tmc);

//   let tmcMeta = await falcor.get([
//     "tmc",
//     tmcArray,
//     "meta",
//     year,
//     ["avg_speedlimit", "miles"],
//   ]);
//   let tmcMetaMiles = tmcMeta.json.tmc;

//   let speedData = await falcor.get([
//     "tmc",
//     tmcArray,
//     "tt",
//     "day",
//     "2022-06-18",
//     "by",
//     "epoch",
//   ]);

//   let temp = speedData.json.tmc;
//   // console.log(speedData.json.tmc)

//   let filteroutMiles = tmcArray.map((t) => {
//     return { tmc: `${t}`, miles: tmcMetaMiles[`${t}`].meta["2021"].miles };
//   });
//   console.log(filteroutMiles);

//   let temp1 = filteroutMiles.map((t) => {
//     return {
//       tmc: `${t.tmc}`,
//       val: temp[`${t.tmc}`]["tt"]["day"]["2022-06-18"]["by"]["epoch"]
//         .map((te) => {
//           return {
//             resolution: te?.resolution,
//             values: (t.miles / te?.value) * 3600,
//           };
//         })
//         .sort((a, b) => a.resolution - b.resolution),
//     };
//   });

//   let temp2 = temp1.map((t) => {
//     const result = new Array(288);
//     for (let i = 0; i <= 288; i++) {
//       result[i] = find(map(t.val), (o) => o.resolution === i)?.values || 0;
//     }
//     return {
//       [t.tmc]: result,
//     };
//   });

//   const final = Object.assign({}, ...temp2);
//   // for(let i=0;i<288;i++) {

//   // }

//   console.log("final", final);

//   // console.log(temp1)
//   // console.log(tm)

//   const rows = tmcArray.map((t) => {
//     return (
//       <tr key={t}>
//         <td>{final[t]}</td>
//       </tr>
//     );
//   });

//   // return <table>
//   //     <thead>

//   //       <th>

//   //       <tr>
//   //         {tmcArray}
//   //       </tr>
//   //       </th>

//   //     </thead>
//   //     <tbody>
//   //         {/* {rows} */}
//   //     </tbody>
//   // </table>;

//   return [tmcArray, final];
// }

// //create simple grid
// //  where the x axis is tmcs along the road
// // y axis is time epochs

// export default function DMS() {
//   const data = useLoaderData();
//   var piyg = d3.scaleSequential([1, 2, 3]);
//   console.log(piyg);

//   return (
//     <>
//       {/* <div className="max-w-5xl mx-auto p-4">
//         <pre>{JSON.stringify(data, null, 3)}</pre>
//       </div> */}
//       {/*       
// <style>
// table {
//   font-family: arial, sans-serif;
//   border-collapse: collapse;
//   width: 100%;
// }

// td, th {
//   border: 1px solid #dddddd;
//   text-align: left;
//   padding: 8px;
// }

// tr:nth-child(even) {
//   background-color: #dddddd;
// }
// </style>
//      */}
//       <table style={{border: "2px solid #000000", backgroundColor: "#dddddd"}}>
//         <thead>
//           <tr style={{border: "1px 1px 1px 1px solid #000000"}}>
//             <td style={{
//               border: "1p solid #dddddd",
//               padding: "5px 15px 15px 25px",
//               marginBottom: "50px",
//             }}>Index</td>
//             {data[0].map((t) => (
//             <>
//             <td style={{
//               border: "1px solid #dddddd",
//               padding: "5px 15px 15px 25px",
//               marginBottom: "50px",
//             }}>{t}

//           </td>
//             </>)
//             )}
//             </tr>
//         </thead>
//         <tbody>
//           {Array(288)
//             .fill(0)
//             .map((elem, i) => {
//               return (
//                 <>
//                 <tr>
//               <td style={{
//               border: "1px solid #dddddd",
//               padding: "5px 15px 15px 25px",
//               marginBottom: "50px",
//             }}>{i}</td>
//                   {data[0].map((t) => (
//                     <>
                      
//                         <td style={{
//               border: "1px solid #dddddd",
//               padding: "5px 15px 15px 25px",
//               marginBottom: "50px", backgroundColor: interpolatePuBu(data[1][t][i]/100)
//             }}>{data[1][t][i]}</td>
                      
//                     </>
//                   ))}
//                 </tr>  
//                 </>
//               );
//             })}
//         </tbody>
//       </table>
//       ;
//     </>
//   );
// }

// export function ErrorBoundary({ error }) {
//   return (
//     <div>
//       <h1>Congestion Error ErrorBoundary</h1>
//       <p>{error.message}</p>
//       <p>The stack trace is:</p>
//       <pre>{error.stack}</pre>
//     </div>
//   );
// }
