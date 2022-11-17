local discordWebhook = "" --https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks

function sendToDiscord(color, name, message, coords, footer)
    local embed = {
          {
              ["color"] = color,
              ["title"] = "**".. name .."**",
              ["description"] = message,
              ["coords"] = coords,
              ["footer"] = {
                ["text"] = footer,
              },
          }
      }
  
    PerformHttpRequest(discordWebhook, function(err, text, headers) end, 'POST', json.encode({username = name, embeds = embed}), { ['Content-Type'] = 'application/json' })
end

RegisterServerEvent("PublishDiscord")
AddEventHandler("PublishDiscord", function(ccc, tt, dd, cc, ff)
  print(ccc, tt, dd, cc, ff)
    sendToDiscord(ccc, tt, dd, cc, ff)
end)