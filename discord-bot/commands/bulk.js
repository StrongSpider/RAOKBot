const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { GetPoints, AddPoints, SubtractPoints } = require('../../api/firebase/points.js')
const { GetUserData } = require('../../api/firebase/user.js')
const { CheckOfficer } = require('../../api/checkofficer.js')

const { PointsWebhook } = require('../../api/webhooks.js')

const { GetGroup } = require('../../api/ranks.js')
const noblox = require('noblox.js');

let database
const SetDatabase = function (db) { database = db }

module.exports = {
    SetDatabase,
    data: new SlashCommandBuilder()
        .setName('bulk')
        .setDescription('Bulk adds/subtracts points from players.')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Targeted point type')
                .setChoices({ name: "royalty", value: "royalty" }, { name: "ranger royalty", value: "ranger royalty" })
                .setRequired(true))
        .addStringOption(option =>
            option.setName('operation')
                .setDescription('Operation being used')
                .setChoices({ name: "add", value: "add" }, { name: "subtract", value: "subtract" })
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('Point change amount')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('usernames')
                .setDescription('Target players usernames. Seperate each user with a space.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.MentionEveryone),
    async execute(interaction) {
        try {
            const pointType = interaction.options.getString('type')
            const operation = interaction.options.getString('operation')
            const amount = interaction.options.getNumber('amount')
            const usersString = interaction.options.getString('usernames')

            const tag = interaction.user.tag

            let resultString = ""
            const usersArray = usersString.split(" ")
            for (let i = 0; i < usersArray.length; i++) {
                const userid = await noblox.getIdFromUsername(usersArray[i])
                if (pointType === "royalty") {
                    var groupid = GetGroup("RAOK").groupid
                    var rank = await noblox.getRankInGroup(groupid, userid)
                } else if (pointType === "ranger royalty") {
                    var groupid = GetGroup("Rangers").groupid
                    var rank = await noblox.getRankInGroup(groupid, userid)
                } else {
                    throw new Error("Point type not found!")
                }

                const AuthorId = await GetUserData(database, interaction.member.id)
                if (CheckOfficer(AuthorId.roblox_id, groupid) === 0) {
                    throw new Error("You must be Officer+ to edit points for this point type!")
                }

                // In Main Group Check
                if (rank === 0) {
                    resultString += `${usersArray[i]}: ⛔ **NOT IN GROUP**\n`
                } else {
                    const oldPoints = await GetPoints(database, userid, pointType)
                    if (operation === "add") {
                        try { // Add
                            await AddPoints(database, userid, pointType, amount)
                            PointsWebhook(pointType, "Points Changed", `**${tag}** changed **${await noblox.getUsernameFromId(userid)}**'s ${pointType} from **${oldPoints}** to **${oldPoints + amount}**`)
                            resultString += `${usersArray[i]}: ✅ ${oldPoints} >>> ${oldPoints + amount}\n`
                        } catch (err) {
                            resultString += `${usersArray[i]}: ⛔ **${err.message}**\n`
                        }
                    } else {
                        try { // Subtract
                            await SubtractPoints(database, userid, pointType, amount)
                            if (oldPoints - amount < 0) { oldPoints = 0; amount = 0 }
                            PointsWebhook(pointType, "Points Changed", `**${tag}** changed **${await noblox.getUsernameFromId(userid)}**'s ${pointType} from **${oldPoints}** to **${oldPoints - amount}**`)
                            resultString += `${usersArray[i]}: ✅ ${oldPoints} >>> ${oldPoints - amount}\n`
                        } catch (err) {
                            resultString += `${usersArray[i]}: ⛔ **${err.message}**\n`
                        }
                    }
                }
            }

            // Main embed
            const bulkEmbed = new EmbedBuilder()
                .setFooter({ text: 'Royal Army of Knights Integration' })
                .setTitle('Bulk Results')
                .setColor([103, 0, 0]) // Red
                .setTimestamp()
                .addFields([{ name: "Results", value: resultString }])
            await interaction.reply({ embeds: [bulkEmbed] });
        } catch (err) {
            await interaction.reply({ content: err.message, ephemeral: true })
        }
    },
};