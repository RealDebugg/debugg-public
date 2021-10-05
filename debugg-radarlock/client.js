let MinimapLocked = false;

onNet("RadarZoom:SetMinimapLock", () => {
    MinimapLocked = !MinimapLocked;
});

setTick(async () => {
    switch(MinimapLocked) {
        case true:
            LockMinimapAngle(360);
            break;
        case false:
            UnlockMinimapAngle();
            break;
    } 

    if (IsControlPressed(1,21) && IsControlPressed(1,168)) {
        emitNet("RadarZoom:SetMinimapLock");
    }
});