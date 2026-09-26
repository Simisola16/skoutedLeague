import React from 'react';
import { Newspaper, ArrowRight, Clock, User, Sparkles } from 'lucide-react';

export default function NewsWidget({ articles = [], onSelectArticle, onNavigateNews }) {
  // Take top 3 articles
  const displayArticles = articles.slice(0, 3);

  if (displayArticles.length === 0) {
    return null;
  }

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'Matchday Recap':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Scouting Report':
        return 'text-[#00E676] bg-[#00E676]/10 border-[#00E676]/30';
      case 'Youth Development':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    }
  };

  return (
    <section className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1E2330]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676]">
            <Newspaper className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-display text-white tracking-tight uppercase flex items-center gap-2">
              <span>League News & Scouting Insights</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30 hidden sm:inline-block">
                LATEST
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Official announcements, tactical breakdowns, and youth scouting spotlight
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateNews}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00E676] hover:text-[#00C853] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span>View All News</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayArticles.map((article) => (
          <article
            key={article._id || article.slug}
            onClick={() => onSelectArticle && onSelectArticle(article)}
            className="group cursor-pointer rounded-2xl bg-[#111520] border border-[#1E2536] hover:border-[#00E676]/40 hover:bg-[#141926] transition-all overflow-hidden flex flex-col justify-between shadow-lg"
          >
            {/* Thumbnail Image Container */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#161B26]">
              <img
                src={article.coverImageUrl || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800'}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111520] via-transparent to-transparent" />
              
              <div className="absolute top-3 left-3">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md ${getCategoryBadge(article.category)}`}>
                  {article.category || 'Announcement'}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{article.readTime || '3 min read'}</span>
                  </span>
                  <span>•</span>
                  <span>
                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Recent'}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-[#00E676] transition-colors leading-snug line-clamp-2">
                  {article.title}
                </h4>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {article.excerpt}
                </p>
              </div>

              {/* Footer Meta */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                  By {article.author || 'SYL Editorial'}
                </span>
                <span className="text-[#00E676] font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Read More &rarr;
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

    </section>
  );
}
