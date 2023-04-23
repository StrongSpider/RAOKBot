const { EventEmitter } = require('events')

const { SetUserData } = require('./firebase/user.js')

const AuthenticationEvent = new EventEmitter()
const ActiveAuthentications = new Map()

const StartAuthentication = async function (database, discord_id, roblox_id) {
    if (ActiveAuthentications.get(roblox_id)) throw new Error("Authentication already started!");
    const activationString = (Math.random(69420)).toString(36);

    let AutenticationObject = {
        Authenticationdiscord_id: discord_id,
        Authenticationroblox_id: roblox_id,
        AuthenticationString: activationString,
    }

    AuthenticationEvent.once('UserAuthenticated-' + roblox_id, () => {
        AuthenticationEvent.removeAllListeners('UserAuthenticated-' + roblox_id)
        ActiveAuthentications.delete(roblox_id);
        SetUserData(database, discord_id, {
            "roblox_id": roblox_id,
        })
    })

    setTimeout(() => {
        if(!ActiveAuthentications.get(roblox_id)) return

        ActiveAuthentications.delete(roblox_id);
        AuthenticationEvent.emit('EventEnded-' + roblox_id)
        AuthenticationEvent.removeAllListeners('UserAuthenticated-' + roblox_id)
    }, 120000)

    ActiveAuthentications.set(roblox_id, AutenticationObject)
    return {AuthenticationString: activationString, AuthenticationEvent: AuthenticationEvent}
}

const ConfirmAuthenication = async function (database, roblox_id, activationString) {
    const AuthenticationObject = ActiveAuthentications.get(roblox_id)
    if (AuthenticationObject) {
        if (AuthenticationObject.AuthenticationString == activationString) {
            AuthenticationEvent.emit("UserAuthenticated-" + roblox_id)
        } else {
            throw new Error("Authentication String did not match!");
        }
    } else {
       throw new Error("Authentication not found!");
    }
}

module.exports = {
    StartAuthentication,
    ConfirmAuthenication
}