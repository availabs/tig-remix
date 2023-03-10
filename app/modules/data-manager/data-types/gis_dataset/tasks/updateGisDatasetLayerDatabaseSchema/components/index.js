import { useContext, useState, useEffect } from "react";

import debounce from "lodash/debounce";
import mapValues from "lodash/mapValues";
// import Dropdown from "react-dropdown";
// import "react-dropdown/style.css";

import PublishStatus from "../../../utils/constants";

import {
  useEtlContextDependencies,
  EtlContextReact,
} from "../../../utils/EtlContext";

const FreeFormColumnNameInput = ({ publishStatus, field, col, onChange }) => {
  return (
    <input
      className="w-full p-2 flex-1 shadow bg-grey-50 focus:bg-blue-100 border-gray-300"
      disabled={publishStatus !== PublishStatus.AWAITING}
      id={field}
      defaultValue={col || ""}
      onChange={onChange}
    />
  );
};

const ConstrainedColumnNameInput = (props) => {
  const { publishStatus, field, col, availableDbColNames, onChange } = props;

  if (!availableDbColNames) {
    return "";
  }

  const matches = col && availableDbColNames.includes(col);

  const key = `col-names-dropdown-for-${field}`;

  const hasAvailableDbColNames = availableDbColNames.filter(Boolean).length > 0;

  if (!availableDbColNames.length) {
    return (
      <span style={{ color: "darkgray" }}>
        All table columns have been assigned.
      </span>
    );
  }

  if (matches && availableDbColNames.length === 1) {
    return <span style={{ textAlign: "center" }}>{col}</span>;
  }

  return (
    <select
      key={key}
      onChange={(e) => onChange(e.target.value)}
      value={matches ? col : ""}
      placeholder="Select the db column name"
      disabled={
        !hasAvailableDbColNames || publishStatus !== PublishStatus.AWAITING
      }
    >
      {availableDbColNames.map(col => <option value={d}>{d}</option>)}
    </select>
  );
};

export const GisDatasetLayerDatabaseDbSchemaForm = () => {
  const ctx = useContext(EtlContextReact);

  const {
    dispatch,
    actions: { updateGisDatasetLayerDatabaseColumnName },
  } = ctx;

  const etlCtxDeps = useEtlContextDependencies(ctx, [
    "layerName",
    "tableDescriptor",
    "publishStatus",
    "databaseColumnNames",
  ]);

  const { layerName, tableDescriptor, publishStatus, databaseColumnNames } =
    etlCtxDeps;

  const [omittedFields, setOmittedFields] = useState(null);
  const [defaultMappings, setDefaultMappings] = useState(null);

  const tableDescriptorColumnTypes =
    tableDescriptor && tableDescriptor.columnTypes;

  const gisDatasetFieldNamesToDbColumns =
    tableDescriptorColumnTypes &&
    tableDescriptorColumnTypes.reduce((acc, { key, col }) => {
      acc[key] = col || null;
      return acc;
    }, {});

  useEffect(() => {
    if (defaultMappings === null && gisDatasetFieldNamesToDbColumns) {
      setDefaultMappings(gisDatasetFieldNamesToDbColumns);
    }
  }, [defaultMappings, gisDatasetFieldNamesToDbColumns]);

  useEffect(() => {
    if (gisDatasetFieldNamesToDbColumns && !omittedFields) {
      setOmittedFields(
        mapValues(gisDatasetFieldNamesToDbColumns, (v) => v === null)
      );
    }
  }, [gisDatasetFieldNamesToDbColumns, omittedFields]);

  if (!layerName) {
    return "";
  }

  if (!gisDatasetFieldNamesToDbColumns) {
    return (
      <span
        style={{
          display: "inline-block",
          width: "100%",
          textAlign: "center",
          padding: "30px",
        }}
      >
        Please wait... the server is analyzing the {layerName} layer. This may
        take a few moments.
      </span>
    );
  }

  if (!omittedFields) {
    return null;
  }

  const InputElem = databaseColumnNames
    ? ConstrainedColumnNameInput
    : FreeFormColumnNameInput;

  const assignedColNamesSet = new Set(
    Object.values(gisDatasetFieldNamesToDbColumns).filter(Boolean)
  );

  const availableDbColNames =
    databaseColumnNames &&
    databaseColumnNames
      .filter((c) => !assignedColNamesSet.has(c))
      .filter(Boolean);

  const fieldsMappingSection = (
    <div>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-center" style={{ paddingRight: "40px" }}>
              GIS Dataset Field Name
            </th>
            <th className="text-center">Database Column Name</th>
            <th className="text-center">Omit</th>
          </tr>
        </thead>
        <tbody>
          {tableDescriptorColumnTypes.map(({ key, col }, rowIdx) => {
            let fieldColNameOptions;
            if (Array.isArray(availableDbColNames)) {
              fieldColNameOptions = assignedColNamesSet.has(col)
                ? [col, ...availableDbColNames]
                : availableDbColNames;
            }

            const ColNameCell = omittedFields[key] ? (
              <span />
            ) : (
              <InputElem
                {...{
                  availableDbColNames: fieldColNameOptions,
                  publishStatus,
                  field: key,
                  col,
                  onChange: debounce((e) => {
                    const value = e.target ? e.target.value : e.value;

                    dispatch(
                      updateGisDatasetLayerDatabaseColumnName(rowIdx, value)
                    );
                  }, 500),
                }}
              />
            );

            return (
              <tr key={key} className="border-b">
                <td className="py-4 text-left">{key}</td>
                <td className="text-center  p-2">{ColNameCell}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={!col}
                    disabled={
                      fieldColNameOptions && fieldColNameOptions.length === 0
                    }
                    onChange={() => {
                      const newOmittedFields = {
                        ...omittedFields,
                        [key]: !omittedFields[key],
                      };

                      setOmittedFields(newOmittedFields);
                      if (col) {
                        dispatch(
                          updateGisDatasetLayerDatabaseColumnName(rowIdx, "")
                        );
                      } else if (!fieldColNameOptions) {
                        dispatch(
                          updateGisDatasetLayerDatabaseColumnName(
                            rowIdx,
                            defaultMappings[key]
                          )
                        );
                      }
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <span
        style={{
          display: "inline-block",
          width: "100%",
          marginTop: "20px",
          textAlign: "center",
          paddingTop: "25px",
          paddingBottom: "50px",
          fontSize: "25px",
          borderTop: "4px solid",
        }}
      >
        Field Names Mappings
      </span>

      {fieldsMappingSection}
    </div>
  );
};
