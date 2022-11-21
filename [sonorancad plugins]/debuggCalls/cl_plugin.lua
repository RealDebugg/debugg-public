CreateThread(function() 
    Config.LoadPlugin("debuggCalls", function(pluginConfig)

        if pluginConfig.enabled then
            local availableCall = false
            local postalSV = nil
            RegisterNetEvent("SonoranCAD::dispatchnotify:SetGps")
            AddEventHandler("SonoranCAD::dispatchnotify:SetGps", function(postal)
                if postal ~= nil then
                    availableCall = true
                    postalSV = postal
                    NewCallTrigg()
                else
                    availableCall = false
                end
            end)

            function NewCallTrigg()
                Notify("New call assigned. Type ~y~/gps accept")
            end

            RegisterCommand("gps", function(s, a)
                if a ~= nil and availableCall == true then
                    if a[1] == "accept" then
                        ExecuteCommand("postal "..tostring(postalSV))
                    end
                end
            end)

            function Notify(notificationMsg) 
                SetNotificationTextEntry("STRING")
                AddTextComponentString(notificationMsg)
                DrawNotification(false, false)
            end
        end
    end) 
end)