import CommandInterface from './-interface';
import { request, gql } from 'graphql-request';
import AsciiTable from 'ascii-data-table'

export default class CX extends CommandInterface {
	constructor(bot, settings) {
		super('cx', bot, settings);
	}

	processArgs(args) {
		return args.map(arg => arg.toUpperCase());
	}

	async action(e, args) {
		let [ticker] = args;
		let broker = await this.fetchData(ticker);
		if (!broker) {
			return e.channel.send(`I couldn't find a broker for ${ticker}`);
		}

		let tableData = [
			["Material", broker.material && broker.material.name || 'N/A'],
			["Ticker", broker.ticker],
			["Bid", `${broker.bid.price.amount} ${broker.bid.price.currency} (${broker.bid.amount})`],
			["Ask", `${broker.ask.price.amount} ${broker.ask.price.currency} (${broker.ask.amount})`],
		]

		let display = AsciiTable.table(tableData, 200);
		return e.channel.send(`\`\`\`\n${display}\n\`\`\``);
	}

	help(e, args) {
		e.channel.send('Send this command with your favorite cx ticker! i.e. `!cx RAT.NC1`');
	}

	fetchData(ticker) {
		return request(this.settings.api, gql`
			query {
				cxBrokerOne(filter: {ticker: "${ticker}"}) {
					material {
						name
					},
					ticker,
					bid {
						price {
							amount,
							currency
						},
						amount
					},
					ask {
						price {
							amount,
							currency
						},
						amount
					}
				}
			}
		`).then(data => data.cxBrokerOne)
	}
}

