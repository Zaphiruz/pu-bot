import CommandInterface from './-interface';

export default class Mat extends CommandInterface {
	constructor(bot, settings) {
		super('mat', bot, settings);
	}

	action(e, args) {
		e.channel.send(['pong -->', ...args].join(' '));
	}

	help(e, args) {
		e.channel.send('replys with "pong" and any arguments. Really just for testing');
	}
}