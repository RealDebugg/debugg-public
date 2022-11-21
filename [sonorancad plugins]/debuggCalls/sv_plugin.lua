CreateThread(function() Config.LoadPlugin("debuggCalls", function(pluginConfig)
    if pluginConfig.enabled then
        function GetSourceByApiId(apiIds)
            if apiIds == nil then return nil end
            for x=1, #apiIds do
                for i=0, GetNumPlayerIndices()-1 do
                    local player = GetPlayerFromIndex(i)
                    if player then
                        local identifiers = GetIdentifiers(player)
                        for type, id in pairs(identifiers) do
                            if id == apiIds[x] then
                                return player
                            end
                        end
                    end
                end
            end
            return nil
        end 

        RegisterServerEvent("SonoranCAD::pushevents:DispatchEvent")
        AddEventHandler("SonoranCAD::pushevents:DispatchEvent", function(data)
            local dispatchType = data.dispatch_type
            local dispatchData = data.dispatch
            local metaData = data.dispatch.metaData
            if dispatchType ~= tostring(dispatchType) then
                -- hmm, expected a string, got a number
                dispatchType = DISPATCH_TYPE[data.dispatch_type+1]
            end
            local switch = {
                ["CALL_NEW"] = function()
                    debugLog("CALL_NEW fired "..json.encode(dispatchData))
                    local emergencyId = dispatchData.metaData.createdFromId
                    for k, id in pairs(dispatchData.idents) do
                        local unit = GetUnitCache()[GetUnitById(id)]
                        if not unit then
                            debugLog("Not sending attach, unit not online")
                        else
                            local officerId = GetSourceByApiId(unit.data.apiIds)
                            TriggerEvent("SonoranCAD::pushevents:UnitAttach", data, unit)
                        end
                    end
                end
            }
            if switch[dispatchType] then
                switch[dispatchType]()
            end
        end)
        RegisterServerEvent("SonoranCAD::pushevents:UnitAttach")
        AddEventHandler("SonoranCAD::pushevents:UnitAttach", function(call, unit)
            local officerId = GetSourceByApiId(unit.data.apiIds)
            if officerId ~= nil then
                if call.dispatch.postal ~= nil and call.dispatch.postal ~= "" then
                    TriggerClientEvent("SonoranCAD::dispatchnotify:SetGps", officerId, call.dispatch.postal)
                end
            end
        end)

        AddEventHandler("SonoranCAD::pushevents:UnitDetach", function(call, unit)
            local officerId = GetSourceByApiId(unit.data.apiIds)
            if GetCallCache()[call.dispatch.callId] == nil then
                debugLog("Ignore unit detach, call doesn't exist")
                return
            end
            if officerId ~= nil and call ~= nil and call.dispatch.metaData ~= nil then
                TriggerClientEvent("SonoranCAD::dispatchnotify:SetGps", officerId, nil)
            end
        end)
    end
end) end)