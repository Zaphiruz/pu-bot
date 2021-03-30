import CommandInterface from './-interface';
import { query } from '../utils/graphql-query-helper';
import AsciiTable from 'ascii-table';
import { camelToText } from '../utils/strings';

const exchangeQuery = {
	id: true,
	name: true,
	code: true
}

const cxBrokerQuery = {
	ticker: true,
	material: {
		name: true
	},
	bid: {
		price: {
			amount: true,
			currency: true
		},
		amount: true
	},
	ask: {
		price: {
			amount: true,
			currency: true
		},
		amount: true
	},
	priceTime: {
		timestamp: true
	}
};

export default class Trade extends CommandInterface {
	constructor(bot, settings) {
		super('trade', bot, settings);
	}

	processArgs(args) {
		return args.map(arg => arg.toUpperCase());
	}

	async action(e, args) {
		// Goal: have the ability to ask the system to give you a list of the top profitable trades between two CX's, option to also specify a specific $ amount
		// Example: !trade nc1 ic1 10000 -> System then shows the most profitable trade between NCC and ICA markets

        try {
			let [origin, destination, amount] = args;

			if (!origin || !destination || !amount) {
				return e.channel.send("Need at least three parametors. An origin, a destination, and a dollar amount");
			}

			let originExchange = []
			originExchange = await query(this.settings.api, 'exchangeOne', { code: origin }, exchangeQuery);

			let destinationExchange = []
			destinationExchange = await query(this.settings.api, 'exchangeOne', { code: destination }, exchangeQuery);

			let originBrokers = []
			originBrokers = await query(this.settings.api, 'cxBrokerMany', { exchange: originExchange.id }, cxBrokerQuery);

			let destinationBrokers = []
			destinationBrokers = await query(this.settings.api, 'cxBrokerMany', { exchange: destinationExchange.id, OR: { exchange: originExchange.id } }, cxBrokerQuery);

			console.log(destinationBrokers);

			return e.channel.send(['pong -->', ...args].join(' '));
        } catch (err) {
			e.channel.send("Errored out!");
			throw err;
        }
	}

	help(e, args) {
		e.channel.send('replys with "pong" and any arguments. Really just for testing');
	}
}