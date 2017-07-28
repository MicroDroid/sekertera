const Fuse = require('fuse.js');
const Parser = require('../parser');

module.exports = {
    description: "An index of resources",
    adminOnly: true,
    
    onCreate: (datastore, bot) => {
        bot.on('message', message => {
            if (message.author.username === bot.user.username && message.author.discriminator === bot.user.discriminator)
                return;
                
            const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
            if (message.content.search(urlRegex) !== -1) {
                datastore.get('resources')
                    .then(resources => {
                        resources = resources ? resources : [];
                        
                        datastore.set('resources', [...resources, {
                            id: Math.random().toString(36).substring(5),
                            text: message.content,
                            category: 'Default',
                        }])
                            .then(() => {
                                message.react('📚');
                            }).catch(e => {
                                message.react('❌');
                            });
                    }).catch(e => {
                        message.react('❌');
                    });
            }
        });
    },
    
    handle: (message, datastore) => {
        const parsed = Parser.parse(message.content);
        
        if (!parsed.argWords[0]) {
            message.channel.send('What do I do?');  
            return;
        } if (!parsed.argWords[1] && ['add', 'search'].indexOf(parsed.argWords[0]) !== -1) {
            message.channel.send(`Yeah okay, I'll ${parsed.argWords[0].substring(0, 16)}, but to what?`);
            return;
        }
        
        switch (parsed.argWords[0]) {
            case 'add':
                if (!parsed.argWords[2]) {
                    message.channel.send(`Yeah, I'll add to the ${parsed.argWords[1].substring(0, 16)} category, but what?`);
                    return;
                }
                
                datastore.get('resources')
                    .then(resources => {
                        resources = resources ? resources : [];
                        
                        datastore.set('resources', [...resources, {
                            id: Math.random().toString(36).substring(5),
                            text: parsed.argWords.slice(2).join(' '),
                            category: parsed.argWords[1][0].toUpperCase() + parsed.argWords[1].slice(1).toLowerCase(),
                        }])
                            .then(() => {
                                message.react('👍🏻');
                            }).catch(e => {
                                message.react('❌');
                            });
                    }).catch(e => {
                        message.react('❌');
                    });
                break;
            case 'search':
                datastore.get('resources')
                    .then(resources => {
                        resources = resources ? resources : [];
                        
                        const fuse = new Fuse(resources, {
                            keys: ['text'],
                        });
                        
                        const results = fuse.search(parsed.args.substr(parsed.args.indexOf(' ')+1));
                        
                        if (results.length < 1)
                            message.react('🤷🏻');
                        
                        let result = `${results.length} results:\n`;
                            
                        for (let i = 0; i < results.length && i < 3; i++)
                            result += `\n\`${results[i].id}\`/\`${results[i].category}\` - ${results[i].text}`;
                            
                        if (results.length >= 3)
                            result += '\n*...*';
                            
                        message.channel.send(result);
                    }).catch(e => {
                        message.react('❌');
                    });
                break;
            case 'delete':
                datastore.get('resources')
                    .then(resources => {
                        resources = resources ? resources : [];
                        const resource = resources.filter(r => r.id === parsed.argWords[1])[0];
                        if (!resource)
                            message.react('🤷🏻');
                        else {
                            datastore.set('resources', resources.filter(r => r.id !== parsed.argWords[1]))
                                .then(() => {
                                    message.react('👍🏻');
                                }).catch(e => {
                                    message.react('❌');
                                })
                        }
                    }).catch(e => {
                        message.react('❌');
                    });
                    break;
            case 'list':
                datastore.get('resources')
                    .then(resources => {
                        resources = resources ? resources : [];
                        let result = `There are ${resources.length} resources, `
                                + `${resources.reduce((p, x) => p.indexOf(x.a) !== -1 ? p : [...p, x.a], []).length+1} categories:\n`;
                        for (let i = 0; i < resources.length && i < 10; i++)
                            result += `\n\`${resources[i].id}\`/\`${resources[i].category}\` - ${resources[i].text}`;
                        if (resources.length >= 10)
                            result += '\n\n*and there\'s more..*';
                        message.channel.send(result);
                    }).catch(e => {
                        message.react('❌');
                    });
                break;
            default:
                message.channel.send('uh?');
                break;
        }
    }
}