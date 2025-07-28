const { generateAndUploadParser } = require('./parser-generator');
const { generateAndUploadRules } = require('./shadowrocket-rules-generator');

/**
 * 上传所有配置到 Gist
 */
async function uploadAll() {
  console.log('🚀 开始上传所有配置...\n');

  try {
    // 1. 生成并上传独立的 parser.js
    console.log('📤 生成并上传 parser.js 到 Gist...');
    await generateAndUploadParser();
    console.log('✅ parser.js 上传完成\n');

    // 2. 生成并上传 Shadowrocket 规则
    console.log('📤 生成并上传 Shadowrocket 规则...');
    await generateAndUploadRules();
    console.log('✅ Shadowrocket 规则上传完成\n');

    console.log('🎉 所有配置上传完成！');
    console.log('📋 上传摘要:');
    console.log('  - parser.js → https://gist.github.com/carllx/f49aaa6362feaa36270e66f604808c50');
    console.log('  - shadowrocket → https://gist.github.com/carllx/e8f0ebb16fd0bcc173bfe082ca3543c0');

  } catch (error) {
    console.error('❌ 上传过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  uploadAll();
}

module.exports = {
  uploadAll
}; 