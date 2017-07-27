var googleTTS = require('google-tts-api');

module.exports = {
    description: "Echo the pronunciation of a word",
    
    handle: message => {
        const args = message.content.substr(message.content.indexOf(' ')+1);
        const lang = args.substr(0, args.indexOf(' '));
        const sentence = args.substr(args.indexOf(' ')+1);
        
        if (!lang) {
            message.channel.send('Add a language for the pronunciation');  
        } if (!sentence) {
            message.channel.send('Add a sentence to pronounce is required');
            return;
        }
            
        googleTTS(sentence, lang, 1)
            .then(url => {
				if (message.member.voiceChannel)
					message.member.voiceChannel.join()
						.then(connection => {
							const dispatcher = connection.playArbitraryInput(url);
							dispatcher.on('end', () => {
								connection.disconnect();
							});
						});
				else message.channel.send(url);
            }).catch(e => {
                message.channel.send('An error occurred!');
            });
    }
}