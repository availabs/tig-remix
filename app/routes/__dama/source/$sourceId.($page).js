import React, { useState, useMemo } from 'react'
import { falcor } from '~/utils/falcor.server'
import { TopNav } from '~/modules/avl-components/src'
import { SourceAttributes, ViewAttributes, getAttributes, pgEnv} from '~/modules/data-manager/attributes'
import { Pages, DataTypes } from '~/modules/data-manager/data-types'
import { useLoaderData, Link, useParams } from "@remix-run/react";

import get from 'lodash.get'

export async function loader ({ params, request }) {
  const { sourceId } = params
  
  const lengthPath = ["dama", pgEnv, "sources","byId",sourceId,"views","length"]
  const resp = await falcor.get(lengthPath);
  let data =  await falcor.get(
    [
      "dama", pgEnv, "sources","byId",sourceId,"views","byIndex",
      {from:0, to:  get(resp.json, lengthPath, 0)-1},
      "attributes",Object.values(ViewAttributes)
    ],
    [
      "dama", pgEnv, "sources","byId",sourceId,
      "attributes",Object.values(SourceAttributes)
    ]
  )
  
  const falcorCache = falcor.getCache()    

  return {
    views:  Object.values(
        get(
          falcorCache,
          ["dama", pgEnv, "sources","byId",sourceId,"views","byIndex",],
          {}
        )
      )
      .map(v => getAttributes(
          get(
            falcorCache,
            v.value,
            {'attributes': {}}
          )['attributes']
        )
      ),
    source: getAttributes(
      get(
        falcorCache,
        ["dama", pgEnv,'sources','byId', sourceId],
        {'attributes': {}}
      )['attributes']
    ) 
  }
}


export default function Dama() {
    const {views,source} = useLoaderData()
    const {sourceId, page} = useParams()
    const [ pages, setPages ] = useState(Pages)
    const user = {email: 'test@test.com', id: 1}

    React.useEffect(() => {
      console.log('useEffect', source.type, source)
      if(DataTypes[source.type] ){
        let typePages = Object.keys(DataTypes[source.type]).reduce((a,c)=>{
          if(DataTypes[source.type][c].path) {
            a[c] = DataTypes[source.type][c]
          }
          return a
        },{})

        let allPages = {...Pages,...typePages}
          setPages(allPages)  
      } 
      /*else {
        setPages(Pages) 
      }*/
    }, [source.type])

    const Page = useMemo(() => {
      return page ? get(pages,`[${page}].component`,Pages['overview'].component) : Pages['overview'].component
    },[page,pages])
    
    return (
      <div>
        <div className='text-xl font-medium overflow-hidden p-2 border-b '>
          {source.display_name || source.name}
        </div>
        <TopNav 
          menuItems={Object.values(pages)
            .map(d => {
              return {
                name:d.name,
                path: `/source/${sourceId}${d.path}`
              }
            })}
          themeOptions={{size:'inline'}}
        />
        <div className='w-full p-4 bg-white shadow mb-4'>
          <Page source={source} views={views} user={user} />
        </div>
      </div>  
    )
}
