import { fetchStars } from './github/index.js';
import { generateTagsBatch } from './ai/index.js';
import { saveStars, groupStarsByTag, saveTagsGrouped } from './tag/index.js';
import { generateEmbeddings } from './embedding/index.js';
import { config } from './config/index.js';

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  try {
    console.log('🚀 开始获取 GitHub Stars...');
    const stars = await fetchStars();
    console.log(`✅ 成功获取 ${stars.length} 个 Stars`);

    console.log('💾 缓存 Stars 数据...');
    await saveStars(stars);
    console.log('✅ Stars 数据已保存');

    console.log(`🤖 开始生成标签（${config.enableThinking ? '✓ Thinking模式' : '✗ 普通模式'}）...`);
    const starsWithTags = await generateTagsBatch(stars);
    console.log('✅ 标签生成完成');

    console.log('📊 按标签分组...');
    const groupedStars = groupStarsByTag(starsWithTags);
    const tagCount = Object.keys(groupedStars).length;
    console.log(`✅ 共生成 ${tagCount} 个标签`);

    console.log('💾 保存标签数据...');
    await saveTagsGrouped(groupedStars);
    console.log('✅ 标签数据已保存');

    console.log('📐 生成 Embedding...');
    await generateEmbeddings(starsWithTags);
    console.log('✅ Embedding 已保存');

    console.log('\n🎉 所有任务完成！');
  } catch (error) {
    console.error('❌ 错误:', (error as Error).message);
    process.exit(1);
  }
}

main();
