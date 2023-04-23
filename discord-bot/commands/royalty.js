const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GetUserData } = require('../../api/firebase/user.js')
const { GetPoints } = require('../../api/firebase/points.js')
const { GetAllGroups } = require('../../api/ranks.js')
const { GetGroup } = require('../../api/ranks.js')

const noblox = require('noblox.js');

let database
const SetDatabase = function (db) { database = db }

module.exports = {
    SetDatabase,
    data: new SlashCommandBuilder()
        .setName('royalty')
        .setDescription('Gets player royalty.')
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

            // Gets roblox user information from noblox
            const userGroups = await noblox.getGroups(userid)
            const userData = await noblox.getPlayerInfo(userid)
            const thumbnailURL = await noblox.getPlayerThumbnail(userid, 420)

            const allGroups = GetAllGroups()
            for (let index = 0; index < allGroups.length; index++) {
                const group = allGroups[index];
                if (group.guildid === interaction.guild.id) {
                    var MainGroupId = group.groupid
                    var Group_Ranks = group.groupranks
                    var StyledType = group.pointtype
                    var emoji = group.emoji
                }
            }

            // Gets player group information from noblox and roblox web api
            const mainGroupData = userGroups.find(playerGroup => playerGroup.Id == MainGroupId)
            const PlayerRoyalty = await GetPoints(database, userid, StyledType.toLowerCase())

            
            let [currentRole, currentRank] = ["Guest", 0]
            if (typeof mainGroupData !== 'undefined') {
                currentRole = mainGroupData.Role
                currentRank = mainGroupData.Rank
            }
            
            const promotionBar = function () {
                let string = emoji.repeat(18)
                let persentage = 100

                const nextPoints = Group_Ranks[Group_Ranks[currentRank].next].points
                if (nextPoints !== "🔒") {
                    let devisor = (nextPoints - Group_Ranks[currentRank].points)
                    if (devisor === 0) devisor = 1

                    persentage = Math.floor(((PlayerRoyalty - Group_Ranks[currentRank].points) / devisor) * 100)
                    string = string.slice(0, -(18 - Math.floor(18 * (persentage / 100))) * 2)
                    for (let i = 0; i < (18 - Math.floor(18 * (persentage / 100))); i++) {
                        string += "◾"
                    }
                }

                return `**[${string}] ${persentage}%**`
            }

            // Main embed
            const royaltyEmbed = new EmbedBuilder()
                .setFooter({ text: 'Royal Army of Knights Integration' })
                .setThumbnail(thumbnailURL[0].imageUrl) // roblox sends thumbnail in an array because for some reason it thinks that you will be mass requesting thumbnails
                .setTitle(`${userData.username}'s ${StyledType} ${emoji}`)
                .setColor([103, 0, 0]) // Red
                .setTimestamp()
                .addFields([
                    { name: "Username", value: `[${userData.username}](https://www.roblox.com/users/${userid}/profile)`, inline: true },
                    { name: "User ID", value: `${userid}`, inline: true },
                    { name: "Royalty", value: `${PlayerRoyalty}`, inline: true },
                    { name: "Group Rank", value: `${currentRole} (${Group_Ranks[currentRank].points})`, inline: true },
                    { name: "Promotion", value: `${promotionBar()}\nCurrent Rank: **${currentRole}** (${Group_Ranks[currentRank].points})\nNext Rank: **${Group_Ranks[Group_Ranks[currentRank].next].role}** (${Group_Ranks[Group_Ranks[currentRank].next].points})`, inline: false },
                ])

            await interaction.reply({ embeds: [royaltyEmbed] });
        } catch (err) {
            console.log(err)
            await interaction.reply({ content: err.message, ephemeral: true })
        }
    },
};