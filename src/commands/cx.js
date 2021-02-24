import CommandInterface from './-interface';
import { request, gql } from 'graphql-request';

export default class CX extends CommandInterface {
	constructor(bot, settings) {
		super('cx', bot, settings);
	}

	processArgs(args) {
		return args.map(arg => arg.toUpperCase());
	}

	async action(e, args) {
		// e.channel.send(['pong', ...args].join(' '));
		let broker = await this.fetchData(args[0]);
		e.channel.send(`${JSON.stringify(broker.cxBrokerMany[0], null, '\t')}`);
	}

	help(e, args) {
		e.channel.send('send this command with your favorite cx ticker');
	}

	fetchData(ticker) {
		return request(this.settings.api, gql`
			query {
				cxBrokerMany(filter: {ticker: "${ticker}"}) {
					material {
						name
					}
					ticker,
					price {
						amount
					}
				}
			}
		`);
	}
}

