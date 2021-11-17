const systemServer = server.registerSystem(0, 0)

systemServer.initialize = function () {
    const scriptLoggerConfig = this.createEventData(
        'minecraft:script_logger_config'
    )
    scriptLoggerConfig.data.log_errors = true
    scriptLoggerConfig.data.log_information = true
    scriptLoggerConfig.data.log_warnings = true
    this.broadcastEvent('minecraft:script_logger_config', scriptLoggerConfig)

    this.breakall = function(eventData) {
        this.log(eventData)
        const data = eventData.data;
        const player = data.player;
        let item = systemServer.getComponent(player, "minecraft:hand_container").data[0]; //0: main 1: off
        const tickingArea = systemServer.getComponent(player, "minecraft:tick_world").data.ticking_area;
        const pos = data.block_position;

        //Tree
        if (data.block_identifier.startsWith("minecraft:log") && item.__identifier__.endsWith("_axe")) {
            const blocks = systemServer.getBlocks(tickingArea,
                pos.x - 1, pos.y-1, pos.z - 1,
                pos.x + 1, pos.y+8, pos.z + 1
            );
            if (blocks[1][0][1].__identifier__ == "minecraft:dirt" && blocks[1][2][1].__identifier__ == data.block_identifier) {
                blocks.forEach(blocks1 => blocks1.forEach(blocks2 => blocks2.forEach(block => {
                    if (block.__identifier__ == data.block_identifier) {
                        systemServer.executeCommand(`/setblock ${block.block_position.x} ${block.block_position.y} ${block.block_position.z} air 0 destroy`, () => {});
                    }
                })));
            }
        }

        //Ore
        if (data.block_identifier.endsWith("_ore") && item.__identifier__.endsWith("_pickaxe")) {
            const blocks = systemServer.getBlocks(tickingArea,
                pos.x - 5, pos.y - 5, pos.z - 5,
                pos.x + 5, pos.y + 5, pos.z + 5
            );
            blocks.forEach(blocks1 => blocks1.forEach(blocks2 => blocks2.forEach(block => {
                if (block.__identifier__ == data.block_identifier) {
                    systemServer.executeCommand(`/setblock ${block.block_position.x} ${block.block_position.y} ${block.block_position.z} air 0 destroy`, () => {});
                }
            })));
        }
    }

    if (!this.listenForEvent("minecraft:player_destroyed_block", eventData => this.breakall(eventData))) {
        this.log("Failed to Listen: BreakAll")
    }
}

systemServer.log = function (...items) {
    const toString = (item) => {
        switch (Object.prototype.toString.call(item)) {
            case '[object Undefined]':
                return 'undefined'
            case '[object Null]':
                return 'null'
            case '[object String]':
                return `"${item}"`
            case '[object Array]':
                const array = item.map(toString)
                return `[${array.join(', ')}]`
            case '[object Object]':
                const object = Object.keys(item).map(
                    (key) => `${key}: ${toString(item[key])}`
                )
                return `{${object.join(', ')}}`
            case '[object Function]':
                return item.toString()
            default:
                return item
        }
    }
    
    const chatEvent = this.createEventData('minecraft:display_chat_event')
    chatEvent.data.message = items.map(toString).join(' ')
    this.broadcastEvent('minecraft:display_chat_event', chatEvent)
}