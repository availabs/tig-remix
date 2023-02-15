import React, {useMemo} from 'react'
import get from 'lodash/get'
import {
  // createDamaSource,
  // stageLayerData,
  // queueCreateDamaView,
  // approveQA,
  publishGisDatasetLayer,
  generateMbTiles
} from './components'

const buttonStates = {
    AWAITING: {
      text: 'Publish',
      color: 'bg-blue-500'
    },
    IN_PROGRESS: {
      text: "Publishing...",
      color: "bg-amber-500"
    },
    PUBLISHED: {
       text: "Publishing...",
       color: "bg-amber-500"
    },
    ERROR : {
       text: "Error...",
       color: "bg-red-500"
    }
}

export default function PublishButton({ state, dispatch }) {
  
  const {
    layerName,
    publishStatus,
    uploadErrMsg,
    lyrAnlysErrMsg,
    tableDescriptor,
    damaSourceName,
    damaSourceId,
    damaServerPath,
    etlContextId
  } = state

  if (!layerName || uploadErrMsg || lyrAnlysErrMsg || !tableDescriptor) {
    return "";
  }


  const { 
    text: publishButtonText, 
    color: publishButtonBgColor } = useMemo(()=> 
      get(buttonStates, publishStatus, buttonStates['AWAITING'])
  , [publishStatus]) 
  

  const publish = () => {
    const runPublish = async () => { 
      try {
        dispatch({type: 'update', payload: { publishStatus : 'IN_PROGRESS' }})

        // if there is no sourceId create a new source Id
        // if (!damaSourceId) {
          
        //   //this may not return anything??
        //   let damaCreateSourceResponse = createDamaSource(state)
        //   console.log('damaCreateSourceResponse', damaCreateSourceResponse)
        // } 
        // await stageLayerData(state);

        // await queueCreateDamaView(state);

        // await approveQA(state);

        const publishFinalEvent = await publishGisDatasetLayer(state);

        const {
          payload: { damaViewId },
        } = publishFinalEvent;

        console.log('published view id', damaViewId)

        await generateMbTiles(state, damaViewId);

        dispatch({type: 'update', payload: { publishStatus : 'PUBLISHED' }});
      } catch (err) {
        dispatch({
          type: 'update', 
          payload: { 
            publishStatus : 'ERROR', 
            publishErrMsg: err.message 
          }
        });
        console.error("==>", err);
      }
    }
    runPublish()
  }

  return (
    <div>
      <div>
        <button
          className={`cursor-pointer py-4 px-8 ${publishButtonBgColor} border-none`}
          //disabled={publishStatus'AWAITING'}
          onClick={() => {
            console.log('onClick publush', publishStatus)
            if (publishStatus === "AWAITING" || publishStatus === "ERROR" ) {
              publish();
            }
          }}
        >
          {publishButtonText}
        </button>
      </div>
      <PublishErrorMessage state={state} />
    </div>
  );
}

function PublishErrorMessage({state}) {
  
  const { 
    etlContextId, 
    publishStatus, 
    publishErrMsg 
  } = state

  if (publishStatus !== "ERROR") {
    return "";
  }

  return (
    <table
      className="w-2/3"
      style={{
        margin: "40px auto",
        textAlign: "center",
        border: "1px solid",
        borderColor: "back",
      }}
    >
      <thead
        style={{
          color: "black",
          backgroundColor: "red",
          fontWeight: "bolder",
          textAlign: "center",
          marginTop: "40px",
          fontSize: "20px",
          border: "1px solid",
          borderColor: "black",
        }}
      >
        <tr>
          <th style={{ border: "1px solid", borderColor: "black" }}>
            {" "}
            Publish Error
          </th>
          <th style={{ border: "1px solid", borderColor: "black" }}>
            {" "}
            ETL Context ID
          </th>
        </tr>
      </thead>
      <tbody style={{ border: "1px solid" }}>
        <tr style={{ border: "1px solid" }}>
          <td
            style={{
              border: "1px solid",
              padding: "10px",
              backgroundColor: "white",
              color: "darkred",
            }}
          >
            {publishErrMsg}
          </td>
          <td style={{ border: "1px solid", backgroundColor: "white" }}>
            {etlContextId}
          </td>
        </tr>
      </tbody>
    </table>
  );
}


