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

import blogConfig from './blog.config.js'

registerDataType('richtext', DmsDraft)


export async function loader ({ request, params }) {
  return { 
    data: await dmsDataLoader(blogConfig, params['*']),
    user: await checkAuth(request)
  }
}

export async function action ({ request, params }) {
  const form = await request.formData();
  // const pathname = new URL(request.url).pathname.slice(1);
  return dmsDataEditor(blogConfig, JSON.parse(form.get("data")), params['*'])
};

export default function DMS() {
    const params = useParams();
    
    return (
      <DmsManager 
        path={params['*'] || ''}
        config={blogConfig}
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