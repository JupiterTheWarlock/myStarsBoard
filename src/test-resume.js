import dotenv from 'dotenv';
import { generateTagsBatch } from './ai.js';
import { groupStarsByTag, saveTagsGrouped } from './tag.js';
import { generateMarkdown, saveReadme } from './readme.js';
import { loadStars } from './tag.js';

dotenv.config();

async function main() {
  try {
    console.log('📂 读取已保存的 Stars 数据...');
    const stars = await loadStars();
    console.log(`✅ 成功读取 ${stars.length} 个 Stars`);

    if (stars.length === 0) {
      console.log('❌ 没有找到 Stars 数据，请先运行主程序获取数据');
      return;
    }

    console.log('🚀 跳过 GitHub API 获取，直接进行标签生成...');
    console.log('🤖 开始生成标签（支持断点续传）...');
    console.log(`   模式: ${process.env.ENABLE_THINKING === 'true' ? 'Thinking模式' : '普通模式'}`);
    const starsWithTags = await generateTagsBatch(stars);
    console.log('✅ 标签生成完成');

    console.log('📊 按标签分组...');
    const groupedStars = groupStarsByTag(starsWithTags);
    const tagCount = Object.keys(groupedStars).length;
    console.log(`✅ 共生成 ${tagCount} 个标签`);

    console.log('💾 保存标签数据...');
    await saveTagsGrouped(groupedStars);
    console.log('✅ 标签数据已保存');

    console.log('📝 生成 README...');
    const username = process.env.GITHUB_USERNAME || 'user';
    const markdown = generateMarkdown(groupedStars, username);
    await saveReadme(markdown);
    console.log('✅ README 已更新');

    console.log('\n🎉 所有任务完成！');
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
