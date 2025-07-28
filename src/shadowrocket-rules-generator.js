const fs = require('fs');
const path = require('path');
const { Octokit } = require("@octokit/rest");
const { GITHUB_TOKEN, GIST_ID_SHADOWROCKET } = require('../config/config');
const { generateShadowrocketConfig } = require('./shadowrocket-config-generator');

/**
 * 生成 Shadowrocket 规则配置
 */
function generateShadowrocketRules() {
  try {
    const shadowrocketRules = generateShadowrocketConfig();
    
    // 保存到文件
    const outputPath = path.join(__dirname, '../shadowrocket-rules.conf');
    fs.writeFileSync(outputPath, shadowrocketRules);
    console.log(`✅ Shadowrocket 规则配置已生成: ${outputPath}`);
    
    return shadowrocketRules;
  } catch (error) {
    console.error('生成 Shadowrocket 规则失败:', error.message);
    throw error;
  }
}

/**
 * 上传规则配置到 Gist
 */
async function uploadRulesToGist() {
  try {
    if (!GITHUB_TOKEN || !GIST_ID_SHADOWROCKET) {
      console.error("Missing GITHUB_TOKEN or GIST_ID_SHADOWROCKET in environment/config.");
      process.exit(1);
    }

    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    const filePath = path.join(__dirname, '../shadowrocket-rules.conf');

    if (!fs.existsSync(filePath)) {
      console.error(`规则配置文件不存在: ${filePath}`);
      console.log("请先运行: npm run generate-rules");
      process.exit(1);
    }

    const content = fs.readFileSync(filePath, "utf8");

    await octokit.gists.update({
      gist_id: GIST_ID_SHADOWROCKET,
      files: {
        'shadowrocket-rules': { content }
      }
    });
    
    console.log("✅ Shadowrocket 规则配置已上传到 Gist!");
    console.log(`Gist URL: https://gist.github.com/carllx/${GIST_ID_SHADOWROCKET}`);
  } catch (err) {
    console.error("❌ 上传规则配置到 Gist 失败:", err.message);
    process.exit(1);
  }
}

/**
 * 生成并上传规则配置
 */
async function generateAndUploadRules() {
  try {
    // 生成规则配置
    generateShadowrocketRules();
    
    // 上传到 Gist
    await uploadRulesToGist();
    
    console.log('✅ Shadowrocket 规则配置已生成并上传到 Gist!');
  } catch (error) {
    console.error('❌ 生成和上传规则配置失败:', error.message);
    throw error;
  }
}

module.exports = {
  generateShadowrocketRules,
  uploadRulesToGist,
  generateAndUploadRules
};

// 如果直接运行此脚本
if (require.main === module) {
  generateAndUploadRules();
} 