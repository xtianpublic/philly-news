import { Article } from "@/lib/feeds";
import { ShareButtons } from "./ShareButtons";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  showImage?: boolean;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ArticleCard({ article, featured = false, showImage = false }: ArticleCardProps) {
  const hasImage = showImage && article.imageUrl;

  return (
    <article className={`${featured ? "mb-8" : "mb-6"}`}>
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        {hasImage && (
          <div className="mb-3 overflow-hidden rounded-lg">
            <img
              src={article.imageUrl}
              alt=""
              className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <h3
          className={`
            font-sans font-bold leading-tight hover:underline
            ${featured ? "text-2xl md:text-3xl mb-3" : "text-lg md:text-xl mb-2"}
          `}
          style={{ color: "#1a1a1a" }}
        >
          {article.title}
        </h3>
      </a>

      {article.excerpt && (
        <p
          className={`
            font-serif leading-relaxed
            ${featured ? "text-lg mb-3" : "text-base mb-2"}
          `}
          style={{ color: "#6b7280" }}
        >
          {article.excerpt}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm" style={{ color: "#6b7280" }}>
          <span className="font-medium" style={{ color: "#004C54" }}>{article.source}</span>
          <span>·</span>
          <time dateTime={article.pubDate.toISOString()}>
            {formatDate(article.pubDate)}
          </time>
        </div>
        <ShareButtons url={article.link} title={article.title} />
      </div>
    </article>
  );
}

export function FeaturedArticle({ article }: { article: Article }) {
  return (
    <article className="mb-10 pb-10" style={{ borderBottom: "1px solid #e5e7eb" }}>
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        {article.imageUrl && (
          <div className="mb-6 overflow-hidden rounded-lg">
            <img
              src={article.imageUrl}
              alt=""
              className="w-full h-64 md:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <h2
          className="font-sans font-black text-3xl md:text-4xl lg:text-5xl leading-tight mb-4 hover:underline"
          style={{ color: "#1a1a1a" }}
        >
          {article.title}
        </h2>
      </a>

      {article.excerpt && (
        <p
          className="font-serif text-xl md:text-2xl leading-relaxed mb-4"
          style={{ color: "#6b7280" }}
        >
          {article.excerpt}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-base">
          <span className="font-semibold" style={{ color: "#004C54" }}>{article.source}</span>
          <span style={{ color: "#6b7280" }}>·</span>
          <time dateTime={article.pubDate.toISOString()} style={{ color: "#6b7280" }}>
            {formatDate(article.pubDate)}
          </time>
        </div>
        <ShareButtons url={article.link} title={article.title} />
      </div>
    </article>
  );
}
