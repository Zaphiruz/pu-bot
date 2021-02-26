import CommandInterface from './-interface';
import { request, gql } from 'graphql-request';
import AsciiTable from 'ascii-data-table'
import moment from 'moment';

const CURRENCY = /\.\w{2}\d$/i;

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
			let materialId = ticker.slice(0, 3);
			let material = await this.fetchMaterial(materialId);
			if (!material) {
				return e.channel.send(`I couldn't find a material for ${materialId}`);
			}

			brokers = await this.fetchCxBroker({material: material.id}, 'cxBrokerMany');
		} else {
			let broker = await this.fetchCxBroker({ticker});
			
			brokers = [broker];
		}

		if (!brokers.length) {
			return e.channel.send(`I couldn't find a broker for ${ticker}`);
		}

		let materialName = brokers[0].material && brokers[0].material.name || 'N/A';
		let headerData = [
			["Material", materialName],
		];
		let tableData = [
			['Ticker', 'Bid', 'Ask', 'Time']
		]

		for(let broker of brokers) {
			let bid = broker.bid ? `${broker.bid.price.amount} ${broker.bid.price.currency} (${broker.bid.amount})` : 'None'
			let ask = broker.ask ? `${broker.ask.price.amount} ${broker.ask.price.currency} (${broker.ask.amount})` : 'None'
			let time = broker.priceTime ? moment(broker.priceTime.timestamp).format('DD MMM, hh:mm A') : 'N/A';
	
			let brokerData = [
				[broker.ticker, `${bid}`, `${ask}`, `${time}`],
			]
			
			tableData.push(...brokerData);
		}

		let header =  AsciiTable.table(headerData, 200);
		let display = AsciiTable.table(tableData, 200);
		return e.channel.send(`\`\`\`\n${header}\n${display}\n\`\`\``);
	}

	help(e, args) {
		e.channel.send('Send this command with your favorite cx ticker! i.e. `!cx RAT.NC1`');
	}

	fetchCxBroker(query, method = 'cxBrokerOne') {
		let [[param, value]] = Object.entries(query);

		return request(this.settings.api, gql`
			query {
				${method}(filter: {${param}: "${value}"}) {
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
					priceTime {
						timestamp
					}
				}
			}
		`).then(data => data[method])
	}

	fetchMaterial(ticker) {
		return request(this.settings.api, gql`
			query {
				materialOne(filter: {ticker: "${ticker}"}) {
					id
				}
			}
		`).then(data => data.materialOne)
	}
}

