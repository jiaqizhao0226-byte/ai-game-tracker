#!/usr/bin/env node
/**
 * Data structure migration script
 * - Normalizes status field (10 variants -> 5 standard values)
 * - Splits funding_round into funding_round + funding_amount + funding_detail
 * - Adds platform field (extracted from tags/url/status/description)
 * - Adds launch_date field (where determinable)
 *
 * Run: node scripts/migrate_data_structure.js
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// --- 1. Status normalization ---
const statusMap = {
  '已上线': '已上线',
  '已上线 (Steam)': '已上线',
  '测试中': '测试中',
  '测试中 (Early Access)': '测试中',
  '研发中': '研发中',
  '早期/原型': '早期·原型',
  '原型/Demo': '早期·原型',
  '早期': '早期·原型',
  'Demo测试': '测试中',
  '未知': '未知',
};

// --- 2. Funding round split ---
function splitFunding(raw) {
  if (!raw || raw === '未知') return { funding_round: '未知', funding_amount: '', funding_detail: '' };

  // Extract content in parentheses
  const match = raw.match(/^(.+?)\s*\((.+)\)$/);
  const baseRound = match ? match[1].trim() : raw;
  const parenContent = match ? match[2].trim() : '';

  // Normalize round name
  let round = baseRound;
  if (baseRound === '种子轮') round = '天使/种子轮';
  if (baseRound === '大厂支持') round = '大厂内部孵化';

  // Try to extract amount and detail from paren content
  let amount = '';
  let detail = '';
  if (parenContent) {
    // Check if it starts with $ or contains amount patterns
    const amountMatch = parenContent.match(/\$[\d.]+[亿万WwM]?/);
    if (amountMatch) {
      amount = amountMatch[0];
    }
    // Rest is detail (after removing amount)
    let rest = parenContent;
    if (amount) {
      rest = parenContent.replace(amountMatch[0], '').replace(/^[\s,，]+/, '').replace(/[\s,，]+$/, '');
    }
    detail = rest;
  }

  return { funding_round: round, funding_amount: amount, funding_detail: detail };
}

// --- 3. Platform extraction ---
function inferPlatform(game) {
  const url = (game.url || '').toLowerCase();
  const tags = (game.tags || '').toLowerCase();
  const desc = (game.description || '').toLowerCase();
  const status = (game.status || '').toLowerCase();
  const name = (game.product_name || '').toLowerCase();

  // Steam (check URL first, then tags, then description)
  if (url.includes('store.steampowered.com')) return 'Steam';
  if (status.includes('steam') || status.includes('early access')) return 'Steam';
  if (tags.includes('steam')) return 'Steam';
  if (desc.includes('steam上架') || desc.includes('steam特别好评') || desc.includes('steam上线') || desc.includes('上线steam')) return 'Steam';

  // Apple App Store
  if (url.includes('apps.apple.com')) return '移动端';

  // Desktop apps (桌面宠物/桌面端)
  if (tags.includes('桌面宠') || tags.includes('桌面宠物')) return '桌面端';
  if (desc.includes('桌面端') || desc.includes('桌面ai') || desc.includes('桌面ai陪伴')) return '桌面端';

  // Web games
  if (tags.includes('网页游戏') || tags.includes('discord')) return '网页';
  if (desc.includes('网页游戏') || desc.includes('web游戏')) return '网页';

  // Mobile games
  if (name.includes('手游')) return '移动端';
  if (desc.includes('手游') && !desc.includes('pc')) return '移动端';
  if (tags.includes('pc端')) return 'PC';
  if (url.includes('m.yjwujian') || url.includes('news.4399')) return '移动端';

  // AI companion apps (typically mobile)
  const companionApps = ['星野', 'Talkie', 'Character.AI', 'LoveyDovey', '月匣', '无限谷', 'EVE AI', '如意情探', '星眠', 'Pengu', 'AI2U', 'Tolan'];
  if (companionApps.includes(game.product_name)) {
    // Some might be web too; check if it has a web platform URL
    if (url.includes('character.ai') || url.includes('xingyeai.com')) return '多平台';
    return '移动端';
  }

  // Suck Up! is a web game
  if (game.product_name === 'Suck Up!') return '网页';

  // Astrocade is a web UGC platform
  if (game.product_name === 'Astrocade') return '网页';

  // Public Eye is a web game
  if (game.product_name === 'Public Eye') return '网页';

  // Big games that are multi-platform
  const multiPlatform = ['Fortnite AI维达', '王者荣耀', '三角洲行动 (CC)', '逆水寒 AI剧组模式', '帕姆问问 (崩坏：星穹铁道)', 'PUBG Ally', 'Altera Bots', '妹居物语'];
  if (multiPlatform.includes(game.product_name)) return '多平台';

  // Death by AI - Discord + web
  if (game.product_name === 'Death by AI') return '网页';

  // 桌崽AI - desktop companion
  if (game.product_name === '桌崽AI') return '桌面端';

  // 逗逗游戏伙伴 - desktop companion
  if (game.product_name === '逗逗游戏伙伴') return '桌面端';

  // 织之&镜土 - online app + offline stores
  if (game.product_name === '织之&镜土 AI+TRPG') return '多平台';

  // Iconic - on-device (mobile)
  if (game.product_name === 'Iconic') return '移动端';

  return '未知';
}

// --- 4. Launch date extraction ---
function inferLaunchDate(game) {
  const desc = game.description || '';
  const intro = game.product_intro || '';

  // Whispers from the Star - "2025年3月推出"
  if (game.product_name === 'Whispers from the Star') return '2025-03';
  // AI創作呪文 - "2025年8月发布"
  if (game.product_name === 'AI創作呪文') return '2025-08';
  // 像素梦工厂 - "2026年Q1计划上线"
  if (game.product_name === '像素梦工厂') return '2026-Q1';
  // 如意情探 - "2025年11月开启内测"
  if (game.product_name === '如意情探') return '2025-11';
  // 帕姆问问 - 4.2版本 (崩坏星穹铁道)
  if (game.product_name === '帕姆问问 (崩坏：星穹铁道)') return '2026-Q2';

  // Try to extract from description patterns
  const patterns = [
    /(\d{4})年(\d{1,2})月.*?(上线|发布|推出|开测|内测|公测)/,
    /(\d{4})年\s*[Qq]([1-4]).*?(上线|发布|推出)/,
  ];

  for (const p of patterns) {
    const m = desc.match(p) || intro.match(p);
    if (m) {
      if (m[2] && m[2].length <= 2) {
        return `${m[1]}-${m[2].padStart(2, '0')}`;
      } else if (m[2] && m[2].match(/^[1-4]$/)) {
        return `${m[1]}-Q${m[2]}`;
      }
    }
  }

  return '';
}

// --- Apply migrations ---
data.games = data.games.map(game => {
  // 1. Normalize status
  const oldStatus = game.status;
  const newStatus = statusMap[oldStatus] || '未知';

  // 2. Split funding
  const funding = splitFunding(game.funding_round);

  // 3. Infer platform
  const platform = inferPlatform(game);

  // 4. Infer launch date
  const launch_date = inferLaunchDate(game);

  return {
    ...game,
    status: newStatus,
    funding_round: funding.funding_round,
    funding_amount: funding.funding_amount,
    funding_detail: funding.funding_detail,
    platform,
    launch_date,
  };
});

// Write back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

// Summary
console.log('=== Migration complete ===');
console.log(`Games: ${data.games.length}`);

const statusCount = {};
data.games.forEach(g => { statusCount[g.status] = (statusCount[g.status] || 0) + 1; });
console.log('\nStatus distribution:', statusCount);

const platformCount = {};
data.games.forEach(g => { platformCount[g.platform] = (platformCount[g.platform] || 0) + 1; });
console.log('Platform distribution:', platformCount);

const fundCount = {};
data.games.forEach(g => { fundCount[g.funding_round] = (fundCount[g.funding_round] || 0) + 1; });
console.log('Funding round distribution:', fundCount);

const withAmount = data.games.filter(g => g.funding_amount).length;
const withDetail = data.games.filter(g => g.funding_detail).length;
const withLaunchDate = data.games.filter(g => g.launch_date).length;
console.log(`\nWith funding_amount: ${withAmount}`);
console.log(`With funding_detail: ${withDetail}`);
console.log(`With launch_date: ${withLaunchDate}`);
