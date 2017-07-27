require('dotenv').config();

const Discord = require('discord.js');
const ModuleManager = require('./module-manager');
const Watch = require('watch');
const fs = require('fs');
const reload = require('require-reload')(require);
const Logger = require('./logger');
const Helpers = require('./helpers');

Logger.info('Starting..');

const Datastore = require('./datastore');

fs.readdir('./plugins', (err, files) => {
	files.filter(f => f.endsWith('.js')).forEach(f => {
		const name = f.substr(0, f.length - 3);
		try {
			const module = reload(`./plugins/${f}`);
			ModuleManager.register(name, module, Datastore, bot);
			Logger.info(`Loaded '${name}'`);
		} catch (e) {
			Logger.warn(`Failed to unload/load '${name}': ${e}`);
		}
	});
});

Watch.watchTree('./plugins', {
    filter: filename => filename.endsWith('.js')
}, (f, curr, prev) => {
	const name = typeof(f) === 'string' ? (f.startsWith('plugins/') ? f.slice(8, -3): f) : '';
	try {
		if (typeof f == 'object' && prev === null && curr === null) {
			// Finished walking the tree
		} else if (prev === null) {
			// f is a new file
			const Module = reload(`./${f}`);
			ModuleManager.register(name, module, Datastore, bot);
			Logger.info(`Loaded '${name}'`);
		} else if (curr.nlink === 0) {
			// f was removed
			ModuleManager.unregister(name, Datastore, bot);
			Logger.info(`Unloaded '${name}'`);
		} else {
			// f was changed
			const module = reload(`./${f}`);
			ModuleManager.unregister(name, bot);
			ModuleManager.register(name, module, Datastore, bot);
			Logger.info(`Reloaded '${name}'`);
		}
	} catch (e) {
		Logger.warn(`Failed to reload '${name}': ${e}`);
	}
});

const bot = new Discord.Client();

bot.on('message', message => {
	if (message.author.username === bot.user.username && message.author.discriminator === bot.user.discriminator)
		Logger.send((message.channel ? `${message.channel.id} (#${message.channel.name})` : '') + `: ${message.content}`);
		
	else Logger.recv(`${message.author.username}#${message.author.discriminator} ` 
		+ (message.channel ? `@ ${message.channel.id} (#${message.channel.name})` : '')
		+ `: ${message.content}`);

    ModuleManager.handle(message, Datastore, bot);
});

bot.on('ready', () => {
	Logger.info(`Connected as ${bot.user.username}!`);
});

if (!process.env.ADMINS)
	Logger.warn('No admins specified');
	
bot.login(process.env.TOKEN);