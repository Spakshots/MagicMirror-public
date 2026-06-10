const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");

module.exports = NodeHelper.create({

    start: function () {
        const filePath = path.join(__dirname, "face_state.txt");

        try {
            fs.writeFileSync(filePath, "0");
            console.log("[face_trigger] face_state.txt reset to 0 on startup");
        } catch (err) {
            console.error("[face_trigger] failed to reset face_state.txt:", err);
        }
    },

    socketNotificationReceived: function(notification) {
        if (notification === "GET_FACE_STATE") {
            const filePath = path.join(__dirname, "face_state.txt");

            fs.readFile(filePath, "utf8", (err, data) => {
                if (!err) {
                    this.sendSocketNotification("FACE_STATE_RESULT", data.trim());
                }
            });
        }
    }
});