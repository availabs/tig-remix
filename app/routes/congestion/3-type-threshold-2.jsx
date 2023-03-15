// import React, { useState, useEffect } from "react";
// import { useLoaderData } from "@remix-run/react";
// import { falcor } from "~/utils/falcor.server";
// import { get, map, find, flatten, cloneDeep, update } from "lodash";
// import { interpolateYlGn, interpolatePuBu } from "d3-scale-chromatic";
// import * as d3 from "d3";
// import '../../styles/3-type-threshold.css';


// export function congestionCal(wholeData, thresholdValues, months, tmcArray) {
//     const updatedWholeData = cloneDeep(wholeData);
//     tmcArray.map((t) => {
//         months.map((m) => {
//             wholeData[m][t].map((val, i) => {
//                 updatedWholeData[m][t][i] = Math.max(val - thresholdValues[m][t][i], 0);
//             });
//         });
//     })

//     // console.log("Execution completed!!!");
//     // console.log(updatedWholeData);
//     return updatedWholeData;
// }

// export function congestionCalculator(wholeData, thresholdValues, months, tmcArray) {
//     const updatedWholeData = cloneDeep(wholeData);
//     tmcArray.map((t) => {
//         months.map((m) => {
//             wholeData[m][t].map((te, i) => {
//                 updatedWholeData[m][t][i] = Math.max(te - thresholdValues[t][i], 0);
//             });
//         });
//     });

//     return updatedWholeData;
// }

// export function formateData(filteroutCongetionTime, tmcEpochTime) {
//     const computedDifference = filteroutCongetionTime.map((t) => {
//         return {
//             [t.tmc]: tmcEpochTime[`${t.tmc}`].map((te) =>
//                 Math.max(te, 0)
//             ),
//         };
//     });
//     return Object.assign({}, ...computedDifference);
// }


// export function speedLimitThreshold(filteroutCongetionTime, tmcEpochTime) {
//     const thresholdValues = filteroutCongetionTime.map((t) => {
//         return {
//             [t.tmc]: tmcEpochTime[`${t.tmc}`].map((te) =>
//                 Math.max(t.avg_time, 0)
//             ),
//         };
//     });
//     return Object.assign({}, ...thresholdValues);
// }

// export function meanThreshold(months, tmcArray, wholeData) {
//     let thresholdValues = tmcArray.map((t) => {
//         let meanValues = Array(288).fill(288);
//         months.map((m) => {
//             wholeData[m][t].map((w, i) => {
//                 meanValues[i] += w;
//                 // console.log(meanValues[i]);
//             });

//         });

//         return {
//             [t]: meanValues.map((w, i) => w/months.length )
//         }
//     });

//     thresholdValues = Object.assign({}, ...thresholdValues)
//     // console.log(thresholdValues, "Completed!!!");

//     return thresholdValues;
// }

// export function medianThreshold(months, tmcArray, wholeData) {
//     const monthLength = months.length;
//     const middleI = (1 + monthLength)/2;
//     let thresholdValues = tmcArray.map((t) => {
//         let meanValues = Array(288).fill(0);

//         meanValues.map((mv, i) => {
//             // console.log("inside loop");
//             let values = Array(monthLength);
//             months.map((m) => {
//                 values.push(wholeData[m][t][i]);
//             });

//             const sortedValues = values.sort((a, b) => a - b);
            
//             const evenCaseValues = (sortedValues[middleI-0.5] + sortedValues[middleI-1.5])/2;
//             const oddCaseValues = sortedValues[middleI-1];

//             meanValues[i] = monthLength%2 == 0 ? evenCaseValues : oddCaseValues;
//             console.log(sortedValues, "---", meanValues[i]);
//         });

//         // console.log(meanValues, "median");
//         return {
//             [t]: meanValues
//         }
//     });

//     thresholdValues = Object.assign({}, ...thresholdValues);
//     // console.log(thresholdValues);

//     return thresholdValues;
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


//     const monthRawData = months.map((m) => {
//         return {
//             [`${m}`]: formateData(
//                 filteroutCongetionTime,
//                 sortResolution(filteroutMiles, tmcData, m)
//             ),
//         };
//     });

//     const speedLimitThresholdVal = months.map((m) => {
//         return {
//             [`${m}`]: speedLimitThreshold(
//                 filteroutCongetionTime,
//                 sortResolution(filteroutMiles, tmcData, m)
//             ),
//         };
//     });

//     const wholeData = Object.assign({}, ...monthRawData);
//     const speedLimitData = Object.assign({}, ...speedLimitThresholdVal);

//     return { tmcArray, months, wholeData, speedLimitData };
// }


// export function Sum15Minutes(t1, t2, t3, sumDefaultValue, functionType) {
//     let count = 0;
//     let sum = 0;

//     if (functionType == "mean") {
//         [t1, t2, t3].map((t) => {
//             if (t != 0) {
//                 count++;
//                 sum += t;
//             }
//         });

//         sum = count === 0 ? sumDefaultValue : sum / count;
//     }

//     else {
//         [t1, t2, t3].map((t) => {
//             if (t != 0) {
//                 count++;
//                 sum += 1 / t;
//             }
//         });

//         sum = count === 0 ? sumDefaultValue : count / sum;
//     }

//     return sum;
// }


// export function Mean15Minute(tmcArray, months, wholeData, j) {
//     var updatedWholeData = cloneDeep(wholeData);
//     const functionType = "mean";

//     months.forEach((m) => {
//         tmcArray.forEach((tmc) => {
//             updatedWholeData[m][tmc].forEach((d, i) => {
//                 if (i < 2);
//                 else {
//                     let t1 = wholeData[m][tmc][i] || 0;
//                     let t2 = wholeData[m][tmc][i - 1] || 0;
//                     let t3 = wholeData[m][tmc][i - 2] || 0;
//                     let sum = Sum15Minutes(t1, t2, t3, 0, functionType);
//                     updatedWholeData[m][tmc][i + j] = sum;
//                 }
//             });
//         });
//     });

//     return updatedWholeData;
// }

// export function HarmonicMean15Minute(tmcArray, months, wholeData, j) {
//     var updatedWholeData = cloneDeep(wholeData);
//     const functionType = "harmonicMean";

//     // console.log(wholeData);

//     months.forEach((m) => {
//         tmcArray.forEach((tmc) => {
//             updatedWholeData[m][tmc].forEach((d, i) => {
//                 if (i < 2);
//                 else {
//                     let t1 = wholeData[m][tmc][i] || 0;
//                     let t2 = wholeData[m][tmc][i - 1] || 0;
//                     let t3 = wholeData[m][tmc][i - 2] || 0;
//                     let sum = Sum15Minutes(t1, t2, t3, 0, functionType);
//                     updatedWholeData[m][tmc][i + j] = sum;
//                 }
//             });
//         });
//     });

//     return updatedWholeData;
// }



// export default function DMS() {
//     let { tmcArray, wholeData, months, speedLimitData } = useLoaderData();

//     let j;

//     const slThresholdValues = speedLimitData;
//     const slRawData = congestionCal(wholeData, slThresholdValues, months, tmcArray);
//     const sL15TrailMean = Mean15Minute(tmcArray, months, slRawData, j = 0);
//     const sL15TrailHarMean = HarmonicMean15Minute(tmcArray, months, slRawData, j = 0);

    
//     const meanThresholdValues = meanThreshold(months, tmcArray, wholeData);
//     const meanRawData = congestionCalculator(wholeData, meanThresholdValues, months, tmcArray);
//     const mean15TrailMean = Mean15Minute(tmcArray, months, meanRawData, j = 0);
//     const mean15TrailHarMean = HarmonicMean15Minute(tmcArray, months, meanRawData, j = 0);

//     const medThresholdValues = medianThreshold(months, tmcArray, wholeData);
//     const medRawData = congestionCalculator(wholeData, medThresholdValues, months, tmcArray);
//     const med15TrailMean = Mean15Minute(tmcArray, months, medRawData, j = 0);
//     const med15TrailHarMean = HarmonicMean15Minute(tmcArray, months, medRawData, j = 0);


//     //console.log({tmcArray, months, wholeData});
//     let total = Array(15).fill(0);
//     return (
//         <div className="conatiner">
//             {
//                 <div className="p-4 min-w-full min-h-screen" style={{ textAlign: "center" }}>
//                     {/* <pre>{JSON.stringify(medThresholdValues, null, 3)}</pre> */}
//                     <div className="tet-center">
//                         <h1 className="text-center text-4xl">Various Thresholds Data Table</h1>
//                         <br />
//                     </div>
//                     <table
//                         style={{
//                             border: "2px solid #000000",
//                             backgroundColor: "#ffffff",
//                             width: "100%",
//                             height: "100%",
//                         }}
//                     >
//                         <thead
//                             style={{
//                                 border: "1px solid #000000",
//                             }}>
//                             <tr style={{ border: "1px solid #000000", width: "10px" }}>
//                                 <td style={{
//                                     border: "1px solid #000000",
//                                 }}>
//                                     Index
//                                 </td>

//                                 <td style={{ border: "1px solid #000000" }}>SL-Raw</td>
//                                 <td style={{ border: "1px solid #000000" }}>SL-15-Trail-Mean</td>
//                                 <td style={{ border: "1px solid #000000" }}>SL-15-Surr-Mean</td>
//                                 <td style={{ border: "1px solid #000000" }}>SL-15-Trail-Har-M</td>
//                                 <td style={{ border: "1px solid #000000" }}>SL-15-Surr-Har-M</td>

//                                 <td style={{ border: "1px solid #000000" }}>Mean-Raw</td>
//                                 <td style={{ border: "1px solid #000000" }}>Mean-15-Trail-Mean</td>
//                                 <td style={{ border: "1px solid #000000" }}>Mean-15-Surr-Mean</td>
//                                 <td style={{ border: "1px solid #000000" }}>Mean-15-Trail-Har-M</td>
//                                 <td style={{ border: "1px solid #000000" }}>Mean-15-Surr-Har-M</td>

//                                 <td style={{ border: "1px solid #000000" }}>Med-Raw</td>
//                                 <td style={{ border: "1px solid #000000" }}>Med-15-Trail-Mean</td>
//                                 <td style={{ border: "1px solid #000000" }}>Med-15-Surr-Mean</td>
//                                 <td style={{ border: "1px solid #000000" }}>Med-15-Trail-Har-M</td>
//                                 <td style={{ border: "1px solid #000000" }}>Med-15-Surr-Har-M</td>
//                             </tr>
//                         </thead>

//                         <tbody style={{ heght: "100%" }}>
//                             {   
//                                 tmcArray.map((t, i) => {
//                                     let tmcSLData = 0, tmcSLTrailMean = 0, tmcSLTrailHarMean = 0;
//                                     let tmcMeanData = 0, tmcMeanTrailMean = 0, tmcMeanTrailHarMean = 0;
//                                     let tmcMedData = 0, tmcMedTrailMean = 0, tmcMedTrailHarMean = 0;
                                    
//                                     return (
//                                         // eslint-disable-next-line react/jsx-key
//                                         <React.Fragment>
//                                         <tr key={i}>
//                                             <td style={{ backgroundColor: "lightgrey" }} >{t}</td>

//                                             {
//                                                 (
//                                                     months.map((m, i) => {
//                                                         let currSLRaw = 0, currSLTrailMean = 0, currSLTrailHarMean = 0;
//                                                         let currMeanRaw = 0, currMeanTrailMean = 0, currMeanTrailHarMean = 0;
//                                                         let currMedRaw = 0, currMedTrailMean = 0, currMedTrailHarMean = 0;

//                                                         currSLRaw = Math.round(d3.sum(slRawData[m][t]));
//                                                         currSLTrailMean = Math.round(d3.sum(sL15TrailMean[m][t]));
//                                                         currSLTrailHarMean = Math.round(d3.sum(sL15TrailHarMean[m][t]));

//                                                         currMeanRaw = Math.round(d3.sum(meanRawData[m][t]));
//                                                         currMeanTrailMean = Math.round(d3.sum(mean15TrailMean[m][t]));
//                                                         currMeanTrailHarMean = Math.round(d3.sum(mean15TrailHarMean[m][t]));

//                                                         currMedRaw = Math.round(d3.sum(medRawData[m][t]));
//                                                         currMedTrailMean = Math.round(d3.sum(med15TrailMean[m][t]));
//                                                         currMedTrailHarMean = Math.round(d3.sum(med15TrailHarMean[m][t]));

//                                                         tmcSLData += currSLRaw;
//                                                         tmcSLTrailMean += currSLTrailMean;
//                                                         tmcSLTrailHarMean += currSLTrailHarMean;

//                                                         tmcMeanData += currMeanRaw;
//                                                         tmcMeanTrailMean += currMeanTrailMean;
//                                                         tmcMeanTrailHarMean += currMeanTrailHarMean;

//                                                         tmcMedData += currMedRaw;
//                                                         tmcMedTrailMean += currMedTrailMean;
//                                                         tmcMedTrailHarMean += currMedTrailHarMean;

//                                                     })
//                                                 )
//                                             }
// {/*                                             
//                                             {total[0] += tmcSLData}{total[1] += tmcSLTrailMean}{total[2]=total[1]}{total[3] += tmcMedTrailHarMean}{total[4]=total[3]} */}

//                                             <td style={{ backgroundColor: "lightgreen", border: "1px solid black"}}>{tmcSLData}</td>
//                                             <td style={{ backgroundColor: "lightgreen", border: "1px solid black" }}>{tmcSLTrailMean}</td>
//                                             <td style={{ backgroundColor: "lightgreen", border: "1px solid black" }}>{tmcSLTrailMean}</td>
//                                             <td style={{ backgroundColor: "lightgreen", border: "1px solid black" }}>{tmcSLTrailHarMean}</td>
//                                             <td style={{ backgroundColor: "lightgreen", border: "1px solid black" }}>{tmcSLTrailHarMean}</td>


//                                             <td style={{ backgroundColor: "lightgreen", border: "1px solid black" }}>{tmcMeanData}</td>
//                                             <td style={{ backgroundColor: "lightgreen", border: "1px solid black" }}>{tmcMeanTrailMean}</td>
//                                             <td style={{ backgroundColor: "lightgreen", border: "1px solid black" }}>{tmcMeanTrailMean}</td>
//                                             <td style={{ backgroundColor: "lightgreen", border: "1px solid black" }}>{tmcMeanTrailHarMean}</td>
//                                             <td style={{ backgroundColor: "lightgreen", border: "1px solid black" }}>{tmcMeanTrailHarMean}</td>


//                                             <td style={{ backgroundColor: "lightgreen", border: "1px solid black" }}>{tmcMedData}</td>
//                                             <td style={{ backgroundColor: "lightgreen", border: "1px solid black" }}>{tmcMedTrailMean}</td>
//                                             <td style={{ backgroundColor: "lightgreen", border: "1px solid black" }}>{tmcMedTrailMean}</td>
//                                             <td style={{ backgroundColor: "lightgreen", border: "1px solid black" }}>{tmcMedTrailHarMean}</td>
//                                             <td style={{ backgroundColor: "lightgreen", border: "1px solid black" }}>{tmcMedTrailHarMean}</td>
//                                         </tr>
//                                         </React.Fragment>
//                                     );
//                                 })
//                             }
//                             {

//                                 // <tr>
//                                 // <td>Total:</td>
//                                 // <td>{total[0]}</td>
//                                 // <td>{total[1]}</td>
//                                 // <td>{total[2]}</td>
//                                 // <td>{total[3]}</td>
//                                 // <td>{total[4]}</td>
//                                 // </tr>
//                             }
//                             {
//                                 // eslint-disable-next-line array-callback-return
//                                 (
//                                     <>
//                                     </>

//                                     //   <>

//                                     //     {months.map((te, j) => {
//                                     //       let totalDate = 0;
//                                     //       return (
//                                     //         <tr key={j}>
//                                     //           <td>{te}</td>
//                                     //           {
//                                     //             tmcArray.map((t, i) => {
//                                     //               let currentDate = 0;
//                                     //               currentDate = Math.round(d3.sum(wholeData[te][t]))
//                                     //               totalDate += currentDate
//                                     //               total += currentDate;
//                                     //               return (
//                                     //                 <td
//                                     //                   key={i}
//                                     //                   style={{
//                                     //                     border: "1px solid #dddddd",
//                                     //                     backgroundColor: "lightgreen",
//                                     //                   }}
//                                     //                 >
//                                     //                   {currentDate.toString()}
//                                     //                 </td>
//                                     //               );
//                                     //             })
//                                     //           }
//                                     //           <td style={{ backgroundColor: "lightblue" }}>{totalDate}</td>
//                                     //         </tr>
//                                     //       )
//                                     //     })
//                                     //     }
//                                     //     <tr>

//                                     //       <td>Total Month:</td>
//                                     //       {tmcArray.map((t, i) => {
//                                     //         return (
//                                     //           <>
//                                     //             <td
//                                     //               key={i}
//                                     //               style={{
//                                     //                 border: "1px solid #dddddd",
//                                     //                 backgroundColor: "lightblue",
//                                     //               }}
//                                     //             >
//                                     //               {d3.sum(
//                                     //                 months.map((m, j) =>
//                                     //                   // console.log(t, m)
//                                     //                   Math.round(d3.sum(wholeData[m][t]))
//                                     //                 )
//                                     //               )}
//                                     //             </td>
//                                     //           </>
//                                     //         );
//                                     //       })}
//                                     //       <td style={{ backgroundColor: "lightpink" }}>{total}</td>
//                                     //     </tr>
//                                     //   </>
//                                 )
//                             }
//                         </tbody>
//                     </table>
//                 </div>
//             }
//             ;
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
