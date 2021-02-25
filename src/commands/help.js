import CommandInterface from './-interface';
import Bot from '../bot';

export default class Help extends CommandInterface {
	constructor(bot, settings, context) {
		super('help', bot, settings);
		this.context = context;
	}

	processArgs(args) {
		return args.map(arg => arg.toLowerCase())
	}

	action(e, args) {
		let subcommand = args[0];
		if (subcommand in this.context._.commands[Bot.EVENT_TYPES.MESSAGE]) {
			return this.context._.commands[Bot.EVENT_TYPES.MESSAGE][subcommand].help(e, args);
		}

		let commands = Object.keys(this.context._.commands[Bot.EVENT_TYPES.MESSAGE]);

		e.channel.send('Available commands: \n •' + commands.join('\n •'));
	}

	help(e, args) {
		e.channel.send('Send this command with a command you have questions about! i.e. `!help cx`');
	}
}
