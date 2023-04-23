const { WebhookClient, EmbedBuilder } = require('discord.js')

const RAOKPointsWebhookClient = new WebhookClient({ url: 'https://canary.discord.com/api/webhooks/1089266844638130238/qnlOjisN3bSlj59m_fhcC-qYm5096QeAD4aZ10wlq_FyWkUjzirRGs4Exo0t7PCpfyAT' });
const RangersPointsWebhookClient = new WebhookClient({ url: 'https://canary.discord.com/api/webhooks/1096934647457382492/qDqMWdqBpMtP15dvgmCNCaB9ISKjvWUFkUSs5czf272rvt61LGunkygEQWnLUYi1xNfJ' });
const PromotionWebhookClient = new WebhookClient({ url: 'https://canary.discord.com/api/webhooks/1089264583090393264/IVUiJlVNJpJNQfDy_wbjo-z6GiMxhS7dtHDj9awW6OKWDUL1CPomV4AqKYyEcol2fUBq' });

const PointsWebhook = function (type, title, data) {
    const embed = new EmbedBuilder()
    .setFooter({ text: 'Royal Army of Knights Integration' })
    .setColor([103, 0, 0]) // Red
    .setDescription(data)
	.setTitle(title)
    .setTimestamp()

    if (type === "royalty") {
        RAOKPointsWebhookClient.send({ embeds: [embed] })
    } else if (type === "ranger royalty") {
        RangersPointsWebhookClient.send({ embeds: [embed] })
    }
}

const PromotionWebhook = function (data) {
    PromotionWebhookClient.send({ content: data })
}

module.exports = {
    PointsWebhook,
    PromotionWebhook
}