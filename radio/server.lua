RegisterServerEvent('all:UPDstatus')
AddEventHandler('all:UPDstatus', function(ch)
  TriggerClientEvent("UPDstatus", -1, ch)
end)

RegisterServerEvent('sendPing')
AddEventHandler('sendPing', function(gId)
  TriggerClientEvent("receivePing", gId)
end)

RegisterServerEvent('sendPanic')
AddEventHandler('sendPanic', function(postal, ch)
  TriggerClientEvent("receivePanic", -1, postal, ch)
end)

RegisterServerEvent('sendKill')
AddEventHandler('sendKill', function(id, stat)
  TriggerClientEvent("receiveKill", id, stat)
end)

RegisterServerEvent('query')
AddEventHandler('query', function(id, stat, ch)
  TriggerClientEvent("receiveQuery", -1, id, stat, ch)
end)