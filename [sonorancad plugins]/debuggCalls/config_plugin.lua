local config = {
    enabled = true,
    configVersion = "1.0",
    pluginName = "debuggCalls",
    pluginAuthor = "Debugg",
}

if config.enabled then
    Config.RegisterPluginConfig(config.pluginName, config)
end