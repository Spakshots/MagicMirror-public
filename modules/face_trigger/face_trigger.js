Module.register("face_trigger", {

    start: function () {
        this.lastState = null;
    },

    notificationReceived: function (notification) {
        if (notification === "MODULE_DOM_CREATED") {
            setTimeout(() => {
                this.sendSocketNotification("GET_FACE_STATE");
                this.watchFile();
            }, 2000);
        }
    },

    watchFile: function () {
        setInterval(() => {
            this.sendSocketNotification("GET_FACE_STATE");
        }, 1000);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "FACE_STATE_RESULT") {

            const state = parseInt(payload);

            if (state !== this.lastState) {
                this.lastState = state;
                this.applyState(state);
            }
        }
    },

    applyState: function (state) {

	this.sendNotification("FACE_STATE_CHANGED", state);

        // -------------------------
        // UI STATE SWITCH
        // -------------------------

	if (state === 3) {
	    this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_10_MMM-FaceAnimation"});
	    this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_4_calendar" });
            this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_3_calendar" });
            this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_7_MMM-Remote-Control" });
	    this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_6_face_trigger"});
	    this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_12_MMM-ObsidianObjectives"});

	    this.sendNotification("REMOTE_ACTION", { action: "SHOW", module: "module_9_calendar" });
	    this.sendNotification("REMOTE_ACTION", { action: "SHOW", module: "module_11_MMM-CircularProfilePic"});

	} else if (state === 2) {
	    this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_10_MMM-FaceAnimation"});
	    this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_3_calendar" });
            this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_7_MMM-Remote-Control" });
	    this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_6_face_trigger"});
	    this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_9_calendar" });
	    
	    this.sendNotification("REMOTE_ACTION", { action: "SHOW", module: "module_2_clock" });
	    this.sendNotification("REMOTE_ACTION", { action: "SHOW", module: "module_5_weather"});
	    this.sendNotification("REMOTE_ACTION", { action: "SHOW", module: "module_4_calendar" });
	    this.sendNotification("REMOTE_ACTION", { action: "SHOW", module: "module_11_MMM-CircularProfilePic"});
	    this.sendNotification("REMOTE_ACTION", { action: "SHOW", module: "module_12_MMM-ObsidianObjectives"});
	    
	} else if (state === 1) {
            this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_11_MMM-CircularProfilePic"});
	    this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_4_calendar" });
            this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_7_MMM-Remote-Control" });
	    this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_6_face_trigger"});
	    this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_9_calendar" });

	    this.sendNotification("REMOTE_ACTION", { action: "SHOW", module: "module_2_clock" });
	    this.sendNotification("REMOTE_ACTION", { action: "SHOW", module: "module_5_weather"});
	    this.sendNotification("REMOTE_ACTION", { action: "SHOW", module: "module_3_calendar" });
	    this.sendNotification("REMOTE_ACTION", { action: "SHOW", module: "module_10_MMM-FaceAnimation"});
	    this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_12_MMM-ObsidianObjectives"});
            
        } else {
            this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_11_MMM-CircularProfilePic"});
	    this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_4_calendar" });
            this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_7_MMM-Remote-Control" });
	    this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_6_face_trigger"});
	    this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_9_calendar" });
	    this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_2_clock" });
	    this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_5_weather"})
	    this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_12_MMM-ObsidianObjectives"});

	    this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_3_calendar" });
	    this.sendNotification("REMOTE_ACTION", { action: "HIDE", module: "module_10_MMM-FaceAnimation"});
            
        }

        // -------------------------
        // MOTD LOGIC (SYNCHRONIZED)
        // -------------------------
        const hour = new Date().getHours();

        let greeting = "";

        if (hour < 12) {
            greeting = "good morning";
        } else if (hour < 18) {
            greeting = "good afternoon";
        } else if (hour < 22) {
            greeting = "good evening";
        } else {
            greeting = "good night";
        }

        if (state === 2) {
            greeting = `${greeting}, brady`;
        } else if (state === 3) {
	    greeting = `${greeting}, camren`;
	}

        this.sendNotification("MOTD_UPDATE", {
            state: state,
            greeting: greeting
        });
    }
});