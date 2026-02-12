import { Article } from "@/lib/feeds";
import { ArticleCard } from "./ArticleCard";

interface SectionProps {
  title: string;
  articles: Article[];
  columns?: 1 | 2;
  showImages?: boolean;
}

export function Section({ title, articles, columns = 1, showImages = false }: SectionProps) {
  if (articles.length === 0) return null;

  return (
    <section className="mb-12">
      <h2
        className="font-sans font-black text-sm uppercase tracking-widest mb-6 pb-3"
        style={{ color: "#004C54", borderBottom: "2px solid #004C54" }}
      >
        {title}
      </h2>

      <div
        className={`
          ${columns === 2 ? "grid md:grid-cols-2 gap-x-8 gap-y-6" : ""}
        `}
      >
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} showImage={showImages} />
        ))}
      </div>
    </section>
  );
}
