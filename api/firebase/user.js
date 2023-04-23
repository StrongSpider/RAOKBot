const lodash = require('lodash');

const UserCache = new Map()
const DiscordIdCache = new Map()

const SetUserData = async function (database, userid, newdata) {
  //if (lodash.isEqual(newdata, UserCache.get(userid))) return;
  
  const UserCollection = database.collection('discord-users').doc(userid)
  await UserCollection.set(newdata)

  //UserCache.set(userid, newdata)

  //if (DiscordIdCache.get(newdata.roblox_id.toString()) == userid) return;

  const IdCollection = database.collection('discord-ids').doc(newdata.roblox_id.toString())
  await IdCollection.set({discord_id: userid})

  //DiscordIdCache.set(newdata.roblox_id.toString(), userid)
}

const GetUserData = async function (database, userid) {
  //if (typeof UserCache.get(userid) === 'undefined') {
    const UserDocument = await database.collection('discord-users').doc(userid).get();
    if (UserDocument.exists) {
  //    UserCache.set(userid, UserDocument.data())
      return UserDocument.data()
    } else {
      throw new Error("Failed to find user in RAOK systems!")
    }
  //} else {
  //  return UserCache.get(userid)
  //}
}

const GetDiscordFromRobloxId = async function (database, roblox_id) {
  //if (typeof DiscordIdCache.get(roblox_id.toString()) === 'undefined') {
    const IdDocument = await database.collection('discord-ids').doc(userid).get();
    if (IdDocument.exists) {
  //    DiscordIdCache.set(userid, IdDocument.data())
      return IdDocument.data().discord_id
    } else {
      throw new Error("Failed to find user in RAOK systems!")
    }
  //} else {
  //  return DiscordIdCache.get(roblox_id.toString())
  //}
}

module.exports = {
    GetUserData, SetUserData, GetDiscordFromRobloxId
}