const lodash = require('lodash');

const PlayerCache = new Map()

const SetPlayerData = async function (database, userid, newdata) {
 // if (lodash.isEqual(newdata, PlayerCache.get(userid.toString()))) return;
  
  const PlayerCollection = database.collection('player-data').doc(userid.toString())
  await PlayerCollection.set(newdata)

 // PlayerCache.set(userid.toString(), newdata)
}

const GetPlayerData = async function (database, userid) {
  //if (typeof PlayerCache.get(userid.toString()) === 'undefined') {
    const PlayerDocument = await database.collection('player-data').doc(userid.toString()).get();
    if (PlayerDocument.exists) {
      //PlayerCache.set(userid.toString(), PlayerDocument.data())
      return PlayerDocument.data()
    } else {
      return false
    }
  //} else {
  //  return PlayerCache.get(userid.toString())
  //}
}

module.exports = {
    GetPlayerData, SetPlayerData
}