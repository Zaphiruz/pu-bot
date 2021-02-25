import CommandInterface from './-interface';
import { request, gql } from 'graphql-request';
import AsciiTable from 'ascii-data-table'

export default class Ping extends CommandInterface {
	constructor(bot, settings) {
		super('fx', bot, settings);
	}

	processArgs(args) {
		return args.map(arg => arg.toUpperCase());
	}

	async action(e, args) {
		let [base, quote] = args;

		let brokers;
		if (base && quote) {
			let broker = await this.fetch('fxBrokerOne', { base, quote });
			brokers = [broker];
			if (!broker) {
				return e.channel.send(`I couldn't find a broker for ${base} => ${quote}`);
			}
		} else if (base) {
			let [base] = args;

			brokers = await this.fetch('fxBrokerMany', { base });
			if (!brokers.length) {
				return e.channel.send(`I couldn't find any brokers for ${base}`);
			}
		} else {
			brokers = await this.fetch('fxBrokerMany');
			if (!brokers.length) {
				return e.channel.send(`I couldn't find any brokers`);
			}
		}

		let display = this.buildDisplay(...brokers);
		return e.channel.send(`\`\`\`\n${display}\n\`\`\``);
	}

	help(e, args) {
		e.channel.send('Send this command with your favorite currencies, or leave it blank for all options!\ni.e. `!fx NCC ICA`\ni.e. `!fx NCC`\ni.e.`!fx`');
	}

	fetch(method, filter) {
		let filterString = '';
		if (filter) {
			let queries = [];
			for (let [key, value] of Object.entries(filter)) {
				queries.push(`${key}: "${value}",`);
			}
			queries[queries.length - 1] = queries[queries.length - 1].slice(0, -1); // last ,

			filterString = [
				'(filter: {',
				...queries,
				'})'
			].join();
		}

		return request(this.settings.api, gql`
			query {
				${method}${filterString} {
					price {
						close {
							rate,
							base,
							quote
						}
					}
				}
			}
		`).then(data => data[method])
	}

	buildDisplay(...brokers) {
		let { items } = brokers.reduce((c, broker) => {
			let { items, lookupTable } = c;

			let quote =  broker.price.close.quote || "N/A";
			let base = broker.price.close.base || "N/A";
			let rate = broker.price.close.rate || "N/A";
			
			// base data
			let baseArrayIndex = lookupTable.base[base];
			if(!baseArrayIndex) {
				// ugh. if this is hard coded to 5, the N/A's stick out on smaller querys.
				// but if you only go off of quote length, its wrong ONLY when all are called
				let length = Math.min(5, brokers.length);
				let baseArray = Array(length + 1).fill('N/A', 1);
				baseArray[0] = base;
				lookupTable.base[base] = baseArrayIndex = items.length;
				items.push(baseArray);
			}
			let baseArray = items[baseArrayIndex];

			// quote array
			let quoteIndex = lookupTable.quote[quote];
			if(!quoteIndex) {
				lookupTable.quote[quote] = quoteIndex = Object.keys(lookupTable.quote).length + 1;
				items[0][quoteIndex] = quote;
			}

			baseArray[quoteIndex] = rate;

			return c
		}, {
			lookupTable: {
				base: {},
				quote: {}
			},
			items: [
				["~~~"]
			]
		});

		return AsciiTable.table(items, 200);
	}
}