import CommandInterface from './-interface';
import { query } from '../utils/graphql-query-helper'
import AsciiTable from 'ascii-table';

const materialQuery = {
	name: true,
	ticker: true,
	category: {
		name: true
    },
	volume: true,
	weight: true
}

export default class Mat extends CommandInterface {
	constructor(bot, settings) {
		super('mat', bot, settings);
	}

	processArgs(args) {
		return args.map(arg => arg.toUpperCase());
    }

	async action(e, args) {
		//e.channel.send(['pong -->', ...args].join(' '));

		let [ticker] = args;
		if (!ticker) {
			return e.channel.send('You need to provide a ticker. i.e. "RAT"');
		}
		
		let mat = await query(this.settings.api, "materialOne", { ticker }, materialQuery);
		if (!mat) {
			return e.channel.send(`I couldn't find a material for ${ticker}`);
		}

		let table = new AsciiTable(mat.name);
		table.addRow("Name", mat.name.toUpperCase())
		table.addRow("Ticker", mat.ticker)
		table.addRow("Category", mat.category && mat.category.name.toUpperCase())
		table.addRow("Volume", mat.volume)
		table.addRow("weight", mat.weight)

		// Align the second column
		table.setAlign(1, AsciiTable.RIGHT)

		return e.channel.send(`\`\`\`\n${table.toString()}\n\`\`\``);
	}

	help(e, args) {
		e.channel.send('replys with "pong" and any arguments. Really just for testing');
	}
}