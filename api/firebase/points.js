const { GetPlayerData, SetPlayerData } = require('./player.js')
const { GetGroup } = require('../ranks.js')
const { PromotionWebhook } = require('../webhooks.js')


const noblox = require('noblox.js')
const { RobloxCookie } = require('../../config.json')

const AutoPromotion = async function (pointType, points, roblox_id) {
    if (pointType === "royalty") {
        const RAOK = GetGroup("RAOK")

        var MainGroupId = RAOK.groupid
        var Group_Ranks = RAOK.groupranks
    } else if (pointType === "ranger royalty") {
        const RAOK = GetGroup("Rangers")

        var MainGroupId = RAOK.groupid
        var Group_Ranks = RAOK.groupranks
    }

    const userGroups = await noblox.getGroups(roblox_id)
    const mainGroup = await noblox.getGroup(MainGroupId)
    const mainGroupData = userGroups.find(playerGroup => playerGroup.Id == mainGroup.id)

    if (Group_Ranks[Group_Ranks[mainGroupData.Rank].next].points === "🔒") return
    if (Group_Ranks[mainGroupData.Rank].points <= points && Group_Ranks[Group_Ranks[mainGroupData.Rank].next].points > points) return

    const roles = await noblox.getRoles(MainGroupId)
    for (let i = 1; i < roles.length; i++) {
        const role = roles[i];
        if (Group_Ranks[role.rank].points <= points && Group_Ranks[Group_Ranks[role.rank].next].points > points || Group_Ranks[Group_Ranks[role.rank].next].points === "🔒") {
            await noblox.setCookie(RobloxCookie)
            await noblox.setRank(MainGroupId, roblox_id, role.rank)
            PromotionWebhook(`**${mainGroupData.Name}:** Changed **${await noblox.getUsernameFromId(roblox_id)}**'s rank from **${mainGroupData.Role}** to **${role.name}**`)
            break;
        }
    }
}

const GetPoints = async function (database, roblox_id, pointType) {
    if (roblox_id) {
        const PlayerData = await GetPlayerData(database, roblox_id)
        if (PlayerData) {
            return PlayerData[pointType] || 0
        } else {
            return 0
        }
    } else {
        throw new Error("Roblox ID could not be identified")
    }
}

const SetPoints = async function (database, roblox_id, pointType, newPoints) {
    if (typeof newPoints !== 'number') throw new Error("Points given is not a number!")
    if (roblox_id) {
        if (pointType === "royalty") {
            var MainGroupId = GetGroup("RAOK").groupid
        } else if (pointType === "ranger royalty") {
            var MainGroupId = GetGroup("Rangers").groupid
        }

        const rank = await noblox.getRankInGroup(MainGroupId, roblox_id)
        if (rank == 0) throw new Error("Player not in group!")

        let PlayerData = await GetPlayerData(database, roblox_id)
        if (PlayerData) {
            PlayerData[pointType] = newPoints
            SetPlayerData(database, roblox_id, PlayerData)
            AutoPromotion(pointType, newPoints, roblox_id)
        } else {
            let newData = {}
            newData[pointType] = newPoints
            SetPlayerData(database, roblox_id, newData)
            AutoPromotion(pointType, newData[pointType], roblox_id)
        }
    } else {
        throw new Error("Roblox ID could not be identified")
    }
}

const AddPoints = async function (database, roblox_id, pointType, newPoints) {
    if (typeof newPoints !== 'number') throw new Error("Points given is not a number!")
    if (roblox_id) {
        if (pointType === "royalty") {
            var MainGroupId = GetGroup("RAOK").groupid
        } else if (pointType === "ranger royalty") {
            var MainGroupId = GetGroup("Rangers").groupid
        }
        const rank = await noblox.getRankInGroup(MainGroupId, roblox_id)
        if (rank == 0) throw new Error("Player not in group!")

        let points = await GetPoints(database, roblox_id, pointType)
        points += newPoints

        let PlayerData = await GetPlayerData(database, roblox_id)
        PlayerData[pointType] = points

        SetPlayerData(database, roblox_id, PlayerData)
        AutoPromotion(pointType, points, roblox_id)
    } else {
        throw new Error("Roblox ID could not be identified")
    }
}

const SubtractPoints = async function (database, roblox_id, pointType, newPoints) {
    if (typeof newPoints !== 'number') throw new Error("Points given is not a number!")
    if (roblox_id) {
        if (pointType === "royalty") {
            var MainGroupId = GetGroup("RAOK").groupid
        } else if (pointType === "ranger royalty") {
            var MainGroupId = GetGroup("Rangers").groupid
        }

        const rank = await noblox.getRankInGroup(MainGroupId, roblox_id)
        if (rank == 0) throw new Error("Player not in group!")

        let points = await GetPoints(database, roblox_id, pointType)
        points -= newPoints
        
        let PlayerData = await GetPlayerData(database, roblox_id)
        PlayerData[pointType] = points

        SetPlayerData(database, roblox_id, PlayerData)
        AutoPromotion(pointType, points, roblox_id)
    } else {
        throw new Error("Roblox ID could not be identified")
    }
}

module.exports = {
    GetPoints, SetPoints, AddPoints, SubtractPoints
}