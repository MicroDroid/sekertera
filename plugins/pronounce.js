const googleTTS = require('google-tts-api');
const Parser = require('../parser');

module.exports = {
    description: "Echo the pronunciation of a word",
    
    handle: message => {
        const parsed = Parser.parse(message.content);
        
        if (!parsed.argWords[0]) {
            message.channel.send('laaalalaaaaa! Like it!?');  
        } if (!parsed.argWords[1]) {
            message.channel.send(`I'll pronounce with language ${parsed.argWords[0].substring(0, 16)}, but what do I?`);
            return;
        }
        
        console.log(parsed.argWords[0])
            
        googleTTS(parsed.args.substring(parsed.args.indexOf(' ')+1), parsed.argWords[0], 1)
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
                message.react('❌');
            });
    }
}