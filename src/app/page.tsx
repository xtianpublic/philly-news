import { fetchAllNews } from "@/lib/feeds";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Section } from "@/components/Section";
import { FeaturedArticle } from "@/components/ArticleCard";

// Revalidate every hour (3600 seconds)
export const revalidate = 3600;

export default async function Home() {
  const news = await fetchAllNews();

  const featuredArticle = news.top[0];
  const remainingTop = news.top.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header lastUpdated={news.lastUpdated} />

        {/* Featured Story */}
        {featuredArticle && <FeaturedArticle article={featuredArticle} />}

        {/* Top Stories */}
        {remainingTop.length > 0 && (
          <Section title="Top Stories" articles={remainingTop} columns={2} showImages={true} />
        )}

        {/* Local News */}
        <Section title="Local News" articles={news.local} columns={2} />

        {/* Sports */}
        <Section title="Sports" articles={news.sports} />

        {/* Culture */}
        <Section title="Culture" articles={news.culture} />

        <Footer />
      </main>
    </div>
  );
}
