// import React, { useState, useEffect } from "react";
// import { useLoaderData     } from "@remix-run/react";
// import { falcor } from "~/utils/falcor.server";
// import { get, map, find, flatten, cloneDeep, mean } from "lodash";
// import { ResponsiveLine } from "@nivo/line";
// import { Link, useNavigate } from "react-router-dom";


// /*
// * Function for calculating the congetion time
// */
// export function congestionCalculator(filteroutThresholdTime, tmcEpochTime) {
//     const computedDifference = filteroutThresholdTime.map((t) => {
//         return {
//             [t.tmc]: tmcEpochTime[`${t.tmc}`].map((te) =>
//                 Math.max(te - t.threshold, 0)
//             ),
//         };
//     });
//     return Object.assign({}, ...computedDifference);
// }



// /*
// * Function for calculating non-reccurent congetion time
// */
// export function congestionCalculatorNonRecurrent(
//     filteroutThresholdTime,
//     tmcEpochTime,
//     avgTMCCongetionTime
// ) {
//     const computedDifference = filteroutThresholdTime.map((t) => {
//         return {
//             [t.tmc]: tmcEpochTime[`${t.tmc}`].map((te) =>
//                 Math.max(te - Math.max(t.threshold, avgTMCCongetionTime[`${t.tmc}`]), 0)
//             ),
//         };
//     });
//     return Object.assign({}, ...computedDifference);
// }



// /*
// * Function for returning values either time or speed based on the defaultValue parameter
// * of 0-288 epochs for each tmc formatting data
// */
// export function sortResolution(filteroutMiles, tmcData, date, defaultValue) {
//     let sortedResolution = filteroutMiles.map((t) => {
//         return {
//             tmc: `${t.tmc}`,
//             val: tmcData[`${t.tmc}`]["tt"]["day"][`${date}`]["by"]["epoch"]
//                 .map((te) => {
//                     return {
//                         resolution: te?.resolution,
//                         values: defaultValue == 0 ? te?.value : (t.miles/te?.value)*3600,
//                     };
//                 })
//                 .sort((a, b) => a.resolution - b.resolution),
//         };
//     });

//     let tmcEachEpochValues = sortedResolution.map((t) => {
//         const result = new Array(288);
//         for (let i = 0; i <= 288; i++) {
//             result[i] = find(map(t.val), (o) => o.resolution === i)?.values || defaultValue;;
//         }
//         return {
//             [t.tmc]: result,
//         };
//     });

//     const objectEachEpochValues = Object.assign({}, ...tmcEachEpochValues);

//     return objectEachEpochValues;
// }


// /*
// * Main loader function
// */
// export async function loader({ request, params }) {
//     const year = 2021;
//     const geo = "COUNTY|36001";
//     let roads = await falcor.get(["geo", geo, year, "tmclinear"]);
//     let road = get(roads, ["json", "geo", geo, year, "tmclinear", params.road], {});

//     const directions = { "N": "North", "S": "South", "W": "West", "E": "East" }
//     const roadsNames = get(roads, ["json", "geo", geo, year, "tmclinear"], {}).map((road_name) => road_name.roadname + " (" + directions[road_name.direction] + ")");

//     const initialRoad = params.road;
//     let tmcs = await falcor.get(["tmc", "tmclinear", year, geo, road.tmclinear, road.direction, ]);
//     let tmcArray = get(tmcs, ["json", "tmc", "tmclinear", year, geo, road.tmclinear, road.direction, ])
//                     .sort((a, b) => a.road_order - b.road_order)
//                     .map((d) => d.tmc);


//     let tmcMeta = await falcor.get(["tmc", tmcArray, "meta", year, ["avg_speedlimit", "miles"], ]);
//     let tmcMetaMiles = tmcMeta.json.tmc;


//     let months = [];
//     for (let i = 1; i < 30; i++) {
//         months.push("2022-06-" + (i < 10 ? "0" + i : i));
//     }


//     let speedData = await falcor.get(["tmc", tmcArray, "tt", "day", months, "by", "epoch", ]);
//     let tmcData = speedData.json.tmc;


//     let filteroutMiles = tmcArray.map((t) => {
//         return { tmc: `${t}`, miles: tmcMetaMiles[`${t}`].meta["2021"].miles };
//     });


//     let filteroutThresholdTime = filteroutMiles.map((t) => {
//         return {
//             tmc: `${t.tmc}`,
//             threshold: (t.miles / Math.max(tmcMetaMiles[`${t.tmc}`].meta["2021"].avg_speedlimit * 0.6, 20)) * 3600,
//         };
//     });


//     let speedLimitThresholdTime = Object.assign({}, ...filteroutMiles.map((t) => {
//         return {
//             [`${t.tmc}`]: [tmcMetaMiles[`${t.tmc}`].meta["2021"].avg_speedlimit * 0.6]
//         }
//     }));
    
//     let milesTMC = Object.assign(
//             {},
//             ...filteroutMiles.map((t) => {
//                 return { [t.tmc]: t.miles };
//             }
//         )
//     );

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
//     var finalDataSpeed = Object.assign(
//             {},
//             ...tmcArray.map((tmc) => {
//                 return {
//                     [tmc]: [],
//                 };
//             }
//         )
//     );

//     var finalDataTime = Object.assign(
//             {},
//             ...tmcArray.map((tmc) => {
//                 return {
//                     [tmc]: [],
//                 };
//             }
//         )
//     );

    
//     avgTMCSpeed.map((d) => {
//         // Array(288).fill(0).map((t) => {
//         finalDataSpeed[d.tmc].push((milesTMC[d.tmc] / d.value) * 3600);
//         finalDataTime[d.tmc].push(d.value)
//         // });
//     });

//     let avgSpeedThreshold = Object.assign(
//         {},
//         ...tmcArray.map((d) => {
//             return {
//                 [d]: [finalDataSpeed[d].reduce((a, b) => a + b, 0) / 288],
//             };
//         }
//         )
//     );
    

//     let avgTMCCongetionTime = Object.assign(
//             {},
//             ...tmcArray.map((d) => {
//                 return {
//                     [d]: finalDataTime[d].reduce((a, b) => a + b, 0) / 288,
//                 };
//             }
//         )
//     );
 

//     avgTMCSpeed = finalDataSpeed;
//     let avgTMCTime = finalDataTime;

//     const monthCongestionData = months.map((m) => {
//         let defaultValue = null;
//         return {
//             [`${m}`]: sortResolution(filteroutMiles, tmcData, m, defaultValue),
//         };
//     });

    
//     const monthCongestionDataTime = months.map((m) => {
//         let defaultValue = 0;
//         return {
//             [`${m}`]: congestionCalculator(
//                 filteroutThresholdTime,
//                 sortResolution(filteroutMiles, tmcData, m, defaultValue)
//             ),
//         };
//     });

    
//     const monthCongestionDataTimeNonRecurrent = months.map((m) => {
//         let defaultValue = 0;
//         return {
//             [`${m}`]: congestionCalculatorNonRecurrent(
//                 filteroutThresholdTime,
//                 sortResolution(filteroutMiles, tmcData, m, defaultValue),
//                 avgTMCCongetionTime
//             ),
//         };
//     });


//     const wholeData = Object.assign({}, ...monthCongestionData);
//     const wholeDataTime = Object.assign({}, ...monthCongestionDataTime);
//     const wholeDataTimeNonRecurrent = Object.assign({}, ...monthCongestionDataTimeNonRecurrent);
    
//     return {
//         tmcArray,
//         months,
//         wholeData,
//         avgTMCSpeed,
//         avgTMCTime,
//         wholeDataTime,
//         wholeDataTimeNonRecurrent,
//         filteroutThresholdTime,
//         roadsNames,
//         speedLimitThresholdTime,
//         initialRoad,
//         avgSpeedThreshold
//     };
// }



// /*
// * Calculates the congetion time from the data
// */
// export function congetionRemoval(filteroutThresholdTime, months, wholeDataTime, avgTMCTime) {
    
//     // console.log("function called!!!");
//     months.map((m) => {
//         let prev = 0;
//         filteroutThresholdTime.map((t) => {
//             wholeDataTime[m][t.tmc].map((d, i) => {
//                 let current = wholeDataTime[m][t.tmc][i];
                
//                 if (current > 0) { prev++; }

//                 if (current == 0) {
//                     if (prev < 5) {
//                         for (let k = 1; k <= prev; k++) {
//                             // console.log("change happened!!!");
//                             wholeDataTime[m][t.tmc][i - k] = 
//                                 Math.max(avgTMCTime[t.tmc][i - k] - t.threshold, 0);
//                         }
//                     }

//                     prev = 0;
//                 }
//             });
//         }); 
//     });

//     return wholeDataTime;
// }





// /*
// * SelectedPlotTypeFunction checks if the selected plot type is speed or congestion-time
// * or non-recurrent-congestion, and based on that returns the appropriate data.
// */
// export function selectedPlotTypeFunction(
//     wholeData,
//     avgTMCSpeed,
//     avgTMCTime,
//     wholeDataTime,
//     wholeDataTimeNonRecurrent,
//     selectedPlotType
// ) {

//     if (selectedPlotType == "Speed") {
//         return [wholeData, avgTMCSpeed];
//     } else if (selectedPlotType == "Congestion-time") {
//         return [wholeDataTime, avgTMCTime];
//     } else if (selectedPlotType == "Non-recurrent-congestion") {
//         return [wholeDataTimeNonRecurrent, avgTMCTime];
//     }
// }



// /*
// * Takes 3 values, and computes the mean of the 3 values.
// */
// export function Sum15Minutes(t1, t2, t3, sumDefaultValue, functionType) {
//     let count = 0;
//     let sum = 0;

//     if(functionType == "mean") {
//         [t1, t2, t3].map((t) => {
//             if (t != 0) {
//                 count++;
//                 sum += t;
//             }
//         });

//         sum = count === 0? sumDefaultValue : sum/count;
//     }

//     else {
//         [t1, t2, t3].map((t) => {
//             if (t != 0) {
//                 count++;
//                 sum += 1/t;
//             }
//         });

//         sum = count === 0? sumDefaultValue : count/sum;
//     }

//     return sum;
// }



// /*
// * Mean15Minutes function return the updated data, after computing 15 min mean
// * on the given raw data.
// */
// export function Mean15Minute(
//     tmcArray,
//     months,
//     wholeData,
//     avgTMCData,
//     selectedPlotType,
//     j
// ) {
//     var updatedAvgTMCSpeed = cloneDeep(avgTMCData);
//     var updatedWholeData = cloneDeep(wholeData);
//     const sumDefaultValue = selectedPlotType == "Speed" ? null : 0;
//     const functionType = "mean";

//     tmcArray.map((tmc) => {
//         avgTMCData[tmc].map((d, i) => {
//             if (i + j > 2 || i + j <= 288)
//             {
//                 let t1 = avgTMCData[tmc][i + j] || 0;
//                 let t2 = avgTMCData[tmc][i + j - 1] || 0;
//                 let t3 = avgTMCData[tmc][i + j - 2] || 0;

//                 let sum = Sum15Minutes(t1, t2, t3, sumDefaultValue, functionType);
//                 updatedAvgTMCSpeed[tmc][i+j] = sum;
//             }
//         });
//     });


//     months.map((m) => {
//         tmcArray.map((tmc) => {
//             updatedWholeData[m][tmc].map((d, i) => {
//                 if (i + j > 2 || i + j < 288)
//                 {
//                     let t1 = wholeData[m][tmc][i + j] || 0;
//                     let t2 = wholeData[m][tmc][i + j - 1] || 0;
//                     let t3 = wholeData[m][tmc][i + j - 2] || 0;
//                     let sum = Sum15Minutes(t1, t2, t3, sumDefaultValue, functionType);
//                     updatedWholeData[m][tmc][i + j] = sum;
//                 }
//             });
//         });
//     });

//     return { updatedAvgTMCSpeed, updatedWholeData };
// }



// /*
// * HarmonicMean15Minutes function return the updated data, after computing 15 min Harmonicmean
// * on the given raw data.
// */
// export function HarmonicMean15Minute(
//     tmcArray,
//     months,
//     wholeData,
//     avgTMCData,
//     selectedPlotType,
//     j
// ) {
//     var updatedAvgTMCSpeed = cloneDeep(avgTMCData);
//     var updatedWholeData = cloneDeep(wholeData);
//     const sumDefaultValue = selectedPlotType == "Speed" ? null : 0;
//     let functionType = "harmonicMean";
    
//     tmcArray.map((tmc) => {
//         avgTMCData[tmc].map((d, i) => {
//             if (i + j > 2 || i + j <= 288)
//             {
//                 let t1 = avgTMCData[tmc][i + j] || 0;
//                 let t2 = avgTMCData[tmc][i + j - 1] || 0;
//                 let t3 = avgTMCData[tmc][i + j - 2] || 0;
//                 let sum = Sum15Minutes(t1, t2, t3, sumDefaultValue, functionType);
//                 updatedAvgTMCSpeed[tmc][i + j] = sum;
//             }
//         });
//     });


//     months.map((m) => {
//         tmcArray.map((tmc) => {
//             updatedWholeData[m][tmc].map((d, i) => {
//                 if (i + j > 2 || i + j <= 288)
//                 {
//                     let t1 = wholeData[m][tmc][i + j] || 0;
//                     let t2 = wholeData[m][tmc][i + j - 1] || 0;
//                     let t3 = wholeData[m][tmc][i + j - 2] || 0;

//                     let sum = Sum15Minutes(t1, t2, t3, sumDefaultValue, functionType);
//                     updatedWholeData[m][tmc][i + j] = sum;
//                 }
//             });
//         });
//     });

//     return { updatedAvgTMCSpeed, updatedWholeData };
// }



// export function Denoiser(tmcArray, months, wholeData, denoiserThresholdVals, w, avgTMCData) {
//     let updatedWholeData = cloneDeep(wholeData);
//     console.log(avgTMCData, "---avgData");
   
//     months.map((m) => {
//       let prev = 0;
//       denoiserThresholdVals.map((t) => {

//           wholeData[m][t.tmc].map((d, i) => {
//               let current = updatedWholeData[m][t.tmc][i];
              
//               if(current == null) {
//                 if(prev > 0) {
//                     for (let k = 1; k <= prev; k++) {
//                         updatedWholeData[m][t.tmc][i - k] = 
//                             Math.max(avgTMCData[t.tmc][i-k], null);
//                     }
//                 }   
//                 prev = 0;
//               } else {

//                 if (current < avgTMCData[t.tmc][i]) { prev++; }
                
//                 if (current >= avgTMCData[t.tmc][i]) {
//                     if (prev <= w) {
//                         for (let k = 1; k <= prev; k++) {
//                             updatedWholeData[m][t.tmc][i - k] = 
//                                 Math.max(avgTMCData[t.tmc][i], null);
//                         }
//                     }
    
//                     prev = 0;
//                 }
//             }
//           });
//       }); 
//     });

//     // console.log(wholeData["2022-06-01"]["120N05851"], "---");
  
//     return updatedWholeData 
  
// }


// /*
// * Based on the selected function, it calls the appropriate function and returns
// * the updated data.
// */
// export function selectedFunction(
//     tmcArray,
//     months,
//     wholeData,
//     avgTMCData,
//     selectedFuctionName,
//     selectedPlotType,
//     denoiserThresholdVals,
// ) {
//     var j;
//     let updatedAvgTMCSpeed = cloneDeep(avgTMCData), updatedWholeData = cloneDeep(wholeData);
//     // If the selected function is raw data, return the raw data.
//     if (selectedFuctionName == "raw") {
//         updatedAvgTMCSpeed = cloneDeep(avgTMCData);
//         updatedWholeData = cloneDeep(wholeData);
//     }
    

//     // If the selected function is Trailling-15 min mean, return the updated data
//     // based on 15 min mean of trailling values.
//     // If the selected function is Surrounding-15 min mean, return the updated data
//     // based on 15 min mean of surrounding values.
//     else if (selectedFuctionName == "Trailling-15-mean" || selectedFuctionName == "Surrounding-15-mean") {
//         j = selectedFuctionName == "Trailling-15-mean"? 0 : 1;
//         ({ updatedAvgTMCSpeed, updatedWholeData } = Mean15Minute(
//             tmcArray,
//             months,
//             wholeData,
//             avgTMCData,
//             selectedPlotType,
//             j
//         ));
//     }
    

//     // If the selected function is Tralling-15-Harmonic mean, return the updated data
//     // based on 15 min mean of harmonic mean of trailling values.
//     // If the selected function is Surrounding-15-Harmonic mean, return the updated data
//     // based on 15 min mean of harmonic mean of surrounding values.
//     else if (selectedFuctionName == "Trailling-15-harmonicMean" || selectedFuctionName == "Surrounding-15-harmonicMean") {
//         j = selectedFuctionName == "Trailling-15-harmmonicMean"? 0 : 1;
//         ({ updatedAvgTMCSpeed, updatedWholeData } = HarmonicMean15Minute(
//             tmcArray,
//             months,
//             wholeData,
//             avgTMCData,
//             selectedPlotType,
//             j
//         ));
//     }
    
//     else if (selectedFuctionName == "Denoiser-w-1") {
  
//         updatedWholeData = Denoiser(tmcArray, months, wholeData, denoiserThresholdVals, 1, avgTMCData);
      
//       } else if (selectedFuctionName == "Denoiser-w-3") {
      
//         updatedWholeData = Denoiser(tmcArray, months, wholeData, denoiserThresholdVals, 3, avgTMCData);
      
//       } else if (selectedFuctionName == "Denoiser-w-5") {
      
//         updatedWholeData = Denoiser(tmcArray, months, wholeData, denoiserThresholdVals, 5, avgTMCData);
      
//       }
    
//     return { updatedAvgTMCSpeed, updatedWholeData };
// }



// /*
// * Convert the raw data into NIVO acceptable format.
// */
// export function TMCPlotData(
//     months,
//     updatedWholeData,
//     updatedAvgTMCSpeed,
//     selectedTmc
// ) {

//     let plotData = months.map((t) => {
//         return {
//             id: t,
//             data: (updatedWholeData[t][selectedTmc] || []).map((d, i) => {
//                 return {
//                     x: i,
//                     y: d,
//                 };
//             }),
//         };
//     });

//     // console.log("\n\n\n",updatedAvgTMCSpeed, "-here");

//     let dataAverage = 
//     // Array(288).fill(0).map((d, i) => {
//         (updatedAvgTMCSpeed[selectedTmc] || []).map((de, i) => {
//             return {
//                 x: i,
//                 y: de,
//             };
//         })
//     // });  
    


//     let data_avg = {
//         id: "Threshold",
//         data: dataAverage,
//     };

    
//     plotData.push(data_avg);
//     return plotData;
// }


// export function theresholdSelection(avgSpeedThreshold, speedLimitThresholdTime, thresholdSelected) {
//     if(thresholdSelected == "SpeedLimit")
//         return speedLimitThresholdTime
//     else 
//         return avgSpeedThreshold
// }


// /*
// * Main Function
// */
// export default function DMS() {
//     const navigate = useNavigate();

//     let {
//         tmcArray,
//         months,
//         wholeData,
//         avgTMCSpeed,
//         avgTMCTime,
//         wholeDataTime,
//         wholeDataTimeNonRecurrent,
//         filteroutThresholdTime,
//         roadsNames,
//         speedLimitThresholdTime,
//         initialRoad,
//         avgSpeedThreshold
//     } = useLoaderData();


//     const [roadSelected, changeRoad] = useState(initialRoad);
//     const thresholds = ["SpeedLimit", "AvgSpeed"];
//     const [thresholdSelected, changeThreshold] = useState(thresholds[0]);

//     let thresholdVals = theresholdSelection(avgSpeedThreshold, speedLimitThresholdTime, thresholdSelected);
    
//     let denoiserThresholdVals = tmcArray.map((t, i) => {
//         return {
//             "tmc": t, "threshold": thresholdVals[t][0]
//         }
//     });


//     const [selectedTmc, changeTmc] = useState(tmcArray[0]);

//     thresholdVals = Object.assign({}, ...thresholdVals[selectedTmc].map((value, key) => {
//         let temp = []
//         Array(288).fill(0).map((t) => {
//             temp.push(value);    
//         });

//         return {
//             [`${selectedTmc}`] : temp
//         }
//     }));

//     const input_functions_list = [
//         "raw",
//         "Trailling-15-mean",
//         "Surrounding-15-mean",
//         "Trailling-15-harmonicMean",
//         "Surrounding-15-harmonicMean",
//         "Denoiser-w-1",
//         "Denoiser-w-3",
//         "Denoiser-w-5"
//     ];

//     const [selectedFuctionName, changeFunction] = useState(
//         input_functions_list[0]
//     );

//     const plotTypeList = ["Speed", "Congestion-time", "Non-recurrent-congestion"];
//     const [selectedPlotType, changePlot] = useState(plotTypeList[0]);

    
//     if(selectedPlotType == "Congestion-time") 
//         wholeDataTime = congetionRemoval(filteroutThresholdTime, months, wholeDataTime, avgTMCTime);
//     else if(selectedPlotType == "Non-recurrent-congestion")
//         wholeDataTimeNonRecurrent = congetionRemoval(filteroutThresholdTime, months, wholeDataTimeNonRecurrent, avgTMCTime);

//     let avgTMCData;

//     [wholeData, avgTMCData] = selectedPlotTypeFunction(
//         wholeData,
//         avgTMCSpeed,
//         avgTMCTime,
//         wholeDataTime,
//         wholeDataTimeNonRecurrent,
//         selectedPlotType
//     );

//     // console.log(filteroutThresholdTime, "---this one");

//     let { updatedAvgTMCSpeed, updatedWholeData } = selectedFunction(
//         tmcArray,
//         months,
//         wholeData,
//         avgTMCData,
//         selectedFuctionName,
//         selectedPlotType,
//         denoiserThresholdVals
//     );

//     const plotData = TMCPlotData(
//         months,
//         updatedWholeData,
//         thresholdVals,
//         selectedTmc
//     );

    
//     let totalCongestion = 0, congestionTag;
//     months.map((m) => {
//         totalCongestion += (updatedWholeData[m][selectedTmc]||[]).reduce((a, b) => a + b, 0);
//     });

//     if(selectedPlotType != "Speed") {
//         congestionTag = <pre>Total Congetion: {totalCongestion}</pre>
//     } else {
//         congestionTag = <pre></pre>
//     }


//     const MyResponsiveLine = ({ data /* see data tab */ }) => (
//         <ResponsiveLine
//             data={data}
//             margin={{ top: 50, right: 160, bottom: 50, left: 50 }}
//             xScale={{ type: "linear" }}
//             yScale={{
//                 type: "linear",
//                 stacked: ("stacked", false),
//                 min: selectedPlotType == "Speed" ? 0 : 0,
//             }}
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
//             //   enableArea= {selectedPlotType != "Speed"? true : false}
//             // areaBaselineValue = {{data_avg}}
//             useMesh={true}
//             // gridXValues={[ 0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 288]}
//             gridYValues={[40, 60, 80, 100, 120]}
//             onHover={function (event, legendItem) {
//                 var options = this.options || {};
//                 var hoverOptions = options.hover || {};
//                 var ci = this.chart;
//                 var hoveredDatasetIndex = legendItem.datasetIndex;
//                 ci.updateHoverStyle(
//                     ci.getDatasetMeta(hoveredDatasetIndex).data,
//                     hoverOptions.mode,
//                     true
//                 );
//                 ci.render();
//             }}
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
//                             on: "hover",
//                             function(event, legendItem) {
//                                 var options = this.options || {};
//                                 var hoverOptions = options.hover || {};
//                                 var ci = this.chart;
//                                 var hoveredDatasetIndex = legendItem.datasetIndex;
//                                 ci.updateHoverStyle(
//                                     ci.getDatasetMeta(hoveredDatasetIndex).data,
//                                     hoverOptions.mode,
//                                     true
//                                 );
//                                 ci.render();
//                             },
//                             style: {
//                                 itemBackground: "rgba(0, 0, 0, .03)",
//                                 function(event, legendItem) {
//                                     var options = this.options || {};
//                                     var hoverOptions = options.hover || {};
//                                     var ci = this.chart;
//                                     var hoveredDatasetIndex = legendItem.datasetIndex;
//                                     ci.updateHoverStyle(
//                                         ci.getDatasetMeta(hoveredDatasetIndex).data,
//                                         hoverOptions.mode,
//                                         true
//                                     );
//                                     ci.render();
//                                 },
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
//                 <div className="grid grid-rows-3 grid-flow-col gap-4 text-center">
//                     <div className="row-start-1 row-end-4">
//                         <div className="grid-rows-3 grid-flow-col gap-4">
//                             <div className="row-start-1 row-end-4">
//                                 <label for="road_function">Choose a road: </label>
//                                 {/* <Link to={`/congestion/update/${roadSelected}`} className="font-medium text-black-600 hover:text-black-500"> */}
//                                 <select
//                                     id="road_functions"
//                                     onChangeCapture={(e) => { changeRoad(e.target.value); navigate(`/congestion/update/${e.target.value}`); }}
//                                 >
//                                     {roadsNames.map((roadsName, i) => (
//                                         <option key={i} value={i}>
//                                             {roadsName}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 {/* </Link> */}
//                             </div>
//                             <div>
//                                 <pre>Selected road: {roadSelected}</pre>
//                             </div>
//                         </div>
//                     </div>


//                     <div className="row-start-1 row-end-4">
//                         <div className="grid-rows-3 grid-flow-col gap-4">
//                             <div className="row-start-1 row-end-4">
//                                 <label className="" for="tmcs">
//                                     Choose a tmc:
//                                 </label>
//                                 <select
//                                     className="mx-auto"
//                                     name="tmcs"
//                                     id="tmcs"
//                                     onChangeCapture={(e) => changeTmc(e.target.value)}
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
//                         <label for="threshold_function">Choose a Threshold type: </label>
//                         <select
//                             name="threshold_function"
//                             id="threshold_function"
//                             onChange={(e) => changeThreshold(e.target.value)}
//                         >
//                             {thresholds.map((threshold, i) => (
//                                 // eslint-disable-next-line react/jsx-key

//                                 <option key={i} value={threshold}>
//                                     {threshold}
//                                 </option>
//                             ))}
//                         </select>

//                         <pre>Selected Threshold: {thresholdSelected}</pre>
//                     </div>


//                     <div className="row-start-1 row-end-4">
//                         <label for="input_function">Choose a input function: </label>
//                         <select
//                             name="input_function"
//                             id="input_functions"
//                             onChangeCapture={(e) => changeFunction(e.target.value)}
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
//                             onChangeCapture={(e) => changePlot(e.target.value)}
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

//                     <div>
//                         {congestionTag}
//                     </div>
//                 </div>
//             }

//             {/* {
//                  <div className="max-w-5xl mx-auto p-4">
//                      <pre>{JSON.stringify(wholeData, null, 3)}</pre>
//                  </div>
//             } */}


//             <div
//                 className="text-secondary"
//                 style={{ width: "100%", height: "1000px" }}
//             >
//                 <MyResponsiveLine data={plotData} />
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
