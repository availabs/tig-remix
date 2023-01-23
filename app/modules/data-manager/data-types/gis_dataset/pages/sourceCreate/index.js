import React from 'react';
import { pgEnv } from '~/modules/data-manager/attributes'
import {
  GisDatasetUploadErrorMessage,
  GisDatasetUploadButton,
  GisDatasetFileMeta,
} from "./components/GisFileUpload";

export default function gisDatasetSourceCreate (props) {
	let [uploadState, setUploadState] = React.useState({
	  gisUploadId: null,
	  fileUploadStatus: null,
	  maxSeenEventId: null,
	  uploadedFile: null,
	  uploadErrMsg: null,
	})

	if (uploadErrMsg) {
	    <GisDatasetUploadErrorMessage
	      uploadErrMsg={uploadErrMsg}
	    />;
	  }

	if (!uploadedFile) {
	    return (
	      <GisDatasetUploadButton
	        uploadGisDataset={uploadGisDataset.bind(null, ctx)}
	      />
	    );
	}

  	return (
    	<GisDatasetFileMeta
    	  uploadedFile={uploadedFile}
      	fileUploadStatus={fileUploadStatus}
    	/>
  	); 
	
} 
