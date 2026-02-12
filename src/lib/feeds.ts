import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["enclosure", "enclosure"],
    ],
  },
});

export interface Article {
  id: string;
  title: string;
  link: string;
  excerpt: string;
  source: string;
  sourceUrl: string;
  pubDate: Date;
  category: "top" | "local" | "sports" | "culture";
  imageUrl?: string;
  credibilityScore: number;
}

interface FeedConfig {
  url: string;
  name: string;
  category: Article["category"];
  // Source credibility tier (1 = highest, 3 = lowest)
  // Based on: reputation, transparency, verification standards, editorial oversight
  credibilityTier: 1 | 2 | 3;
}

// Philadelphia news sources with credibility ratings
// Tier 1: Established outlets with strong editorial standards
// Tier 2: Digital-native local publications with good track records
// Tier 3: Aggregators (useful but require verification)
const FEEDS: FeedConfig[] = [
  // Tier 1: Primary sources - original reporting, editorial standards
  {
    url: "https://www.nbcphiladelphia.com/feed/",
    name: "NBC10",
    category: "top",
    credibilityTier: 1,
  },
  {
    url: "https://6abc.com/feed/",
    name: "6ABC",
    category: "top",
    credibilityTier: 1,
  },
  {
    url: "https://whyy.org/feed/",
    name: "WHYY",
    category: "top",
    credibilityTier: 1,
  },
  // Tier 2: Digital-native local publications
  {
    url: "https://billypenn.com/feed/",
    name: "Billy Penn",
    category: "local",
    credibilityTier: 2,
  },
  {
    url: "https://www.phillyvoice.com/feed/",
    name: "PhillyVoice",
    category: "local",
    credibilityTier: 2,
  },
  {
    url: "https://www.phillytrib.com/search/?f=rss&t=article&c=news&l=50&s=start_time&sd=desc",
    name: "Philadelphia Tribune",
    category: "local",
    credibilityTier: 2,
  },
  {
    url: "https://thephiladelphiacitizen.org/feed/",
    name: "The Philadelphia Citizen",
    category: "local",
    credibilityTier: 2,
  },
  // Tier 3: Aggregators - broad coverage but verify claims
  {
    url: "https://news.google.com/rss/search?q=philadelphia+news&hl=en-US&gl=US&ceid=US:en",
    name: "Google News",
    category: "top",
    credibilityTier: 3,
  },
  // Breaking news / crime - captures stories that may cycle out of main feeds
  {
    url: "https://news.google.com/rss/search?q=philadelphia+shooting+OR+philadelphia+crime&hl=en-US&gl=US&ceid=US:en",
    name: "Google News",
    category: "top",
    credibilityTier: 3,
  },
];

// Red flag patterns in headlines (clickbait, sensationalism)
const RED_FLAG_PATTERNS = [
  /you won't believe/i,
  /shocking/i,
  /\d+ reasons/i,
  /what happens next/i,
  /gone wrong/i,
  /\[video\]/i,
  /\[photos\]/i,
  /click here/i,
];

// Non-news content patterns (broadcast schedules, show names, etc.)
const NON_NEWS_PATTERNS = [
  /^newscast for/i,
  /newscast for \w+day/i,
  /^action news at/i,
  /^good morning/i,
  /^live at \d/i,
  /^the source$/i,
  /^merv$/i,
  /^eyewitness news/i,
  /^\w+ news$/i, // Generic single-word show names
  /- \d+:\d+ [ap]\.?m\.?$/i, // Ends with time like "- 10:00 a.m."
  /february \d+, 2026/i, // Date in title (usually broadcast schedule)
];

// Check if headline has red flags
function hasRedFlags(title: string): boolean {
  return RED_FLAG_PATTERNS.some((pattern) => pattern.test(title));
}

// Check if content is non-news (broadcast schedule, show name, etc.)
function isNonNewsContent(title: string): boolean {
  return NON_NEWS_PATTERNS.some((pattern) => pattern.test(title.trim()));
}

// Check if story is within acceptable time window (48 hours)
function isTimely(pubDate: Date): boolean {
  const now = new Date();
  const hoursDiff = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60);
  return hoursDiff <= 48;
}

// Generate normalized title for deduplication (lowercase, remove punctuation)
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Calculate similarity between two titles (simple word overlap)
function titleSimilarity(title1: string, title2: string): number {
  const words1 = new Set(normalizeTitle(title1).split(" "));
  const words2 = new Set(normalizeTitle(title2).split(" "));
  const intersection = [...words1].filter((w) => words2.has(w));
  const union = new Set([...words1, ...words2]);
  return intersection.length / union.size; // Jaccard similarity
}

// Ensure source diversity - limit articles per source to prevent dominance
function ensureSourceDiversity(articles: Article[], maxPerSource: number): Article[] {
  const sourceCounts: Record<string, number> = {};
  return articles.filter((article) => {
    const count = sourceCounts[article.source] || 0;
    if (count >= maxPerSource) return false;
    sourceCounts[article.source] = count + 1;
    return true;
  });
}

// Deduplicate articles, keeping the one from most credible source
function deduplicateArticles(articles: Article[]): Article[] {
  const dominated: Set<number> = new Set();
  const SIMILARITY_THRESHOLD = 0.6;

  for (let i = 0; i < articles.length; i++) {
    if (dominated.has(i)) continue;
    for (let j = i + 1; j < articles.length; j++) {
      if (dominated.has(j)) continue;
      const similarity = titleSimilarity(articles[i].title, articles[j].title);
      if (similarity >= SIMILARITY_THRESHOLD) {
        // Keep article with higher credibility score (lower tier = higher score)
        if (articles[i].credibilityScore >= articles[j].credibilityScore) {
          dominated.add(j);
        } else {
          dominated.add(i);
          break;
        }
      }
    }
  }

  return articles.filter((_, idx) => !dominated.has(idx));
}

function cleanExcerpt(text: string): string {
  // Remove HTML tags
  let clean = text.replace(/<[^>]+>/g, "");
  // Decode HTML entities
  clean = clean
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
  // Trim and limit length
  clean = clean.trim();
  if (clean.length > 200) {
    clean = clean.substring(0, 197) + "...";
  }
  return clean;
}

function generateId(link: string): string {
  // Use the article link which is guaranteed unique
  return Buffer.from(link).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 24);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImageUrl(item: any): string | undefined {
  try {
    // Try various common RSS image field formats
    const mediaContent = item.mediaContent;
    const mediaThumbnail = item.mediaThumbnail;
    const enclosure = item.enclosure;

    // media:content - can be object or array
    if (mediaContent) {
      if (Array.isArray(mediaContent)) {
        const img = mediaContent.find((m: { $?: { medium?: string; type?: string } }) =>
          m.$?.medium === "image" || m.$?.type?.startsWith("image/")
        );
        if (img?.$?.url) return img.$.url;
      } else if (mediaContent.$?.url) {
        return mediaContent.$.url;
      }
    }

    // media:thumbnail
    if (mediaThumbnail?.$?.url) {
      return mediaThumbnail.$.url;
    }

    // enclosure (common RSS image format)
    if (enclosure?.url && enclosure?.type?.startsWith("image/")) {
      return enclosure.url;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

async function fetchFeed(config: FeedConfig): Promise<Article[]> {
  try {
    const feed = await parser.parseURL(config.url);
    // Credibility score: Tier 1 = 100, Tier 2 = 75, Tier 3 = 50
    const credibilityScore = config.credibilityTier === 1 ? 100 : config.credibilityTier === 2 ? 75 : 50;

    return feed.items
      .slice(0, 15) // Fetch more items for better filtering and coverage
      .map((item) => ({
        id: generateId(item.link || item.title || ""),
        title: item.title || "Untitled",
        link: item.link || "",
        excerpt: cleanExcerpt(item.contentSnippet || item.content || ""),
        source: config.name,
        sourceUrl: feed.link || config.url,
        pubDate: new Date(item.pubDate || Date.now()),
        category: config.category,
        imageUrl: extractImageUrl(item),
        credibilityScore,
      }))
      .filter((article) => {
        // Filter out articles with red flags
        if (hasRedFlags(article.title)) {
          console.log(`Filtered (red flag): ${article.title}`);
          return false;
        }
        // Filter out non-news content (broadcast schedules, show names)
        if (isNonNewsContent(article.title)) {
          console.log(`Filtered (non-news): ${article.title}`);
          return false;
        }
        // Filter out old articles (>48 hours)
        if (!isTimely(article.pubDate)) {
          return false;
        }
        // Filter out very short titles (likely not real articles)
        if (article.title.trim().length < 10) {
          return false;
        }
        return true;
      });
  } catch (error) {
    console.error(`Error fetching ${config.name}:`, error);
    return [];
  }
}

export async function fetchAllNews(): Promise<{
  top: Article[];
  local: Article[];
  sports: Article[];
  culture: Article[];
  lastUpdated: string;
}> {
  const allArticles = await Promise.all(FEEDS.map(fetchFeed));
  let articles = allArticles.flat();

  // Deduplicate similar stories (keeps most credible source)
  articles = deduplicateArticles(articles);

  // Sort by credibility score first, then by date (newest first)
  // This prioritizes original reporting from established outlets
  articles.sort((a, b) => {
    // Primary sort: credibility (higher is better)
    const credDiff = b.credibilityScore - a.credibilityScore;
    if (credDiff !== 0) return credDiff;
    // Secondary sort: recency (newer is better)
    return b.pubDate.getTime() - a.pubDate.getTime();
  });

  // For top stories, prioritize recency but ensure source diversity
  const topArticles = articles
    .filter((a) => a.category === "top")
    .sort((a, b) => {
      // Weighted score: 80% recency, 20% credibility (prioritize fresh news)
      const now = Date.now();
      const recencyA = 1 - (now - a.pubDate.getTime()) / (48 * 60 * 60 * 1000);
      const recencyB = 1 - (now - b.pubDate.getTime()) / (48 * 60 * 60 * 1000);
      const scoreA = recencyA * 0.8 + (a.credibilityScore / 100) * 0.2;
      const scoreB = recencyB * 0.8 + (b.credibilityScore / 100) * 0.2;
      return scoreB - scoreA;
    });

  // Ensure source diversity in top stories - limit per source
  const diverseTopArticles = ensureSourceDiversity(topArticles, 3);

  // Group by category with diversity
  const localArticles = articles.filter((a) => a.category === "local");
  const diverseLocalArticles = ensureSourceDiversity(localArticles, 2);

  const grouped = {
    top: diverseTopArticles.slice(0, 8),
    local: diverseLocalArticles.slice(0, 8),
    sports: articles.filter((a) => a.category === "sports").slice(0, 6),
    culture: articles.filter((a) => a.category === "culture").slice(0, 6),
    lastUpdated: new Date().toISOString(),
  };

  return grouped;
}
