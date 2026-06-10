Module.register("MMM-MOTD", {

    start: function () {
        this.message = "";
    },

    notificationReceived: function (notification, payload) {
        if (notification === "MOTD_UPDATE") {
            this.message = payload.greeting;
            this.updateDom();
        }
    },

    getDom: function () {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = this.message;
        wrapper.style.fontSize = "40px";
        wrapper.style.textAlign = "center";
        return wrapper;
    }
});