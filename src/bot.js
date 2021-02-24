const discord = require("discord.js");

import Ping from './commands/ping';
import Cx from './commands/cx';

export default class Bot {
	static get EVENT_TYPES() {
		return {
			MESSAGE: "message",
		}
	}

	constructor(token, settings) {
		this._ = {}; // privates
		this.settings = settings;

		this._.bot = new discord.Client();

		this._.bot.on('ready', this.onready.bind(this));
		this._.bot.on(Bot.EVENT_TYPES.MESSAGE, this.onevent.bind(this, Bot.EVENT_TYPES.MESSAGE));

		this._.commands = {
			[Bot.EVENT_TYPES.MESSAGE]: {
				ping: new Ping(this._.bot, this.settings),
				cx: new Cx(this._.bot, this.settings)
			}
		}

		this._.bot.login(token);
	}

	onready(e) {
		console.log('Connected');
		console.log('Logged in as: ' + this._.bot.user.username + ' - (' + this._.bot.user.id + ')');
	}

	onevent(type, e) {
		switch (type) {
			case Bot.EVENT_TYPES.MESSAGE:
				if (e.author.bot) {
					return
				}

				if (!e.content.startsWith(this.settings.commandToken)) {
					return;
				}

				let args = e.content.substring(this.settings.commandToken.length).split(' ').filter(s => !!s);
				let cmd = args.shift();

				if (!cmd) {
					return;
				}

				cmd = cmd.toLowerCase();
				this.callAction(e, cmd, args, Bot.EVENT_TYPES.MESSAGE)
				break;
		}
	}

	callAction(e, cmd, args, type) {
		if (cmd in this._.commands[type]) {
			console.log('Running command', cmd, args);
			this._.commands[type][cmd].action(e, this._.commands[type][cmd].processArgs(args));
		}
	}
}