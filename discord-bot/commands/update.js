const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GetUserData } = require('../../api/firebase/user.js')

const { GetAllGroups } = require('../../api/ranks.js')
const { CheckOfficer } = require('../../api/checkofficer.js')

const noblox = require('noblox.js');

let database
const SetDatabase = function (db) { database = db }

module.exports = {
    SetDatabase,
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Update discord roles in discord.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Target user (OFFICER+)')),
    async execute(interaction) {
        try {
            var [userid, authorid, target] = []
            if (interaction.options._hoistedOptions.length > 0) {
                const input = interaction.options.getMember('target')
                const userData = await GetUserData(database, input.id)
                if (userData) userid = userData.roblox_id
                target = input

                const authorData = await GetUserData(database, interaction.member.id)
                if (authorData) authorid = authorData.roblox_id
            } else {
                const userData = await GetUserData(database, interaction.member.id)
                if (userData) userid = userData.roblox_id
                target = interaction.member
            }

            const allGroups = GetAllGroups()
            for (let index = 0; index < allGroups.length; index++) {
                const group = allGroups[index];
                if (group.guildid === interaction.guild.id) {
                    var MainGroupId = group.groupid
                    var Group_Ranks = group.groupranks
                    var DiscordRoles = group.discordroles
                }
            }

            if (typeof authorid !== 'undefined') {
                if (await CheckOfficer(authorid, MainGroupId) === 0) {
                    await interaction.reply({ content: "You do not have the permissions to update another user!", ephemeral: true })
                    return;
                }
            }

            if (!target.bannable) {
                await interaction.reply({ content: "Selected target can not be updated due to being higher on the member hierarchy!", ephemeral: true })
                return;
            }

            // Gets roblox user information from noblox
            const userGroups = await noblox.getGroups(userid)
            const userData = await noblox.getPlayerInfo(userid)

            // Gets player group information from noblox and roblox web api
            const mainGroupData = userGroups.find(playerGroup => playerGroup.Id == MainGroupId)

            let currentRank = 0
            if (typeof mainGroupData !== 'undefined') currentRank = mainGroupData.Rank

            let newNickname = false
            const NicknameString = Group_Ranks[currentRank].prefix + userData.username
            if (target.displayName !== NicknameString) {
                target.setNickname(NicknameString)
                newNickname = true
            }

            let RolesAdded = []
            for (let i = 0; i < Group_Ranks[currentRank].discordRoles.length; i++) {
                const role = target.roles.cache.find(role => role.id === Group_Ranks[currentRank].discordRoles[i]);
                if (typeof role === 'undefined') {
                    target.roles.add(Group_Ranks[currentRank].discordRoles[i])
                    RolesAdded.push(Group_Ranks[currentRank].discordRoles[i])
                }
            }

            let RolesRemoved = []
            for (let i = 0; i < DiscordRoles.length; i++) {
                if (!Group_Ranks[currentRank].discordRoles.includes(DiscordRoles[i])) {
                    const role = target.roles.cache.find(role => role.id === DiscordRoles[i]);
                    if (typeof role !== 'undefined') {
                        target.roles.remove(DiscordRoles[i])
                        RolesRemoved.push(DiscordRoles[i])
                    }
                }
            }

            const RoleString = function (roleArray) {
                let string = ""
                for (let i = 0; i < roleArray.length; i++) {
                    const roleid = roleArray[i];
                    string += ` - <@&${roleid}>\n`
                }

                if (string.length === 0) string = "No updates"
                return string
            }

            // Main Embed
            const updateEmbed = new EmbedBuilder()
                .setFooter({ text: 'Royal Army of Knights Integration' })
                .setColor([103, 0, 0]) // Red
                .setTimestamp()

            if (RolesAdded.length === 0 && RolesRemoved.length === 0 && !newNickname) {
                updateEmbed.setTitle("No updates found!")
                updateEmbed.addFields([
                    { name: "Username", value: `[${userData.username}](https://www.roblox.com/users/${userid}/profile)`, inline: true },
                    { name: "User ID", value: `${userid}`, inline: true },
                    { name: "Updates", value: `None` },
                ])
            } else {
                updateEmbed.setTitle("User Updated!")
                updateEmbed.addFields([
                    { name: "Username", value: `[${userData.username}](https://www.roblox.com/users/${userid}/profile)`, inline: true },
                    { name: "User ID", value: `${userid}`, inline: true },
                    { name: "Display Name", value: NicknameString },
                    { name: "Added", value: RoleString(RolesAdded), inline: true },
                    { name: "Removed", value: RoleString(RolesRemoved), inline: true },
                ])
            }

            await interaction.reply({ embeds: [updateEmbed] });
        } catch (err) {
            await interaction.reply({ content: err.message, ephemeral: true })
        }
    },
};