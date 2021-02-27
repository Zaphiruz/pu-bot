
export function camelToText(string) {
	return string.replace(/[A-Z]/g, ' $&')
}

export function toTitleCase(string) {
	return string.split(' ')
		.map(s => s.slice(0, 1).toUpperCase() + s.slice(1))
		.join(' ')
}