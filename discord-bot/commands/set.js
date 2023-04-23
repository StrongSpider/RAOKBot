const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { GetPoints, SetPoints } = require('../../api/firebase/points.js')
const { GetUserData } = require('../../api/firebase/user.js')
const { CheckOfficer } = require('../../api/checkofficer.js')
const { GetGroup } = require('../../api/ranks.js')

const { PointsWebhook } = require('../../api/webhooks.js')

const noblox = require('noblox.js');

let database
const SetDatabase = function (db) { database = db }

module.exports = {
    SetDatabase,
    data: new SlashCommandBuilder()
        .setName('set')
        .setDescription('Sets points to player.')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Targeted point type')
                .setChoices({ name: "royalty", value: "royalty" }, { name: "ranger royalty", value: "ranger royalty" })
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('New point amount')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Target player username.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        try {
            const pointType = interaction.options.getString('type')
            const amount = interaction.options.getNumber('amount')
            const username = interaction.options.getString('username')

            const tag = interaction.user.tag

            const userid = await noblox.getIdFromUsername(username)
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
            if (CheckOfficer(AuthorId.roblox_id, groupid) < 2) {
                throw new Error("You must be HiCOM+ to edit points for this point type!")
            }
            
            // In Group Check
            if (rank === 0) throw new Error("Player not in group!")

            const oldPoints = await GetPoints(database, userid, pointType)

            await SetPoints(database, userid, pointType, amount)
            PointsWebhook(pointType, "Points Changed", `**${tag}** changed **${username}**'s ${pointType} from **${oldPoints}** to **${amount}**`)

            // Main embed
            const subtractEmbed = new EmbedBuilder()
                .setFooter({ text: 'Royal Army of Knights Integration' })
                .setTitle('Set ' + pointType)
                .setColor([103, 0, 0]) // Red
                .setTimestamp()
                .addFields([{ name: "Success ✅", value: `**Username:** ${username}\n**Point Change:** ${oldPoints} >>> ${amount}` }])
            await interaction.reply({ embeds: [subtractEmbed] });
        } catch (err) {
            await interaction.reply({ content: err.message, ephemeral: true })
        }
    },
};