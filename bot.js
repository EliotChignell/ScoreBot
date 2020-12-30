/*
    ScoreBot by Eliot "chig" Chignell
    Started 29/12/20
*/

// Libraries
const Discord = require(`discord.js`);
const fs = require(`fs`);

// discord.js core variables
const client = new Discord.Client();

// Sorting out commands
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync(`./commands`).filter(file => file.endsWith(`.js`));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// JSON files
const config = require(`./config.json`);

// When ready
client.once(`ready`, () => {
	console.log(`${client.user.tag} is ready!`);
});

// When message is sent
client.on(`message`, message => {
    let prefix;
    for (var i = 0; i < config.prefixes.length; i++) {
        if (message.content.startsWith(config.prefixes[i])) prefix = config.prefixes[i];
    }
	if (!prefix || message.author.bot || !message.guild) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	if (!client.commands.has(command)) return;

	try {
		console.log(`[${message.author.tag}] ${message.content}`);
		client.commands.get(command).execute(message, args, prefix.split(` `).join(``));
	} catch (error) {
		console.error(error);
		message.reply(`an unknown error occured running that command.`);
	}
});

// Logging into Discord API
client.login(config.token);