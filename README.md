# ClashParser

一个基于 Node.js 的 Clash 配置解析器，支持自动生成 Shadowrocket 规则并上传到 GitHub Gist。

## 🏗️ 项目架构

```
src/
├── rules.js                           # 规则配置文件（主要维护对象）
├── rule-manager.js                    # 规则管理工具
├── parser.js                          # 核心解析逻辑（模板）
├── parser-generator.js                # 独立 parser.js 生成器
├── shadowrocket-config-generator.js   # Shadowrocket 配置生成器
├── shadowrocket-rules-generator.js    # 主脚本（生成+上传）
├── uploadGist.js                      # parser.js 上传工具
└── upload-all.js                      # 组合上传脚本
```

## 🚀 快速开始

### 1. 环境配置

创建 `.env` 文件：

```bash
# GitHub Token (需要 gist 权限)
GITHUB_TOKEN=your_github_token_here

# parser.js 上传配置
GIST_ID_PARSER=xxxxxxxxxxxx

# Shadowrocket 规则上传配置
GIST_ID_SHADOWROCKET=xxxxxxxxxxxxx
```

### 2. 安装依赖

```bash
npm install
```

## 📋 使用说明

### 规则管理

```bash
# 查看规则管理帮助
npm run rule:help

# 列出所有规则
npm run rule:list

# 添加新规则
npm run rule:add "DOMAIN-SUFFIX,example.com,autoUS" "示例规则"

# 搜索规则
npm run rule:search "google"

# 删除规则
npm run rule:remove "example.com"
```

### 配置上传

```bash
# 生成独立的 parser.js 并上传
npm run generate-parser

# 只生成并上传 Shadowrocket 规则
npm run generate-rules

# 同时上传所有配置（推荐）
npm run upload-all
```

## 📁 文件说明

### 核心文件

- **`src/rules.js`** - 规则配置文件（主要维护对象）
  - `RuleCustom` - 自定义规则数组
  - `RuleSets` - 系统规则数组
  - `ProxyGroups` - 代理组配置
  - `SpecialGroups` - 特殊分组配置

- **`src/parser.js`** - 核心解析逻辑（模板）
  - 包含占位符，供生成器替换
  - 处理 Clash 配置
  - 应用规则和代理组

- **`src/parser-generator.js`** - 独立 parser.js 生成器
  - 从 `rules.js` 读取规则配置
  - 生成独立的、可上传的 `parser.js`
  - 自动上传到 GitHub Gist

### 生成器文件

- **`src/shadowrocket-config-generator.js`** - Shadowrocket 配置生成器
  - 从 `parser.js` 提取规则和代理组
  - 生成 Shadowrocket 格式的配置

- **`src/shadowrocket-rules-generator.js`** - 主脚本
  - 调用配置生成器
  - 保存到本地文件
  - 上传到 GitHub Gist

### 上传工具

- **`src/uploadGist.js`** - parser.js 上传工具
- **`src/upload-all.js`** - 组合上传脚本

## 🔧 规则格式

### 规则类型

```bash
DOMAIN-SUFFIX,域名,代理组      # 域名后缀匹配
DOMAIN-KEYWORD,关键词,代理组    # 域名关键词匹配
DOMAIN,域名,代理组             # 精确域名匹配
IP-CIDR,IP段,代理组           # IP 段匹配
PROCESS-NAME,进程名,代理组     # 进程名匹配
```

### 代理组选项

```bash
DIRECT    - 直连
PROXY     - 代理
autoUS    - 美国节点
autoUK    - 英国节点
AutoJP    - 日本节点
Hong Kong - 香港节点
!HK       - 非香港节点
Bing      - Bing搜索
```

## 📤 上传目标

### parser.js 上传
- **Gist ID**: `f49aaa6362feaa36270e66f604808c50`
- **文件名**: `parser.js`
- **内容**: 独立的 Clash 解析器逻辑（包含所有规则）

### Shadowrocket 规则上传
- **Gist ID**: `e8f0ebb16fd0bcc173bfe082ca3543c0`
- **文件名**: `shadowrocket`
- **内容**: 纯规则配置（不包含敏感节点信息）

## 🔄 工作流程

1. **规则维护**: 使用 `npm run rule:*` 命令管理规则
2. **配置生成**: 
   - `npm run generate-parser` 生成独立的 parser.js
   - `npm run generate-rules` 生成 Shadowrocket 规则
3. **自动上传**: `npm run upload-all` 同时上传所有配置
4. **Clash 使用**: 在 Clash 中配置 parser.js 的 Gist URL
5. **Shadowrocket 使用**: 在 Shadowrocket 中导入生成的规则文件

## 🛡️ 安全说明

- 生成的 Shadowrocket 规则**不包含**敏感节点信息
- 机场订阅在 Shadowrocket 应用中单独配置
- 规则文件只包含分流规则和代理组定义
- 所有敏感配置都存储在 `.env` 文件中（已加入 .gitignore）

## 📝 开发说明

### 添加新规则

1. 使用命令行工具：
   ```bash
   npm run rule:add "DOMAIN-SUFFIX,newsite.com,autoUS" "新网站"
   ```

2. 或直接编辑 `src/rules.js`：
   ```javascript
   const RuleCustom = [
     // 现有规则...
     "DOMAIN-SUFFIX,newsite.com,autoUS", // 新网站
   ];
   ```

### 修改代理组

编辑 `src/rules.js` 中的 `ProxyGroups` 和 `SpecialGroups` 数组。

### 架构优势

- **一处修改，动态生成**: 所有规则在 `rules.js` 中维护
- **独立文件**: 生成的 `parser.js` 不依赖外部文件
- **易于维护**: 规则管理工具简化操作
- **自动上传**: 一键生成并上传所有配置

## 🔗 相关链接

- [Clash 官方文档](https://github.com/Dreamacro/clash)
- [Shadowrocket 配置说明](https://github.com/blackmatrix7/ios_rule_script)
- [Loyalsoldier Clash Rules](https://github.com/Loyalsoldier/clash-rules) 