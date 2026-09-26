import React, { useState } from 'react';
import { Newspaper, Search, ArrowLeft, Clock, Calendar, Sparkles, Filter } from 'lucide-react';
import NewsArticleModal from './NewsArticleModal';

export default function NewsPage({ articles = [], onBackToHome }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState(null);

  const categories = [
    'All',
    'League Announcement',
    'Matchday Recap',
    'Scouting Report',
    'Youth Development'
  ];

  const filteredArticles = articles.filter(art => {
    const matchCat = selectedCategory === 'All' || art.category === selectedCategory;
    const matchSearch = !searchQuery || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const featuredArticle = articles.find(a => a.featured) || articles[0];

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
    <div className="space-y-8 pb-12">
      
      {/* 1. Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121622] via-[#0D1017] to-[#0A0D13] border border-[#1E2536] p-6 sm:p-10">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Matches</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs font-mono font-bold">
            <Newspaper className="w-3.5 h-3.5" />
            <span>MEDIA & EDITORIAL FEED</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
            League News & Match Reports
          </h1>

          <p className="text-sm sm:text-base text-slate-300">
            Official briefings, matchday breakdowns, grassroots talent scouting, and youth football development stories across the Skouted Youth League.
          </p>
        </div>
      </section>

      {/* 2. Featured Lead Story (If Available) */}
      {featuredArticle && selectedCategory === 'All' && !searchQuery && (
        <section
          onClick={() => setActiveArticle(featuredArticle)}
          className="group cursor-pointer relative overflow-hidden rounded-3xl bg-[#111520] border border-[#1E2536] hover:border-[#00E676]/40 transition-all p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center shadow-xl"
        >
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                <Sparkles className="w-3 h-3" />
                FEATURED STORY
              </span>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadge(featuredArticle.category)}`}>
                {featuredArticle.category}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-display text-white group-hover:text-[#00E676] transition-colors leading-tight">
              {featuredArticle.title}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
              {featuredArticle.excerpt}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span>By {featuredArticle.author || 'SYL Editorial'}</span>
              <span>•</span>
              <span>{featuredArticle.readTime || '4 min read'}</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#161B26] border border-[#1E2536]">
              <img
                src={featuredArticle.coverImageUrl || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800'}
                alt={featuredArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>
        </section>
      )}

      {/* 3. Category Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#00E676] text-black border-[#00E676] shadow-md shadow-[#00E676]/20'
                  : 'bg-[#141722] border-[#222735] text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141722] border border-[#222735] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#00E676]"
          />
        </div>

      </div>

      {/* 4. Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-slate-400 space-y-3 border border-[#23293A]">
          <Newspaper className="w-10 h-10 mx-auto text-slate-600" />
          <h4 className="text-white font-bold text-base">No articles found</h4>
          <p className="text-xs text-slate-400">Try adjusting your category filter or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map(article => (
            <article
              key={article._id || article.slug}
              onClick={() => setActiveArticle(article)}
              className="group cursor-pointer rounded-2xl bg-[#111520] border border-[#1E2536] hover:border-[#00E676]/40 hover:bg-[#141926] transition-all overflow-hidden flex flex-col justify-between shadow-lg"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#161B26]">
                <img
                  src={article.coverImageUrl || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800'}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111520] via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md ${getCategoryBadge(article.category)}`}>
                    {article.category || 'Article'}
                  </span>
                </div>
              </div>

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

                  <h3 className="text-base font-bold text-white group-hover:text-[#00E676] transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 truncate max-w-[170px]">
                    {article.author || 'SYL Editorial'}
                  </span>
                  <span className="text-[#00E676] font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Story &rarr;
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Article Detail Reader Modal */}
      {activeArticle && (
        <NewsArticleModal
          article={activeArticle}
          onClose={() => setActiveArticle(null)}
        />
      )}

    </div>
  );
}
