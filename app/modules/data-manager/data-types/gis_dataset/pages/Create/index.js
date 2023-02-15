import React, { useReducer, useMemo, useEffect } from "react";
import { useNavigate , useParams, useFetcher } from "@remix-run/react";

import get from 'lodash/get'

import { pgEnv } from '~/modules/data-manager/attributes'
import { DAMA_HOST } from "~/config";

import { reducer } from './components/reducer'

import UploadFileComp from './uploadFile'
import SelectLayerComp from './selectLayer'
import SchemaEditorComp from './schemaEditor'
import PublishComp from './publish'

export default function UploadGisDataset({ source={}, user={} }) {
    
  const { name: damaSourceName, source_id: sourceId } = source;
  const userId = get(user,`id`, null)



  const [state, dispatch] = useReducer(reducer,{
    damaSourceId: sourceId,
    damaSourceName: damaSourceName,
    userId: userId,
    etlContextId: null,
    // maxSeenEventId: null,
    damaServerPath: `${DAMA_HOST}/dama-admin/${pgEnv}`,
    
    // uploadFile state
    gisUploadId: null,
    fileUploadStatus: null,
    uploadedFile: null,
    uploadErrMsg: null,
    polling: false,
    pollingInterval: null,

    // selectLayer state
    layerNames: null,
    layerName: null,
    lyrAnlysErrMsg: null,
    layerAnalysis: null,

    // schemaEditor state
    databaseColumnNames: null,
    tableDescriptor: null,

    // publish state
    publishStatus: "AWAITING",
    publishErrMsg: null    
  });

  useEffect(() => {
    dispatch({type:'update', payload: { damaSourceName }})
  }, [damaSourceName])

  useEffect(() => {
    // on page load get etl context
    // TODO :: probably want to move this to on file upload
    // currently it runs every refresh leaving orphaned contextIds
    (async () => {
      const newEtlCtxRes = await fetch(`${state.damaServerPath}/etl/new-context-id`);
      const newEtlCtxId  = +(await newEtlCtxRes.text());
      dispatch({type:'update', payload: {etlContextId: newEtlCtxId}})
    })();
  }, [pgEnv]);

  if (!sourceId && !damaSourceName) {
    return <div> Please enter a datasource name.</div>;
  }

  return (
    <div>
      <div>
        <UploadFileComp state={state} dispatch={dispatch} />
        <SelectLayerComp state={state} dispatch={dispatch} />
        <SchemaEditorComp state={state} dispatch={dispatch} />
        <PublishComp state={state} dispatch={dispatch} />
      </div>
      <div>
        <pre>
            {JSON.stringify({state},null,3)}
        </pre>
      </div>
    </div>
  )

}
