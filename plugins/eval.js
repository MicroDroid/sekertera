const safeEval = require('safe-eval');
const Parser = require('../parser');

module.exports = {
	adminOnly: true,
	description: 'Evaluate stuff',

	handle: (message, datastore, bot) => {
		const parsed = Parser.parse(message.content);
		var result;

		try {
			result = safeEval(parsed.args, {
				env: process.env,
				bot, datastore, message
			});
		} catch (e) {
			result = e;
		}

		message.channel.send('```\n' + result + '\n```');
	}
}