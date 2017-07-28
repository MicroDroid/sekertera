const axios = require('axios');
const Logger = require('../logger');
const Parser = require('../parser');
const DomParser = require('dom-parser');

wa = {
    description: "Query some arbitrary data",
    parser: null,
    
    onCreate: () => {
        if (!process.env.WOLFRAM_API_KEY)
            Logger.warn('Wolfram API key is not set!');
        wa.parser = new DomParser();
    },
    
    handle: message => {
        if (!process.env.WOLFRAM_API_KEY) {
            message.channel.send('Wolfram plugin is not set up.');
            return;
        }
            
        const parsed = Parser.parse(message.content);
        
        if (!parsed.args) {
            message.channel.send('Add some data to query');
            return;
        }
        
        axios.get('https://api.wolframalpha.com/v2/query?input=' 
                    + encodeURIComponent(parsed.args) 
                    + '&appid='
                    + encodeURIComponent(process.env.WOLFRAM_API_KEY))
            .then(data => {
                const parsed = wa.parser.parseFromString(data.data);
                const result = parsed.getElementsByTagName('plaintext')
                    .slice(0, 3)
                    .map(e => e.innerHTML)
                    .reduce((p, c) => p + '\n' + c, '');
                message.channel.send('```' + result + '\n```');
            }).catch(error => {
                message.channel.send('An error occurred');
                throw error;
            });
    }
}

module.exports = wa;