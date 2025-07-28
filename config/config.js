require('dotenv').config();

module.exports = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  GIST_ID_PARSER: process.env.GIST_ID_PARSER,
  GIST_FILENAME: 'parser.js',
  LOCAL_FILE: 'src/parser.js',
  // Shadowrocket Gist 配置
  GIST_ID_SHADOWROCKET: process.env.GIST_ID_SHADOWROCKET || 'e8f0ebb16fd0bcc173bfe082ca3543c0',
  SHADOWROCKET_GIST_FILENAME: 'shadowrocket',
  SHADOWROCKET_LOCAL_FILE: 'shadowrocket.conf'
}; 