const { getRankInGroup } = require("noblox.js")

const HighRanks = {
    6391619: {
        officer: 12,
        hicom: 15
    },
    6948111: {
        officer: 9,
        hicom: 12
    }
}

const CheckOfficer = async function(userid, groupid) {
    const rank = await getRankInGroup(groupid, userid)
    if (rank >= HighRanks[groupid].officer) {
        if (rank >= HighRanks[groupid].hicom) {
            return 2
        } else {
            return 1
        }
    } else {
        return 0
    }
}

module.exports = {
    CheckOfficer
}