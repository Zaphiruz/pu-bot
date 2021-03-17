import CommandInterface from './-interface';
import { query } from '../utils/graphql-query-helper';
import AsciiTable from 'ascii-table';
import { camelToText } from '../utils/strings';

export default class Trade extends CommandInterface {
	constructor(bot, settings) {
		super('trade', bot, settings);
	}

	processArgs(args) {
		return args.map(arg => arg.toUpperCase());
	}

	async action(e, args) {
		return e.channel.send(['pong -->', ...args].join(' '));
	}

	help(e, args) {
		e.channel.send('replys with "pong" and any arguments. Really just for testing');
	}
}