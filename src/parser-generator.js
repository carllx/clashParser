const fs = require('fs');
const path = require('path');

/**
 * 生成独立的 parser.js 文件
 * 将 rules.js 中的规则内联到 parser.js 中
 */
function generateStandaloneParser() {
  // 读取规则配置
  const { RuleCustom, RuleSets, ProxyGroups, SpecialGroups } = require('./rules');
  
  // 读取基础 parser.js 模板
  const parserTemplate = fs.readFileSync(path.join(__dirname, 'parser.js'), 'utf8');
  
  // 生成规则数组字符串
  const ruleCustomString = RuleCustom.map(rule => `      "${rule}",`).join('\n');
  const ruleSetsString = RuleSets.map(rule => `      "${rule}",`).join('\n');
  
  // 生成代理组配置
  const proxyGroupsCode = ProxyGroups.map(group => {
    const regex = group.regex.replace(/^\/|\/[a-z]*$/g, '');
    const exclude = group.exclude ? ', true' : '';
    return `    addProxyGroupByRegex(/${regex}/i, "${group.name}", "${group.type}", obj${exclude});`;
  }).join('\n');
  
  // 生成特殊分组配置
  const specialGroupsCode = SpecialGroups.map(group => {
    const proxies = group.proxies ? `, proxies: ["${group.proxies.join('", "')}"]` : '';
    return `    obj["proxy-groups"].unshift({
      name: "${group.name}",
      type: "${group.type}"${proxies}
    });`;
  }).join('\n');
  
  // 替换模板中的占位符
  let standaloneParser = parserTemplate
    .replace('// 导入规则配置\n  const { RuleCustom, RuleSets, ProxyGroups, SpecialGroups } = require(\'./rules\');', '')
    .replace('// 自定义规则 - 使用 rules.js 中的配置\n    const RuleCustom = [\n      // 规则将在这里生成\n    ];', `// 自定义规则
    const RuleCustom = [
${ruleCustomString}
    ];`)
    .replace('// Rule-Set: (White List) - 使用 rules.js 中的配置\n    const RuleSets = [\n      // 规则集将在这里生成\n    ];', `// Rule-Set: (White List)
    const RuleSets = [
${ruleSetsString}
    ];`)
    .replace('// 代理分组 - 使用 rules.js 中的配置\n    for (const group of ProxyGroups) {\n      const regex = new RegExp(group.regex.replace(/^\\/|\\/[a-z]*$/g, \'\'), \'i\');\n      addProxyGroupByRegex(regex, group.name, group.type, obj, group.exclude);\n    }', `// 代理分组
${proxyGroupsCode}`)
    .replace('// 特殊分组\n    for (const group of SpecialGroups) {\n      if (!obj["proxy-groups"]) obj["proxy-groups"] = [];\n      obj["proxy-groups"].unshift({\n        name: group.name,\n        type: group.type,\n        proxies: group.proxies,\n      });\n    }', `// 特殊分组
${specialGroupsCode}`);

  // 写入生成的 parser.js 文件
  const outputPath = path.join(__dirname, '../generated-parser.js');
  fs.writeFileSync(outputPath, standaloneParser);
  
  console.log(`✅ 已生成独立的 parser.js: ${outputPath}`);
  console.log(`📊 统计信息:`);
  console.log(`  - 自定义规则: ${RuleCustom.length} 条`);
  console.log(`  - 系统规则: ${RuleSets.length} 条`);
  console.log(`  - 代理组: ${ProxyGroups.length} 个`);
  console.log(`  - 特殊分组: ${SpecialGroups.length} 个`);
  
  return outputPath;
}

/**
 * 生成并上传 parser.js
 */
async function generateAndUploadParser() {
  try {
    // 生成独立的 parser.js
    const parserPath = generateStandaloneParser();
    
    // 读取生成的 parser.js 内容
    const parserContent = fs.readFileSync(parserPath, 'utf8');
    
    // 上传到 Gist
    const { Octokit } = require("@octokit/rest");
    const { GITHUB_TOKEN, GIST_ID_PARSER, GIST_FILENAME } = require("../config/config");
    
    if (!GITHUB_TOKEN || !GIST_ID_PARSER) {
      console.error("Missing GITHUB_TOKEN or GIST_ID_PARSER in environment/config.");
      process.exit(1);
    }
    
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    
    await octokit.gists.update({
      gist_id: GIST_ID_PARSER,
      files: {
        [GIST_FILENAME]: { content: parserContent }
      }
    });
    
    console.log(`✅ parser.js 已上传到 Gist!`);
    console.log(`🔗 Gist URL: https://gist.github.com/carllx/${GIST_ID_PARSER}`);
    
  } catch (error) {
    console.error('❌ 生成或上传失败:', error.message);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  generateAndUploadParser();
}

module.exports = {
  generateStandaloneParser,
  generateAndUploadParser
}; 