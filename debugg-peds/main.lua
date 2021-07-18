function createJobPed(coords, pedType, task, data)
    if coords == nil then return end
    if pedType == nil then return end

    RequestModel(pedType)
    while not HasModelLoaded(pedType) do
        Wait(0)
    end

    for i=1, #coords, 1 do
        print(coords[i].x)
        local newPed = CreatePed(26, pedType, coords[i].x, coords[i].y, coords[i].z, coords[i].h, 0, 1)
        SetEntityInvincible(newPed, data.inv)
        SetBlockingOfNonTemporaryEvents(newPed, data.events)
        SetPedCanRagdoll(newPed, data.rag)
        FreezeEntityPosition(newPed, data.frozen)
        if task ~= nil then
            TaskStartScenarioInPlace(newPed, task, 0, 0)
        end
    end
end