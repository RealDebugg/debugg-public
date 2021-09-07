local wut = false
local Currch = 1
local CHheld = false
local FirstCall = false
local COMon = false
local panic = false
local nolink = false
local speaking = false

RegisterCommand("r1", function(source, args, raw)
  TriggerEvent("updateSignal")
end)

RegisterCommand("r5", function(source, args, raw)
  TriggerEvent("sendKill", args[1])
end)

RegisterCommand("r6", function(source, args, raw)
  TriggerEvent("sendRevive", args[1])
end)


-- 3 Threads
--////////PTT HANDLERS////////
CreateThread(function()
  while true do
    Wait(0)
    SendNUIMessage({type = "location_update"})
    if not nolink then
      if speaking then
        DisableControlAction(0, 137, true)
        if IsDisabledControlJustPressed(0, 137) then
          SendNUIMessage({sound = "query", volume = 0.3})
        end
      else
        EnableControlAction(0, 137, true)
        if IsControlJustPressed(0, 137) then
          TriggerServerEvent("query", PlayerId(), true, Currch)
        elseif IsControlJustReleased(0, 137) then
          TriggerServerEvent("query", PlayerId(), false)
        end
      end
    end
  end
end)

RegisterNetEvent('receiveQuery')
AddEventHandler('receiveQuery', function(id, stat, ch)
  if id == PlayerId() then
    return
  else
    if Currch == ch then
      speaking = stat
    else
      speaking = false
    end
  end
end)

--////////STUN HANDLERS//////// Test
RegisterNetEvent('sendKill')
AddEventHandler('sendKill', function(id)
  TriggerServerEvent("sendKill", id, true)
end)

RegisterNetEvent('sendRevive')
AddEventHandler('sendRevive', function(id)
  TriggerServerEvent("sendKill", id, false)
end)

RegisterNetEvent('receiveKill')
AddEventHandler('receiveKill', function(status)
  if status then
    SendNUIMessage({type = "nolink", valid = true})
    nolink = true

    if COMon then
      Notify("~o~Your radio has been stunned. ~r~Please watch your RTO")
    end
  else
    SendNUIMessage({type = "nolink", valid = false})
    nolink = false

    if COMon then
      Notify("~o~Your radio has been revived.")
    end
  end
end)

CreateThread(function()
  while true do
    if nolink then
      DisableControlAction(0, 137, true)
      if IsDisabledControlJustPressed(0, 137) then
        SendNUIMessage({sound = "deny", volume = 0.3})
      end
    else
      EnableControlAction(0, 137, true)
    end
    Wait(0)
  end
end)

--////////PANIC HANDLERS////////
RegisterCommand("panic", function(source, args, raw)
  if args[1] == "clear" then
    SendNUIMessage({type = "ea_alert", valid = false})
    panic = false
  else
    if not nolink then
      TriggerEvent("sendPanic")
    end
  end
end)

RegisterNUICallback("panic", function(data, cb)
  TriggerEvent("sendPanic")
end)

RegisterNetEvent('sendPanic')
AddEventHandler('sendPanic', function()
  TriggerServerEvent("sendPanic", exports['postaldisplay']:nearestPostal(), Currch)
end)

RegisterNetEvent('receivePanic')
AddEventHandler('receivePanic', function(postal, ch)
  if Currch == ch and COMon then
    Notify("~r~Emergency Alert Received!!")
    SendNUIMessage({type = "ea_alert", valid = true, text = "@ " .. postal})
    panic = true
  end
end)

--////////PING HANDLERS////////
RegisterNetEvent('sendPing')
AddEventHandler('sendPing', function(gId)
  TriggerServerEvent("sendPing", gId)
end)

RegisterNetEvent('receivePing')
AddEventHandler('receivePing', function()
  if COMon then
    SendNUIMessage({ 
      type = "radio_ping"
    })
  end
end)
--////////SIGNAL 100 HANDLERS////////
RegisterNetEvent('updateSignal')
AddEventHandler('updateSignal', function()
  CHheld = not CHheld
  Wait(100)
  TriggerServerEvent("all:UPDstatus", CHheld)
  if CHheld then
    Notify("Signal 100 Active")
  else
    Notify("Signal 100 Inactive")
  end
end)

RegisterNetEvent('UPDstatus')
AddEventHandler('UPDstatus', function(ch)
  if ch == true then 
    CHheld = ch
    if ch == true and Currch == 1 and COMon then
      SendNUIMessage({type = "signal_100"})
    end
  elseif ch == false then
    CHheld = ch
    if ch == false and Currch == 1 and COMon then
      SendNUIMessage({ sound = "ten_three", volume = 0.3})
    end
  end
end)

CreateThread(function()
  while true do
    if Currch == 1 and COMon then
      if CHheld then
        SendNUIMessage({ sound = "channel_held", volume = 0.1})
      end
    end
    Wait(30000)
  end
end)

--////////Notification HANDLERS////////
RegisterNUICallback("showNotification", function(data, cb)
  Notify(data.notification)
end)

--////////CHANNEL HANDLERS////////
function setChannel()
  if Currch == 1 then
    SendNUIMessage({ sound = "Ch_SWDispatch", volume = 0.3})
    exports["mumble-voip"]:SetRadioChannel(1)
  elseif Currch == 2 then
    exports["mumble-voip"]:SetRadioChannel(2)
    SendNUIMessage({ sound = "Ch_FireOps", volume = 0.3})
  elseif Currch == 3 then
    exports["mumble-voip"]:SetRadioChannel(3)
    SendNUIMessage({ sound = "Ch_Tac1", volume = 0.3})
  elseif Currch == 4 then
    exports["mumble-voip"]:SetRadioChannel(4)
    SendNUIMessage({ sound = "Ch_Tac2", volume = 0.3})
  end
end

function checkChannel()
  if Currch == 1 then
    return "PATROL OPS"
  elseif Currch == 2 then
    return "FIRE OPS"
  elseif Currch == 3 then
    return "TAC 1"
  elseif Currch == 4 then
    return "TAC 2"
  end
end

RegisterNUICallback("checkState", function(data, cb) 
  SendNUIMessage({type = "channel_display", text = checkChannel()})
end)

RegisterNUICallback("chUpd", function(data, cb) 
  if Currch == 1 and data.talkgroup == "down" then
    return
  elseif Currch > 1 and data.talkgroup == "down" then
    Currch = Currch - 1
    setChannel()
  elseif Currch == 4 and data.talkgroup == "up" then
    return
  elseif Currch < 4 and data.talkgroup == "up" then
    Currch = Currch + 1
    setChannel()
  end
end)

RegisterNUICallback("setCH", function(data, cb) 
  setChannel()
end)

RegisterNUICallback("radioState", function(data, cb) 
  if data.state then
    exports["mumble-voip"]:SetRadioChannel(Currch)
    COMon = true
    Wait(100)
    if nolink == true then
      SendNUIMessage({type = "nolink", valid = true, boot = true})
    else
      SendNUIMessage({type = "nolink", valid = false})
    end
  else
    exports["mumble-voip"]:SetRadioChannel(0)
    COMon = false
  end
  SendNUIMessage({type = "connection_status", status = true})
  SendNUIMessage({type = "tower_size", tower = 3})
end)

--////////UI HANDLERS////////

RegisterNUICallback("hide", function(data, cb) 
  SetNuiFocus(false,false)
  showGUI()
end)

function showGUI()
  wut = not wut
  TriggerEvent("animation:radio", wut)
  if wut then
    SetNuiFocus(true,true)
    SendNUIMessage({type = "show_radio"})
  else
    SetNuiFocus(false,false)
    SendNUIMessage({type = "hide_radio"})
  end
end

--////////COMMANDS////////

RegisterCommand("radio", function(source, args, raw)
  SendNUIMessage({type = "resource_name", name = GetCurrentResourceName()})
  showGUI()
end)

--////////ANIMATIONS////////
RegisterNetEvent('animation:radio')
AddEventHandler('animation:radio', function(enable)
  TriggerEvent("destroyPropRadio")
  local lPed = PlayerPedId()
  inPhone = enable

  RequestAnimDict("cellphone@")
  while not HasAnimDictLoaded("cellphone@") do
    Citizen.Wait(0)
  end
  
  Citizen.Wait(300)
  if inPhone then
    TriggerEvent("attachPropRadio","prop_cs_hand_radio", 57005, 0.14, 0.01, -0.02, 110.0, 120.0, -15.0)
    Citizen.Wait(150)
    while inPhone do
      local dead = IsDead()
      if dead then
        closeGui()
        inPhone = false
      end
      if not IsEntityPlayingAnim(lPed, "cellphone@", "cellphone_text_read_base", 3) and not IsEntityPlayingAnim(lPed, "cellphone@", "cellphone_swipe_screen", 3) then
        TaskPlayAnim(lPed, "cellphone@", "cellphone_text_read_base", 2.0, 3.0, -1, 49, 0, 0, 0, 0)
      end    
      Citizen.Wait(1)
    end
  else
      ClearPedTasks(PlayerPedId())
      TaskPlayAnim(lPed, "cellphone@", "cellphone_text_out", 2.0, 1.0, 5.0, 49, 0, 0, 0, 0)
      Citizen.Wait(400)
      TriggerEvent("destroyPropRadio")
      Citizen.Wait(400)
      ClearPedTasks(PlayerPedId())
  end
  TriggerEvent("destroyPropRadio")
end)

attachedPropRadio = 0
function removeAttachedPropRadio()
	if DoesEntityExist(attachedPropRadio) then
		DeleteEntity(attachedPropRadio)
		attachedPropRadio = 0
	end
end

RegisterNetEvent('destroyPropRadio')
AddEventHandler('destroyPropRadio', function()
	removeAttachedPropRadio()
end)

RegisterNetEvent('attachPropRadio')
AddEventHandler('attachPropRadio', function(attachModelSent,boneNumberSent,x,y,z,xR,yR,zR)
	removeAttachedPropRadio()
	attachModelRadio = GetHashKey(attachModelSent)
	SetCurrentPedWeapon(PlayerPedId(), 0xA2719263)
	local bone = GetPedBoneIndex(PlayerPedId(), boneNumberSent)
	RequestModel(attachModelRadio)
	while not HasModelLoaded(attachModelRadio) do
		Citizen.Wait(100)
	end
	attachedPropRadio = CreateObject(attachModelRadio, 1.0, 1.0, 1.0, 1, 1, 0)
	AttachEntityToEntity(attachedPropRadio, PlayerPedId(), bone, x, y, z, xR, yR, zR, 1, 0, 0, 0, 2, 1)
end)

function Notify(text)
  SetNotificationTextEntry('STRING')
  AddTextComponentString(text)
  DrawNotification(false, false)
end

function IsDead()
  return IsPedDeadOrDying(GetPlayerPed(-1), 1)
end