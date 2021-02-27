const discord = require("discord.js");

import Ping from './commands/ping';
import Cx from './commands/cx';
import Help from './commands/help';
import Fx from './commands/fx';
import Bbc from './commands/bbc';

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
				cx: new Cx(this._.bot, this.settings),
				fx: new Fx(this._.bot, this.settings),
				bbc: new Bbc(this._.bot, this.settings),
				help: new Help(this._.bot, this.settings, this),
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

	async callAction(e, cmd, args, type) {
		console.time('Action')
		try {
			if (cmd in this._.commands[type]) {
				console.log('Running command', cmd, args);
				await this._.commands[type][cmd].action(e, this._.commands[type][cmd].processArgs(args));
			}
		} catch(err) {
			e.channel.send(`That command failed. ${cmd}: ${args}`);
			throw err;
		}
		console.timeEnd('Action')
	}
}
