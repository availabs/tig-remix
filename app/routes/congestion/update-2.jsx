// import React, { useState, useEffect } from "react";
// import { useLoaderData } from "@remix-run/react";
// import { falcor } from "~/utils/falcor.server";
// import { get, map, find, flatten, cloneDeep } from "lodash";
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

//     console.log(sortedResolution);
//     console.log("Sorted");
//     let tmcEachEpochValues = sortedResolution.map((t) => {
//         const result = new Array(288);
//         for (let i = 0; i <= 288; i++) {
//             result[i] = find(map(t.val), (o) => o.resolution === i)?.values || null;
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

//     let milesTMC = Object.assign(
//         {},
//         ...filteroutMiles.map((t) => {
//             return { [t.tmc]: t.miles };
//         })
//     );

//     // console.log(milesTMC);

//     const getRequestKey = (startEpoch, endEpoch) =>
//         [
//             [tmcArray],
//             +`${year}0101`, // start date
//             +`${year}1231`, // end date
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

//     const avgTMCrequestKey = getRequestKey(0, 288);
//     const apiSpeedData = await falcor.get(["routes", "data", avgTMCrequestKey]);
//     let avgTMCSpeed = apiSpeedData.json.routes.data[avgTMCrequestKey];

//     var finalData = Object.assign(
//         {},
//         ...tmcArray.map((tmc) => {
//             return {
//                 [tmc]: [],
//             };
//         })
//     );

//     avgTMCSpeed.map((d) => {
//         finalData[d.tmc].push((milesTMC[d.tmc] / d.value) * 3600);
//     });

//     // console.log(finalData);
//     // tmcArray.map((tmc) => {
//     //     finalData[tmc].map((d, i) => {
//     //         if(i < 2) ;
//     //         else {
//     //             finalData[tmc][i] = (finalData[tmc][i]+finalData[tmc][i-1]+finalData[tmc][i-2])/3;
//     //         }
//     //     });
//     // })
//     // avgTMCSpeed.map((d) => {

//     // })

//     // console.log(avgTMCSpeed);

//     avgTMCSpeed = finalData;

//     const monthCongestionData = months.map((m) => {
//         return {
//             [`${m}`]: sortedResolutionSpeed(filteroutMiles, tmcData, m),
//         };
//     });

//     const wholeData = Object.assign({}, ...monthCongestionData);
//     return { tmcArray, months, wholeData, avgTMCSpeed };
// }

// export function Mean15Minute(tmcArray, months, wholeData, avgTMCSpeed) {
//     var updatedAvgTMCSpeed = cloneDeep(avgTMCSpeed);
//     var updatedWholeData = cloneDeep(wholeData);
//     // console.log("Mean", updatedAvgTMCSpeed)
//     tmcArray.forEach((tmc) => {
//         avgTMCSpeed[tmc].forEach((d, i) => {
//             if (i < 2);
//             else {
//                 let t1 = avgTMCSpeed[tmc][i] || 0;
//                 let t2 = avgTMCSpeed[tmc][i - 1] || 0;
//                 let t3 = avgTMCSpeed[tmc][i - 2] || 0;
//                 let count = 0;
//                 let sum = 0;
//                 // if(t1 == 0||t2 == 0||t3 == 0)
//                 console.log("\n\nt1", t1, "\nt2", t2, "\nt3:", t3);

//                 if (t1 !== 0) {
//                     sum += t1;
//                     count++;
//                 }
//                 if (t2 !== 0) {
//                     sum += t2;
//                     count++;
//                 }
//                 if (t3 !== 0) {
//                     sum += t3;
//                     count++;
//                 }

//                 if (count === 0) {
//                     sum = null;
//                 } else {
//                     sum = sum / count;
//                 }
//                 updatedAvgTMCSpeed[tmc][i] = sum;

//                 // if(t1 == 0 || t2 == 0 || t3 == 0)
//                 // console.log("\n\nt1", t1, "\nt2", t2, "\nt3:", t3, "\ncount:", count, "\nsum:", sum, "\nfinal value:", updatedAvgTMCSpeed[tmc][i])
//             }
//         });
//     });
//     // console.log(wholeData);

//     months.map((m) => {
//         tmcArray.map((tmc) => {
//             updatedWholeData[m][tmc].map((d, i) => {
//                 if (i < 2);
//                 else {
//                     let t1 = wholeData[m][tmc][i] || 0;
//                     let t2 = wholeData[m][tmc][i - 1] || 0;
//                     let t3 = wholeData[m][tmc][i - 2] || 0;
//                     let count = 0;
//                     let sum = 0;

//                     if (t1 != 0) {
//                         sum += t1;
//                         count++;
//                     }
//                     if (t2 != 0) {
//                         sum += t2;
//                         count++;
//                     }
//                     if (t3 != 0) {
//                         sum += t3;
//                         count++;
//                     }

//                     if (count == 0) {
//                         sum = null;
//                     } else {
//                         sum = sum / count;
//                     }
//                     updatedWholeData[m][tmc][i] = sum;
//                 }
//             });
//         });
//     });

//     return { updatedAvgTMCSpeed, updatedWholeData };
// }

// export function HarmonicMean15Minute(tmcArray, months, wholeData, avgTMCSpeed) {
//     var updatedAvgTMCSpeed = cloneDeep(avgTMCSpeed); 
//     var updatedWholeData = cloneDeep(wholeData);
//     // console.log("Mean", updatedAvgTMCSpeed)
//     tmcArray.map((tmc) => {
//         avgTMCSpeed[tmc].map((d, i) => {
//             if (i < 2);
//             else {
//                 let t1 = avgTMCSpeed[tmc][i] || 0;
//                 let t2 = avgTMCSpeed[tmc][i - 1] || 0;
//                 let t3 = avgTMCSpeed[tmc][i - 2] || 0;
//                 let count = 0;
//                 let sum = 0;

//                 if (t1 != 0) {
//                     sum += 1 / t1;
//                     count++;
//                 }
//                 if (t2 != 0) {
//                     sum += 1 / t2;
//                     count++;
//                 }
//                 if (t3 != 0) {
//                     sum += 1 / t3;
//                     count++;
//                 }

//                 if (count == 0) {
//                     sum = null;
//                 } else {
//                     sum = count / sum;
//                 }
//                 updatedAvgTMCSpeed[tmc][i] = sum;
//             }
//         });
//     });
//     // console.log(wholeData);

//     months.map((m) => {
//         tmcArray.map((tmc) => {
//             updatedWholeData[m][tmc].map((d, i) => {
//                 if (i < 2);
//                 else {
//                     let t1 = wholeData[m][tmc][i] || 0;
//                     let t2 = wholeData[m][tmc][i - 1] || 0;
//                     let t3 = wholeData[m][tmc][i - 2] || 0;
//                     let count = 0;
//                     let sum = 0;

//                     if (t1 != 0) {
//                         sum += 1 / t1;
//                         count++;
//                     }
//                     if (t2 != 0) {
//                         sum += 1 / t2;
//                         count++;
//                     }
//                     if (t3 != 0) {
//                         sum += 1 / t3;
//                         count++;
//                     }

//                     if (count == 0) {
//                         sum = null;
//                     } else {
//                         sum = count / sum;
//                     }
//                     updatedWholeData[m][tmc][i] = sum;
//                 }
//             });
//         });
//     });

//     return { updatedAvgTMCSpeed, updatedWholeData };
// }

// export function selectedFunction(
//     tmcArray,
//     months,
//     wholeData,
//     avgTMCSpeed,
//     selectedFuctionName
// ) {
//     if (selectedFuctionName == "raw") {
//         let updatedAvgTMCSpeed = cloneDeep(avgTMCSpeed);
//         let updatedWholeData = cloneDeep(wholeData);
//         return { updatedAvgTMCSpeed, updatedWholeData };
//     } else if (selectedFuctionName == "15-mean") {
//         let { updatedAvgTMCSpeed, updatedWholeData } = Mean15Minute(
//             tmcArray,
//             months,
//             wholeData,
//             avgTMCSpeed
//         );
//         return { updatedAvgTMCSpeed, updatedWholeData };
//     } else if (selectedFuctionName == "15-harmonicMean") {
//         var { updatedAvgTMCSpeed, updatedWholeData } = HarmonicMean15Minute(
//             tmcArray,
//             months,
//             wholeData,
//             avgTMCSpeed
//         );
//         return { updatedAvgTMCSpeed, updatedWholeData };
//     }
//     return { updatedAvgTMCSpeed, updatedWholeData };
// }

// export function TMCPlotData(
//     tmcArray,
//     months,
//     updatedWholeData,
//     updatedAvgTMCSpeed,
//     selectedTmc
// ) {
//     let data1 = months.map((t) => {
//         return {
//             id: t,
//             data: updatedWholeData[t][selectedTmc].map((d, i) => {
//                 return {
//                     x: i,
//                     y: d,
//                 };
//             }),
//         };
//     });

//     let data2 = updatedAvgTMCSpeed[selectedTmc].map((d, i) => {
//         return {
//             x: i,
//             y: d,
//         };
//     });

//     let data_avg = {
//         id: "average",
//         data: data2,
//     };

//     data1.push(data_avg);
//     return data1;
// }

// export default function DMS() {
//     const { tmcArray, months, wholeData, avgTMCSpeed } = useLoaderData();
//     const [selectedTmc, changeTmc] = useState(tmcArray[0]);

//     const input_functions_list = ["raw", "15-mean", "15-harmonicMean"];
//     const [selectedFuctionName, changeFunction] = useState(
//         input_functions_list[0]
//     );

//     const plotTypeList = ["Speed", "Congestion-time"];
//     const [selectedPlotType, changePlot] = useState(
//         plotTypeList[0]
//     );


//     let { updatedAvgTMCSpeed, updatedWholeData } = selectedFunction(
//         tmcArray,
//         months,
//         wholeData,
//         avgTMCSpeed,
//         selectedFuctionName
//     );

    

//     const data1 = TMCPlotData(
//         tmcArray,
//         months,
//         updatedWholeData,
//         updatedAvgTMCSpeed,
//         selectedTmc
//     );

//     const MyResponsiveLine = ({ data /* see data tab */ }) => (
//         <ResponsiveLine
//             data={data}
//             margin={{ top: 50, right: 160, bottom: 50, left: 160 }}
//             xScale={{ type: "linear" }}
//             yScale={{ type: "linear", stacked: ("stacked", false), min: 20 }}
//             yFormat=" >-.2f"
//             curve="monotoneX"
//             axisTop={null}
//             axisRight={{
//                 // tickValues:[40, 50, 60, 70, 80, 90],
//                 tickSize: 5,
//                 tickPadding: 5,
//                 tickRotation: 0,
//                 format: ".2s",
//                 legend: "",
//                 legendOffset: 0,
//                 itemBackground: "white",
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
//                 // tickValues:[40, 50, 60, 70, 80, 90],
//                 tickSize: 5,
//                 tickPadding: 0,
//                 tickRotation: 0,
//                 format: ".2s",
//                 legendOffset: -40,
//                 legendPosition: "middle",
//             }}
//             enableGridX={true}
//             colors={{ scheme: "spectral" }}
//             lineWidth={1.5}
//             // pointSize={4}
//             pointColor={{ theme: "background" }}
//             // pointBorderWidth={1}
//             pointBorderColor={{ from: "serieColor" }}
//             pointLabelYOffset={-12}
//             enableSlices={"x"}
//             // enableArea= {true}
//             // areaBaselineValue = {{data_avg}}
//             useMesh={true}
//             // gridXValues={[ 0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 288]}
//             gridYValues={[40, 60, 80, 100, 120]}
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
//                     symbolBorderColor: "rgba(0, 0, 0, .5)",
//                     effects: [
//                         {
//                             on: "hover",
//                             style: {
//                                 itemBackground: "rgba(0, 0, 0, .03)",

//                                 itemOpacity: 1,
//                             },
//                         },
//                     ],
//                 },
//             ]}
//         />
//     );

//     return (
//         <div className="bg-white text-teal-800">
//             {
//                 // <div className="max-w-5xl mx-auto p-4">
//                 //     <pre>{JSON.stringify(wholeData, null, 3)}</pre>
//                 // </div>
//             }

//             {
//                 <div className="grid grid-rows-3 grid-flow-col gap-4 text-center">
//                     <div className="row-start-1 row-end-4">
//                         <div className="grid-rows-3 grid-flow-col gap-4">
//                             <div className="row-start-1 row-end-4">
//                                 <label className="" for="tmcs">
//                                     Choose a tmc: 
//                                 </label>
//                                 <select className="mx-auto"
//                                     name="tmcs"
//                                     id="tmcs"
//                                     onChange={(e) => changeTmc(e.target.value)}
//                                 >
//                                     {tmcArray.map((tmc, i) => (
//                                         // eslint-disable-next-line react/jsx-key

//                                         <option key={i} value={tmc} defaultValue={tmcArray[0]}>
//                                             {tmc}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                             <div>
//                                 <pre>Selected tmc: {selectedTmc}</pre>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="row-start-1 row-end-4">
//                         <label for="input_function">Choose a input function: </label>
//                         <select
//                             name="input_function"
//                             id="input_functions"
//                             onChange={(e) => changeFunction(e.target.value)}
//                         >
//                             {input_functions_list.map((input_function, i) => (
//                                 // eslint-disable-next-line react/jsx-key

//                                 <option key={i} value={input_function}>
//                                     {input_function}
//                                 </option>
//                             ))}
//                         </select>

//                         <pre>Selected function: {selectedFuctionName}</pre>
//                     </div>
//                     <div className="row-start-1 row-end-4">
//                         <label for="input_function">Choose type: </label>
//                         <select
//                             name="input_function"
//                             id="input_functions"
//                             onChange={(e) => changePlot(e.target.value)}
//                         >
//                             {plotTypeList.map((plotType, i) => (
//                                 // eslint-disable-next-line react/jsx-key

//                                 <option key={i} value={plotType}>
//                                     {plotType}
//                                 </option>
//                             ))}
//                         </select>

//                         <pre>Selected function: {selectedPlotType}</pre>
//                     </div>

//                     {/* <pre>{MyResponsiveLine}</pre> */}
//                 </div>
//             }

//             <div
//                 className="text-secondary"
//                 style={{ width: "100%", height: "800px" }}
//             >
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
