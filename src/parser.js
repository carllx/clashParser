const rulerSetUrls = [
    // "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/applications.txt",
    "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt",
    "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt",
    "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt",
    "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt",
    "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt",
    "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt",
    "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt",
    "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt",
    "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/greatfire.txt",
    "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt",
    "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt",
    "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt",
    "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt",
    "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt",
  ];
  
  const PROXY_GROUP_INTERVAL = 300;
  const RULE_PROVIDER_INTERVAL = 86400;
  const PROXY_GROUP_URL = "http://www.gstatic.com/generate_204";

  // 导入规则配置
  const { RuleCustom, RuleSets, ProxyGroups, SpecialGroups } = require('./rules');

  function getRuleProviders(urls) {
    const ruleProviders = {};
    urls.forEach((url) => {
      const fileName = url.split("/").pop().split(".")[0];
      ruleProviders[fileName] = {
        type: "http",
        behavior: "domain",
        url,
        path: `./ruleset/${fileName}.yaml`,
        interval: RULE_PROVIDER_INTERVAL,
      };
    });
    return ruleProviders;
  }
  
  /**
   * 添加代理分组，可选择正则包含或排除
   * @param {RegExp} regex 匹配正则
   * @param {string} name 分组名
   * @param {string} type 分组类型
   * @param {object} ymlObj yaml对象
   * @param {boolean} exclude 是否排除匹配
   */
  function addProxyGroupByRegex(regex, name, type, ymlObj, exclude = false) {
    if (!ymlObj.proxies || !Array.isArray(ymlObj.proxies)) return;
    if (!ymlObj["proxy-groups"]) ymlObj["proxy-groups"] = [];
    const filteredNames = ymlObj.proxies.filter((element) =>
      exclude ? !regex.test(element.name.toLowerCase()) : regex.test(element.name.toLowerCase())
    );
    if (filteredNames.length === 0) return null;
    const proxies = filteredNames.map((ymlObj) => ymlObj.name);
    const proxyGroup = {
      name,
      type,
      proxies,
      interval: PROXY_GROUP_INTERVAL,
      url: PROXY_GROUP_URL,
    };
    ymlObj["proxy-groups"].unshift(proxyGroup);
  }
  
  module.exports.parse = (
    raw,
    { axios, yaml, notify, console },
    { name, url, interval, selected }
  ) => {
    let obj;
    try {
      obj = yaml.parse(raw);
    } catch (e) {
      notify && notify("YAML Parse Error", e.message, false);
      throw e;
    }
  
    // 代理分组 - 使用 rules.js 中的配置
    for (const group of ProxyGroups) {
      const regex = new RegExp(group.regex.replace(/^\/|\/[a-z]*$/g, ''), 'i');
      addProxyGroupByRegex(regex, group.name, group.type, obj, group.exclude);
    }
  
    // 特殊分组
    for (const group of SpecialGroups) {
      if (!obj["proxy-groups"]) obj["proxy-groups"] = [];
      obj["proxy-groups"].unshift({
        name: group.name,
        type: group.type,
        proxies: group.proxies,
      });
    }
  
    // 规则集提供者
    const providers = getRuleProviders(rulerSetUrls);
    obj["rule-providers"] = { ...obj["rule-providers"], ...providers };
  
    // 自定义规则 - 使用 rules.js 中的配置
    const RuleCustom = [
      // 规则将在这里生成
    ];
    // Rule-Set: (White List) - 使用 rules.js 中的配置
    const RuleSets = [
      // 规则集将在这里生成
    ];
    
    // 更鲁棒的 target 提取，去除注释和多余空格
    function extractTarget(raw) {
      if (!raw) return null;
      const parts = raw.split(",");
      if (parts.length < 2) return null;
      return parts[1].split("//")[0].trim().toLowerCase();
    }
    // 收集所有 RuleCustom 中的 target（小写、去空格、去注释）
    const customDomainTargets = new Set(
      RuleCustom.map(rule => {
        const type = rule.split(",")[0].trim().toUpperCase();
        if (["DOMAIN", "DOMAIN-KEYWORD", "DOMAIN-SUFFIX"].includes(type)) {
          return extractTarget(rule);
        }
        return null;
      }).filter(Boolean)
    );
    // 过滤 RuleSets：只要是 RULE-SET,xxx,yyy 规则且 RuleCustom 有任意 target，直接移除该 RULE-SET
    const filteredRuleSets = RuleSets.filter(rule => {
      const parts = rule.split(",");
      if (parts.length < 3) return true;
      const type = parts[0].trim().toUpperCase();
      if (type === "RULE-SET") {
        // 只要 RuleCustom 有任意 target，移除所有 RULE-SET
        if (customDomainTargets.size > 0) {
          return false;
        }
      }
      // 其它本地规则照常去重
      if (["DOMAIN", "DOMAIN-KEYWORD", "DOMAIN-SUFFIX"].includes(type)) {
        const target = extractTarget(rule);
        return !customDomainTargets.has(target);
      }
      return true;
    });
    // 顺序调整：RuleCustom 在前，RuleSets 在后
    const _rule = [...RuleCustom, ...filteredRuleSets, ...(Array.isArray(obj.rules) ? obj.rules : [])];
    delete obj.rules;
    obj.rules = _rule;
    
  
    try {
      return yaml.stringify(obj);
    } catch (e) {
      notify && notify("YAML Stringify Error", e.message, false);
      throw e;
    }
  }; 

  // 导出配置供其他模块使用
  function getConfig() {
    return {
      // 代理组配置
      proxyGroups: ProxyGroups,
      // 特殊分组
      specialGroups: SpecialGroups,
      // 规则配置
      rules: {
        custom: RuleCustom,
        sets: RuleSets
      }
    };
  }

  module.exports = {
    parse: module.exports.parse,
    getConfig
  }; 