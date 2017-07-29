const axios = require('axios');
const Parser = require('../parser');
const Logger = require('../logger');

module.exports = {
    description: "Translate text",
    
    onCreate: () => {
        if (!process.env.YANDEX_API_KEY)
            Logger.warn('Yandex translation API key is not set!');
    },
    
    handle: message => {
        if (!process.env.YANDEX_API_KEY) {
            message.channel.send('Translation plugin is not set up.');
            return;
        }
            
            
        const parsed = Parser.parse(message.content);
        
        if (!parsed.argWords[0]) {
            message.channel.send(`What do I translate?`);
            return;
        } if (!parsed.argWords[1]) {
            message.channel.send(`Ok I'll translate to ${parsed.argWords[0]}, but what?`);
            return;
        }
            
        axios.get('https://translate.yandex.net/api/v1.5/tr.json/translate?key='
                    + process.env.YANDEX_API_KEY
                    + '&lang='
                    + encodeURIComponent(parsed.argWords[0])
                    + '&text='
                    + encodeURIComponent(parsed.args.substring(parsed.args.indexOf(' ')+1)))
            .then(response => {
				message.channel.send(response.data.text.reduce((p, c) => p + ', ' + c, '').substr(2));
            }).catch(e => {
                message.react('❌');
            });
    }
}