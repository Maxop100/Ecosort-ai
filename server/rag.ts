import { WasteCategory, WasteRule } from '../src/types';
import { getAllWasteRules } from './db';

interface RagMatchResult {
  rule: WasteRule;
  score: number;
  matchedKeywords: string[];
}

/**
 * Clean and tokenize a string into meaningful search terms
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !['the', 'and', 'for', 'with', 'this', 'that', 'can', 'are', 'was'].includes(token));
}

/**
 * Retrieve the closest matching municipal waste rule for an item and category
 */
export function retrieveClosestWasteRule(
  itemDescription: string,
  category: WasteCategory,
  municipality: string = 'general'
): WasteRule {
  const allRules = getAllWasteRules();
  const queryTokens = tokenize(itemDescription);

  let bestMatch: WasteRule | null = null;
  let highestScore = -1;
  const scoredRules: RagMatchResult[] = [];

  for (const rule of allRules) {
    let score = 0;
    const ruleKeywords = rule.itemKeyword.toLowerCase().split(',').map(k => k.trim());
    const ruleTokens = tokenize(rule.itemKeyword + ' ' + rule.disposalInstruction);
    const matchedKeywords: string[] = [];

    // Exact sub-phrase match in itemKeyword
    const lowerItemDesc = itemDescription.toLowerCase();
    for (const kw of ruleKeywords) {
      if (lowerItemDesc.includes(kw) || kw.includes(lowerItemDesc)) {
        score += 15;
        matchedKeywords.push(kw);
      }
    }

    // Token overlap
    for (const qToken of queryTokens) {
      for (const rToken of ruleTokens) {
        if (qToken === rToken) {
          score += 4;
        } else if (qToken.includes(rToken) || rToken.includes(qToken)) {
          score += 2;
        }
      }
    }

    // Category match bonus
    if (rule.category === category) {
      score += 5;
    }

    // Municipality match bonus
    if (municipality && municipality !== 'general' && rule.municipality === municipality) {
      score += 8;
    } else if (rule.municipality === 'general') {
      score += 2;
    }

    scoredRules.push({ rule, score, matchedKeywords });

    if (score > highestScore) {
      highestScore = score;
      bestMatch = rule;
    }
  }

  // If score is reasonably good, return best match
  if (bestMatch && highestScore > 3) {
    return bestMatch;
  }

  // Fallback: match by municipality and category, or first category rule
  const categoryMunicipalityMatch = allRules.find(
    r => r.category === category && (r.municipality === municipality || r.municipality === 'general')
  );

  if (categoryMunicipalityMatch) {
    return categoryMunicipalityMatch;
  }

  // Ultimate safe fallback
  return {
    id: 'default-fallback',
    itemKeyword: category,
    category,
    municipality: 'general',
    disposalInstruction: `Ensure item is clean and dry. Check local municipal signage for designated ${category} waste bins. Never cross-contaminate bins.`,
    updatedAt: new Date().toISOString()
  };
}
