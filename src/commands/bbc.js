import CommandInterface from './-interface';
import { query } from '../utils/graphql-query-helper'

export default class Buildinginfo extends CommandInterface {
	constructor(bot, settings) {
		super('bbc', bot, settings);
	}

	processArgs(args) {
		return args.map(arg => arg.toUpperCase());
	}

	async action(e, args) {
		let [ticker] = args;
		if (!ticker) {
			return e.channel.send('You need to prodive a ticker. i.e.`HB1`');
		}

		let building = await query(this.settings.api, 'buildingOptionOne', { ticker }, {
			name: true,
			area: true,
			expertiseCategory: true,
			type: true,
			workforceCapacities: {
				level: true,
				capacity: true
			}
		});
		if (!building) {
			return e.channel.send(`I couldn't find a building for ${ticker}`);
		}

		console.log(building);

		e.channel.send(JSON.stringify(building));
	}

	help(e, args) {
		e.channel.send('Send this command with a building ticker to get information about it! i.e. `!bbc HB1`');
	}
}