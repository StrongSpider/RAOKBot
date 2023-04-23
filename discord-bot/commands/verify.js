const noblox = require('noblox.js');

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { StartAuthentication } = require('../../api/authenticate.js')

let database
const SetDatabase = function (db) { database = db }

module.exports = {
    SetDatabase,
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Links discord account to RAOK Servers.')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Your roblox username.')
                .setRequired(true)),
    async execute(interaction) {
        try {
            if (interaction.options._hoistedOptions.length <= 0) {
                interaction.reply({ content: "No user selected to be verified!", ephemeral: true })
                return;
            }

            const username = interaction.options.getString('username')
            const userid = await noblox.getIdFromUsername(username)

            const {AuthenticationString, AuthenticationEvent} = await StartAuthentication(database, interaction.user.id, userid)

            AuthenticationEvent.once('UserAuthenticated-' + userid, async () => {
                const confirmEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Royal Army of Knights Integration' })
                    .setTitle('Account Verified!')
                    .setColor([103, 0, 0]) // Red
                    .setTimestamp()
                    .addFields([
                        { name: "Username", value: `[${username}](https://www.roblox.com/users/${userid}/profile)`, inline: true },
                        { name: "User ID", value: `${userid}`, inline: true },
                    ])
                    
                interaction.member.roles.add('795689026496495637')
                const channel = await interaction.user.createDM()
                channel.send({ embeds: [confirmEmbed], ephemeral: true });
            })

            AuthenticationEvent.once('EventEnded-' + userid, async () => {
                interaction.followUp({content: "Verify timeout! Please try again.", ephemeral: true})
            })


            const verifyEmbed = new EmbedBuilder()
                .setFooter({ text: 'Royal Army of Knights Integration' })
                .setTitle('Verify Account')
                .setColor([103, 0, 0]) // Red
                .setTimestamp()
                .addFields([
                    { name: "Username", value: `[${username}](https://www.roblox.com/users/${userid}/profile)`, inline: true },
                    { name: "User ID", value: `${userid}`, inline: true },
                    { name: "Verification String", value: `\`${AuthenticationString}\`\n\n Join this [roblox game](https://www.roblox.com/games/12806189193/) and enter the verification string to verify your account!` },
                ])

            await interaction.reply({ embeds: [verifyEmbed], ephemeral: true });
        } catch (err) {
            console.log(err)
            await interaction.reply({ content: err.message, ephemeral: true })
        }
    }
};