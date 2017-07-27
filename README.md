Sekertera
========

A Discord bot for an Arabic-English learning server. Inspired by [Bolt](https://github.com/MicroDroid/bolt)

Usage
-----

```bash
git clone https://github.com/MicroDroid/sekertera
cd ./sekertera
cp ./.env.example ./.env
# Edit .env
npm i
node .
```

Writing plugins
--------

Plugins are dead-easy to write, they can extend the bot's functionality to the highest possible. Filename of a plugin represents the command name it reserves and handles

--------------

Each plugin **must** export a `handle` function, which gets `message`, `datastore`, and `bot` params:

- `message` is [this](https://discord.js.org/#/docs/main/stable/class/Message)
- `datastore` is a very simple key/value store.
    - `get(key)` Returns a promise, which returns the value. `null` or `undefined` if non-existant
    - `set(key, value)` Sets value of `key` to `value`. Returns a promise.
- `bot` is a [DiscordJS client](https://discord.js.org/#/docs/main/stable/class/Client)

Here's an example plugin that utilizes all features:

###### test.js
```JavaScript
module.exports = {
    adminOnly: true, // Optional, defaults to false
    description: 'A description that shows in help',

    handle: (message, datastore, bot) => {
        // Someone said !test
        // Here you can handle the command.
    },

    onCreate: (datastore, bot) => {
        // Bot is a Slackbots instance
        // Do whatever. Such as initialize a connection,
        // Listen to an event.
    },

    onDestroy: (datastore, bot) => {
        // Bot is also Slackbots instance
        // And you can listen to also whatever, close a connection,
        // Remove event listener.
    }
}
```