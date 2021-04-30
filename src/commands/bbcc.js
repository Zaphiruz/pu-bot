import CommandInterface from './-interface';
import { query } from '../utils/graphql-query-helper'
import AsciiTable from 'ascii-table';
import { toUpper, startCase } from 'lodash';

const buildingQuery = {
	name: true,
	area: true,
	expertiseCategory: true,
	type: true,
	workforceCapacities: {
		level: true,
		capacity: true
	},
	materials: {
		quantities: {
			amount: true,
			material: {
				id: true,
				ticker: true,
			}
		}
	}
};

const cxBrokerQuery = {
	ticker: true,
	material: {
		id: true
	},
	currency: {
		code: true
	},
	bid: {
		price: {
			amount: true
		}
	},
	ask: {
		price: {
			amount: true
		}
	},
	priceAverage: {
		amount: true
	}
};

export default class BuildingPricing extends CommandInterface {
	constructor(bot, settings) {
		super('bbcc', bot, settings);
	}

	processArgs(args) {
		return args.map(toUpper);
	}

	async action(e, args) {
		let [ticker, market] = args;
		if (!ticker) {
			return e.channel.send('You need to provide a ticker. i.e.`HB1`');
		}

		let building = await query(this.settings.api, 'buildingOptionOne', { ticker }, buildingQuery);
		if (!building) {
			return e.channel.send(`I couldn't find a building for ${ticker}`);
		}

		let brokers = [];
		if (market) {
			// resolve a single market
			let brokerTickers = (building.materials.quantities || []).map(amountMaterial => `${amountMaterial.material.ticker}.${market}`);
			if (!brokerTickers.length) {
				return e.channel.send(`I couldn't find the materials for ${building.ticker}`);
			}

			brokers = await query(this.settings.api, 'cxBrokerMany', {tickers: brokerTickers}, cxBrokerQuery);
			if (!brokers.length) {
				return e.channel.send(`I couldn't find the cxBrokers for ${brokerTickers.join(', ')}`);
			}
		} else {
			// resolve all markets
			let materialIds = (building.materials.quantities || []).map(amountMaterial => amountMaterial.material.id);
			if (!materialIds.length) {
				return e.channel.send(`I couldn't find the materials for ${building.ticker}`);
			}

			brokers = await query(this.settings.api, 'cxBrokerMany', {materials: materialIds}, cxBrokerQuery);
			if (!brokers.length) {
				return e.channel.send(`I couldn't find the cxBrokers for ${materialIds.join(', ')}`);
			}
		}

		let prices = building.materials.quantities.reduce((c, materialAmount) => {
			let materialBrokers = brokers.filter(broker => broker.material.id === materialAmount.material.id);
			let amount = materialAmount.amount;

			for (let broker of materialBrokers) {
				let currency = broker.currency.code;
				c[currency] = c[currency] || {};
				c[currency][broker.ticker] = {
					bid: broker.bid && broker.bid.price.amount * amount,
					ask: broker.ask && broker.ask.price.amount * amount,
					avg: broker.priceAverage && broker.priceAverage.amount * amount,
					amount
				}
			}

			return c;
		}, {})
		

		for (let [currency, materialData] of Object.entries(prices)) {
			let table = new AsciiTable(`${startCase(building.name)} --- ${currency}`)
				.setHeading('Material', 'Amount', 'Ask (Total)', 'Bid (Total)', 'Average (Total)');

			let sum = {
				ask: 0,
				bid: 0,
				avg: 0
			}
			for (let [material, prices] of  Object.entries(materialData)) {
				table.addRow(material, prices.amount, `${prices.ask.toFixed(2) || '---'} ${currency}`, `${prices.bid.toFixed(2) || '---'} ${currency}`, `${prices.avg.toFixed(2) || '---'} ${currency}`);
				sum.ask += Math.round(isNaN(parseFloat(prices.ask)) ? 0 : parseFloat(prices.ask));
				sum.bid += Math.round(isNaN(parseFloat(prices.bid)) ? 0 : parseFloat(prices.bid));
				sum.avg += Math.round(isNaN(parseFloat(prices.avg)) ? 0 : parseFloat(prices.avg));
			}
			table.addRow();
			table.addRow('Total', null, `${sum.ask.toFixed(2) || '---'} ${currency}`, `${sum.bid.toFixed(2) || '---'} ${currency}`, `${sum.avg.toFixed(2) || '---'} ${currency}`);

			e.channel.send(`\`\`\`\n${table.toString()}\n\`\`\``);
		}
	}

	help(e, args) {
		e.channel.send('Send this command with a building ticker to get pricing info for, and optionally a market! i.e. `!bbcc HB1` or `!bbcc HB1 NC1`');
	}
}