function ShowUIMessage(tmsgType, tmsg)
    SendNUIMessage({
        type = "show",
        msgType = tmsgType,
        msg = tmsg,
    })
end

function HideUIMessage()
    SendNUIMessage({
        type = "hide"
    })
end