import text from './text.js'
import textarea from './textarea.js'
import boolean from './boolean.js'
import get from 'lodash.get'

const DmsDataTypes = {
	'text': text,
	'datetime': text,
	'textarea': textarea,
	'boolean': boolean,
	'default': text
}

export function registerDataType (name, dataType) {
	DmsDataTypes[name] = dataType
}

export function getViewComp (type) {
	// console.log('getViewComp', type, Object.keys(DmsDataTypes))
	return get(DmsDataTypes, `[${type}]`, DmsDataTypes['default']).ViewComp
}

export function getEditComp (type) {
	return get(DmsDataTypes, `[${type}]`, DmsDataTypes['default']).EditComp
}


export default DmsDataTypes