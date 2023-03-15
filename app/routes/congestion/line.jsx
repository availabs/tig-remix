// import React, { useState, useEffect } from "react";
// import { useLoaderData } from "@remix-run/react";
// import { falcor } from "~/utils/falcor.server";
// import { get, map, find, flatten } from "lodash";
// import { interpolateYlGn, interpolatePuBu } from "d3-scale-chromatic";
// import * as d3 from "d3";
// import { ResponsiveLine } from "@nivo/line";
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

// export function sortResolution(filteroutMiles, tmcData, date) {
//     let sortedResolution = filteroutMiles.map((t) => {
//         return {
//             tmc: `${t.tmc}`,
//             val: tmcData[`${t.tmc}`]["tt"]["day"][`${date}`]["by"]["epoch"]
//                 .map((te) => {
//                     return {
//                         resolution: te?.resolution,
//                         values: te?.value,
//                     };
//                 })
//                 .sort((a, b) => a.resolution - b.resolution),
//         };
//     });

//     let tmcEachEpochValues = sortedResolution.map((t) => {
//         const result = new Array(288);
//         for (let i = 0; i <= 288; i++) {
//             result[i] = find(map(t.val), (o) => o.resolution === i)?.values || 0;
//         }
//         return {
//             [t.tmc]: result,
//         };
//     });

//     const objectEachEpochValues = Object.assign({}, ...tmcEachEpochValues);

//     return objectEachEpochValues;
// }

// export function sortedResolutionSpeed(filteroutMiles, tmcData, date) {
//     let sortedResolution = filteroutMiles.map((t) => {
//         return {
//             tmc: `${t.tmc}`,
//             val: tmcData[`${t.tmc}`]["tt"]["day"][`${date}`]["by"]["epoch"]
//                 .map((te) => {
//                     return {
//                         resolution: te?.resolution,
//                         values: (t.miles / te?.value) * 3600,
//                     };
//                 })
//                 .sort((a, b) => a.resolution - b.resolution),
//         };
//     });

//     let tmcEachEpochValues = sortedResolution.map((t) => {
//         const result = new Array(288);
//         for (let i = 0; i <= 288; i++) {
//             result[i] = find(map(t.val), (o) => o.resolution === i)?.values || 20;
//         }
//         return {
//             [t.tmc]: result,
//         };
//     });

//     const objectEachEpochValues = Object.assign({}, ...tmcEachEpochValues);

//     return objectEachEpochValues;
// }

// export async function getLine(tmcArray, date) { }

// export async function loader({ request, params }) {
//     const year = 2021;
//     const geo = "COUNTY|36001";
//     let roads = await falcor.get(["geo", geo, year, "tmclinear"]);
//     let road = get(roads, ["json", "geo", geo, year, "tmclinear", 4], {});

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

//     // return tmcsz;

//     //   const tmcs = tmcArray.map(d => d.tmc)

//     const getRequestKey = (startEpoch, endEpoch) =>
//         [
//             [tmcArray[0]],
//             +`${year}0601`, // start date
//             +`${year}0629`, // end date
//             startEpoch, //start epoch
//             endEpoch, // end epoch
//             [
//                 //"sunday",
//                 "monday",
//                 "tuesday",
//                 "wednesday",
//                 "thursday",
//                 "friday",
//                 //"saturday",
//             ], //day filter
//             "5-minutes" /* -- resolution '5-minutes','15-minutes','hour','date', 'month','year' */,
//             "travel_time_all",
//             "travelTime",
//             encodeURI(JSON.stringify({})),
//             "ny",
//         ].join("|");

//     const requestKey = getRequestKey(0, 288);
//     const requestKeyAm = getRequestKey(84, 120);
//     const requestKeyPm = getRequestKey(192, 228);

//     let finalData = await falcor.get(
//         [
//             "tmc",
//             tmcArray[0],
//             "meta",
//             year,
//             ["miles", "region_code", "avg_speedlimit"],
//         ],
//         ["routes", "data", [requestKey, requestKeyAm, requestKeyPm]]
//     );

//     // console.log(finalData.json.routes.data[requestKey]);
//     // console.log(finalData.json.routes.data[requestKeyAm]);
//     // console.log(finalData.json.tmc["120N05855"].meta);

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
//         months,
//         "by",
//         "epoch",
//     ]);

//     let tmcData = speedData.json.tmc;

//     let filteroutMiles = tmcArray.map((t) => {
//         return { tmc: `${t}`, miles: tmcMetaMiles[`${t}`].meta["2021"].miles };
//     });

//     // let filteroutCongetionTime = filteroutMiles.map((t) => {
//     //     return {
//     //         tmc: `${t.tmc}`,
//     //         avg_time:
//     //             (t.miles /
//     //                 Math.max(
//     //                     tmcMetaMiles[`${t.tmc}`].meta["2021"].avg_speedlimit * 0.6,
//     //                     20
//     //                 )) *
//     //             3600,
//     //     };
//     // });

//     const monthCongestionData = months.map((m) => {
//         return {
//             [`${m}`]: sortedResolutionSpeed(filteroutMiles, tmcData, m),
//         };
//     });

//     const wholeData = Object.assign({}, ...monthCongestionData);
//     return { tmcArray, months, wholeData, finalData };
// }

// export default function DMS() {
//     const { tmcArray, months, wholeData, finalData } = useLoaderData();
//     const [selectedTmc, changeTmc] = useState(tmcArray[0]);

//     let data3 = Array(288).fill(0);

//     let data1 = months.map((t) => {
//         return {
//             id: t,
//             data: wholeData[t][selectedTmc].map((d, i) => {
//                 data3[i] += d;
//                 return {
//                     x: i,
//                     y: d,
//                 };
//             }),
//         };
//     });

//     let data2 = data3.map((d, i) => {
//         return {
//             x: i,
//             y: (d > 0 ? d : 0) / 30,
//         };
//     });

//     let data_avg = {
//         id: "average",
//         data: data2,
//     };

//     data1.push(data_avg);

//     const MyResponsiveLine = ({ data /* see data tab */ }) => (
//         <ResponsiveLine
//             data={data}
//             margin={{ top: 50, right: 160, bottom: 50, left: 160 }}
//             xScale={{ type: "linear" }}
//             yScale={{ type: "linear", stacked: ("stacked", true) }}
//             yFormat=" >-.2f"
//             curve="monotoneX"
//             axisTop={null}
//             axisRight={{
//                 tickSize: 1,
//                 tickPadding: 5,
//                 tickRotation: 0,
//                 format: ".2s",
//                 legend: "",
//                 legendOffset: 0,
//             }}
//             axisBottom={{
//                 tickSize: 5,
//                 tickPadding: 5,
//                 tickRotation: 0,
//                 format: ".2f",
//                 legend: "epochs",
//                 legendOffset: 36,
//                 legendPosition: "middle",
//             }}
//             axisLeft={{
//                 tickSize: 5,
//                 tickPadding: 5,
//                 tickRotation: 0,
//                 format: ".2s",
//                 legendOffset: -40,
//                 legendPosition: "middle",
//             }}
//             enableGridX={true}
//             colors={{ scheme: "spectral" }}
//             lineWidth={1.5}
//             pointSize={4}
//             pointColor={{ theme: "background" }}
//             pointBorderWidth={1}
//             pointBorderColor={{ from: "serieColor" }}
//             pointLabelYOffset={-12}
//             useMesh={false}
//             enableSlices={"x"}
//             // gridXValues={[ 0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 288]}
//             // gridYValues={[0, 20, 40, 60, 80, 100, 120, 140, 160]}
//             legends={[
//                 {
//                     anchor: "bottom-right",
//                     direction: "column",
//                     justify: false,
//                     translateX: 120,
//                     translateY: 2,
//                     itemsSpacing: 2,
//                     itemDirection: "left-to-right",
//                     itemWidth: 80,
//                     itemHeight: 12,
//                     itemOpacity: 0.75,
//                     symbolSize: 12,
//                     symbolShape: "circle",
//                     symbolBorderColor: "rgba(20, 0, 0, .5)",
//                     effects: [
//                         {
//                             on: "hover",
//                             style: {
//                                 itemBackground: "rgba(0, 0, 0, .03)",
//                                 enablePointLabel: true,
//                                 itemOpacity: 1,
//                             },
//                         },
//                     ],
//                 },
//             ]}
//         />
//     );

//     return (
//         <div className="bg-gray-300 text-teal-800">
//             {
//                 // <div className="max-w-5xl mx-auto p-4">
//                 //     <pre>{JSON.stringify(data5, null, 3)}</pre>
//                 // </div>
//             }

//             {
//                 <div className="max-w-5xl mx-auto p-4">
//                     <label for="tmcs">Choose a tmc: </label>
//                     <select
//                         name="tmcs"
//                         id="tmcs"
//                         onChange={(e) => changeTmc(e.target.value)}
//                     >
//                         {tmcArray.map((tmc, i) => (
//                             <option key={i} value={tmc}>
//                                 {tmc}
//                             </option>
//                         ))}
//                     </select>

//                     <pre>Selected tmc: {selectedTmc}</pre>
//                     <pre>{MyResponsiveLine}</pre>
//                 </div>
//             }

//             <div style={{ width: "100%", height: "800px" }}>
//                 <MyResponsiveLine data={data1} />
//             </div>
//         </div>
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
