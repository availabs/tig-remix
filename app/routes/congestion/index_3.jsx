// import React, { useEffect } from "react";
// import { useLoaderData } from "@remix-run/react";
// import { falcor } from "~/utils/falcor.server";
// import { get, map, find, flatten } from "lodash";
// import { interpolateYlGn, interpolatePuBu } from "d3-scale-chromatic";
// import * as d3 from "d3";
// // import {interpolateYlGn} from "https://cdn.skypack.dev/d3-scale-chromatic@3";
// // import fetch from "node-fetch";

// export function congestionCalculator(filteroutCongetionTime, tmcEpochTime) {
//     const computedDifference = filteroutCongetionTime.map((t) => {
//         return {
//             [t.tmc]: tmcEpochTime[`${t.tmc}`].map((te) =>
//                 Math.max(t.avg_time - te, 0)
//             ),
//         };
//     });
//     return Object.assign({}, ...computedDifference);
// }

// export async function getMonthEpochs(tmcArray) {
//     let months = [];
//     for (let i = 1; i < 30; i++) {
//         months.push("2022-06-" + (i < 10 ? "0" + i : i));
//     }

//     let monthSpeedData = await falcor.get([
//         "tmc",
//         tmcArray,
//         "tt",
//         "day",
//         months,
//         "by",
//         "epoch",
//     ]);

//     return monthSpeedData;
// }

// export async function loader({ request, params }) {
//     const year = 2021;
//     const geo = "COUNTY|36001";
//     let roads = await falcor.get(["geo", geo, year, "tmclinear"]);
//     let road = get(roads, ["json", "geo", geo, year, "tmclinear", 4], {});

//     // const temp_full = await falcor.get(["geo", geo, year]);
//     // return temp_full;
//     // console.log(roads);

//     let tmcs = await falcor.get([
//         "tmc",
//         "tmclinear",
//         year,
//         geo,
//         road.tmclinear,
//         road.direction,
//     ]);
//     let tmcArray = get(tmcs, [
//         "json",
//         "tmc",
//         "tmclinear",
//         year,
//         geo,
//         road.tmclinear,
//         road.direction,
//     ])
//         .sort((a, b) => a.road_order - b.road_order)
//         .map((d) => d.tmc);

//     let tmcMeta = await falcor.get([
//         "tmc",
//         tmcArray,
//         "meta",
//         year,
//         ["avg_speedlimit", "miles"],
//     ]);
//     let tmcMetaMiles = tmcMeta.json.tmc;

//     let months = [];
//     for (let i = 1; i < 30; i++) {
//         months.push("2022-06-" + (i < 10 ? "0" + i : i));
//     }

//     let speedData = await falcor.get([
//         "tmc",
//         tmcArray,
//         "tt",
//         "day",
//         "2022-06-18",
//         "by",
//         "epoch",
//     ]);

//     let monthSpeedData = await getMonthEpochs(tmcArray);

//     let temp = speedData.json.tmc;
//     // console.log(speedData.json.tmc)

//     let filteroutMiles = tmcArray.map((t) => {
//         return { tmc: `${t}`, miles: tmcMetaMiles[`${t}`].meta["2021"].miles };
//     });

//     let filteroutCongetionTime = filteroutMiles.map((t) => {
//         return {
//             tmc: `${t.tmc}`,
//             avg_time:
//                 (t.miles /
//                     Math.max(
//                         tmcMetaMiles[`${t.tmc}`].meta["2021"].avg_speedlimit * 0.6,
//                         20
//                     )) *
//                 3600,
//         };
//     });
//     // console.log(filteroutCongetionTime);

//     let sortedResolution = filteroutMiles.map((t) => {
//         return {
//             tmc: `${t.tmc}`,
//             val: temp[`${t.tmc}`]["tt"]["day"]["2022-06-18"]["by"]["epoch"]
//                 .map((te) => {
//                     return {
//                         resolution: te?.resolution,
//                         values: te?.value,
//                     };
//                 })
//                 .sort((a, b) => a.resolution - b.resolution),
//         };
//     });

//     let tmceachepochvalues = sortedResolution.map((t) => {
//         const result = new Array(288);
//         for (let i = 0; i <= 288; i++) {
//             result[i] = find(map(t.val), (o) => o.resolution === i)?.values || 0;
//         }
//         return {
//             [t.tmc]: result,
//         };
//     });

//     const objecteachepochvalues = Object.assign({}, ...tmceachepochvalues);
//     // for(let i=0;i<288;i++) {

//     // }
//     // console.log(sortedResolution);
//     // console.log("objecteachepochvalues", objecteachepochvalues);

//     // console.log(sortedResolution)
//     // console.log(tm)


//     // return [tmcArray, congestionCalculator(filteroutCongetionTime, objecteachepochvalues)];

//     // let wholeData = await falcor.get([
//     //     "tmc",
//     //     tmcArray,
//     //     "tt"
//     // ]);
//     const wholeData = monthSpeedData.json.tmc["120N05855"].tt.day;
//     console.log(monthSpeedData);
//     return wholeData;
// }

// //create simple grid
// //  where the x axis is tmcs along the road
// // y axis is time epochs
// export default function DMS() {
//     const data = useLoaderData();
//     var piyg = d3.scaleSequential([1, 2, 3]);
//     console.log(piyg);

//     return (
//         <>
//             {
//                 <div className="max-w-5xl mx-auto p-4">
//                     <pre>{JSON.stringify(data, null, 3)}</pre>
//                 </div>
//             }
//             {/*       
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
//             {   
//             // <div  className=" p-4" style={{minWidth: "100%", minHeight: "100%"}}>
//             //     <table style={{ border: "2px solid #000000", backgroundColor: "#dddddd", width: "100%", height: "100%" }}>
//             //         <thead>
//             //             <tr style={{ border: "1px 1px 1px 1px solid #000000" }}>
//             //                 <td style={{
//             //                     border: "1p solid #dddddd",
//             //                 }}>Index</td>
//             //                 {data[0].map((t) => (
//             //                     <>
//             //                         <td style={{
//             //                             border: "1px solid #dddddd",
//             //                         }}>{Math.round(d3.sum(data[1][t]))}

//             //                         </td>
//             //                     </>)
//             //                 )}
//             //             </tr>
//             //         </thead>
//             //         <tbody style={{heght: "100%"}}>
//             //             {Array(288)
//             //                 .fill(0)
//             //                 .map((elem, i) => {
//             //                     return (
//             //                         <>
//             //                             <tr>

//             //                                 {data[0].map((t) => (
//             //                                     <>

//             //                                         <td style={{
//             //                                             border: "1px solid #dddddd", backgroundColor: interpolatePuBu(data[1][t][i] / 100)
//             //                                         }}>
//             //                                             {/* {data[1][t][i].toFixed(3)} */}
//             //                                             </td>

//             //                                     </>
//             //                                 ))}
//             //                             </tr>
//             //                         </>
//             //                     );
//             //                 })}
//             //         </tbody>
//             //     </table>
//             //     </div>
//                         }
//             ;
//         </>
//     );
// }

// export function ErrorBoundary({ error }) {
//     return (
//         <div>
//             <h1>Congestion Error ErrorBoundary</h1>
//             <p>{error.message}</p>
//             <p>The stack trace is:</p>
//             <pre>{error.stack}</pre>
//         </div>
//     );
// }
