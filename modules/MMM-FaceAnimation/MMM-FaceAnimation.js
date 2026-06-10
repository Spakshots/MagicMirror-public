/* MMM-FaceAnimation */
Module.register("MMM-FaceAnimation", {

    defaults: {
        idleVideo: "modules/MMM-FaceAnimation/idle4.mp4",
        successVideo: "modules/MMM-FaceAnimation/success5.mp4",
        successDuration: 2000
    },

    start: function () {
        this.video = null;
        this.currentState = 0;
        this.pendingUser = null;
        this.successTimeout = null;
    },

    getDom: function () {
        const wrapper = document.createElement("div");
        const video = document.createElement("video");
        video.muted = true;
        video.autoplay = true;
        video.loop = true;
        video.controls = false;
        video.preload = "auto";
        video.width = 105;
        video.height = 105;
        this.video = video;
        video.setAttribute("src", this.config.idleVideo);
        video.load();
        video.play();
        wrapper.appendChild(video);
        return wrapper;
    },

    notificationReceived: function (notification, payload) {
        if (notification !== "FACE_STATE_CHANGED") return;
        if (payload === 1) {
            this.hide(600);
            this.clearSuccessTimer();
            if (this.video) {
                this.video.setAttribute("src", this.config.idleVideo);
                this.video.loop = true;
                this.video.load();
                this.video.play();
            }
            return;
        }
        if (payload === 1 || payload === 2) {
            this.show(200);
            if (this.video) {
                this.video.setAttribute("src", this.config.successVideo);
                this.video.loop = false;
                this.video.load();
                this.video.play();
            }
            this.clearSuccessTimer();
            this.successTimeout = setTimeout(() => {
                this.sendNotification("FACE_LOGIN_SUCCESS", { user: payload });
            }, this.config.successDuration);
            return;
        }
    },

    clearSuccessTimer: function () {
        if (this.successTimeout) {
            clearTimeout(this.successTimeout);
            this.successTimeout = null;
        }
    }
});