local log = require "log"
local constants = require "constants"

local discovery = {}

function discovery.handle_discovery(driver, _, should_continue)
    log.info("Starting ewelink discovery")
    local known = {}
    for _, device in ipairs(driver:get_devices()) do known[device.device_network_id] = device end
    if known[constants.bridge.id] == nil then
        driver:try_create_device({
            type = "LAN",
            device_network_id = constants.bridge.id,
            label = constants.bridge.title,
            profile = "sonoff-bridge.v1",
            vendor_provided_label = nil
        })
    end
end

return discovery
