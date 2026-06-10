const NodeHelper = require("node_helper");
const https = require("https");

module.exports = NodeHelper.create({
  start() {
    console.log("MMM-ObsidianObjectives helper started");
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "FETCH_OBJECTIVES") {
      this.getObjectives(payload || {});
    }
  },

  getObjectives(config) {
    const dateStr = this.getLocalDateString(config.timeZone || "America/Los_Angeles");

    const owner = config.githubOwner;
    const repo = config.githubRepo;
    const branch = config.githubBranch || "main";
    const folder = config.githubPath || "";
    const token = config.githubToken || "";

    const filePath = [folder, `${dateStr}.md`]
      .filter(Boolean)
      .join("/");

    const encodedPath = filePath
      .split("/")
      .map(encodeURIComponent)
      .join("/");

    const options = {
      hostname: "api.github.com",
      path: `/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`,
      method: "GET",
      headers: {
        "User-Agent": "MagicMirror-MMM-ObsidianObjectives",
        "Accept": "application/vnd.github+json"
      }
    };

    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    https.get(options, (res) => {
      let data = "";

      console.log("REQUEST PATH:", options.path);
      console.log("STATUS CODE:", res.statusCode);

      res.on("data", chunk => data += chunk);

      res.on("end", () => {
        try {
          const json = JSON.parse(data);

          if (res.statusCode !== 200) {
            throw new Error(json.message || "GitHub request failed");
          }

          const content = Buffer.from(
            json.content.replace(/\n/g, ""),
            "base64"
          ).toString("utf8");

          console.log("FETCHED DATE:", dateStr);
          console.log("CONTENT PREVIEW:", content.slice(0, 500));

          const objectives = this.parseObjectives(content);

          console.log("PARSED OBJECTIVES:", objectives);

          this.sendSocketNotification("OBJECTIVES_RESULT", {
            objectives,
            date: dateStr
          });
        } catch (e) {
          console.log("ERROR:", e.message);

          this.sendSocketNotification("OBJECTIVES_RESULT", {
            objectives: [],
            date: dateStr,
            error: e.message
          });
        }
      });
    }).on("error", err => {
      console.log("REQUEST ERROR:", err.message);

      this.sendSocketNotification("OBJECTIVES_RESULT", {
        objectives: [],
        date: dateStr,
        error: err.message
      });
    });
  },

  getLocalDateString(timeZone) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());

    const values = {};
    parts.forEach(part => {
      values[part.type] = part.value;
    });

    return `${values.year}-${values.month}-${values.day}`;
  },

  parseObjectives(content) {
  const lines = content.split(/\r?\n/);
  const objectives = [];
  let inSection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^#{1,6}\s+main\s*objectives\s*$/i.test(trimmed)) {
      inSection = true;
      continue;
    }

    if (inSection && /^#{1,6}\s+log\s+of\s+events\s*$/i.test(trimmed)) {
      break;
    }

    if (!inSection) continue;

    const match = trimmed.match(/^[-*+]\s*(?:\[([ xX])\]\s*)?(.+)$/);
    if (match) {
      objectives.push({
        done: /x/i.test(match[1] || ""),
        text: match[2].trim()
      });
    }
  }

  return objectives;
}
});