// import React, { useState, useEffect } from "react";
// import { useLoaderData } from "@remix-run/react";
// import { falcor } from "~/utils/falcor.server";
// import { get, map, find, cloneDeep } from "lodash";
// import * as d3 from "d3";
// import {interpolateYlGn, interpolatePuBu, interpolateBlues} from "d3-scale-chromatic";
// import { Link, useNavigate, Navigate} from "react-router-dom";

// export function congestionCalculator(wholeData, months, thresholdValues) {
//     let updatedWholeData = cloneDeep(wholeData);

//     months.map((m, i) => {
//         thresholdValues.map((v, j) => {
//             updatedWholeData[m][v.tmc].map((t, k) => {
//                 updatedWholeData[m][v.tmc][k] = Math.max(t - v.threshold, 0);
//             });
//         });
//     });

//     return updatedWholeData;
// }

// export async function getMonthEpochs(tmcArray) {
//   let months = [];
//   for (let i = 1; i < 30; i++) {
//     months.push("2022-06-" + (i < 10 ? "0" + i : i));
//   }

//   let monthSpeedData = await falcor.get([
//     "tmc",
//     tmcArray,
//     "tt",
//     "day",
//     months,
//     "by",
//     "epoch",
//   ]);

//   return monthSpeedData;
// }

// export function sortResolution(filteroutMiles, tmcData, date) {
//   let sortedResolution = filteroutMiles.map((t) => {
//     return {
//       tmc: `${t.tmc}`,
//       val: tmcData[`${t.tmc}`]["tt"]["day"][`${date}`]["by"]["epoch"]
//         .map((te) => {
//           return {
//             resolution: te?.resolution,
//             values: te?.value,
//           };
//         })
//         .sort((a, b) => a.resolution - b.resolution),
//     };
//   });

//   let tmcEachEpochValues = sortedResolution.map((t) => {
//     const result = new Array(288);
//     for (let i = 0; i <= 288; i++) {
//       result[i] = find(map(t.val), (o) => o.resolution === i)?.values || 0;
//     }
//     return {
//       [t.tmc]: result,
//     };
//   });

//   const objectEachEpochValues = Object.assign({}, ...tmcEachEpochValues);

//   return objectEachEpochValues;
// }

// export async function loader({ request, params}) {

//   const year = 2021;
//   const geo = "COUNTY|36001";
//   let roads = await falcor.get(["geo", geo, year, "tmclinear"]);
//   let road = get(roads, ["json", "geo", geo, year, "tmclinear", params.road], {});
//   const directions = {"N": "North", "S": "South", "W": "West", "E": "East"}
//   const roadsNames = get(roads, ["json", "geo", geo, year, "tmclinear"], {}).map((road_name) => road_name.roadname+" ("+directions[road_name.direction]+")");

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

//   let months = [];
//   for (let i = 1; i < 30; i++) {
//     months.push("2022-06-" + (i < 10 ? "0" + i : i));
//   }

//   let speedData = await falcor.get([
//     "tmc",
//     tmcArray,
//     "tt",
//     "day",
//     months,
//     "by",
//     "epoch",
//   ]);

//   let tmcData = speedData.json.tmc;

//   let filteroutMiles = tmcArray.map((t) => {
//     return { tmc: `${t}`, miles: tmcMetaMiles[`${t}`].meta["2021"].miles };
//   });


//   let speedLimitThresholdTime = filteroutMiles.map((t) => {
//     return {
//         tmc: `${t.tmc}`,
//         threshold: (t.miles / Math.max(tmcMetaMiles[`${t.tmc}`].meta["2021"].avg_speedlimit * 0.6)) * 3600,
//     };
//   });

//   const getRequestKey = (startEpoch, endEpoch) =>
//     [
//       [tmcArray],
//       +`${year}0101`, // start date
//       +`${year}1231`, // end date
//       startEpoch, //start epoch
//       endEpoch, // end epoch
//       [
//         //"sunday",
//         "monday",
//         "tuesday",
//         "wednesday",
//         "thursday",
//         "friday",
//         //"saturday",
//       ], //day filter
//       "year" /* -- resolution '5-minutes','15-minutes','hour','date', 'month','year' */,
//       "travel_time_all",
//       "travelTime",
//       encodeURI(JSON.stringify({})),
//       "ny",
//     ].join("|");

//   const avgTMCrequestKey = getRequestKey(0, 288);
//   const apiSpeedData = await falcor.get(["routes", "data", avgTMCrequestKey]);
//   let avgTMCSpeed = apiSpeedData.json.routes.data[avgTMCrequestKey];
 
//   var avgSpeedThreshold = avgTMCSpeed.map((t) => {
//     return {
//         tmc: `${t.tmc}`,
//         threshold: `${(t.value*0.6)}`,
//     };
//   });


//   const monthData = months.map((m) => {
//     return {
//       [`${m}`]: 
//         sortResolution(filteroutMiles, tmcData, m)
//     };
//   });

//   const wholeData = Object.assign({}, ...monthData);

//   return { tmcArray, months, wholeData, roadsNames, speedLimitThresholdTime, avgSpeedThreshold};
// }


// export function Mean15Minute(tmcArray, months, wholeData) {
//   var updatedWholeData = cloneDeep(wholeData);


//   months.forEach((m) => {
//     tmcArray.forEach((tmc) => {
//       updatedWholeData[m][tmc].forEach((d, i) => {
//         if (i < 2);
//         else {
//           let t1 = wholeData[m][tmc][i] || 0;
//           let t2 = wholeData[m][tmc][i - 1] || 0;
//           let t3 = wholeData[m][tmc][i - 2] || 0;
//           let count = 0;
//           let sum = 0;

//           if (t1 != 0) {
//             sum += t1;
//             count++;
//           }
//           if (t2 != 0) {
//             sum += t2;
//             count++;
//           }
//           if (t3 != 0) {
//             sum += t3;
//             count++;
//           }

//           if (count == 0) {
//             sum = 0;
//           } else {
//             sum = sum / count;
//           }
//           updatedWholeData[m][tmc][i] = sum;
//         }
//       });
//     });
//   });

//   return updatedWholeData;
// }

// export function HarmonicMean15Minute(tmcArray, months, wholeData) {
//   var updatedWholeData = cloneDeep(wholeData);


//   months.forEach((m) => {
//     tmcArray.forEach((tmc) => {
//       updatedWholeData[m][tmc].forEach((d, i) => {
//         if (i < 2);
//         else {
//           let t1 = wholeData[m][tmc][i] || 0;
//           let t2 = wholeData[m][tmc][i - 1] || 0;
//           let t3 = wholeData[m][tmc][i - 2] || 0;
//           let count = 0;
//           let sum = 0;

//           if (t1 != 0) {
//             sum += 1 / t1;
//             count++;
//           }
//           if (t2 != 0) {
//             sum += 1 / t2;
//             count++;
//           }
//           if (t3 != 0) {
//             sum += 1 / t3;
//             count++;
//           }

//           if (count == 0) {
//             sum = 0;
//           } else {
//             sum = count / sum;
//           }
//           updatedWholeData[m][tmc][i] = sum;
//         }
//       });
//     });
//   });

//   return updatedWholeData;
// }


// export function Denoiser(tmcArray, months, wholeData, speedLimitThresholdTime, w, avgSpeedThreshold) {
//   let updatedWholeData = cloneDeep(wholeData);

//   const avgThreshold = Object.assign({},
//     ...avgSpeedThreshold.map((t, i) => {
//         return {
//             [`${t.tmc}`] : t.threshold,
//         }
//     }));

//   months.map((m) => {
//     let prev = 0;
//     speedLimitThresholdTime.map((t) => {
//         wholeData[m][t.tmc].map((d, i) => {
//             let current = updatedWholeData[m][t.tmc][i];
            
//             if (current > 0) { prev++; }

//             if (current == 0) {
//                 if (prev <= w) {
//                     for (let k = 1; k <= prev; k++) {
//                         updatedWholeData[m][t.tmc][i - k] = 
//                             Math.max(avgThreshold[t.tmc] - t.threshold, 0);
//                     }
//                 }

//                 prev = 0;
//             }
//         });
//     }); 
//   });

//   return updatedWholeData 

// }


// export function selectedFunction(
//   tmcArray,
//   months,
//   wholeData,
//   selectedFuctionName,
//   speedLimitThresholdTime,
//   avgSpeedThreshold
// ) {
//   let updatedWholeData;
  
//   if (selectedFuctionName == "raw") {
  
//     updatedWholeData = cloneDeep(wholeData);
  
//   } else if (selectedFuctionName == "15-mean") {
  
//     updatedWholeData = Mean15Minute(
//       tmcArray,
//       months,
//       wholeData
//     );
  
//   } else if (selectedFuctionName == "15-harmonicMean") {
  
//     updatedWholeData = HarmonicMean15Minute(
//       tmcArray,
//       months,
//       wholeData
//     );
  
//   } else if (selectedFuctionName == "Denoiser-w-1") {
  
//     updatedWholeData = Denoiser(tmcArray, months, wholeData, speedLimitThresholdTime, 1, avgSpeedThreshold);
  
//   } else if (selectedFuctionName == "Denoiser-w-3") {
  
//     updatedWholeData = Denoiser(tmcArray, months, wholeData, speedLimitThresholdTime, 3, avgSpeedThreshold);
  
//   } else if (selectedFuctionName == "Denoiser-w-5") {
  
//     updatedWholeData = Denoiser(tmcArray, months, wholeData, speedLimitThresholdTime, 5, avgSpeedThreshold);
  
//   }
//   return updatedWholeData;
// }

// export function dateFormatData(wholeData, months, tmcArray) {

//   let total_val = 0;
//   const yAxis = cloneDeep(months);
//   const formatedData = Object.assign({}, ...months.map((te, j) => {
//         let totalDate = 0;
//         let temp = Array();
//         tmcArray.map((t, i) => {
//           let currentDate = 0;
//           currentDate = Math.round(d3.sum(wholeData[te][t]));
//           totalDate += currentDate;
//           total_val += currentDate;
//           temp.push(currentDate.toString());
//         });

//         return {
//           [te] : temp
//         }
//   }));

//   return {formatedData, total_val, yAxis};
// }

// export function epochFormatData(wholeData, months, tmcArray) {

//   let total_val = 0;
//   const yAxis = Array(288).fill(0);
//   yAxis.map((t, i) => {
//     yAxis[i] = i;
//   });
 
//   let formatedData = Object.assign({}, ...yAxis.map((x, i) => {
//       let allTMCEpoch = Array(tmcArray.length).fill(0);
//       months.map((month, j) => {
//         tmcArray.map((tmc, k) => {
//           allTMCEpoch[k] += Math.round(wholeData[month][tmc][i]);
//           total_val += wholeData[month][tmc][i];
//         });
//       });

//       return {
//         [i] : allTMCEpoch
//       }
//     })
//   );

//   total_val = Math.round(total_val);
//   return {formatedData, total_val, yAxis};
// }

// export function formatDisplayData( wholeData, months, tmcArray, selectedDisplayFunction ) {
//   let formatedData, total_val, yAxis ;
//   if(selectedDisplayFunction == "Date") {
//     ({formatedData, total_val, yAxis} = dateFormatData(wholeData, months, tmcArray));
//   } else if(selectedDisplayFunction == "Epochs") {
//     ({formatedData, total_val, yAxis} = epochFormatData(wholeData, months, tmcArray));
//   }
  
//   return {formatedData, total_val, yAxis };
// }

// export function selectedThreshold(wholeData, months, speedLimitThresholdTime, avgSpeedThreshold, thresholdSelected) {
//     let updatedWholeData = cloneDeep(wholeData);
//     if(thresholdSelected == "SpeedLimit") {
//         updatedWholeData = congestionCalculator(wholeData, months, speedLimitThresholdTime);
//     } else {
//         updatedWholeData = congestionCalculator(wholeData, months,  avgSpeedThreshold);
//     }

//     return updatedWholeData;
// }

// export default function DMS() {
//   let navigate = useNavigate();
//   let total = 0;

//   let { tmcArray, wholeData, months, roadsNames, speedLimitThresholdTime, avgSpeedThreshold} = useLoaderData();
//   const [roadSelected, changeRoad] = useState(0);
//   const thresholds = ["SpeedLimit", "AvgSpeed"];
//   const [thresholdSelected, changeThreshold] = useState(thresholds[0]);

//   wholeData = selectedThreshold(wholeData, months, speedLimitThresholdTime, avgSpeedThreshold, thresholdSelected);

//   const input_functions_list = ["raw", "15-mean", "15-harmonicMean", "Denoiser-w-1", "Denoiser-w-3", "Denoiser-w-5"];
//   const [selectedFuctionName, changeFunction] = useState(
//     input_functions_list[0]
//   );

//   wholeData = selectedFunction(
//     tmcArray,
//     months,
//     wholeData,
//     selectedFuctionName,
//     speedLimitThresholdTime,
//     avgSpeedThreshold
//   );

//   const display_function_list = ["Date", "Epochs"];
//   const [selectedDisplayFunction, changeDisplayFunction] = useState(
//     display_function_list[0]
//   );

//   let {formatedData, total_val, yAxis} = formatDisplayData(wholeData, months, tmcArray, selectedDisplayFunction);
  
//   let resultantOutput;

//   if(selectedDisplayFunction == "Date") {  
//     let maxValue = 0, maxRow = 0;
//     yAxis.map((yaxis, i) => {
//       let total_row = 0;
//       formatedData[yaxis].map((t, j) => {
//         maxValue = Math.max(maxValue, t);
//         total_row += t;
//       });
//       maxRow = Math.max(maxRow, total_row);
//     });


//     resultantOutput = 
//       yAxis.map((yaxis, i) => {
//         let total_row = 0;
//         return (
//           <tr key={i} style={{maxHeight : "900px"}}>
//             <td>{yaxis}</td>
//             {
//               formatedData[yaxis].map((t, j) => {
//                 total_row += Number(t);
//                 total += Number(t);
//                 return (
//                   <td key={j} style={{ backgroundColor: interpolateBlues(t/maxValue) }}>{t.toString()}</td>
//                 );
//               })
//             }
//             <td style={{ backgroundColor:  interpolateBlues(total_row/maxRow) }}>{total_row}</td>
//           </tr>
//         )
//       })
//   } else {
//     let maxValue = 0, maxRow = 0;
//     yAxis.map((yaxis, i) => {
//       let total_row = 0;
//       formatedData[yaxis].map((t, j) => {
//         maxValue = Math.max(maxValue, t);
//         total_row += t;
//       });
//       maxRow = Math.max(maxRow, total_row);
//     });

//     resultantOutput = yAxis.map((yaxis, i) => {
//       let total_row = 0;
//       return (
//         <tr key={i} style={{maxHeight : "900px"}}>
//         <td></td>
//           {
//             formatedData[yaxis].map((t, j) => {
//               total_row += Number(t);
//               total += Number(t);
//               return (
//                 <td key={j} style={{ backgroundColor: interpolateBlues(t/maxValue) }}></td>
//               );
//             })
//           }
//           <td style={{ backgroundColor: interpolateBlues(total_row/maxRow) }}></td>
//         </tr>
//       )
//     })
//   }
  

//   let thresholdVals;
//   if(thresholdSelected == "SpeedLimit") {
//     thresholdVals = Object.assign({},
//         ...speedLimitThresholdTime.map((t, i) => {
//            return { [`${t.tmc}`]: t.threshold
//             }
//         })
//         )
//   } else {
//     thresholdVals = Object.assign({},
//         ...avgSpeedThreshold.map((t, i) => {
//            return { [`${t.tmc}`]: t.threshold
//             }
//         })
//         )
//   }

//   return (
//     <div className="conatiner">
//       {
//         <div className="p-4 min-w-full min-h-screen" style={{ textAlign: "center" }}>
//           {/* to display the object structure */}
//           {/* <div className="">
//             <pre>{JSON.stringify(wholeData, null, 3)}</pre>
//           </div> */}


//           <div className="grid grid-rows-3 grid-flow-col gap-4 text-center">
//             <div className="row-start-1 row-end-4">
//               <div className="grid-rows-3 grid-flow-col gap-4">
//                 <div className="row-start-1 row-end-4">
//                   <label for="road_function">Choose a road: </label>
//                   {/* <Link to={`/congestion/grid/${roadSelected}`} className="font-medium text-black-600 hover:text-black-500"> */}
//                     <select
//                       id="road_functions"
//                       onChange={(e) => {changeRoad(e.target.value); navigate(`/congestion/grid/${e.target.value}`)}}
//                     >
//                       {roadsNames.map((roadsName, i) => (
//                         <option key={i} value={i}>
//                           {roadsName}
//                         </option>
//                       ))}
//                     </select>
//                   {/* </Link> */}
//                 </div>
//                 <div>
//                   <pre>Selected road: {roadSelected}</pre>
//                 </div>
//               </div>
//             </div>

//             <div className="row-start-1 row-end-4">
//               <label for="threshold_function">Choose a Threshold type: </label>
//               <select
//                 name="threshold_function"
//                 id="threshold_function"
//                 onChange={(e) => changeThreshold(e.target.value)}
//               >
//                 {thresholds.map((threshold, i) => (
//                   // eslint-disable-next-line react/jsx-key

//                   <option key={i} value={threshold}>
//                     {threshold}
//                   </option>
//                 ))}
//               </select>

//               <pre>Selected Threshold: {thresholdSelected}</pre>
//             </div>


//             <div className="row-start-1 row-end-4">
//               <label for="input_function">Choose a input function: </label>
//               <select
//                 name="input_function"
//                 id="input_functions"
//                 onChange={(e) => changeFunction(e.target.value)}
//               >
//                 {input_functions_list.map((input_function, i) => (
//                   // eslint-disable-next-line react/jsx-key

//                   <option key={i} value={input_function}>
//                     {input_function}
//                   </option>
//                 ))}
//               </select>

//               <pre>Selected function: {selectedFuctionName}</pre>
//             </div>


//             <div className="row-start-1 row-end-4">
//               <label for="display_function">Choose a Display Type: </label>
//               <select
//                 name="display_function"
//                 id="display_function"
//                 onChange={(e) => changeDisplayFunction(e.target.value)}
//               >
//                 {display_function_list.map((display_function, i) => (
//                   <option key={i} value={display_function}>
//                     {display_function}
//                   </option>
//                 ))}
//               </select>

//               <pre>Selected Display-Type: {selectedDisplayFunction}</pre>
//             </div>
//           </div>


//           <table
//             style={{
//               border: "2px solid #000000",
//               backgroundColor: "#dddddd",
//               width: "100%",
//               height: "900px"
//             }}
//           >
//             <thead>
//               <tr clasname="border boder-grey-900">
//                 <td
//                   style={{
//                     border: "1p solid #dddddd",
//                   }}
//                 >
//                   Index
//                 </td>
//                 {tmcArray.map((t, i) => {
//                   return (
//                     <td
//                       key={i}
//                       style={{
//                         border: "1px solid #dddddd",
//                       }}
//                     >
//                       {t}
//                     </td>
//                   );
//                 })}
//                 <td>Total TMC:</td>
//               </tr>

//               <tr clasname="border boder-grey-900">
//                 <td
//                   style={{
//                     border: "1p solid #dddddd",
//                   }}
//                 >
//                   Threshold
//                 </td>
//                 {tmcArray.map((t, i) => {
//                   return (
//                     <td
//                       key={i}
//                       style={{
//                         border: "1px solid #dddddd",
//                       }}
//                     >
//                       {Math.round(thresholdVals[t], 2)}
//                     </td>
//                   );
//                 })}
//                 <td>Total TMC:</td>
//               </tr>
//             </thead>
//             <tbody style={{ heght: "100%" }}>
//               {
//                 // eslint-disable-next-line array-callback-return
//                 (
//                   <>

//                       {/* months.map((te, j) => {
//                         let totalDate = 0;
//                         return (
//                           <tr key={j}>
//                             <td>{te}</td>
//                             {
//                               tmcArray.map((t, i) => {
//                                 let currentDate = 0;
//                                 currentDate = Math.round(d3.sum(wholeData[te][t]))
//                                 totalDate += currentDate
//                                 total += currentDate;
//                                 return (
//                                   <td
//                                     key={i}
//                                     style={{
//                                       border: "1px solid #dddddd",
//                                       backgroundColor: "lightgreen",
//                                     }}
//                                   >
//                                     {currentDate.toString()}
//                                   </td>
//                                 );
//                               })
//                             }
//                             <td style={{ backgroundColor: "lightblue" }}>{totalDate}</td>
//                           </tr>
//                         )
//                       }) */}

//                       {resultantOutput}
                    
                     

//                     <tr>

//                       <td>Total Month:</td>
//                       {tmcArray.map((t, i) => {
//                         return (
//                           <>
//                             <td
//                               key={i}
//                               style={{
//                                 border: "1px solid #dddddd",
//                                 backgroundColor: "lightblue",
//                               }}
//                             >
//                               {d3.sum(
//                                 months.map((m, j) =>
//                                   Math.round(d3.sum(wholeData[m][t]))
//                                 )
//                               )}
//                             </td>
//                           </>
//                         );
//                       })}
//                       <td style={{ backgroundColor: "lightpink" }}>{total}</td>
//                     </tr>
//                   </>
//                 )
//               }
//             </tbody>
//           </table>
//         </div>
//       }
//       ;
//     </div>
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
