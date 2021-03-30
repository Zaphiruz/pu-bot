import { request } from 'graphql-request';

export function query(url, method, filter, body) {
	let filterString = _makeFilterString(filter);
	let bodyString = _makeBodyString(body);
	let queryString = `query { ${method}${filterString} { \n${bodyString}\n } }`

	console.log('fetch ', url);
	return request(url, queryString).then(data => data[method]);
}

function _makeFilterString(filter) {
	let filterArray = [];
	if (filter) {
		let queries = [];
		console.log("1");
		for (let [key, value] of Object.entries(filter)) {
			console.log("2");
			if (Array.isArray(value)) {
				console.log("3");
				// Value is array
				queries.push(`${key}: [${value.map(v => `"${v}"`).join(',')}],`);
			} else if (value.constructor == Object) {
				// Value is dictionary
				console.log("4");
				if (key.toLocaleUpperCase() == "OR") {
					for (let [subkey, subvalue] of value) {
						console.log(`${key}: {${subkey}: ${subvalue}}`);
						queries.push(`${key}: {${subkey}: ${subvalue}}`);
					}
				} else {
					console.log("Value is something other than 'OR'");
                }
            } else {
				console.log("10");
				// Value is string??? 
				queries.push(`${key}: "${value}",`);
			}
		}

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