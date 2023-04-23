const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const noblox = require('noblox.js');
const axios = require("axios");
const maxPages = 10 // Hardcoded max groups per page

const { GetUserData } = require('../../api/firebase/user.js')

const { GetAllGroups } = require('../../api/ranks.js')

async function getRelationship(groupId, relationship, playerGroups) {
    const res = [];
    try {
        // Initial request to roblox
        const initalData = await axios.get(`https://groups.roblox.com/v1/groups/${groupId}/relationships/${relationship}?model.startRowIndex=0&model.maxRows=1`)

        // Uses the inital request to calculate the number of loops needed to get all related groups
        const totalGroupCount = initalData.data.totalGroupCount
        const modifiedNumber = Math.floor(totalGroupCount / 100) + 1

        // All related groups are added to this array (gets around roblox's 100 groups per request)
        let relatedGroups = []

        // Main request loop gets all pages and adds them to relatedGroups
        for (let i = 0; i < modifiedNumber; i++) {
            const { data } = await axios.get(`https://groups.roblox.com/v1/groups/${groupId}/relationships/${relationship}?model.startRowIndex=${i * 100}&model.maxRows=100`)
            relatedGroups = relatedGroups.concat(data.relatedGroups)
        }

        // Checks if player is in a related group and makes an array
        const relatedGroupsMembership = playerGroups.filter(playerGroup => relatedGroups.filter(relatedGroup => playerGroup.Id == relatedGroup.id).length > 0);

        // Spilts the related groups belonging to the player into a single array with 10 element chunckArrays
        for (i = 0; i < relatedGroupsMembership.length; i += maxPages) res.push(relatedGroupsMembership.slice(i, i + maxPages))

    } finally {
        // Returns output of try
        return res;
    }
}

function makeGroupLink(groupid, name) {
    // Replaces all specail characters from name
    name = name.replace(/[^a-z|\s]/gi, '')
    name = name.replace(/[|]/g, '')

    // Spilts name into array
    const charArray = name.split(' ')
    for (let cur of charArray) {
        if (cur == '') { charArray.splice(charArray.indexOf(cur)) }
    }

    // Returns final product
    return "https://www.roblox.com/groups/" + groupid + "/" + charArray.join('-') + "#!/about";
}

let database
const SetDatabase = function (db) { database = db }

module.exports = {
    SetDatabase,
    data: new SlashCommandBuilder()
        .setName('enemies')
        .setDescription('Gets group enemied information on player.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Target user.'))
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Target player username.'))
        .addNumberOption(option =>
            option.setName('userid')
                .setDescription('Target player userid.')),
    async execute(interaction) {
        // Sets up the userid and username variables that will be changed depending on the input of the user
        var [userid, username] = []
        try {
            if (interaction.options._hoistedOptions.length > 0) {
                const input = interaction.options.getMember('target') || interaction.options.getString('username') || interaction.options.getNumber('userid')
                if (typeof input === 'number') userid = input // If the input is a number, we know its userid so it sets that number to the userid
                if (typeof input === 'string') username = input // If the input is a string, we know its username so it sets that string to the username
                if (typeof input === 'object') {
                    const userData = await GetUserData(database, input.id)
                    if (userData) userid = userData.roblox_id
                }
            } else {
                const userData = await GetUserData(database, interaction.member.id)
                if (userData) userid = userData.roblox_id
            }

            // If no userid is specified, we get the userid from roblox
            if (typeof userid === 'undefined') userid = await noblox.getIdFromUsername(username)

            // User data from noblox
            const userData = await noblox.getPlayerInfo(userid)
            const thumbnailURL = await noblox.getPlayerThumbnail(userid, 420)

            // Finds group id for guild
            const allGroups = GetAllGroups()
            for (let index = 0; index < allGroups.length; index++) {
                const group = allGroups[index];
                if (group.guildid === interaction.guild.id) {
                    var MainGroupId = group.groupid
                }
            }

            // Relationship data is called
            const userGroups = await noblox.getGroups(userid)
            const enemiedGroupsData = await getRelationship(MainGroupId, "Enemies", userGroups)

            //Discord.js v14 hack (due to .addfield being deprecated, I made my own that adds the fields to an array due to this scripts use of .addField to make pages)
            const embedFields = []
            const addField = (name, value, inline) => {
                inline = inline || false
                embedFields.push({ name: name, value: value, inline: inline })
            }

            function createPage(page) {
                const replyEmbed = new EmbedBuilder()
                    .setFooter({ text: `Pages: ${page + 1}/${enemiedGroupsData.length}` }) // Lets the user know what page they are viewing
                    .setTitle(userData.username + "'s Enemied Connections 🔎") // Nice title, might make it something else in the future
                    .setThumbnail(thumbnailURL[0].imageUrl) // roblox sends thumbnail in an array because for some reason it thinks that you will be mass requesting thumbnails
                    .setColor([103, 0, 0]) // Red
                    .setTimestamp()

                embedFields.splice(0, embedFields.length) // Removes all previous embedFields elements
                for (var playerGroup of enemiedGroupsData[page]) {
                    // For each enemiedgroup it adds a field to the embedFields array
                    addField(playerGroup.Name, `**Rank: **${playerGroup.Role}\n[Group Link](${makeGroupLink(playerGroup.Id, playerGroup.Name)})\n`, true)
                }

                replyEmbed.addFields(embedFields) // Sets the embedFields array to the replyEmbed
                return replyEmbed;
            }

            // Changing Pages functionality
            const replyRow = new ActionRowBuilder()
                .addComponents([
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('⬅')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('➡')
                        .setStyle(ButtonStyle.Secondary),
                ]);

            // Returns the command if no enemiedd groups were found to belong in the player group list
            if (enemiedGroupsData.length == 0) return await interaction.reply({ content: 'I could not find any enemied groups connected to the main discord group that has a relationship with the selected user!' })

            if (enemiedGroupsData.length == 1) {
                // If only 1 page, doesnt bother adding the replyRow
                await interaction.reply({ embeds: [createPage(0)] })
            } else {
                // If more than 1 page, adds replyRow
                await interaction.reply({ embeds: [createPage(0)], components: [replyRow] })

                // Creates collector for the replyRow interactions
                const filter = i => i.user.id === interaction.user.id;
                const initalCollector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

                var pageCount = 0 // Keeps track of the active page count of the replyEmbed
                initalCollector.on('collect', async i => {
                    if (i.customId === 'prev') {
                        // Back arrow was pressed
                        pageCount -= 1;

                        // Creates new button only for the previous button
                        var prev = new ButtonBuilder()
                            .setCustomId('prev')
                            .setLabel('⬅')
                            .setStyle(ButtonStyle.Secondary)
                        if (pageCount === 0) prev.setDisabled(true); // If there is no pages to go back to, new button is disabled

                        // Builds new replyRow
                        const replyRow = new ActionRowBuilder()
                            .addComponents([
                                prev,
                                new ButtonBuilder()
                                    .setCustomId('next')
                                    .setLabel('➡')
                                    .setStyle(ButtonStyle.Secondary),
                            ]);

                        // Updates first interaction
                        await i.update({ embeds: [createPage(pageCount)], components: [replyRow] });
                    } else if (i.customId === 'next') {
                        // Forward arrow was pre
                        pageCount += 1;

                        // Creates new button only for the next button
                        var next = new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('➡')
                            .setStyle(ButtonStyle.Secondary)
                        if (pageCount + 1 == enemiedGroupsData.length) next.setDisabled(true); // If there is no pages to go next to, new button is disabled

                        // Builds new replyRow
                        const replyRow = new ActionRowBuilder()
                            .addComponents([
                                new ButtonBuilder()
                                    .setCustomId('prev')
                                    .setLabel('⬅')
                                    .setStyle(ButtonStyle.Secondary),
                                next
                            ]);

                        // Updates first interaction
                        await i.update({ embeds: [createPage(pageCount)], components: [replyRow] });
                    }
                });

                // Button collector gets all button inputs
                initalCollector.on('end', _ => interaction.editReply({ embeds: [createPage(pageCount)] }));
            }
        } catch (err) {
            await interaction.reply({ content: err.message, ephemeral: true })
        }
    },
};