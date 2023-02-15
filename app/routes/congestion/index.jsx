import React, {useEffect} from 'react'
import { useLoaderData } from "@remix-run/react";
import { falcor } from '~/utils/falcor.server'
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';

import get from 'lodash/get'
import flatten from 'lodash/flatten'

//import {merge} from 'lodash'


export async function loader ({ request, params }) {
  
  async function getTmcsByDirection (interstate,year) {
    // get all counties in NY (fips = 36)
    let counties = get(
        await falcor.get(["geo", "36", "geoLevels"]), 
        ["json","geo", "36", "geoLevels"],
        []
      ).filter(d => d.geolevel === 'COUNTY')
       .map(d => `${d.geolevel}|${d.geoid}`) 

    // --
    // get all tmcs linear ids in each county and filter down to ones 
    // matching the defined interstate
    // -- 
    let tmcLinearRoads = await falcor.get(["geo", counties, year, "tmclinear"])
    let tmcLinearSegments = flatten(counties.map(geo => {
      return flatten(
        get(tmcLinearRoads, ["json", "geo", geo, year, "tmclinear"], [])
          .filter(d => d.roadname.includes(`I-${interstate}`))
        ) 
    }))

    // --
    // get all tmc ids for each linear segment of highway
    // and map them back to the direction as a sorted by road order
    // --
    let tmcs = get(
      await falcor.get(
        ...tmcLinearSegments
          .map(road => ["tmc", "tmclinear", year, road.geo, road.tmclinear, road.direction])
      ),
      ['json', 'tmc', 'tmclinear', year],
      {}    
    )
    let tmcsByDirection = tmcLinearSegments.reduce((out,seg) => {
      if(!out[seg.direction]) {
        out[seg.direction] = []
      }
      out[seg.direction] = [
        ...out[seg.direction],
        ...get(tmcs, [seg.geo,seg.tmclinear, seg.direction], [])
      ]
      out[seg.direction] = out[seg.direction].sort((a,b) => +a.road_order - +b.road_order)
      return out 
    }, {})

    return tmcsByDirection
  }

  async function getSpeeds (tmcArray,year) {
    const tmcs = tmcArray.map(d => d.tmc)
    const getRequestKey = (startEpoch, endEpoch) => [
        [tmcs],
          +`${year}0101`, // start date
          +`${year}0201`, // end date
          startEpoch, //start epoch
          endEpoch, // end epoch
          [
          //"sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          //"saturday",
          ], //day filter
          "year", /* -- resolution '5-minutes','15-minutes','hour','date', 'month','year' */
          "travel_time_all",
          "travelTime",
          encodeURI(JSON.stringify({})),
          "ny"
      ].join("|")

    const requestKey = getRequestKey(0,288)
    const requestKeyAm = getRequestKey(84,120)
    const requestKeyPm = getRequestKey(192,228)

    let finalData = await falcor.get(
      ["tmc", tmcs, "meta", year, 
        [
          "miles",
          "region_code", 
          // "avg_speedlimit"
        ]
      ],
      ["routes", "data", [requestKey, requestKeyAm, requestKeyPm]]
    )
    // return finalData
    let peakKeys = { 'all': requestKey, 'am':requestKeyAm, 'pm':requestKeyPm}
    let peaks = Object.keys(peakKeys)
    let speedbyTmcs = peaks
      .reduce((out,peak) => {
      out[peak] = get(finalData, ["json","routes", "data", [peakKeys[peak]]], [])
          .reduce((out,tmcData) =>{
          out[tmcData.tmc] = tmcData.value
          return out
        }, {})
      return out
    },{})
    
    //return speedbyTmcs
    let regions = ['']
    let totalSegment = tmcArray.map(tmc => {
      tmc.miles = get(finalData, ["json", "tmc", tmc.tmc, "meta", year, 'miles'], 23)
      tmc.region_code = get(finalData, ["json", 'tmc',tmc.tmc, "meta", year, 'region_code'])
      peaks.forEach(peak => {
        tmc[`speed_${peak}`] = Math.round(tmc.miles * (3600.0 / speedbyTmcs[peak][tmc.tmc]) * 100 ) / 100
      })
      
      if(!tmc.speed) {
        // console.log('hola', tmc, speedbyTmcs[tmc.tmc])
      }
      return tmc
    }).reduce((out,tmc) => {
      if(tmc.speed_all){
        out._length += tmc.miles
        out._count += 1
        out._speed_all += tmc.speed_all * tmc.miles
        out._speed_am += tmc.speed_am * tmc.miles
        out._speed_pm += tmc.speed_pm * tmc.miles ? tmc.speed_pm * tmc.miles : 65

        if(!out[`${tmc.region_code}_length`]) {
          regions.push(tmc.region_code)
          out[`${tmc.region_code}_length`] = 0
          out[`${tmc.region_code}_count`] = 0
          out[`${tmc.region_code}_speed_all`] = 0
          out[`${tmc.region_code}_speed_am`] = 0
          out[`${tmc.region_code}_speed_pm`] = 0
        }
        out[`${tmc.region_code}_length`] += tmc.miles
        out[`${tmc.region_code}_count`] += 1
        out[`${tmc.region_code}_speed_all`] += tmc.speed_all * tmc.miles
        out[`${tmc.region_code}_speed_am`] += tmc.speed_am * tmc.miles
        out[`${tmc.region_code}_speed_pm`] += tmc.speed_pm * tmc.miles ? tmc.speed_pm * tmc.miles : 65
      }
      return out
    }, {_length:0, _count:0, _speed_all:0, _speed_am:0,_speed_pm:0})

    totalSegment.total_avg_speed = totalSegment.total_speed / totalSegment.total_length 
    regions.forEach(r => {
      totalSegment[`${r}_avg_speed`] = Math.round(totalSegment[`${r}_speed_all`] / totalSegment[`${r}_length`] * 10) / 10 
      totalSegment[`${r}_avg_speed_am`] = Math.round(totalSegment[`${r}_speed_am`] / totalSegment[`${r}_length`] * 10) / 10 
      totalSegment[`${r}_avg_speed_pm`] = Math.round(totalSegment[`${r}_speed_pm`] / totalSegment[`${r}_length`] * 10) / 10 
      totalSegment.regions = regions
    })
    return totalSegment

  }

  const years = [2016,2017,2018,2019,2020,2021,2022]
  const Interstates = ['81','84',/*'86',*/'87','88','90','95','390','495']

  let data = await Promise.all(Interstates.map(async interstate => {
    return {
      [interstate]: await Promise.all(years.map(async year => {
        let interstateTmcs = await getTmcsByDirection(interstate,year)
        return { [year]: {
          [Object.keys(interstateTmcs)[0]]: await getSpeeds(Object.values(interstateTmcs)[0],year),
          [Object.keys(interstateTmcs)[1]]: await getSpeeds(Object.values(interstateTmcs)[1],year)
          }
        }
      }))
    }
  }))
  
  //return data
  return { 
    years: years,
    data: data.reduce((out, inter) => {
      let num = `I-${Object.keys(inter)[0]}`
      Object.values(inter).forEach(interstate => {
        Object.values(interstate).forEach(y => {
          let year = Object.keys(y)[0]
          let data = Object.values(y)[0]
          let directions = Object.keys(data)
          directions.forEach(dir => {
            let regions = data[dir].regions
            regions.forEach(region => {
              out.push({
                interstate: `${num} ${dir}${region ? ` Region ${region}` : ''}`,  
                year, 
                speed: data[dir][`${region}_avg_speed`],
                speed_am: data[dir][`${region}_avg_speed_am`],
                speed_pm: data[dir][`${region}_avg_speed_pm`],
                length: Math.round(data[dir][`${region}_length`] *100)/100,
                count: data[dir][`${region}_count`]

              })
            }) 
          })
          
        })  
      })
      return out
    },[]).reduce((out,d) => {
      if(!out[d.interstate]) {
        out[d.interstate] = []
      }
      out[d.interstate].push(d)
      out[d.interstate].sort((a,b) => +a.year - +b.year)
      return out
    },{})
  }

 
}

  //create simple grid
  //  where the x axis is tmcs along the road 
  //  y axis is time epochs (0-288)
  //  calculate the speed in each epoch 
  //  create a color scale based on the domain of speeds
  //  color each square based on the speed in the scale


export default function DMS() {
    const data = useLoaderData();
    
    return (
      <div className='max-w-9xl mx-auto p-4'>
       
        <table className='min-w-full divide-y divide-gray-300'>
          <thead className="bg-gray-50">
            <tr>
              <th/>
              <th className='font-light border-r-2 text-sm  border-gray-300' colSpan={data.years.length+1}>
                Weekday Full Day Avg Speed
              </th>
              <th className='font-light border-r-2 text-sm  border-gray-300' colSpan={data.years.length+1}>
                Weekday Am Peak (7am-10am) Avg Speed
              </th>
              <th className='font-light border-r-2 text-sm  border-gray-300' colSpan={data.years.length+1}>
                Weekday Pm Peak (4pm-8am) Avg Speed
              </th>
            </tr>
            <tr>
              <th className='py-3.5 pl-1 pr-2 text-left text-xs font-semibold text-gray-900 sm:pl-6'> Intersate </th>
              {data.years.map(year=> 
                <th className=' py-3.5 text-left text-xs font-semibold text-gray-900'>
                  {year}
                </th>)
              }
              <th className=' py-3.5 text-center text-xs font-semibold text-gray-900'>Trend</th>
              {data.years.map(year=> 
                <th className=' py-3.5 text-left text-xs font-semibold text-gray-900'>
                  {year}
                </th>)
              }
              <th className=' py-3.5 text-center text-xs font-semibold text-gray-900'> Trend</th>
              {data.years.map(year=> 
                <th className=' py-3.5 text-left text-xs font-semibold text-gray-900'>
                  {year}
                </th>)
              }
              <th className=' py-3.5 text-center text-xs font-semibold text-gray-900'> Trend</th> 
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white'>
            {Object.keys(data.data).map(k => {
              while(data.data[k].length < data.years.length) {
                data.data[k].unshift({})
              }
              return (
                <tr>
                  <td className='whitespace-nowrap py-4 pl-1 pr-2 text-xs font-medium text-gray-900 sm:pl-6'>{k}</td>
                  {/*full day*/}
                  {data.data[k].map(d => <td className='whitespace-nowrap  py-2 text-xs text-gray-500'>{d.speed}</td>)}
                  <td className='whitespace-nowrap px-3 text-xs w-32 text-gray-500'>
                    <Sparklines data={data.data[k].filter(d => d.speed).map(d => d.speed)}>
                        <SparklinesLine style={{ fill: "none",strokeWidth: 2 }}  color="#2cb3ae"/>
                        <SparklinesSpots />
                    </Sparklines>
                  </td>
                  {/*am*/}
                  {data.data[k].map(d => <td className='whitespace-nowrap py-2 text-xs text-gray-500'>{d.speed_am}</td>)}
                  <td className='whitespace-nowrap px-3 text-xs w-32 text-gray-500'>
                    <Sparklines data={data.data[k].filter(d => d.speed_am).map(d => d.speed_am)}>
                        <SparklinesLine style={{ fill: "none",strokeWidth: 2 }} color="#da4682"/>
                    </Sparklines>
                  </td>
                  {/*pm*/}
                  {data.data[k].map(d => <td className='whitespace-nowrap  py-2 text-xs text-gray-500'>{d.speed_pm}</td>)}
                  <td className='whitespace-nowrap px-1 text-xs w-32 text-gray-500'>
                    <Sparklines data={data.data[k].filter(d => d.speed_pm).map(d => d.speed_pm)}>
                        <SparklinesLine style={{ fill: "none",strokeWidth: 2 }} color="#f2891d"/>
                    </Sparklines>
                  </td>

                </tr>
              )
            })}
          </tbody>
        </table>
        {/* <pre>
          {JSON.stringify(data,null,3)}
        </pre>*/}

      </div>

    )
}

export function ErrorBoundary({ error }) {
  return (
    <div>
      <h1>Congestion Error ErrorBoundary</h1>
      <p>{error.message}</p>
      <p>The stack trace is:</p>
      <pre>{error.stack}</pre>
    </div>
  );
}