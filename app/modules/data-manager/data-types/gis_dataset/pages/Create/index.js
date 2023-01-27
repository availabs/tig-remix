import React, { useState, useMemo, useEffect } from "react";
import { useNavigate , useParams, useFetcher } from "@remix-run/react";
import get from 'lodash/get'

import PublishStatus from "./components/constants"

import { pgEnv } from '~/modules/data-manager/attributes'



const progressUpdateIntervalMs = 3000;

export default function UploadGisDataset({ source={}, user={} }) {
    
  const { name: damaSourceName, source_id:sourceId } = source;
  const userId = get(user,`id`, null)

  const [state, setState] = useState({
    damaSourceId: sourceId,
    damaSourceName: damaSourceName,
    
    etlContextId: null,
    maxSeenEventId: null,

    // SubSlices
    // uploadGisDatasetState: null,
    // gisDatasetLayerState: null,
    // gisDatasetLayerDatabaseSchemaState: null,

    publishStatus: PublishStatus.AWAITING,
    publishErrMsg: null,
  });

  //const [isCreatingNew] = useState(!!source.source_id);

  // const publishOperation = isCreatingNew
  //   ? updateExistingDamaSource
  //   : createNewDamaSource;  

  if (!sourceId && !damaSourceName) {
    return <div> Please enter a datasource name.</div>;
  }

  useEffect(() => {
    (async () => {
      const newEtlCtxRes = await fetch(`${DAMA_HOST}/dama-admin/${pgEnv}/etl/new-context-id`);
      const newEtlCtxId  = +(await newEtlCtxRes.text());
      setState({...state, etlContextId: newEtlCtxId})
    })();
  }, [pgEnv]);

  return (
    <div>
      <div className='fixed right-0 top-[170px] w-100 '>
            <pre>
              {JSON.stringify(state,null,3)}
            </pre>
      </div>
      <div>
        Stuff coming here.
      </div>
    </div>
  )

}
