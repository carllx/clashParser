const fs = require('fs');
const path = require('path');

/**
 * 规则管理工具
 */
class RuleManager {
  constructor() {
    this.rulesPath = path.join(__dirname, 'rules.js');
  }

  /**
   * 读取当前规则
   */
  readRules() {
    const content = fs.readFileSync(this.rulesPath, 'utf8');
    return content;
  }

  /**
   * 添加新规则到 RuleCustom
   */
  addRule(rule, comment = '') {
    const content = this.readRules();
    
    // 找到 RuleCustom 数组的位置
    const ruleCustomMatch = content.match(/(const RuleCustom = \[[\s\S]*?)(\];)/);
    if (!ruleCustomMatch) {
      throw new Error('无法找到 RuleCustom 数组');
    }

    const beforeRules = ruleCustomMatch[1];
    const afterRules = ruleCustomMatch[2];
    
    // 构建新规则行
    const newRuleLine = `  "${rule}",${comment ? ` // ${comment}` : ''}\n`;
    
    // 在数组末尾添加新规则
    const newContent = content.replace(
      ruleCustomMatch[0],
      beforeRules + newRuleLine + '  ' + afterRules
    );

    fs.writeFileSync(this.rulesPath, newContent);
    console.log(`✅ 已添加规则: ${rule}`);
  }

  /**
   * 删除规则
   */
  removeRule(rulePattern) {
    const content = this.readRules();
    
    // 查找并删除匹配的规则
    const lines = content.split('\n');
    const newLines = lines.filter(line => {
      const trimmed = line.trim();
      return !trimmed.includes(rulePattern) || !trimmed.startsWith('"');
    });

    fs.writeFileSync(this.rulesPath, newLines.join('\n'));
    console.log(`✅ 已删除包含 "${rulePattern}" 的规则`);
  }

  /**
   * 列出所有规则
   */
  listRules() {
    const { RuleCustom, RuleSets } = require('./rules');
    
    console.log('\n📋 自定义规则 (RuleCustom):');
    console.log('=' .repeat(50));
    RuleCustom.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule}`);
    });

    console.log('\n📋 系统规则 (RuleSets):');
    console.log('=' .repeat(50));
    RuleSets.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule}`);
    });
  }

  /**
   * 搜索规则
   */
  searchRules(keyword) {
    const { RuleCustom, RuleSets } = require('./rules');
    
    console.log(`\n🔍 搜索包含 "${keyword}" 的规则:`);
    console.log('=' .repeat(50));

    const customMatches = RuleCustom.filter(rule => 
      rule.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const setMatches = RuleSets.filter(rule => 
      rule.toLowerCase().includes(keyword.toLowerCase())
    );

    if (customMatches.length > 0) {
      console.log('\n📋 自定义规则匹配:');
      customMatches.forEach((rule, index) => {
        console.log(`${index + 1}. ${rule}`);
      });
    }

    if (setMatches.length > 0) {
      console.log('\n📋 系统规则匹配:');
      setMatches.forEach((rule, index) => {
        console.log(`${index + 1}. ${rule}`);
      });
    }

    if (customMatches.length === 0 && setMatches.length === 0) {
      console.log('❌ 未找到匹配的规则');
    }
  }

  /**
   * 显示帮助信息
   */
  showHelp() {
    console.log(`
🔧 规则管理工具使用说明:

用法: node src/rule-manager.js <命令> [参数]

命令:
  add <规则> [注释]    添加新规则
  示例: node src/rule-manager.js add "DOMAIN-SUFFIX,example.com,autoUS" "示例规则"

  remove <关键词>       删除包含关键词的规则
  示例: node src/rule-manager.js remove "example.com"

  list                 列出所有规则

  search <关键词>       搜索包含关键词的规则
  示例: node src/rule-manager.js search "google"

  help                 显示此帮助信息

规则格式:
  DOMAIN-SUFFIX,域名,代理组
  DOMAIN-KEYWORD,关键词,代理组
  DOMAIN,域名,代理组
  IP-CIDR,IP段,代理组
  PROCESS-NAME,进程名,代理组

代理组选项:
  DIRECT    - 直连
  PROXY     - 代理
  autoUS    - 美国节点
  autoUK    - 英国节点
  AutoJP    - 日本节点
  Hong Kong - 香港节点
  !HK       - 非香港节点
  Bing      - Bing搜索
    `);
  }
}

// 命令行接口
if (require.main === module) {
  const manager = new RuleManager();
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'add':
      if (args.length < 2) {
        console.error('❌ 请提供规则内容');
        process.exit(1);
      }
      const rule = args[1];
      const comment = args[2] || '';
      manager.addRule(rule, comment);
      break;

    case 'remove':
      if (args.length < 2) {
        console.error('❌ 请提供搜索关键词');
        process.exit(1);
      }
      manager.removeRule(args[1]);
      break;

    case 'list':
      manager.listRules();
      break;

    case 'search':
      if (args.length < 2) {
        console.error('❌ 请提供搜索关键词');
        process.exit(1);
      }
      manager.searchRules(args[1]);
      break;

    case 'help':
    default:
      manager.showHelp();
      break;
  }
}

module.exports = RuleManager; 