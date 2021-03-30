import CommandInterface from './-interface';
import { query } from '../utils/graphql-query-helper';
import AsciiTable from 'ascii-table';
import { camelToText } from '../utils/strings';

export default class Suggest extends CommandInterface {
	constructor(bot, settings) {
		super('suggest', bot, settings);
	}

	processArgs(args) {
		return args.map(arg => arg.toUpperCase());
	}

	async action(e, args) {
		e.channel.send('Not implimented yet');
		return;
	}

	help(e, args) {
		e.channel.send('replys with "pong" and any arguments. Really just for testing');
	}
}