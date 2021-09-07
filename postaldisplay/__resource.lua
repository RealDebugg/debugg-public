resource_manifest_version '44febabe-d386-4d18-afbe-5e627f4af937'

client_script "@drp-errorlog/client/cl_errorlog.lua"
client_script 'client.lua'
local postalFile = 'ocrp-postals.json'
client_scripts {
	'config.lua',
	'cl.lua'
}

file(postalFile)
postal_file(postalFile)

export 'nearestPostal' --exports['postaldisplay']:nearestPostal()