/* MMM-CircularProfilePic
 * A simple module to show circular profile pictures for recognized users
 */

Module.register("MMM-CircularProfilePic", {
  defaults: {
    width: "100px",        // Circle width
    height: "100px",       // Circle height
    borderRadius: "50%",   // Makes it circular
    border: "2px solid white", // Optional border
    position: "top_left",  // Default position
    imageUrl: null,        // Default image
    fadeSpeed: 500         // Fade transition when updating
  },

  start: function() {
    this.currentUrl = this.config.imageUrl;
  },

  getDom: function() {
    // Wrapper div to mask circular shape
    const wrapper = document.createElement("div");
    wrapper.style.width = this.config.width;
    wrapper.style.height = this.config.height;
    wrapper.style.borderRadius = this.config.borderRadius;
    wrapper.style.overflow = "hidden";
    wrapper.style.border = this.config.border;
    wrapper.style.transition = `opacity ${this.config.fadeSpeed}ms ease`;

    // Image element
    const img = document.createElement("img");
    img.src = this.currentUrl || "";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";

    wrapper.appendChild(img);
    this.imgElement = img; // save reference for updates
    return wrapper;
  },

  notificationReceived: function(notification, payload) {
    if(notification === "FACE_STATE_CHANGED") {
	if (payload === 0 || payload === 1){
		this.hide(500);
	}
	if (payload === 2){
		this.currentUrl = "modules/MMM-CircularProfilePic/brady.jpeg";
		this.show(250);
		this.updateDom(250);
	}
	if (payload === 3){
		this.currentUrl = "modules/MMM-CircularProfilePic/camren.jpeg";
		this.show(250);
		this.updateDom(250);
	}
    }
  }
});