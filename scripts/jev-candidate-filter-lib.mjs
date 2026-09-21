import { createHash } from 'node:crypto';

export const EVENT_TYPES = {
  new_product: '首次出现、首次公开或新产品进入可验证阶段',
  funding_or_acquisition: '融资、投资、并购或所有权变化',
  shutdown_or_delisting: '停止运营、终止开发、关闭服务或大范围下架',
  core_product_change: '核心玩法、商业模式、产品定位或关键技术路线发生实质变化',
  major_metric: '用户、收入、留存、愿望单等具有判断价值的重大数据',
  team_or_ownership_change: '创始人、核心负责人、团队结构或控制权出现重要变化',
  compliance_or_trust: '监管、版权、安全、内容治理、虚假宣传或信任事件',
  routine_release_or_marketing: '普通上线、版本更新、Demo、预约、展会或营销信息',
  article_or_opinion: '评论、观点、盘点或没有新增可验证事实的文章',
  other_or_unclear: '不属于以上类型，或现有材料不足以判断',
};

export const SCORE_LEVELS = {
  novelty_to_tracker: [
    'No new fact: the same event or claim is already in the tracker.',
    'Minor detail or routine confirmation about an already known fact.',
    'A materially new fact about a known product, team, financing, or performance.',
    'A genuinely new product or a previously unknown major event.',
  ],
  change_materiality: [
    'No meaningful change, commentary only, or cosmetic information.',
    'Routine release, small update, or additional detail without strategic impact.',
    'Meaningful change to product state, team, financing, metrics, or availability.',
    'Structural or terminal change such as shutdown, acquisition, core gameplay shift, or serious compliance event.',
  ],
  market_scope: [
    'Relevant only as a minor detail for one record.',
    'Useful for understanding one product but unlikely to affect category judgment.',
    'Strong reference case for several products or a meaningful category signal.',
    'Potentially changes the tracker\'s broader view of the AI plus games market.',
  ],
};

export const SOURCE_TYPES = new Set([
  'official_self_disclosure',
  'independent_primary_record',
  'independent_reporting',
  'secondary_commentary',
  'unknown',
]);

export function normalizeText(value = '') {
  return String(value)
    .normalize('NFKC')
    .toLocaleLowerCase('zh-CN')
    .replace(/[\s\p{P}\p{S}]+/gu, '');
}

export function normalizeUrl(value = '') {
  if (!value) return '';
  try {
    const url = new URL(value);
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|spm$|from$|source$|fbclid$|gclid$)/i.test(key)) {
        url.searchParams.delete(key);
      }
    }
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    return `${url.hostname.toLowerCase()}${pathname}${url.search}`;
  } catch {
    return String(value).trim().replace(/\/+$/, '').toLowerCase();
  }
}

export function contentHash(value = '') {
  return value ? createHash('sha256').update(String(value).trim()).digest('hex') : '';
}

function tokenSet(value = '') {
  return new Set(
    String(value)
      .normalize('NFKC')
      .toLocaleLowerCase('zh-CN')
      .split(/[\s/|·:：,，()（）【】\[\]"“”'‘’_-]+/u)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2),
  );
}

function jaccard(left, right) {
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  for (const token of left) if (right.has(token)) intersection += 1;
  return intersection / (left.size + right.size - intersection);
}

export function indexExistingData(data) {
  const eventsByGame = new Map();
  for (const event of data.events ?? []) {
    const list = eventsByGame.get(event.game_id) ?? [];
    list.push(event);
    eventsByGame.set(event.game_id, list);
  }

  return (data.games ?? []).map((game) => ({
    id: game.id,
    product_name: game.product_name ?? '',
    company_name: game.company_name ?? '',
    aliases: Array.isArray(game.aliases) ? game.aliases : [],
    url: game.url ?? '',
    status: game.status ?? '未知',
    updated_at: game.updated_at ?? '',
    description: game.description ?? '',
    funding_detail: game.funding_detail ?? '',
    team_background: game.team_background ?? '',
    recent_events: (eventsByGame.get(game.id) ?? []).slice(-8).map((event) => ({
      event_type: event.event_type,
      event_date: event.event_date,
      content: event.content,
    })),
  }));
}

export function rankExistingCandidates(incoming, records, limit = 5) {
  const name = normalizeText(incoming.product_name);
  const company = normalizeText(incoming.company_name);
  const sourceUrl = normalizeUrl(incoming.source_url);
  const incomingTokens = tokenSet(`${incoming.product_name ?? ''} ${incoming.company_name ?? ''}`);

  return records
    .map((record) => {
      const names = [record.product_name, ...(record.aliases ?? [])].map(normalizeText).filter(Boolean);
      const exactName = Boolean(name && names.includes(name));
      const exactCompany = Boolean(company && company === normalizeText(record.company_name));
      const exactUrl = Boolean(sourceUrl && sourceUrl === normalizeUrl(record.url));
      const tokenSimilarity = jaccard(
        incomingTokens,
        tokenSet(`${record.product_name ?? ''} ${record.company_name ?? ''} ${(record.aliases ?? []).join(' ')}`),
      );
      const score = Math.min(
        1,
        (exactUrl ? 1 : 0) + (exactName ? 0.8 : 0) + (exactCompany ? 0.12 : 0) + tokenSimilarity * 0.35,
      );
      return { record, score, exactName, exactCompany, exactUrl, tokenSimilarity };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.record.id - a.record.id)
    .slice(0, limit);
}

export function inspectDeterministicSignals(incoming, rankedCandidates) {
  const incomingHash = incoming.content_hash || contentHash(incoming.content);
  const matchingUrl = rankedCandidates.find((item) => item.exactUrl);
  const matchingHash = rankedCandidates.find((item) =>
    incomingHash && (item.record.recent_events ?? []).some((event) => contentHash(event.content) === incomingHash),
  );
  const top = rankedCandidates[0] ?? null;
  const second = rankedCandidates[1] ?? null;

  return {
    exact_url_duplicate: Boolean(matchingUrl),
    exact_content_duplicate: Boolean(matchingHash),
    exact_duplicate: Boolean(matchingUrl || matchingHash),
    top_candidate_id: top?.record.id ?? null,
    top_candidate_score: top?.score ?? 0,
    ambiguous_shortlist: Boolean(top && second && top.score - second.score < 0.08),
  };
}

export function buildState(incoming, rankedCandidates, policyVersion = '2026-09-poc1') {
  const top = rankedCandidates[0]?.record ?? null;
  return {
    incoming: {
      title: incoming.title ?? '',
      product_name: incoming.product_name ?? '',
      company_name: incoming.company_name ?? '',
      source_url: incoming.source_url ?? '',
      source_type: SOURCE_TYPES.has(incoming.source_type) ? incoming.source_type : 'unknown',
      published_at: incoming.published_at ?? '',
      primary_claim: incoming.primary_claim ?? '',
      content: incoming.content ?? '',
      independent_sources: incoming.independent_sources ?? [],
    },
    existing_candidate: top,
    policy: {
      version: policyVersion,
      ordinary_launch_is_not_monthly_by_default: true,
      priority_events: [
        'shutdown_or_delisting',
        'core_product_change',
        'major_metric',
        'team_or_ownership_change',
        'compliance_or_trust',
      ],
      final_publication_requires_user_confirmation: true,
    },
  };
}

export function buildQuestions({ choice, noul, score }) {
  return {
    record_relation: choice(
      'Compare `incoming` with `existing_candidate`. What is their relationship? Treat a later change about the same product as a new event, not a duplicate.',
      {
        same_event_duplicate: 'The incoming material repeats the same already-recorded event or claim.',
        new_event_same_product: 'It concerns the same product but contains a genuinely new event or material fact.',
        different_product_or_entity: 'It concerns a different product or entity.',
        unclear: 'The supplied material is insufficient or internally ambiguous.',
      },
    ),
    event_type: choice('What is the primary event described by `incoming`?', EVENT_TYPES),
    novelty_to_tracker: score(
      'How new is the information in `incoming` relative to `existing_candidate`?',
      SCORE_LEVELS.novelty_to_tracker,
    ),
    change_materiality: score(
      'How materially does the event in `incoming` change the tracked product, company, or market state?',
      SCORE_LEVELS.change_materiality,
    ),
    market_scope: score(
      'How broadly useful is this event for understanding AI plus games beyond a minor record detail?',
      SCORE_LEVELS.market_scope,
    ),
    source_support: choice(
      'How does the supplied `incoming.content` support `incoming.primary_claim`? Judge only the supplied text, not outside knowledge.',
      {
        supports: 'The text directly states or clearly entails the primary claim.',
        contradicts: 'The text states or clearly entails the opposite of the primary claim.',
        says_nothing: 'The text does not address the primary claim.',
        mixed_or_unclear: 'The text provides mixed, conditional, or too ambiguous support.',
      },
    ),
    independent_corroboration: noul(
      'Do `incoming.independent_sources` contain at least one source independent from the product maker that corroborates `incoming.primary_claim`?',
      {
        true: 'At least one independent source supports the claim.',
        false: 'No independent corroboration is supplied.',
      },
    ),
    existing_fact_relation: choice(
      'How does `incoming.primary_claim` relate to the facts in `existing_candidate`? A real later status change is a temporal update, not a contradiction.',
      {
        supports_existing: 'It agrees with or adds detail without changing an existing fact.',
        contradicts_existing: 'It cannot be true at the same time as a currently stated fact for the same time period.',
        temporal_update: 'It describes a later state that legitimately supersedes an older state.',
        unrelated_or_not_addressed: 'The existing record does not address this claim.',
        mixed_or_unclear: 'The relationship cannot be determined from the supplied material.',
      },
    ),
  };
}

function confidenceOf(answer) {
  return typeof answer?.confidence === 'number' ? answer.confidence : null;
}

function probabilityOf(answer, key) {
  const value = answer?.probabilities?.[key];
  return typeof value === 'number' ? value : 0;
}

export function deriveDecision({ incoming, deterministic, answers, thresholds = {} }) {
  const config = {
    autoChoiceConfidence: thresholds.autoChoiceConfidence ?? 0.78,
    reviewChoiceConfidence: thresholds.reviewChoiceConfidence ?? 0.58,
    independentProbability: thresholds.independentProbability ?? 0.72,
    scoreConfidence: thresholds.scoreConfidence ?? 0.5,
  };

  const relation = answers.record_relation;
  const eventType = answers.event_type;
  const support = answers.source_support;
  const factRelation = answers.existing_fact_relation;
  const sourceType = SOURCE_TYPES.has(incoming.source_type) ? incoming.source_type : 'unknown';

  const duplicateProbability = deterministic.exact_duplicate
    ? 1
    : probabilityOf(relation, 'same_event_duplicate');
  const duplicateConfident =
    deterministic.exact_duplicate ||
    (relation?.choice === 'same_event_duplicate' && confidenceOf(relation) >= config.autoChoiceConfidence);
  const duplicateUnclear =
    !deterministic.exact_duplicate &&
    (relation?.choice === 'unclear' || confidenceOf(relation) < config.reviewChoiceConfidence);

  const novelty = Math.max(0, Math.min(3, Number(answers.novelty_to_tracker?.score ?? 0)));
  const materiality = Math.max(0, Math.min(3, Number(answers.change_materiality?.score ?? 0)));
  const scope = Math.max(0, Math.min(3, Number(answers.market_scope?.score ?? 0)));
  const composite = (novelty / 3) * 0.35 + (materiality / 3) * 0.45 + (scope / 3) * 0.2;

  let importance = composite < 0.24 ? 0 : composite < 0.5 ? 1 : composite < 0.74 ? 2 : 3;
  if (duplicateConfident) importance = 0;
  if (
    ['routine_release_or_marketing', 'article_or_opinion'].includes(eventType?.choice) &&
    materiality < 2
  ) {
    importance = Math.min(importance, 1);
  }
  if (
    ['shutdown_or_delisting', 'compliance_or_trust'].includes(eventType?.choice) &&
    support?.choice === 'supports' &&
    confidenceOf(support) >= config.reviewChoiceConfidence
  ) {
    importance = 3;
  }

  const corroborationProbability = Number(answers.independent_corroboration?.noul ?? 0.5);
  let evidenceQuality = 'insufficient';
  if (support?.choice === 'contradicts') evidenceQuality = 'conflicted';
  else if (support?.choice === 'supports') {
    if (
      sourceType === 'independent_primary_record' ||
      sourceType === 'independent_reporting' ||
      corroborationProbability >= config.independentProbability
    ) {
      evidenceQuality = 'independently_supported';
    } else if (sourceType === 'official_self_disclosure') {
      evidenceQuality = 'primary_source_only';
    } else {
      evidenceQuality = 'weakly_supported';
    }
  }

  let contradicts = null;
  if (
    factRelation?.choice === 'contradicts_existing' &&
    confidenceOf(factRelation) >= config.autoChoiceConfidence
  ) {
    contradicts = true;
  } else if (
    ['supports_existing', 'temporal_update', 'unrelated_or_not_addressed'].includes(factRelation?.choice) &&
    confidenceOf(factRelation) >= config.reviewChoiceConfidence
  ) {
    contradicts = false;
  }

  const scoreConfidenceLow = ['novelty_to_tracker', 'change_materiality', 'market_scope'].some(
    (key) => confidenceOf(answers[key]) < config.scoreConfidence,
  );
  const highRiskType = ['shutdown_or_delisting', 'compliance_or_trust', 'major_metric'].includes(
    eventType?.choice,
  );
  const highRiskEvidenceWeak =
    highRiskType && !['independently_supported', 'primary_source_only'].includes(evidenceQuality);
  const choiceConfidenceLow = [eventType, support, factRelation].some(
    (answer) => confidenceOf(answer) < config.reviewChoiceConfidence,
  );

  const reasons = [];
  let route = 'candidate';
  if (duplicateConfident) {
    route = 'ignore';
    reasons.push('same event already recorded');
  } else if (
    deterministic.ambiguous_shortlist ||
    duplicateUnclear ||
    contradicts === true ||
    factRelation?.choice === 'mixed_or_unclear' ||
    highRiskEvidenceWeak ||
    choiceConfidenceLow ||
    scoreConfidenceLow ||
    (importance >= 3 && evidenceQuality !== 'independently_supported')
  ) {
    route = 'human_review';
    if (deterministic.ambiguous_shortlist) reasons.push('multiple existing records are similarly plausible');
    if (duplicateUnclear) reasons.push('duplicate relation is uncertain');
    if (contradicts === true) reasons.push('incoming claim conflicts with the existing record');
    if (factRelation?.choice === 'mixed_or_unclear') reasons.push('existing-fact relationship is unclear');
    if (highRiskEvidenceWeak) reasons.push('high-risk event lacks strong supplied evidence');
    if (choiceConfidenceLow || scoreConfidenceLow) reasons.push('one or more judgments have low confidence');
    if (importance >= 3 && evidenceQuality !== 'independently_supported') {
      reasons.push('major monthly candidate is not independently supported');
    }
  } else {
    reasons.push(importance >= 2 ? 'material monthly candidate' : 'database update candidate');
  }

  return {
    is_duplicate: {
      value: duplicateUnclear ? null : duplicateConfident,
      probability: duplicateProbability,
      confidence: confidenceOf(relation),
    },
    event_type: {
      value: eventType?.choice ?? 'other_or_unclear',
      probabilities: eventType?.probabilities ?? {},
      confidence: confidenceOf(eventType),
    },
    monthly_importance: {
      level: importance,
      label: ['ignore', 'database_only', 'monthly_candidate', 'major_candidate'][importance],
      composite_score: Number(composite.toFixed(4)),
      dimensions: { novelty, materiality, scope },
      requires_user_confirmation: importance >= 2,
    },
    evidence_quality: {
      value: evidenceQuality,
      source_type: sourceType,
      source_support: support?.choice ?? 'mixed_or_unclear',
      source_support_confidence: confidenceOf(support),
      independent_corroboration_probability: corroborationProbability,
    },
    contradicts_existing_record: {
      value: contradicts,
      relation: factRelation?.choice ?? 'mixed_or_unclear',
      probability: probabilityOf(factRelation, 'contradicts_existing'),
      confidence: confidenceOf(factRelation),
    },
    route,
    reasons: [...new Set(reasons)],
    policy_version: '2026-09-poc1',
  };
}

export function validateIncoming(incoming) {
  const errors = [];
  if (!incoming || typeof incoming !== 'object') return ['input must be a JSON object'];
  if (!incoming.title && !incoming.product_name) errors.push('title or product_name is required');
  if (!incoming.content) errors.push('content is required');
  if (!incoming.primary_claim) errors.push('primary_claim is required');
  if (incoming.source_type && !SOURCE_TYPES.has(incoming.source_type)) {
    errors.push(`source_type must be one of: ${[...SOURCE_TYPES].join(', ')}`);
  }
  return errors;
}
