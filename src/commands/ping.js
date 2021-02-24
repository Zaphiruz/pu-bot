import CommandInterface from './-interface';

export default class Ping extends CommandInterface {
	constructor(bot, settings) {
		super('ping', bot, settings);
	}

	action(e, args) {
		e.channel.send(['pong', ...args].join(' '));
	}

	help(e, args) {
		e.channel.send('replys with "pong" and any arguments. Really just for testing');
	}
}