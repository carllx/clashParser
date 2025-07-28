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
  
    // 代理分组
    addProxyGroupByRegex(/.*/i, "CUSTOMSELECT", "select", obj);
    addProxyGroupByRegex(/.*/i, "PROXY", "url-test", obj);
    addProxyGroupByRegex(/(香|hk|hong)/i, "Hong Kong", "url-test", obj);
    addProxyGroupByRegex(/(香|hk|hong)/i, "!HK", "url-test", obj, true);
    addProxyGroupByRegex(/(英|uk)/i, "autoUK", "url-test", obj);
    addProxyGroupByRegex(/(日|jp)/i, "AutoJP", "url-test", obj);
    addProxyGroupByRegex(/(us|美国)/i, "autoUS", "url-test", obj);
    addProxyGroupByRegex(/(us|美国)/i, "US", "select", obj);
  
    // Bing 分组
    if (!obj["proxy-groups"]) obj["proxy-groups"] = [];
    obj["proxy-groups"].unshift({
      name: "Bing",
      type: "select",
      proxies: ["autoUS", "US"],
    });
  
    // 规则集提供者
    const providers = getRuleProviders(rulerSetUrls);
    obj["rule-providers"] = { ...obj["rule-providers"], ...providers };
  
    // 自定义规则
    const RuleCustom = [
      /** 
       * how to set 
       * to DIRECT 198.18.0.1:52716 (TUN) 98.178.200.161:35547 C:\Program Files\Motrix\resources\engine\aria2c.exe
       * Source 198.18.0.1:49896 (TUN) Destination 45.131.145.18:11665
       * Source 198.18.0.1:55920 (TUN) Destination 185.197.120.147:11450 
       * Source 198.18.0.1:54029 (TUN) Destination 45.131.145.19:11733
       * Source 198.18.0.1:52695 (TUN) Destination 61.238.11.35:9976
      */
      "IP-CIDR,198.18.0.1/32,DIRECT",
      "IP-CIDR,45.131.145.0/24,DIRECT",
      "IP-CIDR,210.21.79.152/24,DIRECT", // 广州南方学院
      // "IP-CIDR,61.238.11.0/24,DIRECT", // pc motrix
      "DOMAIN-SUFFIX,cdn.pvvstream.pro,DIRECT",
      "DOMAIN-SUFFIX,oclc.org,DIRECT", // wos 文献虫 不能使用代理
      "DOMAIN-SUFFIX,unity3d.com,DIRECT", // Unity install
      "DOMAIN-SUFFIX,zb.caa.edu.cn,DIRECT",
      "DOMAIN-SUFFIX,derivative.ca,DIRECT",// TouchDesigner, Proxy模式无法访问
      "DOMAIN-SUFFIX,tuna.tsinghua.edu.cn,DIRECT",
      "DOMAIN-SUFFIX,baidu.com,DIRECT",
      "DOMAIN-SUFFIX,markji.com,DIRECT",
      // "DOMAIN-SUFFIX,baidupcs.com,DIRECT",
      "PROCESS-NAME,baidunetdiskhost.exe,DIRECT",
      "PROCESS-NAME,aria2c.exe,DIRECT",
      "PROCESS-NAME,VooV Meeting,DIRECT",
      "DOMAIN-SUFFIX,cloudflarestorage.com,DIRECT", // Ollama library models download
      "DOMAIN-SUFFIX,api2.cursor.sh,DIRECT", // Cursor 不需要代理, 尤其据说有些 MCP 无法访问
      "DOMAIN-SUFFIX,adobe.com,DIRECT",
      "DOMAIN-SUFFIX,oas.must.edu.mo,DIRECT",
      "DOMAIN-SUFFIX,jiumodiary.com,DIRECT",
      "DOMAIN-SUFFIX,researchrabbitapp.com,DIRECT",
      "DOMAIN-SUFFIX,sketchfab.com,DIRECT",
      "DOMAIN-SUFFIX,imgur.com,PROXY",
      "DOMAIN-SUFFIX,trafficmanager.net,DIRECT",
      "DOMAIN-SUFFIX,dingtalk.com,DIRECT",
      "DOMAIN-SUFFIX,apple.com,DIRECT",
      "DOMAIN-SUFFIX,easyscholar.cc,DIRECT",
      "DOMAIN-SUFFIX,kmf.com,DIRECT",
      "DOMAIN-SUFFIX,koolearn.com,DIRECT",
      "DOMAIN-SUFFIX,burningvocabulary.com,DIRECT",
      "PROCESS-NAME,DingTalk.app,DIRECT",
      "PROCESS-NAME,Dt WebView Helper.app,DIRECT",
      "DOMAIN-SUFFIX,ankiweb.net,DIRECT",
      "DOMAIN-SUFFIX,similarweb.com,DIRECT",
      "DOMAIN-SUFFIX,notion.so,DIRECT",
      "DOMAIN-SUFFIX,evernote.com,DIRECT",
      "DOMAIN-SUFFIX,sciencedirect.com,DIRECT",
      "DOMAIN-SUFFIX,strpst.com,DIRECT", // @
      "DOMAIN-SUFFIX,doppiocdn.org,DIRECT", // stripchat
      "DOMAIN-SUFFIX,doppiocdn.net,DIRECT", // stripchat
      "DOMAIN-SUFFIX,doppiocdn.com,DIRECT", // stripchat
      "DOMAIN-SUFFIX,ddoppiocdn.live,DIRECT", // stripchat
      "DOMAIN-SUFFIX,whoreshub.com/get_file,DIRECT", // whoreshub
      "DOMAIN-SUFFIX,h-cdn.com,DIRECT", // whoreshub
      "DOMAIN-SUFFIX,ptx.li,DIRECT", // whoreshub
      "DOMAIN-SUFFIX,getyarn.io,DIRECT", // 搜索视频资源
      "DOMAIN-SUFFIX,dmm.co.jp,AutoJP", // dmm/ maxjav
      "DOMAIN-SUFFIX,icloud-content.com,DIRECT", // keynote
      "DOMAIN-SUFFIX,ngrok-free.app,DIRECT", // 服务器外网穿透
      "DOMAIN-SUFFIX,ngrok.com,DIRECT", // 服务器外网穿透
      "DOMAIN-SUFFIX,freemdict.com,DIRECT", // 字典搭配
      "DOMAIN-SUFFIX,ydstatic.com,DIRECT", // 字典
      "DOMAIN-SUFFIX,youdao.com,DIRECT", // 字典
      "DOMAIN-SUFFIX,conn.voovmeeting.com,DIRECT", // 腾讯会议
      "DOMAIN-SUFFIX,ltlogo.top,DIRECT", // 知网
      "DOMAIN-SUFFIX,hccck.com,DIRECT", // 知网
      "DOMAIN-SUFFIX,aaaib.top,DIRECT", // 知网
      "DOMAIN-SUFFIX,cnki.net,DIRECT", // 知网
      "DOMAIN-SUFFIX,gaoxiaojob.com,DIRECT", // 高校人才网
      "DOMAIN-SUFFIX,cqvip.com,DIRECT", // 维普
      "DOMAIN-SUFFIX,nfu.edu.cn,DIRECT", // 广州南方学院系统
      "DOMAIN-SUFFIX,momot.rs,DIRECT", // Anna achive
      "DOMAIN-SUFFIX,cdn.auth0.com,Bing", // A.I
      "DOMAIN-SUFFIX,bingapis.com,Bing",
      "DOMAIN-SUFFIX,challenges.cloudflare.com,Bing",
      "DOMAIN-SUFFIX,identrust.com,Bing",
      // OpenAI-Main domain
      "DOMAIN-SUFFIX,openai.com,Bing",
      "DOMAIN-SUFFIX,oaistatic.com,Bing",
      // OpenAI-CDN & API
      "DOMAIN-SUFFIX,chat.openai.com.cdn.cloudflare.net,Bing",
      "DOMAIN-SUFFIX,chatgpt.com,Bing",
      "DOMAIN-SUFFIX,openaiapi-site.azureedge.net,Bing",
      "DOMAIN-SUFFIX,openaicom-api-bdcpf8c6d2e9atf6.z01.azurefd.net,Bing",
      "DOMAIN-SUFFIX,openaicomproductionae4b.blob.core.windows.net,Bing",
      "DOMAIN-SUFFIX,production-openaicom-storage.azureedge.net,Bing",
      // OpenAI-tracking
      "DOMAIN-SUFFIX,o33249.ingest.sentry.io,Bing",
      "DOMAIN-SUFFIX,openaicom.imgix.net,Bing",
      "DOMAIN-SUFFIX,anthropic.com,autoUS",// Claude
      "DOMAIN-SUFFIX,claude.ai,autoUS", // Claude
      "DOMAIN-SUFFIX,usefathom.com,autoUS", // Claude
      "DOMAIN-SUFFIX,intercom.io,autoUS", // Claude
      "DOMAIN-SUFFIX,intercomcdn.com,autoUS", // Claude
      "DOMAIN-SUFFIX,maxai.me,autoUS", // Maxai
      "DOMAIN-SUFFIX,icbc.com.cn,DIRECT", // icbc
      "DOMAIN-SUFFIX,gzarts.edu.cn,DIRECT", // 广美
      "DOMAIN-SUFFIX,cityu.edu.mo,DIRECT", // 澳门城市大学 
      "DOMAIN-SUFFIX,bing.com,autoUS",
      "DOMAIN-SUFFIX,moonshot.cn,DIRECT",
      "DOMAIN-SUFFIX,khanacademy.org,autoUS", // 可汗学院AI 测试只支持US
      "DOMAIN-SUFFIX,deepl.com,autoUS", // 可汗学院AI 测试只支持US
      "DOMAIN-SUFFIX,ximalaya.com,DIRECT", // 喜马拉雅
      "DOMAIN-SUFFIX,chatanywhere.com,DIRECT", // Openai api 优惠
      "DOMAIN-SUFFIX,chatanywhere.cn, PROXY", // Openai api 优惠
      "DOMAIN-SUFFIX,ximalaya.com,DIRECT", // 喜马拉雅
      "DOMAIN-SUFFIX,elevenlabs.io,CUSTOMSELECT", // TTS.elevenlabs
      "DOMAIN-SUFFIX,cambly.com,DIRECT", // cambly
      "DOMAIN-SUFFIX,cloudfront.net,DIRECT", // cambly
      // https://camblyavatars.s3.amazonaws.com/580f86e30bb83a002e0b868ds200.jpg
      "DOMAIN-SUFFIX,amazonaws.com,DIRECT", // cambly // kimi upload
      "DOMAIN-SUFFIX,maxaistorage.s3.amazonaws.com,PROXY", // cambly // kimi upload
      "DOMAIN-SUFFIX,trancy.org,DIRECT", // trancy
      "DOMAIN-SUFFIX,gdghospital.org,DIRECT", // gdghospital
      "DOMAIN-SUFFIX,spotifycdn.com,!HK", // Spotify
      "DOMAIN-SUFFIX,spotify.com,!HK", // Spotify
      "DOMAIN-SUFFIX,audio-ak-spotify-com.akamaized.net,!HK", // Spotify
      
      // AI 服务域名 - 使用 autoUS 代理
      "DOMAIN-SUFFIX,ai.google.dev,autoUS", // Google AI
      "DOMAIN-SUFFIX,alkalicore-pa.clients6.google.com,autoUS", // Google AI Core
      "DOMAIN-SUFFIX,api.github.com,autoUS", // GitHub API
      "DOMAIN-SUFFIX,file.oaiusercontent.com,autoUS", // OpenAI File Service
      "DOMAIN-SUFFIX,gateway.ai.cloudflare.com,autoUS", // Cloudflare AI Gateway
      "DOMAIN-SUFFIX,jules.google.com,autoUS", // Google Jules AI
      "DOMAIN-SUFFIX,ai.com,autoUS", // AI.com
      "DOMAIN-SUFFIX,aistudio.google.com,autoUS", // Google AI Studio
      "DOMAIN-SUFFIX,anthropic.com,autoUS", // Claude AI
      "DOMAIN-SUFFIX,bard.google.com,autoUS", // Google GoogleGemini
      "DOMAIN-SUFFIX,chat.com,autoUS", // Chat.com
      "DOMAIN-SUFFIX,chatgpt.com,autoUS", // ChatGPT
      "DOMAIN-SUFFIX,claude.ai,autoUS", // Claude AI
      "DOMAIN-SUFFIX,clipdrop.co,autoUS", // Clipdrop AI
      "DOMAIN-SUFFIX,deepmind.com,autoUS", // DeepMind
      "DOMAIN-SUFFIX,deepmind.google,autoUS", // DeepMind Google
      "DOMAIN-SUFFIX,dify.ai,autoUS", // Dify AI
      "DOMAIN-SUFFIX,grok.com,autoUS", // Grok AI
      "DOMAIN-SUFFIX,groq.com,autoUS", // Groq AI
      "DOMAIN-SUFFIX,jasper.ai,autoUS", // Jasper AI
      "DOMAIN-SUFFIX,makersuite.google.com,autoUS", // Google MakerSuite
      "DOMAIN-SUFFIX,meta.ai,autoUS", // Meta AI
      "DOMAIN-SUFFIX,oaistatic.com,autoUS", // OpenAI Static
      "DOMAIN-SUFFIX,openart.ai,autoUS", // OpenArt AI
      "DOMAIN-SUFFIX,perplexity.ai,autoUS", // Perplexity AI
      "DOMAIN-SUFFIX,poe.com,autoUS", // Poe AI
      "DOMAIN-SUFFIX,sora.com,autoUS", // Sora AI
      "DOMAIN-SUFFIX,x.ai,autoUS", // xAI
      "DOMAIN-KEYWORD,openai,autoUS", // OpenAI Keyword
      "DOMAIN-KEYWORD,carllx.com,DIRECT", // OpenAI Keyword
      // Google AI
      "DOMAIN-SUFFIX,proactivebackend-pa.googleapis.com,autoUS", // Google Proactive Backend
      "DOMAIN-KEYWORD,alkalimakersuite-pa.clients6.google.com,autoUS", // Google AI MakerSuite
      "DOMAIN-KEYWORD,alkalimakersuite-pa.clients2.google.com,autoUS", // Google AI MakerSuite
      // "DOMAIN-SUFFIX,labs.google,autoUS", // Google Whisk
      // "DOMAIN-SUFFIX,dl.google.com,PROXY",
      "DOMAIN-SUFFIX,gemini.google.com,autoUS", // Google Gemini
      "DOMAIN-SUFFIX,generativeai.google,autoUS", // Google Generative AI
      "DOMAIN-SUFFIX,geller-pa.googleapis.com,autoUS", // Google AI API
      "DOMAIN-SUFFIX,generativelanguage.googleapis.com,autoUS", // Google Generative Language API
      // "DOMAIN,gstatic.com,autoUS", 
      // "DOMAIN,googletagmanager.com,autoUS", // GoogleGemini
      // "DOMAIN,googleusercontent.com,autoUS", // GoogleGemini
      "DOMAIN,waa-pa.clients6.google.com,autoUS", // GoogleGemini
      "DOMAIN,aistudio.google.com,autoUS", // AI Studio Google
      "DOMAIN,notebooklm.google.com,autoUS", // Google Learn
      "DOMAIN,notebooklm.google,autoUS", // Google Learn
      "DOMAIN,learning.google.com,autoUS", // Google Learn About
      // "DOMAIN,alkalimakersuite-pa.clients6.google.com,autoUS", // AI Studio Google (冗余，已被 DOMAIN-KEYWORD 覆盖)
    ];
    // Rule-Set: (White List)
    // (`Loyalsoldier/clash-rules: Clash Premium(RULE-SET)` [github](https://github.com/Loyalsoldier/clash-rules))
    const RuleSets = [
      "RULE-SET,applications,DIRECT",
      "DOMAIN,clash.razord.top,DIRECT",
      "DOMAIN,yacd.haishan.me,DIRECT",
      "RULE-SET,private,DIRECT",
      "RULE-SET,reject,REJECT",
      "RULE-SET,icloud,DIRECT",
      "RULE-SET,apple,DIRECT",
      // "RULE-SET,google,DIRECT",
      "RULE-SET,proxy,PROXY",
      "RULE-SET,direct,DIRECT",
      "RULE-SET,lancidr,DIRECT",
      "RULE-SET,cncidr,DIRECT",
      "RULE-SET,telegramcidr,PROXY",
      "GEOIP,LAN,DIRECT",
      "GEOIP,CN,DIRECT",
      "MATCH,PROXY",
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