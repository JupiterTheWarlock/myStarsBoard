import dotenv from 'dotenv';
import { fetchStars } from './github.js';
import { generateTagsBatch } from './ai.js';
import { saveStars, groupStarsByTag, saveTagsGrouped } from './tag.js';
import { generateMarkdown, saveReadme } from './readme.js';

dotenv.config();

async function main() {
  try {
    console.log('🚀 开始获取 GitHub Stars...');
    const stars = await fetchStars();
    console.log(`✅ 成功获取 ${stars.length} 个 Stars`);

    console.log('💾 缓存 Stars 数据...');
    await saveStars(stars);
    console.log('✅ Stars 数据已保存');

    console.log(`🤖 开始生成标签（${ENABLE_THINKING ? '✓ Thinking模式' : '✗ 普通模式'}）...`);
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
    process.exit(1);
  }
}

main();
