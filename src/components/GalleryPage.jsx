import React, { useState, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Sparkles, 
  Heart, 
  Eye, 
  Download, 
  Share2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Filter, 
  Search, 
  Calendar, 
  Tag, 
  Layers,
  ArrowLeft,
  Check
} from 'lucide-react';
import { api } from '../services/api';

const CATEGORIES = [
  'All',
  'Matchday Action',
  'Teams',
  'Behind The Scenes',
  'Awards & Scouts'
];

export default function GalleryPage({ onBackToHome, onOpenRegisterTeam }) {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('skouted_liked_photos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Touch Swipe coordinates
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  // Fetch Gallery Items
  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await api.getGalleryItems({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery.trim() || undefined
      });
      if (res.success) {
        setItems(res.data || []);
        if (res.counts) setCounts(res.counts);
      }
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [selectedCategory]);

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGallery();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Like Photo Handler
  const handleLike = async (e, id) => {
    e.stopPropagation();
    if (likedIds.includes(id)) return;

    try {
      const res = await api.likeGalleryItem(id);
      if (res.success) {
        const nextLikes = [...likedIds, id];
        setLikedIds(nextLikes);
        localStorage.setItem('skouted_liked_photos', JSON.stringify(nextLikes));

        // Update local item likes count
        setItems(prev => prev.map(item => 
          item._id === id ? { ...item, likes: res.likes || (item.likes + 1) } : item
        ));
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  // Lightbox Navigation
  const activeItem = lightboxIndex !== null && items[lightboxIndex] ? items[lightboxIndex] : null;

  const handlePrev = useCallback(() => {
    if (lightboxIndex === null || items.length === 0) return;
    setLightboxIndex(prev => (prev === 0 ? items.length - 1 : prev - 1));
  }, [lightboxIndex, items.length]);

  const handleNext = useCallback(() => {
    if (lightboxIndex === null || items.length === 0) return;
    setLightboxIndex(prev => (prev === items.length - 1 ? 0 : prev + 1));
  }, [lightboxIndex, items.length]);

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(null);
    setIsFullscreen(false);
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') handleCloseLightbox();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, handlePrev, handleNext, handleCloseLightbox]);

  // Swipe detection for mobile lightbox
  const handleTouchStart = (e) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  // Share link handler
  const handleShare = async (item) => {
    const url = item.url;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.caption || 'Skouted Youth League Official Matchday Photo',
          url: url
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }

    navigator.clipboard.writeText(url);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#1E2330] bg-gradient-to-br from-[#121622] via-[#0E121B] to-[#0A0C12] p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00E676]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-xs font-mono font-bold tracking-wide">
                <Camera className="w-3.5 h-3.5" />
                <span>OFFICIAL LEAGUE MEDIA</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {items.length} High-Res Assets
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-display text-white tracking-tight leading-tight">
              Matchday & Tournament Gallery
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Experience the tournament up close: high-intensity matchday action, starting lineups, emotional celebrations, dressing room moments, and official scout showcases.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Matches</span>
              </button>
            )}
            {onOpenRegisterTeam && (
              <button
                onClick={onOpenRegisterTeam}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] text-black font-black text-xs shadow-md shadow-[#00E676]/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Register Club
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#1E2330]">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map(category => {
            const active = selectedCategory === category;
            const count = counts[category] !== undefined ? counts[category] : (category === 'All' ? items.length : null);

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
                  active
                    ? 'bg-[#00E676]/15 border-[#00E676] text-[#00E676] shadow-sm shadow-[#00E676]/20 font-black'
                    : 'bg-[#141720] border-[#222735] text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                <span>{category}</span>
                {count !== null && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    active ? 'bg-[#00E676]/25 text-[#00E676]' : 'bg-white/5 text-slate-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, teams, tags..."
            className="w-full bg-[#141720] border border-[#222735] focus:border-[#00E676] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* 3. Photo Gallery Grid / Masonry */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-[#141722] animate-pulse border border-[#23293A]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-slate-400 space-y-4 border border-[#23293A] bg-[#141722]/80">
          <Camera className="w-12 h-12 mx-auto text-slate-500" />
          <div className="space-y-1.5 max-w-md mx-auto">
            <h4 className="font-bold text-white text-lg font-display">No Photos Found</h4>
            <p className="text-xs text-slate-400">
              {searchQuery 
                ? `No images match your query "${searchQuery}". Try different keywords.` 
                : `There are currently no photos in the "${selectedCategory}" album.`}
            </p>
          </div>
          {(selectedCategory !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-xs font-bold hover:bg-[#00E676]/25 transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item, idx) => {
            const isLiked = likedIds.includes(item._id);

            return (
              <div
                key={item._id}
                onClick={() => setLightboxIndex(idx)}
                className="group relative rounded-2xl overflow-hidden border border-[#1E2330] bg-[#141720] hover:border-[#00E676]/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-[#00E676]/10 flex flex-col cursor-pointer"
              >
                {/* Image Container with Aspect Ratio */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                  <img
                    src={item.url}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F14] via-[#0D0F14]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Category Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#0D0F14]/80 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-[#00E676]">
                      {item.category}
                    </span>
                  </div>

                  {/* Quick Action Overlay (Like & View Full) */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleLike(e, item._id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
                        isLiked 
                          ? 'bg-rose-500/25 border-rose-500/50 text-rose-400' 
                          : 'bg-[#0D0F14]/75 border-white/10 text-white hover:text-rose-400 hover:bg-rose-500/20'
                      }`}
                      title="Like photo"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                    </button>
                  </div>

                  {/* Match Tag Pill */}
                  {item.matchTag && (
                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <div className="text-[10px] font-semibold text-white/90 truncate flex items-center gap-1">
                        <Tag className="w-3 h-3 text-[#00E676] shrink-0" />
                        <span className="truncate">{item.matchTag}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Meta Content */}
                <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-[#00E676] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    {item.caption && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                        {item.caption}
                      </p>
                    )}
                  </div>

                  {/* Card Footer: Views, Likes, Date */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#1E2330] text-[10px] font-mono text-slate-400">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>{item.views || 0}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className={`w-3 h-3 ${isLiked ? 'text-rose-400 fill-rose-400' : 'text-slate-500'}`} />
                        <span>{item.likes || 0}</span>
                      </span>
                    </div>

                    <span>
                      {new Date(item.createdAt || item.dateTaken).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. EDGE-TO-EDGE HIGH-RESOLUTION LIGHTBOX MODAL */}
      {/* =================================================================== */}
      {activeItem && (
        <div 
          className="fixed inset-0 z-50 bg-[#07090E]/98 backdrop-blur-2xl flex flex-col justify-between select-none animate-in fade-in duration-200"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Control Bar */}
          <div className="flex items-center justify-between p-4 sm:px-8 border-b border-white/10 bg-[#0D0F14]/80 backdrop-blur-md">
            
            {/* Left: Counter & Category */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-slate-300">
                {lightboxIndex + 1} / {items.length}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-[10px] font-mono font-bold">
                {activeItem.category}
              </span>
            </div>

            {/* Right: Actions (Fullscreen, Download, Share, Close) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleShare(activeItem)}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer relative"
                title="Share photo"
              >
                {copyFeedback ? <Check className="w-4 h-4 text-[#00E676]" /> : <Share2 className="w-4 h-4" />}
                {copyFeedback && (
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[#00E676] text-black text-[9px] font-bold whitespace-nowrap">
                    Link Copied!
                  </span>
                )}
              </button>

              <a
                href={activeItem.url}
                target="_blank"
                rel="noopener noreferrer"
                download={`skouted-league-${activeItem.title.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Open / Download Full Resolution"
              >
                <Download className="w-4 h-4" />
              </a>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="hidden sm:flex w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white items-center justify-center transition-all cursor-pointer"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={handleCloseLightbox}
                className="w-9 h-9 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 flex items-center justify-center transition-all cursor-pointer ml-2"
                title="Close lightbox (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Middle: Main Image Container with Chevron Navigators */}
          <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
            
            {/* Prev Chevron */}
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-6 z-10 w-11 h-11 rounded-full bg-[#0D0F14]/75 hover:bg-[#00E676] text-white hover:text-black border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-xl backdrop-blur-md"
              title="Previous image (Left arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* High-Res Image View */}
            <div className={`relative max-w-full max-h-full flex items-center justify-center transition-all duration-300 ${
              isFullscreen ? 'h-full w-full' : 'max-h-[75vh]'
            }`}>
              <img
                src={activeItem.url}
                alt={activeItem.title}
                className="max-h-[75vh] max-w-[90vw] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
              />
            </div>

            {/* Next Chevron */}
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-6 z-10 w-11 h-11 rounded-full bg-[#0D0F14]/75 hover:bg-[#00E676] text-white hover:text-black border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-xl backdrop-blur-md"
              title="Next image (Right arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Caption & Details Bar */}
          <div className="p-4 sm:p-6 border-t border-white/10 bg-[#0D0F14]/90 backdrop-blur-md">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black font-display text-white">
                    {activeItem.title}
                  </h2>
                  {activeItem.matchTag && (
                    <span className="text-[11px] font-semibold text-[#00E676] px-2 py-0.5 rounded bg-[#00E676]/10 border border-[#00E676]/20">
                      {activeItem.matchTag}
                    </span>
                  )}
                </div>

                {activeItem.caption && (
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {activeItem.caption}
                  </p>
                )}

                {activeItem.tags && activeItem.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {activeItem.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Like Button & Meta */}
              <div className="flex items-center gap-4 shrink-0">
                <button
                  onClick={(e) => handleLike(e, activeItem._id)}
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all border cursor-pointer ${
                    likedIds.includes(activeItem._id)
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                      : 'bg-white/5 border-white/10 text-white hover:text-rose-400 hover:border-rose-500/30'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${likedIds.includes(activeItem._id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{activeItem.likes || 0} Likes</span>
                </button>

                <div className="text-right text-[11px] font-mono text-slate-400">
                  <div>{activeItem.views || 0} Views</div>
                  <div>
                    {new Date(activeItem.createdAt || activeItem.dateTaken).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
