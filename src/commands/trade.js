import CommandInterface from './-interface';
import { query } from '../utils/graphql-query-helper';
import AsciiTable from 'ascii-table';

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

			if (!origin || !destination) {
				return e.channel.send("Need at least three parametors. An origin and a destination! i.e. nc1 ic1");
			}

			if (!amount) {
				amount = 10000;
            }

			let originBrokers = await returnExchangeBrokers(this.settings.api, origin);

			let destinationBrokers = await returnExchangeBrokers(this.settings.api, destination);

			console.log(originBrokers, destinationBrokers);

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

async function returnExchangeBrokers(api, exchangeCode) {
	let exchange = await query(api, 'exchangeOne', { code: exchangeCode }, exchangeQuery);
	return await query(api, 'cxBrokerMany', { exchange: exchange.id }, cxBrokerQuery);
}