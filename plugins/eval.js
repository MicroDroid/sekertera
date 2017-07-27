const safeEval = require('safe-eval');

module.exports = {
	adminOnly: true,
	description: 'Evaluate stuff',

	handle: (message, datastore, bot) => {
        const expression = message.content.substr(message.content.indexOf(' ')+1);
		var result;

		try {
			result = safeEval(expression, {
				env: process.env,
				bot, datastore
			});
		} catch (e) {
			result = e;
		}

		message.channel.send('```\n' + result + '\n```');
	}
}