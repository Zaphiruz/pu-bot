import CommandInterface from './-interface';
import { query } from '../utils/graphql-query-helper';
import AsciiTable from 'ascii-table';
import moment from 'moment';
import { toUpper, startCase, isNil, negate } from 'lodash';

const notNil = negate(isNil);

const CURRENCY = /\.\w{2}\d$/i;
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

export default class CX extends CommandInterface {
	constructor(bot, settings) {
		super('cx', bot, settings);
	}

	processArgs(args) {
		return args.map(arg => arg.toUpperCase());
	}

	async action(e, args) {
		let [ticker] = args;

		let brokers = []
		if (!CURRENCY.test(ticker)) {
			let materialTicker = ticker.slice(0, 3);
			let material = await query(this.settings.api, 'materialOne', {ticker: materialTicker}, {
				id: true
			});
			if (!material) {
				return e.channel.send(`I couldn't find a material for ${materialTicker}`);
			}

			brokers = await query(this.settings.api, 'cxBrokerMany', {material: material.id}, cxBrokerQuery);
		} else {
			let broker = await query(this.settings.api, 'cxBrokerOne', {ticker}, cxBrokerQuery);
			
			brokers = [broker];
		}

		brokers = brokers.filter(notNil);
		if (!brokers.length) {
			return e.channel.send(`I couldn't find a broker for ${ticker}`);
		}

		let materialName = brokers[0].material && brokers[0].material.name || 'N/A';
		let table = new AsciiTable(startCase(materialName))
			.setHeading('Ticker', 'Bid', 'Ask', 'Time');

		for(let broker of brokers) {
			let bid = broker.bid ? `${broker.bid.price.amount.toFixed(2)} ${broker.bid.price.currency} (${broker.bid.amount})` : 'None'
			let ask = broker.ask ? `${broker.ask.price.amount.toFixed(2)} ${broker.ask.price.currency} (${broker.ask.amount})` : 'None'
			let time = broker.priceTime ? moment(broker.priceTime.timestamp).format('DD MMM, hh:mm A') : 'N/A';

			table.addRow(broker.ticker, `${bid}`, `${ask}`, `${time}`)
		}

		return e.channel.send(`\`\`\`\n${table.toString()}\n\`\`\``);
	}

	help(e, args) {
		e.channel.send('Send this command with your favorite cx ticker! i.e. `!cx RAT.NC1`');
	}
}

