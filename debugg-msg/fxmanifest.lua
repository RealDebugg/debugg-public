fx_version 'cerulean'

games { 'rdr3', 'gta5' }

version '1.0.0'

ui_page "html/index.html"

client_scripts {
    'client/main.lua'
}

files {
    'html/*.html',
    'html/js/*.js',
    'html/css/*.css'
}

export 'ShowUIMessage'
export 'HideUIMessage'