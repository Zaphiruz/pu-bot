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
		let broker = await this.fetchData(args[0]);
		e.channel.send(`${JSON.stringify(broker.cxBrokerOne, null, '\t')}`);
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

