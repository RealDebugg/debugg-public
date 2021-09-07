fx_version 'adamant'
games { 'gta5' }

ui_page('nui/index.html')

client_scripts {
	'client.lua'
}

server_scripts {
	'server.lua'
}

files {
	'nui/index.html',
	'nui/radio.js',
	'nui/radio.css',
	'nui/helper.js',
	'nui/sounds/*.mp3',
	'nui/sounds/channels/*.wav',
	'nui/sounds/general/*.wav',
	'nui/sounds/tones/*.wav',
	'nui/sounds/tones/*.mp3',
	'nui/images/*.png',
	'nui/font/*.ttf'
}
