const axios = require('axios');
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
            
            
        const args = message.content.substr(message.content.indexOf(' ')+1);
        const lang = args.substr(0, args.indexOf(' '));
        const sentence = args.substr(args.indexOf(' ')+1);
        
        if (!lang) {
            message.channel.send('Add a language for the translation direction');  
        } if (!sentence) {
            message.channel.send('Add a sentence to translate');
            return;
        }
            
        axios.get('https://translate.yandex.net/api/v1.5/tr.json/translate?key='
                    + process.env.YANDEX_API_KEY
                    + '&text='
                    + encodeURIComponent(sentence)
                    + '&lang='
                    + encodeURIComponent(lang))
            .then(response => {
				message.channel.send(response.data.text.reduce((p, c) => p + ', ' + c, '').substr(2));
            }).catch(e => {
                message.channel.send('An error occurred!');
            });
    }
}