const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const path = require("path");
const { GITHUB_TOKEN, GIST_ID, GIST_FILENAME, LOCAL_FILE } = require("../config/config");

async function uploadToGist() {
  if (!GITHUB_TOKEN || !GIST_ID) {
    console.error("Missing GITHUB_TOKEN or GIST_ID in environment/config.");
    process.exit(1);
  }
  const octokit = new Octokit({ auth: GITHUB_TOKEN });
  const content = fs.readFileSync(path.resolve(__dirname, "../", LOCAL_FILE), "utf8");
  try {
    await octokit.gists.update({
      gist_id: GIST_ID,
      files: {
        [GIST_FILENAME]: { content }
      }
    });
    console.log("Gist updated successfully!");
  } catch (err) {
    console.error("Failed to update Gist:", err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  uploadToGist();
} 