local isAllowed = false
CreateThread(function()
    while true do
        Wait(0)
        if IsPedUsingActionMode(GetPlayerPed()) and not isAllowed then
            SetPedUsingActionMode(GetPlayerPed(), 0, -1, 0)
        elseif IsControlJustPressed(0, 20) then
            isAllowed = not isAllowed
            if isAllowed and not IsPedUsingActionMode(GetPlayerPed()) then
                SetPedUsingActionMode(GetPlayerPed(), 1, -1, 0)
            end
        end
    end
end)