// Require the necessary discord.js classes
const { Client, Events, Collection, GatewayIntentBits } = require('discord.js');
const { DiscordToken } = require('./config.json');
const fs = require('node:fs');

const commandFiles = fs.readdirSync('./discord-bot/commands').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./discord-bot/events').filter(file => file.endsWith('.js'));

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.Guilds,
	]
});

client.commands = new Collection();

// Init Firebase
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { firebase, BearerToken } = require('./config.json')

initializeApp({
	credential: cert(firebase)
});

const db = getFirestore();

// Init Server
const express = require("express")
const bodyParser = require('body-parser');

const port = 6969;
const app = express();

app.use(bodyParser.json());


// Rate Limiting
const Redis = require('ioredis');
const redis = new Redis();

const CheckRateLimit = async function (req, res) {
	const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
	const requests = await redis.incr(ip);
	console.log(`${ip}: request #${requests}`);

	if (requests === 1) {
		await redis.expire(ip, 60);
	}
	if (requests > 15) {
		res.status(503)
			.json({
				response: 'Error',
				callsMade: requests,
				error: 'Too many calls made'
			});
		return false
	}
	return true
}

for (const file of commandFiles) {
	const command = require(`./discord-bot/commands/${file}`);

	// Sets up database for command modules
	command.SetDatabase(db)

	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

for (const file of eventFiles) {
	const event = require(`./discord-bot/events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// API Functions
const { StartAuthentication, ConfirmAuthenication } = require('./api/authenticate.js')
const { AddPoints, SubtractPoints, GetPoints } = require('./api/firebase/points.js')
const { PointsWebhook } = require('./api/webhooks.js')

const noblox = require('noblox.js')

app.post("/auth-user", async function (req, res) {
	if (!await CheckRateLimit(req, res)) return;
	if (req.headers.authorization !== BearerToken) {
		res.status(401).send("Invalid Credentials")
		return
	}

	ConfirmAuthenication(db, req.body.UserId, req.body.ActivationString).then(() => {
		res.json({ "message": "ok" })
	}).catch((err) => {
		res.json({ "error": err.message })
	})
})

app.post("/change-points", async function (req, res) {
	if (!await CheckRateLimit(req, res)) return;
	if (req.headers.authorization !== BearerToken) {
		res.status(401).send("Invalid Credentials")
		return
	}

	let errorusers = []
	
	for (let index = 0; index < req.body.userids.length; index++) {
		const userid = req.body.userids[index];
		try {
			const oldPoints = await GetPoints(db, userid, req.body.type)
			if (req.body.operation === "add") {
				await AddPoints(db, userid, req.body.type, req.body.value)
				PointsWebhook(req.body.type, "Points Changed", `**${await noblox.getUsernameFromId(req.body.officer)}** changed **${await noblox.getUsernameFromId(userid)}**'s ${req.body.type} from **${oldPoints}** to **${oldPoints + req.body.value}**`)
			} else {
				await SubtractPoints(db, userid, req.body.type, req.body.value)
				PointsWebhook(req.body.type, "Points Changed", `**${await noblox.getUsernameFromId(req.body.officer)}** changed **${await noblox.getUsernameFromId(userid)}**'s ${req.body.type} from **${oldPoints}** to **${oldPoints - req.body.value}**`)
			}
		} catch (err) {
			errorusers.push(`${userid}: ${err.message}`)
		}
	}
	
	if (errorusers.length === 0) {
		res.json({ "message": "ok" })
	} else {
		res.json({ "error": errorusers })
	}
})

app.get('/get-points/:type/:userid', async function(req, res) {
	if (!await CheckRateLimit(req, res)) return;
	try {
		res.json({"points": await GetPoints(db, req.params.userid, req.params.type)	})
	} catch (err) {
		res.json({ "error": err.message })
	}
})

app.listen(port, function () {
	console.log("App listening on port " + port + ".");
});

// Log in to Discord with your client's token
client.login(DiscordToken);