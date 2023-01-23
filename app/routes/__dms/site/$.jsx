import React, {useEffect} from 'react'
import { useParams } from "@remix-run/react";
import { checkAuth } from "~/utils/session.server";

import { 
  DmsManager, 
  dmsDataLoader,
  dmsDataEditor, 
  registerDataType 
} from '~/modules/dms'


import DmsDraft from '~/modules/dms-custom/draft'

import { siteConfig } from './site.config.js'

registerDataType('richtext', DmsDraft)


export async function loader ({ request, params }) {
  console.log('loader', params['*'])
  const data= await dmsDataLoader(siteConfig, params['*'])
  
  return { 
    data ,
    user: await checkAuth(request)
  }
}

export async function action ({ request, params }) {
  const form = await request.formData();
  // const pathname = new URL(request.url).pathname.slice(1);
  return dmsDataEditor(siteConfig, JSON.parse(form.get("data")), params['*'])
};

export default function DMS() {
    const params = useParams();
    
    return (
      <DmsManager 
        path={params['*'] || ''}
        config={siteConfig}
      />
    )
}

export function ErrorBoundary({ error }) {
  return (
    <div>
      <h1>DMS Error ErrorBoundary</h1>
      <p>{error.message}</p>
      <p>The stack trace is:</p>
      <pre>{error.stack}</pre>
    </div>
  );
}