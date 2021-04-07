import { request } from 'graphql-request';

export function query(url, method, filter, body) {
	let filterString = _makeFilterString(filter);
	let bodyString = _makeBodyString(body);
	let queryString = `query { ${method}${filterString} { \n${bodyString}\n } }`

	console.log(filterString)

	console.log('fetch ', url);
	return request(url, queryString).then(data => data[method]);
}

function _makeFilterString(filter) {
	let filterArray = [];
	if (filter) {
		const thingToString = ([key, value]) =>{
			switch (true) {
				case Array.isArray(value):
					return `${key}: [${value.map(v => `"${v}"`).join(',')}],`;
				
				case typeof(value) === 'object':
					return `${key}: { ${Object.entries(value).map(thingToString).join('')} }`

				case typeof (value) === 'number':
					return `${key}: ${value},`
				
				default:
					return `${key}: "${value}",`
			}
		}

		let queries = Object.entries(filter).map(thingToString);

		filterArray = [
			'(filter: {',
			...queries,
			'})'
		]
	}

	return filterArray.join('');
}

function _makeBodyString(body) {
	function stringify(obj) {
		let string = '';
		for (let [key, value] of Object.entries(obj)) {
			if (typeof value === 'object') {
				let valueString = stringify(value);
				string += `${key} { \n${valueString}\n },\n`
			} else {
				string += `${key},\n`;
			}
		}

		return string;
	}

	return typeof(body) === 'object' ? stringify(body) : body;
}