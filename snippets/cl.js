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