export default class Comamnd {
	constructor(name, bot, settings) {
		this.name = name;
		this.bot = bot;
		this.settings = settings;
	}

	processArgs(args) {
		return args;
	}

	action(e, args) {
		e.channel.send('This is a work in progress. Please try this command again later');
	}

	help(e, args) {
		e.channel.send('This is undocumented. Please try again later');
	}
}