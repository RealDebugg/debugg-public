CreateThread(function()
    while true do
        Wait(0)
        if IsPedInAnyPoliceVehicle(GetPlayerPed()) then
            if IsControlPressed(0, 75) then
                Wait(150)
                if IsControlPressed(0, 75) then
                    Wait(150)
                    TaskLeaveVehicle(GetPlayerPed(), GetVehiclePedIsIn(GetPlayerPed(), false), 256)
                end
            end
        end
    end
end)