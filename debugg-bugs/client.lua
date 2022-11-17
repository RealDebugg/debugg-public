function closeGui()
  SetNuiFocus(false, false)
end

function openGui()
  SetNuiFocus(true, true)
  SendNUIMessage({open = true, playerName = GetPlayerName(PlayerId())})
end

RegisterCommand("bug", function(source, args, raw)
  openGui()
end)

RegisterNUICallback('close', function(data, cb)
  closeGui()
end)

RegisterNUICallback('submit', function(data, cb)
  local coords = GetEntityCoords(PlayerPedId())
  local cc = "X: ".. coords.x .. ", Y: ".. coords.y .. ", Z: ".. coords.z
  TriggerServerEvent("PublishDiscord", 16711680, data.titleTxt, data.descTxt, cc, data.footer)
end)