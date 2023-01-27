import React, {useEffect} from 'react'
import { useLoaderData } from "@remix-run/react";
import { falcor } from '~/utils/falcor.server'
import get from 'lodash.get'

export async function loader ({ request, params }) {
  const year = 2021
  const geo = 'COUNTY|36001'
  let roads = await falcor.get(["geo", geo, year, "tmclinear"])
  let road = get(roads, ["json", "geo", geo, year, "tmclinear",4], {})

  let tmcs = await falcor.get(["tmc", "tmclinear", year, geo, road.tmclinear, road.direction])
  let tmcArray = get(tmcs, ["json", "tmc", "tmclinear", year, geo, road.tmclinear, road.direction])
    .sort((a,b) => a.road_order - b.road_order)
    .map(d => d.tmc)

  let tmcMeta = await falcor.get(["tmc", tmcArray, "meta", year, ["avg_speedlimit", "miles"]])

  let speedData = await falcor.get(["tmc", tmcArray, 'tt', 'day', '2022-06-18', "by", 'epoch'])

  return speedData
 
}

  //create simple grid
  //  where the x axis is tmcs along the road 
  // y axis is time epochs


export default function DMS() {
    const data = useLoaderData();
    
    return (
      <div className='max-w-5xl mx-auto p-4'>
        <pre>
          {JSON.stringify(data,null,3)}
        </pre>
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