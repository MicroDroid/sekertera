const Helpers = require('./helpers');
const Logger = require('./logger');

let modules = {
    // command: module
};

function generateHelp() {
    var help = '```yaml\nSekertera is a sekertera that can do magic\n\n';

    help += 'User commands';

    for (let key in modules)
      if (modules.hasOwnProperty(key) && !modules[key].adminOnly)
        help += '\n  ' + key + (modules[key].description ? ': ' + modules[key].description : '');

    help += '\n\nAdmin commands';

    for (let key in modules)
      if (modules.hasOwnProperty(key) && modules[key].adminOnly)
        help += '\n  ' + key + (modules[key].description ? ': ' + modules[key].description : '');

    help += '\n```';

    return help;
}

module.exports = {
    handle: (message, datastore, bot) => {
        let command = message.content.split(' ')[0];

        if (!command.startsWith(process.env.PREFIX))
            return false;
        
		command = command.substr(process.env.PREFIX.length);
        
        if (command === 'help') {
            message.channel.send(generateHelp());
        } else {
            if (modules[command] && process.env.ADMINS && modules[command].adminOnly)
                if (!Helpers.isAdmin(message.author.username + '#' + message.author.discriminator))
                    return Logger.info(`User ${message.author.username}#${message.author.discriminator} tried to use '${command}'`);

            if (modules[command]) {
                try {
                    modules[command].handle(message, datastore, bot);
                } catch (e) {
                    Logger.err(`Module ${command} threw: ${e}`);
                }
            }
        }
    },

    register: (command, module, datastore, bot) => {
        if (typeof(module.handle) !== 'function') // wat
            throw `Invalid or undefined handler for '${command}'`;
        if (module.onCreate)
            module.onCreate(datastore, bot);
        modules[command] = module;
    },

    unregister: (command, datastore, bot) => {
        if (modules[command]) {
            if (modules[command].onDestroy)
                modules[command].onDestroy(datastore, bot);
            delete modules[command];
        }
    }
}