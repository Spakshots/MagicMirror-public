Module.register("MMM-ObsidianObjectives", {
  defaults: {
    githubOwner: "",
    githubRepo: "",
    githubBranch: "main",
    githubPath: "",
    githubToken: "",
    timeZone: "America/Los_Angeles",
    updateInterval: 2 * 30 * 1000,
    maxItems: 8,
    showDate: true,
    header: "Today's Objectives"
  },

  start() {
    this.objectives = [];
    this.date = "";
    this.error = "";
    this.fetchObjectives();
    setInterval(() => this.fetchObjectives(), this.config.updateInterval);
  },

  getHeader() {
    return this.config.header;
  },

  getStyles() {
    return ["MMM-ObsidianObjectives.css"];
  },

  fetchObjectives() {
    this.sendSocketNotification("FETCH_OBJECTIVES", this.config);
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "OBJECTIVES_RESULT") {
      this.objectives = payload.objectives || [];
      this.date = payload.date || "";
      this.error = payload.error || "";
      this.updateDom();
    }
  },

  getDom() {
    const wrapper = document.createElement("div");
    wrapper.className = "MMM-ObsidianObjectives";

    if (this.error) {
      wrapper.innerHTML = `<div class="dimmed small">${this.error}</div>`;
      return wrapper;
    }

    if (this.objectives.length === 0) {
      wrapper.innerHTML = `<div class="dimmed small">No objectives found for ${this.date || "today"}.</div>`;
      return wrapper;
    }

    const ul = document.createElement("ul");
    ul.className = "objectives-list";

    this.objectives.slice(0, this.config.maxItems).forEach(obj => {
      const li = document.createElement("li");
      li.className = "objective-item small";

      if (typeof obj === "string") {
        li.textContent = obj;
      } else {
        li.textContent = obj.text;
        if (obj.done) {
          li.classList.add("done");
        }
      }

      ul.appendChild(li);
    });

    wrapper.appendChild(ul);
    return wrapper;
  }
});