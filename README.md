# clashParser (Node.js 现代架构)

## 功能
- 自动生成 Clash 规则配置（parser.js）
- 支持自定义规则、分组、去重等高级逻辑
- 一键自动上传 parser.js 到指定 Gist

## 目录结构
```
clashParser/
├── src/
│   ├── parser.js         # 主要解析和生成逻辑（唯一主文件）
│   └── uploadGist.js     # Gist 自动上传脚本
├── config/
│   └── config.js         # 配置项（读取 .env）
├── .env                  # 环境变量（GITHUB_TOKEN, GIST_ID）
├── package.json
├── README.md
└── .gitignore
```

## 使用方法

1. 安装依赖
   ```sh
   npm install
   ```
2. 创建并配置 .env 文件（需包含 GITHUB_TOKEN 和 GIST_ID，GIST_ID 只填 ID 部分）
   - 在项目根目录下新建 `.env` 文件，内容如下：
     ```env
     GITHUB_TOKEN=你的github_token
     GIST_ID=你的gistid（如：f49aaa6362feaa36270e66f604808c50）
     ```
   - 注意事项：
     - GITHUB_TOKEN 必须有 gist 权限（建议 classic token，勾选 gist）
     - GIST_ID 只填 Gist 的 ID，不要填完整 URL
     - .env 文件不要上传到公开仓库
3. 修改 src/parser.js（所有业务逻辑均在此文件）
4. 上传到 Gist:
   ```sh
   npm run upload-gist
   ```
   - 终端提示 `Gist updated successfully!` 即为成功
   - Gist 页面内容会同步更新

## 注意事项
- GIST_ID 必须是你有编辑权限的 Gist（建议用自己的账号新建 Gist）
- GITHUB_TOKEN 必须有 gist 权限
- parser.js 是唯一主逻辑文件，所有规则和处理都集中于此

## 自动化
- 可结合 git hook 或 CI 自动上传
- 例如 post-commit 钩子：
  ```sh
  echo "npm run upload-gist" > .git/hooks/post-commit
  chmod +x .git/hooks/post-commit
  ```

## 贡献
欢迎 PR 和 issue！ 