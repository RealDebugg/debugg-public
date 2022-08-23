Wait = (ms) => new Promise(resolve =>  setTimeout(resolve, ms));

function IsInsideInterior() {
    if (GetInteriorFromEntity(PlayerPedId()) !== 0) {
        return true;
    }
    return false;
}

async function CheckForProfanity(string) {
    let [retval, token] = ScProfanityCheckUgcString(string);
    while ScProfanityGetCheckIsPending(token) {
        await Wait(0);
    }
    return ScProfanityGetStringPassed(token);
}

var math = { //custom math functions
    random: function(min, max) {
        if (max == null || max == undefined) {
            return Math.floor(Math.random() * min);
        } else {
            return Math.floor(Math.random() * (max - min) + min);
        }
    },
    distance: function(cc1, cc2, ignoreZ = false) {
        if (!ignoreZ) {
            return Math.hypot(cc1[0] - cc2[0], cc1[1] - cc2[1], cc1[2] - cc2[2])
        } else {
            Math.hypot(cc1[0] - cc2[0], cc1[1] - cc2[1])
        }
    },
    Vector3: function(x, y, z) {
        return [x, y, z]
    },
    DateToMinutesAgo: function(date) {
        return time = ((Date.now() - date) / 60000);
    },
    MinutesLeft: function(time, mins) {
        let timeTot = mins - time;
        if (timeTot > 0) {
            timeTot = Math.ceil(timeTot);
        } else {
            timeTot = 0;
        }
        return timeTot
    }
}