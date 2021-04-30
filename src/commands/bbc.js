import CommandInterface from './-interface';
import { query } from '../utils/graphql-query-helper'
import AsciiTable from 'ascii-table';
import { toUpper, startCase, capitalize } from 'lodash';

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
				name: true
			}
		}
	}
};
export default class Buildinginfo extends CommandInterface {
	constructor(bot, settings) {
		super('bbc', bot, settings);
	}

	processArgs(args) {
		return args.map(toUpper);
	}

	async action(e, args) {
		let [ticker] = args;
		if (!ticker) {
			return e.channel.send('You need to prodive a ticker. i.e.`HB1`');
		}

		let building = await query(this.settings.api, 'buildingOptionOne', { ticker }, buildingQuery);
		if (!building) {
			return e.channel.send(`I couldn't find a building for ${ticker}`);
		}

		let table = new AsciiTable(startCase(building.name))
			.addRow('Area', building.area, '')
			.addRow('Category', startCase(capitalize(building.expertiseCategory)), '')
			.addRow('Type', startCase(capitalize(building.type)), '')
			
		for (let { level, capacity } of building.workforceCapacities || [] ) {
			table.addRow('Workforce', startCase(capitalize(level)), capacity)
		}

		for (let { amount, material } of building.materials.quantities || [] ) {
			table.addRow('Material', startCase(material && material.name), amount);
		}

		e.channel.send(`\`\`\`\n${table.toString()}\n\`\`\``);
	}

	help(e, args) {
		e.channel.send('Send this command with a building ticker to get information about it! i.e. `!bbc HB1`');
	}
}