// Discord Roles
const RAOK_DiscordRoles = [
    '795689026496495637', // Verified Role 0
    '795661229808156694', // Novice Role 1
    '795661262829912064', // Page Role 2
    '798270528137068574', // Squire Role 3
    '795661182890541067', // Knight Role 4
    '795767826195415090', // Captain Role 5 
    '803664224316162088', // Baron Role 6
    '795766541403947069', // Viscount Role 7
    '798684265251733544', // Count Role 8
    '795663015927480410', // Lord Role 9
    '795662947740286987', // Officer Role 10
]

const Ranger_DiscordRoles = [
    '1085230590053331034', // Verified Role 0
    '1096881633514225756', // Serf Role 1
    '1085230635196620851', // Apprentice Role 2
    '1085230763227754528', // Junior Ranger Role 3
    '1085230941632479252', // Ranger Role 4
    '1093096120693030993', // Senior Ranger Role 5 
    '1093096205900329101', // High Ranger Role 6
    '1093096304340647946', // Royal Ranger Role 7
    '1093096421084909568', // Sub Lt Role 8
    '1093096460494585887', // Lt Role 9
    '1096770408436477992', // Bat Commander Role 10
    '1096770524299919470', // Shadow Role 11
    '1096769501594390550', // Low Rank Role 12
    '1096770290199052341', // Middle Rank Role 13
    '1085231149992923136', // Officer Role 14
]

// Ranks
const Ranger_Ranks = {
    0: {points: 0, role: "Guest", discordRoles: [Ranger_DiscordRoles[0]], prefix: "", next: 1},
    1: {points: 0, role: "| N | Serf", discordRoles: [Ranger_DiscordRoles[0], Ranger_DiscordRoles[1]], prefix: "[N] ", next: 2},
    2: {points: 15, role: "| L | Apprentice", discordRoles: [Ranger_DiscordRoles[0], Ranger_DiscordRoles[2], Ranger_DiscordRoles[12]], prefix: "[L] ", next: 3},
    3: {points: 40, role: "| L | Jr. Ranger", discordRoles: [Ranger_DiscordRoles[0], Ranger_DiscordRoles[3], Ranger_DiscordRoles[12]], prefix: "[L] ", next: 4},
    4: {points: 75, role: "| L | Ranger", discordRoles: [Ranger_DiscordRoles[0], Ranger_DiscordRoles[4], Ranger_DiscordRoles[12]], prefix: "[L] ", next: 5},
    5: {points: 120, role: "| L | Sr. Ranger", discordRoles: [Ranger_DiscordRoles[0], Ranger_DiscordRoles[5], Ranger_DiscordRoles[12]], prefix: "[L] ", next: 6},
    6: {points: 170, role: "| M | High Ranger", discordRoles: [Ranger_DiscordRoles[0], Ranger_DiscordRoles[6], Ranger_DiscordRoles[13]], prefix: "[M] ", next: 7},
    7: {points: 270, role: "| M | Royal Ranger", discordRoles: [Ranger_DiscordRoles[0], Ranger_DiscordRoles[7], Ranger_DiscordRoles[13]], prefix: "[M] ", next: 8},
    8: {points: 350, role: "| M | Sub Lieutenant", discordRoles: [Ranger_DiscordRoles[0], Ranger_DiscordRoles[8], Ranger_DiscordRoles[13]], prefix: "[M] ", next: 9},
    9: {points: "🔒", role: "| O | Lieutenant", discordRoles: [Ranger_DiscordRoles[0], Ranger_DiscordRoles[9], Ranger_DiscordRoles[14]], prefix: "[O] ", next: 10},
    10: {points: "🔒", role: "| O | Battalion Commander", discordRoles: [Ranger_DiscordRoles[0], Ranger_DiscordRoles[10], Ranger_DiscordRoles[14]], prefix: "[O] ", next: 11},
    11: {points: "🔒", role: "| O | Shadow", discordRoles: [Ranger_DiscordRoles[0], Ranger_DiscordRoles[11], Ranger_DiscordRoles[14]], prefix: "[O] ", next: 12},
    12: {points: "🔒", role: "| HC | Ranger Council", discordRoles: [], prefix: "[HC] ", next: 13},
    13: {points: "🔒", role: "| HC | Ranger High Council", discordRoles: [], prefix: "[HC] ", next: 14},
    14: {points: "🔒", role: "| X | Ranger Secretary", discordRoles: [], prefix: "[X]", next: 15},
    15: {points: "🔒", role: "| X | The Commandant", discordRoles: [], prefix: "[X]", next: 16},
    16: {points: "🔒", role: "Administration", discordRoles: [], prefix: "", next: 255},
    255: {points: "🔒", role: "King", discordRoles: [], prefix: "", next: 255},
}

const RAOK_Ranks = {
    0: {points: 0, role: "Guest", discordRoles: [RAOK_DiscordRoles[0]], prefix: "", next: 1},
    1: {points: 0, role: "| 1 | Novice", discordRoles: [RAOK_DiscordRoles[0], RAOK_DiscordRoles[1]], prefix: "[1] ", next: 2},
    2: {points: 2, role: "| 2 | Page", discordRoles: [RAOK_DiscordRoles[0], RAOK_DiscordRoles[2]], prefix: "[2] ", next: 3},
    3: {points: 10, role: "| 3 | Squire", discordRoles: [RAOK_DiscordRoles[0], RAOK_DiscordRoles[3]], prefix: "[3] ", next: 4},
    4: {points: 20, role: "| K | Knight", discordRoles: [RAOK_DiscordRoles[0], RAOK_DiscordRoles[4]], prefix: "[K] ", next: 5},
    5: {points: 35, role: "| K | Conscript", discordRoles: [RAOK_DiscordRoles[0], RAOK_DiscordRoles[4]], prefix: "[K] ", next: 6},
    6: {points: 60, role: "| K | Lance Corporal", discordRoles: [RAOK_DiscordRoles[0], RAOK_DiscordRoles[4]], prefix: "[K] ", next: 7},
    7: {points: 100, role: "| K | Corporal", discordRoles: [RAOK_DiscordRoles[0], RAOK_DiscordRoles[4]], prefix: "[K] ", next: 8},
    8: {points: 150, role: "| K | Sergeant", discordRoles: [RAOK_DiscordRoles[0], RAOK_DiscordRoles[4]], prefix: "[K] ", next: 9},
    9: {points: 205, role: "| K | Staff Sergeant", discordRoles: [RAOK_DiscordRoles[0], RAOK_DiscordRoles[4]], prefix: "[K] ", next: 10},
    10: {points: 350, role: "| C | Captain", discordRoles: [RAOK_DiscordRoles[0], RAOK_DiscordRoles[5]], prefix: "[C] ", next: 11},
    11: {points: "🔒", role: "| Sub | Baron", discordRoles: [RAOK_DiscordRoles[0], RAOK_DiscordRoles[10], RAOK_DiscordRoles[0], RAOK_DiscordRoles[6]], prefix: "[Sub] ", next: 12},
    12: {points: "🔒", role: "| O | Viscount", discordRoles: [RAOK_DiscordRoles[0], RAOK_DiscordRoles[10], RAOK_DiscordRoles[0], RAOK_DiscordRoles[7]], prefix: "[O] ", next: 13},
    13: {points: "🔒", role: "| O | Count", discordRoles: [RAOK_DiscordRoles[0], RAOK_DiscordRoles[10], RAOK_DiscordRoles[0], RAOK_DiscordRoles[8]], prefix: "[O] ", next: 14},
    14: {points: "🔒", role: "| O | Lord", discordRoles: [RAOK_DiscordRoles[0], RAOK_DiscordRoles[10], RAOK_DiscordRoles[0], RAOK_DiscordRoles[9]], prefix: "[O] ", next: 15},
    15: {points: "🔒", role: "| HC | Duke", discordRoles: [], prefix: "[HC] ", next: 16},
    16: {points: "🔒", role: "------------------------", discordRoles: [], prefix: "[Dev] ", next: 17},
    17: {points: "🔒", role: "| HC | Archduke", discordRoles: [], prefix: "[HC] ", next: 18},
    18: {points: "🔒", role: "Council", discordRoles: [], prefix: "", next: 255},
    255: {points: "🔒", role: "King", discordRoles: [], prefix: "", next: 255},
}

const groups = {
    RAOK: {
        emoji: '👑',
        groupid: 6391619,
        pointtype: "Royalty",
        groupranks: RAOK_Ranks,
        guildid: "795660559503982623",
        discordroles: RAOK_DiscordRoles,
    },
    Rangers: {
        emoji: '🏹',
        groupid: 6948111,
        groupranks: Ranger_Ranks,
        pointtype: "Ranger Royalty",
        guildid: "1082792501653553182",
        discordroles: Ranger_DiscordRoles,
    }
}

const GetGroup = function(name) {
    return groups[name]
}

const GetAllGroups = function() {
    return [ GetGroup("RAOK"), GetGroup("Rangers") ]
}

module.exports = {
    GetGroup,
    GetAllGroups
}