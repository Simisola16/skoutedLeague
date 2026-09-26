import React from 'react';
import { X, Clock, Calendar, User, Share2, Tag, ArrowLeft } from 'lucide-react';

export default function NewsArticleModal({ article, onClose }) {
  if (!article) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#0F131C] border border-[#23293A] shadow-2xl overflow-hidden my-auto">
        
        {/* Header Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-[#0F131C]/90 backdrop-blur-md border-b border-[#1E2536]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
              {article.category || 'League News'}
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              {article.readTime || '3 min read'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Share article"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
              title="Close article"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Article Body */}
        <div className="max-h-[80vh] overflow-y-auto p-5 sm:p-8 space-y-6">
          
          {/* Article Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-white tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Meta Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pb-4 border-b border-[#1E2536]">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <User className="w-3.5 h-3.5 text-[#00E676]" />
              <span>{article.author || 'SYL Editorial Team'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : 'Official Report'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readTime || '3 min read'}</span>
            </div>
          </div>

          {/* Featured Cover Image */}
          {article.coverImageUrl && (
            <div className="rounded-2xl overflow-hidden border border-[#1E2536] bg-[#161B26] aspect-[16/9] shadow-lg">
              <img
                src={article.coverImageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Excerpt Lead */}
          <div className="p-4 rounded-xl bg-[#00E676]/10 border-l-4 border-[#00E676] text-slate-200 text-sm sm:text-base font-medium leading-relaxed">
            {article.excerpt}
          </div>

          {/* Formatted Content */}
          <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
            {article.content ? (
              article.content.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-lg sm:text-xl font-black font-display text-white pt-2">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('#### ')) {
                  return (
                    <h4 key={idx} className="text-base font-bold text-white pt-1">
                      {paragraph.replace('#### ', '')}
                    </h4>
                  );
                }
                if (paragraph.startsWith('> ')) {
                  return (
                    <blockquote key={idx} className="pl-4 border-l-2 border-[#00E676] italic text-slate-200 py-1 bg-white/[0.02] rounded-r">
                      {paragraph.replace('> ', '')}
                    </blockquote>
                  );
                }
                if (paragraph.startsWith('- ')) {
                  const items = paragraph.split('\n');
                  return (
                    <ul key={idx} className="list-disc pl-5 space-y-1">
                      {items.map((it, i) => (
                        <li key={i}>{it.replace(/^- /, '')}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={idx}>{paragraph}</p>;
              })
            ) : (
              <p>Full article details will be uploaded shortly.</p>
            )}
          </div>

          {/* Footer Back Button */}
          <div className="pt-6 border-t border-[#1E2536] flex items-center justify-between">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to League News</span>
            </button>
            <div className="text-[11px] font-mono text-[#00E676]">
              SKOUTED YOUTH LEAGUE MEDIA
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
