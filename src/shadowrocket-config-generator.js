const { getConfig } = require('./parser');

/**
 * 转换正则表达式为 Shadowrocket 格式
 */
function convertRegexToShadowrocket(regex, exclude = false) {
  // 移除正则表达式的 / 和标志
  let pattern = regex.replace(/^\/|\/[a-z]*$/g, '');
  
  // 处理排除模式
  if (exclude) {
    pattern = `^(?!.*${pattern})`;
  }
  
  return pattern;
}

/**
 * 生成 Shadowrocket 代理组配置
 */
function generateProxyGroups() {
  const config = getConfig();
  const proxyGroups = config.proxyGroups;
  const specialGroups = config.specialGroups;
  
  const shadowrocketConfig = [
    '# 代理组配置（动态生成自 parser.js）',
    '[Proxy Group]',
    '# 主要代理组',
    'CUSTOMSELECT = select, policy-path=DIRECT, update-interval=86400',
    'PROXY = url-test, policy-path=DIRECT, update-interval=300, url=http://www.gstatic.com/generate_204',
    '',
    '# 地区分组（基于节点名称匹配）'
  ];
  
  // 处理正则分组
  for (const group of proxyGroups) {
    const regexFilter = convertRegexToShadowrocket(group.regex, group.exclude);
    const interval = group.type === 'url-test' ? '300' : '86400';
    const urlTest = group.type === 'url-test' ? ', url=http://www.gstatic.com/generate_204' : '';
    
    if (regexFilter) {
      shadowrocketConfig.push(`${group.name} = ${group.type}, policy-path=DIRECT, update-interval=${interval}${urlTest}, policy-regex-filter=${regexFilter}`);
    } else {
      shadowrocketConfig.push(`${group.name} = ${group.type}, policy-path=DIRECT, update-interval=${interval}${urlTest}`);
    }
  }
  
  // 处理特殊分组
  for (const group of specialGroups) {
    if (group.proxies && group.proxies.length > 0) {
      shadowrocketConfig.push(`${group.name} = ${group.type}, policy-path=DIRECT, update-interval=86400, policy-regex-filter=(${group.proxies.join('|')})`);
    } else {
      shadowrocketConfig.push(`${group.name} = ${group.type}, policy-path=DIRECT, update-interval=86400`);
    }
  }
  
  shadowrocketConfig.push('');
  shadowrocketConfig.push('# 注意：');
  shadowrocketConfig.push('# 1. policy-path=DIRECT 表示使用所有可用节点');
  shadowrocketConfig.push('# 2. policy-regex-filter 用于根据节点名称过滤');
  shadowrocketConfig.push('# 3. 代理组配置自动从 parser.js 提取');
  shadowrocketConfig.push('# 4. 如果节点名称不匹配，可以手动调整代理组');
  
  return shadowrocketConfig;
}

/**
 * 生成完整的 Shadowrocket 配置
 */
function generateShadowrocketConfig() {
  const config = getConfig();
  
  // 合并所有规则
  const allRules = [...config.rules.custom, ...config.rules.sets];
  
  console.log(`✅ 从 parser.js 提取到 ${allRules.length} 条规则`);
  console.log(`✅ 从 parser.js 提取到 ${config.proxyGroups.length + config.specialGroups.length} 个代理组`);
  
  const shadowrocketConfig = [
    '# Shadowrocket Rules Configuration',
    '# Generated from parser.js',
    '# Auto-uploaded to Gist',
    '#',
    '# 使用说明：',
    '# 1. 在 Shadowrocket 中添加你的机场订阅',
    '# 2. 导入此规则配置文件',
    '# 3. 规则会自动应用到你的节点',
    '#',
    '[Rule]',
    ...allRules,
    '',
    ...generateProxyGroups()
  ];
  
  return shadowrocketConfig.join('\n');
}

module.exports = {
  generateShadowrocketConfig,
  generateProxyGroups
}; 