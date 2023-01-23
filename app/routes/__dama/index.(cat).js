import React, {useState} from 'react'
import { falcor } from '~/utils/falcor.server'
import {SourceAttributes, ViewAttributes, getAttributes, pgEnv} from '~/modules/data-manager/attributes'
import { useLoaderData, Link } from "@remix-run/react";
import get from 'lodash.get'

export async function loader ({ request }) {
  
  const lengthPath = ["dama", pgEnv, "sources", "length"];
  const resp = await falcor.get(lengthPath);
  const sourceData = await falcor.get([
    "dama", pgEnv,"sources","byIndex",
    {from:0, to:  get(resp.json, lengthPath, 0)-1},
    "attributes",Object.values(SourceAttributes),
  ])
 
  const falcorCache = falcor.getCache()

  return Object.values(get(falcorCache,["dama", pgEnv,'sources','byIndex'],{}))
    .map(v => getAttributes(get(falcorCache,v.value,{'attributes': {}})['attributes']))

  
}


export default function Dama() {
    const [layerSearch, setLayerSearch] = useState('')
    const sources = useLoaderData()
    return (
      <div>
        
        <div className='py-4'>
            <div>
              <input 
                className='w-full text-lg p-2 border border-gray-300 ' 
                placeholder='Search datasources'
                value={layerSearch}
                onChange={(e) => setLayerSearch(e.target.value)}
              />
            </div>
          </div>
          {
              sources
                .filter(source => {
                  let searchTerm = (source.name + ' ' + get(source, 'categories[0]',[]).join(' '))
                  return !layerSearch.length > 2 || searchTerm.toLowerCase().includes(layerSearch.toLowerCase())
                })
                .map((s,i) => <SourceThumb key={i} source={s} />)
          }
      </div>  
    )
}

const SourceThumb = ({source}) => {
  return (
    <div className='w-full p-4 bg-white my-1 hover:bg-blue-50 block border shadow'>
      <Link to={`/source/${source.source_id}`} className='text-xl font-medium w-full block'>
        <span>{ source.name }</span>
      </Link>
      <div>
          {(get(source,'categories',[]) || [])
            .map(cat => cat.map((s,i) => (
              <Link key={i} to={`/cat/${i > 0 ? cat[i-1] + '/' : ''}${s}`} className='text-xs p-1 px-2 bg-blue-200 text-blue-600 mr-2'>{s}</Link>
          )))
          }
      </div>
      <Link to={`/source/${source.source_id}`} className='py-2 block'>
        {source.description}
      </Link>
    </div>
  )
}

export function ErrorBoundary({ error }) {
  return (
    <div>
      <h1>Error</h1>
      <p>{error.message}</p>
      <p>The stack trace is:</p>
      <pre>{error.stack}</pre>
    </div>
  );
}