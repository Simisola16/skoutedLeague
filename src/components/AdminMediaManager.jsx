import React, { useState, useEffect } from 'react';
import { 
  Camera,
  Image,
  Newspaper, 
  Headphones, 
  Handshake, 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  EyeOff,
  Check, 
  X, 
  Upload, 
  Sparkles, 
  ExternalLink, 
  AlertCircle,
  RefreshCw,
  Copy,
  Tag,
  Search,
  Filter,
  Layers,
  CheckSquare,
  Square,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { getMediaUrl } from '../utils/mediaUtils';

const MEDIA_CATEGORIES = [
  'All',
  'Matchday Action',
  'Teams',
  'Behind The Scenes',
  'Awards & Scouts',
  'Hero Banner',
  'News',
  'About Highlight'
];

export default function AdminMediaManager() {
  const [subTab, setSubTab] = useState('gallery'); // 'gallery' | 'news' | 'podcasts' | 'sponsors'
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // =========================================================================
  // 1. GALLERY & CENTRALIZED MEDIA STATE
  // =========================================================================
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaSummary, setMediaSummary] = useState({ total: 0, totalPublished: 0, totalDraft: 0 });
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState('All');
  const [mediaSearchQuery, setMediaSearchQuery] = useState('');
  const [mediaStatusFilter, setMediaStatusFilter] = useState('all'); // 'all' | 'published' | 'draft'
  const [selectedMediaIds, setSelectedMediaIds] = useState([]);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadPreviews, setUploadPreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    caption: '',
    category: 'Matchday Action',
    matchTag: '',
    tags: '',
    isPublished: true,
    directUrl: ''
  });

  // Edit Modal State
  const [editingMedia, setEditingMedia] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    caption: '',
    category: 'Matchday Action',
    matchTag: '',
    tags: '',
    isPublished: true
  });

  const [copiedId, setCopiedId] = useState(null);

  // =========================================================================
  // 2. NEWS STATE
  // =========================================================================
  const [articles, setArticles] = useState([]);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'League Announcement',
    author: 'SYL Editorial Board',
    readTime: '4 min read',
    featured: false,
    isPublished: true,
    coverImageUrl: ''
  });
  const [articleCoverFile, setArticleCoverFile] = useState(null);

  // =========================================================================
  // 3. PODCAST STATE
  // =========================================================================
  const [podcasts, setPodcasts] = useState([]);
  const [showPodcastModal, setShowPodcastModal] = useState(false);
  const [podcastForm, setPodcastForm] = useState({
    episodeNumber: '',
    title: '',
    description: '',
    audioUrl: '',
    youtubeUrl: '',
    spotifyUrl: '',
    duration: '35 mins',
    host: 'Skouted Media Team',
    guest: '',
    coverImageUrl: ''
  });
  const [podcastCoverFile, setPodcastCoverFile] = useState(null);

  // =========================================================================
  // 4. SPONSOR STATE
  // =========================================================================
  const [sponsors, setSponsors] = useState([]);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [sponsorForm, setSponsorForm] = useState({
    name: '',
    tier: 'Official Partner',
    websiteUrl: '',
    description: '',
    order: 0,
    logoUrl: ''
  });
  const [sponsorLogoFile, setSponsorLogoFile] = useState(null);

  // =========================================================================
  // 5. ABOUT SHOWCASE IMAGE STATE
  // =========================================================================
  const DEFAULT_ABOUT_IMG = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200';
  const DEFAULT_ABOUT_CAP = 'Youth talent competing in the Skouted Youth League Championship';

  const [aboutImageUrl, setAboutImageUrl] = useState(DEFAULT_ABOUT_IMG);
  const [aboutImageCaption, setAboutImageCaption] = useState(DEFAULT_ABOUT_CAP);
  const [aboutImageFile, setAboutImageFile] = useState(null);
  const [aboutImagePreview, setAboutImagePreview] = useState(null);
  const [aboutImageLoading, setAboutImageLoading] = useState(false);
  const [aboutDirectUrlInput, setAboutDirectUrlInput] = useState('');
  const [aboutIsDragOver, setAboutIsDragOver] = useState(false);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Centralized Media Assets
  const loadMediaAssets = async () => {
    try {
      const params = {};
      if (mediaCategoryFilter && mediaCategoryFilter !== 'All') {
        params.category = mediaCategoryFilter;
      }
      if (mediaSearchQuery && mediaSearchQuery.trim()) {
        params.search = mediaSearchQuery.trim();
      }
      if (mediaStatusFilter && mediaStatusFilter !== 'all') {
        params.status = mediaStatusFilter;
      }

      const res = await api.getAdminMedia(params);
      if (res.success) {
        setMediaItems(res.data || []);
        if (res.summary) setMediaSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load admin media:', err);
    }
  };

  // Fetch Other Content (News, Podcasts, Sponsors, and About Image Settings)
  const loadContentMedia = async () => {
    try {
      const [nRes, pRes, sRes, settRes] = await Promise.all([
        api.getNews(),
        api.getPodcasts(),
        api.getAllSponsors ? api.getAllSponsors() : api.getSponsors(),
        api.getLeagueSettings()
      ]);
      if (nRes.success) setArticles(nRes.data || []);
      if (pRes.success) setPodcasts(pRes.data || []);
      if (sRes.success) setSponsors(sRes.data || []);
      if (settRes?.data) {
        if (settRes.data.aboutImageUrl) setAboutImageUrl(settRes.data.aboutImageUrl);
        if (settRes.data.aboutImageCaption) setAboutImageCaption(settRes.data.aboutImageCaption);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAboutFileSelect = (files) => {
    const file = files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToastMsg('Please select a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }

    setAboutImageFile(file);
    const localUrl = URL.createObjectURL(file);
    setAboutImagePreview(localUrl);
    setAboutDirectUrlInput('');
  };

  const handleClearAboutSelectedFile = () => {
    setAboutImageFile(null);
    setAboutImagePreview(null);
  };

  const handleSaveAboutImage = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const targetUrl = aboutDirectUrlInput.trim() || (!aboutImageFile ? aboutImageUrl : '');
    if (!aboutImageFile && !targetUrl) {
      showToastMsg('Please select an image file or enter an image URL.', 'error');
      return;
    }

    setAboutImageLoading(true);
    try {
      let res;
      if (aboutImageFile) {
        const formData = new FormData();
        formData.append('image', aboutImageFile);
        formData.append('caption', aboutImageCaption.trim());
        res = await api.updateAboutImage(formData);
      } else {
        res = await api.updateAboutImage({
          imageUrl: targetUrl,
          caption: aboutImageCaption.trim()
        });
      }

      if (res.success) {
        const updatedUrl = res.data?.aboutImageUrl || targetUrl;
        setAboutImageUrl(updatedUrl);
        if (res.data?.aboutImageCaption !== undefined) {
          setAboutImageCaption(res.data.aboutImageCaption);
        }
        setAboutImageFile(null);
        setAboutImagePreview(null);
        setAboutDirectUrlInput('');
        showToastMsg('About section image updated successfully.');
      } else {
        showToastMsg(res.error || 'Failed to update about image', 'error');
      }
    } catch (err) {
      showToastMsg(err.message || 'Error updating about image', 'error');
    } finally {
      setAboutImageLoading(false);
    }
  };

  const handleResetToDefaultAboutImage = async () => {
    if (!window.confirm('Reset the About Section showcase image back to the default photo?')) return;
    setAboutImageLoading(true);
    try {
      const res = await api.updateAboutImage({
        imageUrl: DEFAULT_ABOUT_IMG,
        caption: DEFAULT_ABOUT_CAP
      });
      if (res.success) {
        setAboutImageUrl(DEFAULT_ABOUT_IMG);
        setAboutImageCaption(DEFAULT_ABOUT_CAP);
        setAboutImageFile(null);
        setAboutImagePreview(null);
        setAboutDirectUrlInput('');
        showToastMsg('About section image updated successfully.');
      } else {
        showToastMsg(res.error || 'Failed to reset image', 'error');
      }
    } catch (err) {
      showToastMsg(err.message, 'error');
    } finally {
      setAboutImageLoading(false);
    }
  };

  useEffect(() => {
    loadMediaAssets();
    loadContentMedia();
  }, [mediaCategoryFilter, mediaStatusFilter]);

  // Debounced search for media
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMediaAssets();
    }, 350);
    return () => clearTimeout(timer);
  }, [mediaSearchQuery]);

  // --------------------------------------------------------------------------
  // Media Handlers (Upload, Edit, Delete, Toggle)
  // --------------------------------------------------------------------------
  const handleFilesSelect = (filesList) => {
    const newFiles = Array.from(filesList);
    setUploadFiles(prev => [...prev, ...newFiles]);

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setUploadPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveSelectedFile = (idx) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== idx));
    setUploadPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelect(e.dataTransfer.files);
    }
  };

  const handleSaveUpload = async (e) => {
    e.preventDefault();
    if (uploadFiles.length === 0 && !uploadForm.directUrl) {
      showToastMsg('Please select at least one image or provide a direct image URL', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title || '');
      formData.append('caption', uploadForm.caption || '');
      formData.append('category', uploadForm.category || 'Matchday Action');
      formData.append('matchTag', uploadForm.matchTag || '');
      formData.append('tags', uploadForm.tags || '');
      formData.append('isPublished', String(uploadForm.isPublished));

      if (uploadForm.directUrl) {
        formData.append('directUrl', uploadForm.directUrl);
      }

      uploadFiles.forEach(file => {
        formData.append('images', file);
      });

      setUploadProgress(50);
      const res = await api.createAdminMedia(formData);
      setUploadProgress(90);

      if (res.success) {
        showToastMsg(`Successfully uploaded ${uploadFiles.length || 1} media item(s)!`);
        setShowUploadModal(false);
        setUploadFiles([]);
        setUploadPreviews([]);
        setUploadProgress(0);
        setUploadForm({
          title: '',
          caption: '',
          category: 'Matchday Action',
          matchTag: '',
          tags: '',
          isPublished: true,
          directUrl: ''
        });
        loadMediaAssets();
      } else {
        showToastMsg(res.error || 'Failed to upload media assets', 'error');
      }
    } catch (err) {
      showToastMsg(err.message || 'Network upload error', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleStartEditMedia = (item) => {
    setEditingMedia(item);
    setEditForm({
      title: item.title || '',
      caption: item.caption || '',
      category: item.category || 'Matchday Action',
      matchTag: item.matchTag || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      isPublished: Boolean(item.isPublished)
    });
  };

  const handleSaveEditMedia = async (e) => {
    e.preventDefault();
    if (!editingMedia) return;

    try {
      const res = await api.updateAdminMedia(editingMedia._id, editForm);
      if (res.success) {
        showToastMsg('Media asset updated successfully!');
        setEditingMedia(null);
        loadMediaAssets();
      } else {
        showToastMsg(res.error || 'Failed to update media asset', 'error');
      }
    } catch (err) {
      showToastMsg(err.message, 'error');
    }
  };

  const handleTogglePublishMedia = async (id) => {
    try {
      const res = await api.togglePublishMedia(id);
      if (res.success) {
        setMediaItems(prev => prev.map(m => m._id === id ? { ...m, isPublished: res.data.isPublished } : m));
        showToastMsg(res.message || 'Status updated');
      }
    } catch (err) {
      showToastMsg(err.message, 'error');
    }
  };

  const handleDeleteMedia = async (id) => {
    if (!window.confirm('Are you sure you want to delete this media asset permanently?')) return;

    try {
      const res = await api.deleteAdminMedia(id);
      if (res.success) {
        showToastMsg('Media asset deleted.');
        setMediaItems(prev => prev.filter(m => m._id !== id));
      } else {
        showToastMsg(res.error || 'Failed to delete asset', 'error');
      }
    } catch (err) {
      showToastMsg(err.message, 'error');
    }
  };

  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToastMsg('CDN Image URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSelectMedia = (id) => {
    setSelectedMediaIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllMedia = () => {
    if (selectedMediaIds.length === mediaItems.length) {
      setSelectedMediaIds([]);
    } else {
      setSelectedMediaIds(mediaItems.map(m => m._id));
    }
  };

  const handleBulkDeleteMedia = async () => {
    if (selectedMediaIds.length === 0) return;
    if (!window.confirm(`Permanently delete ${selectedMediaIds.length} selected media assets?`)) return;

    try {
      const res = await api.bulkDeleteAdminMedia(selectedMediaIds);
      if (res.success) {
        showToastMsg(`Deleted ${selectedMediaIds.length} media assets.`);
        setSelectedMediaIds([]);
        loadMediaAssets();
      } else {
        showToastMsg(res.error || 'Failed to delete selected assets', 'error');
      }
    } catch (err) {
      showToastMsg(err.message, 'error');
    }
  };

  // --------------------------------------------------------------------------
  // News Handlers
  // --------------------------------------------------------------------------
  const handleSaveArticle = async (e) => {
    e.preventDefault();
    if (!articleForm.title || !articleForm.excerpt || !articleForm.content) {
      showToastMsg('Please fill in title, excerpt, and content', 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(articleForm).forEach(k => {
        formData.append(k, articleForm[k]);
      });
      if (articleCoverFile) {
        formData.append('coverImage', articleCoverFile);
      }

      let res;
      if (editingArticle) {
        res = await api.updateNewsArticle(editingArticle._id, formData);
      } else {
        res = await api.createNewsArticle(formData);
      }

      if (res.success) {
        showToastMsg(editingArticle ? 'Article updated successfully!' : 'Article published successfully!');
        setShowArticleModal(false);
        setEditingArticle(null);
        setArticleCoverFile(null);
        loadContentMedia();
      } else {
        showToastMsg(res.error || 'Failed to save article', 'error');
      }
    } catch (err) {
      showToastMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm('Delete this news article?')) return;
    try {
      const res = await api.deleteNewsArticle(id);
      if (res.success) {
        showToastMsg('Article deleted');
        loadContentMedia();
      }
    } catch (err) {
      showToastMsg(err.message, 'error');
    }
  };

  // --------------------------------------------------------------------------
  // Podcast Handlers
  // --------------------------------------------------------------------------
  const handleSavePodcast = async (e) => {
    e.preventDefault();
    if (!podcastForm.title) {
      showToastMsg('Please enter episode title', 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(podcastForm).forEach(k => {
        formData.append(k, podcastForm[k]);
      });
      if (podcastCoverFile) {
        formData.append('coverImage', podcastCoverFile);
      }

      const res = await api.createPodcast(formData);
      if (res.success) {
        showToastMsg('Podcast episode created!');
        setShowPodcastModal(false);
        setPodcastCoverFile(null);
        loadContentMedia();
      } else {
        showToastMsg(res.error || 'Failed to save episode', 'error');
      }
    } catch (err) {
      showToastMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePodcast = async (id) => {
    if (!window.confirm('Delete this episode?')) return;
    try {
      const res = await api.deletePodcast(id);
      if (res.success) {
        showToastMsg('Episode deleted');
        loadContentMedia();
      }
    } catch (err) {
      showToastMsg(err.message, 'error');
    }
  };

  // --------------------------------------------------------------------------
  // Sponsor Handlers
  // --------------------------------------------------------------------------
  const handleSaveSponsor = async (e) => {
    e.preventDefault();
    if (!sponsorForm.name) {
      showToastMsg('Please enter sponsor name', 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(sponsorForm).forEach(k => {
        formData.append(k, sponsorForm[k]);
      });
      if (sponsorLogoFile) {
        formData.append('logo', sponsorLogoFile);
      }

      const res = await api.createSponsor(formData);
      if (res.success) {
        showToastMsg('Sponsor partner registered!');
        setShowSponsorModal(false);
        setSponsorLogoFile(null);
        loadContentMedia();
      } else {
        showToastMsg(res.error || 'Failed to save sponsor', 'error');
      }
    } catch (err) {
      showToastMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSponsor = async (id) => {
    if (!window.confirm('Delete this sponsor?')) return;
    try {
      const res = await api.deleteSponsor(id);
      if (res.success) {
        showToastMsg('Sponsor deleted');
        loadContentMedia();
      }
    } catch (err) {
      showToastMsg(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border animate-in slide-in-from-top ${
          toast.type === 'error'
            ? 'bg-rose-950 border-rose-500/50 text-rose-300'
            : 'bg-[#0E1B15] border-[#00E676]/40 text-[#00E676]'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <Check className="w-4 h-4 text-[#00E676]" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Top Media Architecture Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1E2536]">
        
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'gallery', label: 'Gallery & Media Hub', icon: Camera, count: mediaSummary.total || mediaItems.length },
            { id: 'news', label: 'News Articles', icon: Newspaper, count: articles.length },
            { id: 'podcasts', label: 'Podcast Episodes', icon: Headphones, count: podcasts.length },
            { id: 'sponsors', label: 'Sponsors & Partners', icon: Handshake, count: sponsors.length },
            { id: 'about', label: 'About Showcase Image', icon: Image, count: null }
          ].map(tab => {
            const Icon = tab.icon;
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border cursor-pointer ${
                  active
                    ? 'bg-[#00E676] text-black border-[#00E676] shadow-sm shadow-[#00E676]/20'
                    : 'bg-[#121622] border-[#222838] text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  active ? 'bg-black/20 text-black font-extrabold' : 'bg-white/5 text-slate-400'
                }`}>
                  {tab.count !== null ? tab.count : ''}
                </span>
              </button>
            );
          })}
        </div>

        {/* Global Action depending on subTab */}
        <div>
          {subTab === 'gallery' && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] text-black font-extrabold text-xs flex items-center gap-2 shadow-md shadow-[#00E676]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Media to Cloudinary</span>
            </button>
          )}

          {subTab === 'news' && (
            <button
              onClick={() => {
                setEditingArticle(null);
                setArticleForm({
                  title: '',
                  excerpt: '',
                  content: '',
                  category: 'League Announcement',
                  author: 'SYL Editorial Board',
                  readTime: '4 min read',
                  featured: false,
                  isPublished: true,
                  coverImageUrl: ''
                });
                setShowArticleModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#00E676] text-black font-extrabold text-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create News Article</span>
            </button>
          )}

          {subTab === 'podcasts' && (
            <button
              onClick={() => setShowPodcastModal(true)}
              className="px-4 py-2 rounded-xl bg-[#00E676] text-black font-extrabold text-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Episode</span>
            </button>
          )}

          {subTab === 'sponsors' && (
            <button
              onClick={() => setShowSponsorModal(true)}
              className="px-4 py-2 rounded-xl bg-[#00E676] text-black font-extrabold text-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Sponsor Partner</span>
            </button>
          )}
        </div>

      </div>

      {/* =================================================================== */}
      {/* TAB 1: CENTRALIZED GALLERY & MEDIA HUB */}
      {/* =================================================================== */}
      {subTab === 'gallery' && (
        <div className="space-y-5">
          
          {/* Rule Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-[#00E676]/5 border border-[#00E676]/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Sparkles className="w-4 h-4 text-[#00E676] shrink-0" />
              <span>
                <strong>Centralized Visual Governance:</strong> All tournament hero banners, about highlights, matchday photos, and awards must be uploaded here.
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span>Published: <strong className="text-[#00E676]">{mediaSummary.totalPublished}</strong></span>
              <span>Drafts: <strong className="text-amber-400">{mediaSummary.totalDraft}</strong></span>
            </div>
          </div>

          {/* Filtering & Search Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#111520] p-3 rounded-2xl border border-[#23293A]">
            
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {MEDIA_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setMediaCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    mediaCategoryFilter === cat
                      ? 'bg-[#00E676]/20 border border-[#00E676] text-[#00E676]'
                      : 'bg-white/5 border border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Status & Search */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={mediaStatusFilter}
                onChange={(e) => setMediaStatusFilter(e.target.value)}
                className="bg-[#161B26] border border-[#252A38] rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published Only</option>
                <option value="draft">Drafts Only</option>
              </select>

              <div className="relative w-48 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={mediaSearchQuery}
                  onChange={(e) => setMediaSearchQuery(e.target.value)}
                  placeholder="Filter media..."
                  className="w-full bg-[#161B26] border border-[#252A38] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E676]"
                />
              </div>

              {selectedMediaIds.length > 0 && (
                <button
                  onClick={handleBulkDeleteMedia}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete ({selectedMediaIds.length})</span>
                </button>
              )}
            </div>

          </div>

          {/* Bulk Selection Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <button
              onClick={handleSelectAllMedia}
              className="flex items-center gap-1.5 hover:text-white cursor-pointer"
            >
              {selectedMediaIds.length === mediaItems.length && mediaItems.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-[#00E676]" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>Select All ({mediaItems.length} Assets)</span>
            </button>

            <span>Click any image to view details, toggle status, or copy CDN link.</span>
          </div>

          {/* Media Items Grid */}
          {mediaItems.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-[#111520] border border-[#23293A] rounded-3xl space-y-3">
              <Camera className="w-10 h-10 mx-auto text-slate-500" />
              <h4 className="font-bold text-white text-sm">No Media Assets Found</h4>
              <p className="text-xs max-w-sm mx-auto text-slate-400">
                Upload matchday photography, tournament banners, and scouting photos directly to MongoDB League Storage.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-xs font-bold"
              >
                Upload First Media
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaItems.map(item => {
                const isSelected = selectedMediaIds.includes(item._id);
                const isCopied = copiedId === item._id;

                return (
                  <div
                    key={item._id}
                    className={`group rounded-2xl overflow-hidden bg-[#121622] border transition-all flex flex-col justify-between ${
                      isSelected 
                        ? 'border-[#00E676] ring-1 ring-[#00E676]' 
                        : 'border-[#222838] hover:border-slate-600'
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="relative aspect-[4/3] bg-black overflow-hidden">
                      <img
                        src={getMediaUrl(item.url)}
                        alt={item.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800';
                        }}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Top Checkbox & Status */}
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                        <button
                          onClick={() => handleSelectMedia(item._id)}
                          className="w-7 h-7 rounded-lg bg-[#0D0F14]/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#00E676]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        <button
                          onClick={() => handleTogglePublishMedia(item._id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold backdrop-blur-md border cursor-pointer transition-all ${
                            item.isPublished
                              ? 'bg-[#00E676]/20 border-[#00E676]/40 text-[#00E676]'
                              : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          }`}
                          title="Toggle published status"
                        >
                          {item.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </div>

                      {/* Category Tag Pill */}
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono font-semibold text-slate-300 border border-white/10">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {/* Meta & Content */}
                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-white truncate" title={item.title}>
                          {item.title}
                        </div>
                        {item.caption && (
                          <p className="text-[11px] text-slate-400 line-clamp-2" title={item.caption}>
                            {item.caption}
                          </p>
                        )}
                        {item.matchTag && (
                          <div className="text-[10px] text-[#00E676] truncate flex items-center gap-1 font-mono">
                            <Tag className="w-3 h-3 shrink-0" />
                            <span className="truncate">{item.matchTag}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Action Toolbar */}
                      <div className="pt-2 border-t border-[#1E2536] flex items-center justify-between text-xs">
                        <button
                          onClick={() => handleCopyUrl(item.url, item._id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                          title="Copy Image URL"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-[#00E676]" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'Copied' : 'URL'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEditMedia(item)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                            title="Edit metadata"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMedia(item._id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: NEWS ARTICLES */}
      {/* =================================================================== */}
      {subTab === 'news' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map(article => (
              <div key={article._id} className="rounded-2xl bg-[#121622] border border-[#222838] overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="aspect-video bg-black overflow-hidden relative">
                    <img src={article.coverImageUrl} alt={article.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00E676]/20 border border-[#00E676]/40 text-[#00E676]">
                      {article.category}
                    </span>
                  </div>
                  <div className="p-3.5 space-y-1.5">
                    <h4 className="text-xs font-bold text-white line-clamp-1">{article.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{article.excerpt}</p>
                  </div>
                </div>
                <div className="p-3.5 pt-0 flex items-center justify-between border-t border-[#1E2536] text-xs">
                  <span className="text-[10px] text-slate-500">{article.author}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingArticle(article);
                        setArticleForm({
                          title: article.title,
                          excerpt: article.excerpt,
                          content: article.content,
                          category: article.category,
                          author: article.author,
                          readTime: article.readTime,
                          featured: article.featured,
                          isPublished: article.isPublished,
                          coverImageUrl: article.coverImageUrl
                        });
                        setShowArticleModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(article._id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: PODCASTS */}
      {/* =================================================================== */}
      {subTab === 'podcasts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {podcasts.map(ep => (
              <div key={ep._id} className="rounded-2xl bg-[#121622] border border-[#222838] p-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#00E676]">
                    <span>EPISODE {ep.episodeNumber || '01'}</span>
                    <span>{ep.duration}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{ep.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{ep.description}</p>
                </div>
                <div className="pt-3 border-t border-[#1E2536] flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">{ep.host}</span>
                  <button
                    onClick={() => handleDeletePodcast(ep._id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: SPONSORS */}
      {/* =================================================================== */}
      {subTab === 'sponsors' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sponsors.map(sp => (
              <div key={sp._id} className="rounded-2xl bg-[#121622] border border-[#222838] p-4 flex flex-col justify-between items-center text-center">
                <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2 mb-2">
                  {sp.logoUrl ? (
                    <img src={sp.logoUrl} alt={sp.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <Handshake className="w-6 h-6 text-[#00E676]" />
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">{sp.name}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20">
                    {sp.tier}
                  </span>
                </div>
                <div className="pt-3 w-full border-t border-[#1E2536] mt-3 flex items-center justify-end">
                  <button
                    onClick={() => handleDeleteSponsor(sp._id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: DRAG & DROP MULTI-FILE UPLOADER DIRECTLY TO CLOUDINARY */}
      {/* =================================================================== */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-[#111520] border border-[#23293A] p-6 sm:p-8 space-y-5 my-auto shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2536]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center text-[#00E676]">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Upload Media to Cloudinary</h3>
                  <p className="text-[11px] text-slate-400">High-resolution tournament & gallery assets</p>
                </div>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpload} className="space-y-4 text-xs">
              
              {/* Drag & Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                  isDragOver
                    ? 'border-[#00E676] bg-[#00E676]/10'
                    : 'border-[#252A38] bg-[#0D1017] hover:border-[#00E676]/50'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFilesSelect(e.target.files)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-8 h-8 mx-auto text-[#00E676] mb-2 animate-bounce" />
                <p className="text-xs font-bold text-white">
                  Drag and drop photo files here, or <span className="text-[#00E676] underline">browse files</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Supports JPG, PNG, WEBP, AVIF up to 15MB each. Multiple selection enabled.
                </p>
              </div>

              {/* Selected Files Preview Strip */}
              {uploadPreviews.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Selected Files ({uploadPreviews.length})</span>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadFiles([]);
                        setUploadPreviews([]);
                      }}
                      className="text-rose-400 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto p-2 bg-[#0D1017] rounded-xl border border-[#222838] no-scrollbar">
                    {uploadPreviews.map((src, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10 group">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveSelectedFile(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Image Title *</label>
                  <input
                    type="text"
                    required
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    placeholder="e.g. Opening Kickoff Volley"
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white focus:border-[#00E676] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Target Category *</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white focus:border-[#00E676] focus:outline-none"
                  >
                    <option value="Matchday Action">Matchday Action</option>
                    <option value="Teams">Teams & Squads</option>
                    <option value="Behind The Scenes">Behind The Scenes</option>
                    <option value="Awards & Scouts">Awards & Scouts</option>
                    <option value="Hero Banner">Homepage Hero Banner</option>
                    <option value="About Highlight">About Section Highlight</option>
                    <option value="Gallery">General Gallery</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Caption / Description</label>
                <textarea
                  rows={2}
                  value={uploadForm.caption}
                  onChange={(e) => setUploadForm({ ...uploadForm, caption: e.target.value })}
                  placeholder="Detail what makes this moment memorable..."
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white focus:border-[#00E676] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Match Tag (Optional)</label>
                  <input
                    type="text"
                    value={uploadForm.matchTag}
                    onChange={(e) => setUploadForm({ ...uploadForm, matchTag: e.target.value })}
                    placeholder="e.g. Matchday 1: AFC vs SFC"
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white focus:border-[#00E676] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                    placeholder="Goal, Volley, MOTM, Fans"
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white focus:border-[#00E676] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uploadForm.isPublished}
                    onChange={(e) => setUploadForm({ ...uploadForm, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-[#00E676] bg-[#161B26] border-[#252A38]"
                  />
                  <span className="text-slate-300 font-semibold">Publish immediately to public Gallery</span>
                </label>
              </div>

              {/* Progress Bar */}
              {isUploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Uploading to Cloudinary...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#1A1E2B] overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#00E676] to-[#00B359] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1E2536]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] text-black font-extrabold flex items-center gap-2 cursor-pointer shadow-md shadow-[#00E676]/20 disabled:opacity-50"
                >
                  {isUploading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isUploading ? 'Uploading...' : 'Confirm & Upload'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: EDIT MEDIA METADATA */}
      {/* =================================================================== */}
      {editingMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-[#111520] border border-[#23293A] p-6 space-y-4 my-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2536]">
              <h3 className="text-base font-bold text-white">Edit Media Metadata</h3>
              <button onClick={() => setEditingMedia(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMedia} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Category *</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white focus:outline-none focus:border-[#00E676]"
                >
                  <option value="Matchday Action">Matchday Action</option>
                  <option value="Teams">Teams</option>
                  <option value="Behind The Scenes">Behind The Scenes</option>
                  <option value="Awards & Scouts">Awards & Scouts</option>
                  <option value="Hero Banner">Hero Banner</option>
                  <option value="About Highlight">About Highlight</option>
                  <option value="Gallery">Gallery</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Caption / Description</label>
                <textarea
                  rows={2}
                  value={editForm.caption}
                  onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Match Tag</label>
                  <input
                    type="text"
                    value={editForm.matchTag}
                    onChange={(e) => setEditForm({ ...editForm, matchTag: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tags</label>
                  <input
                    type="text"
                    value={editForm.tags}
                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsPublished"
                  checked={editForm.isPublished}
                  onChange={(e) => setEditForm({ ...editForm, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded text-[#00E676] bg-[#161B26]"
                />
                <label htmlFor="editIsPublished" className="text-slate-300 font-semibold cursor-pointer">
                  Visible to public (Published)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E2536]">
                <button
                  type="button"
                  onClick={() => setEditingMedia(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00E676] text-black font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD / EDIT NEWS ARTICLE */}
      {/* ==================================================================== */}
      {showArticleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-[#111520] border border-[#23293A] p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2536]">
              <h3 className="text-base font-bold text-white">
                {editingArticle ? 'Edit News Article' : 'Create News Article'}
              </h3>
              <button onClick={() => setShowArticleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Article Headline *</label>
                <input
                  type="text"
                  required
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  placeholder="e.g. Matchday 1 Tactical Breakdown"
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={articleForm.category}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  >
                    <option value="League Announcement">League Announcement</option>
                    <option value="Matchday Recap">Matchday Recap</option>
                    <option value="Scouting Report">Scouting Report</option>
                    <option value="Club Spotlight">Club Spotlight</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Author Byline</label>
                  <input
                    type="text"
                    value={articleForm.author}
                    onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Excerpt / Brief Lead *</label>
                <textarea
                  rows={2}
                  required
                  value={articleForm.excerpt}
                  onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                  placeholder="Quick 2-sentence summary displayed on cards..."
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Article Body * (Markdown supported)</label>
                <textarea
                  rows={6}
                  required
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  placeholder="Write full article here..."
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Upload Cover Photo (Cloudinary)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setArticleCoverFile(e.target.files[0])}
                    className="w-full text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-[#00E676]/20 file:text-[#00E676] file:font-bold file:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Or Direct Image URL</label>
                  <input
                    type="text"
                    value={articleForm.coverImageUrl}
                    onChange={(e) => setArticleForm({ ...articleForm, coverImageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={articleForm.featured}
                    onChange={(e) => setArticleForm({ ...articleForm, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#00E676] bg-[#161B26] border-[#252A38]"
                  />
                  <span className="text-slate-300">Feature on Homepage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={articleForm.isPublished}
                    onChange={(e) => setArticleForm({ ...articleForm, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-[#00E676] bg-[#161B26] border-[#252A38]"
                  />
                  <span className="text-slate-300">Published</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E2536]">
                <button
                  type="button"
                  onClick={() => setShowArticleModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#00E676] text-black font-bold flex items-center gap-2 cursor-pointer"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingArticle ? 'Save Changes' : 'Publish Article'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD PODCAST */}
      {/* ==================================================================== */}
      {showPodcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-[#111520] border border-[#23293A] p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2536]">
              <h3 className="text-base font-bold text-white">Publish Podcast Episode</h3>
              <button onClick={() => setShowPodcastModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePodcast} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Episode #</label>
                  <input
                    type="text"
                    value={podcastForm.episodeNumber}
                    onChange={(e) => setPodcastForm({ ...podcastForm, episodeNumber: e.target.value })}
                    placeholder="01"
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Episode Title *</label>
                  <input
                    type="text"
                    required
                    value={podcastForm.title}
                    onChange={(e) => setPodcastForm({ ...podcastForm, title: e.target.value })}
                    placeholder="e.g. Inside the Academy System"
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={podcastForm.description}
                  onChange={(e) => setPodcastForm({ ...podcastForm, description: e.target.value })}
                  placeholder="Episode summary and topics covered..."
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Host Name</label>
                  <input
                    type="text"
                    value={podcastForm.host}
                    onChange={(e) => setPodcastForm({ ...podcastForm, host: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Special Guest</label>
                  <input
                    type="text"
                    value={podcastForm.guest}
                    onChange={(e) => setPodcastForm({ ...podcastForm, guest: e.target.value })}
                    placeholder="Guest scout / coach"
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">YouTube URL</label>
                  <input
                    type="text"
                    value={podcastForm.youtubeUrl}
                    onChange={(e) => setPodcastForm({ ...podcastForm, youtubeUrl: e.target.value })}
                    placeholder="https://youtube.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Spotify URL</label>
                  <input
                    type="text"
                    value={podcastForm.spotifyUrl}
                    onChange={(e) => setPodcastForm({ ...podcastForm, spotifyUrl: e.target.value })}
                    placeholder="https://open.spotify.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cover Photo (Cloudinary)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPodcastCoverFile(e.target.files[0])}
                    className="w-full text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-[#00E676]/20 file:text-[#00E676] file:font-bold file:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    value={podcastForm.duration}
                    onChange={(e) => setPodcastForm({ ...podcastForm, duration: e.target.value })}
                    placeholder="35 mins"
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E2536]">
                <button
                  type="button"
                  onClick={() => setShowPodcastModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#00E676] text-black font-bold flex items-center gap-2 cursor-pointer"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Episode</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD SPONSOR */}
      {/* ==================================================================== */}
      {showSponsorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-[#111520] border border-[#23293A] p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2536]">
              <h3 className="text-base font-bold text-white">Add Sponsor Partner</h3>
              <button onClick={() => setShowSponsorModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSponsor} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Partner Name *</label>
                <input
                  type="text"
                  required
                  value={sponsorForm.name}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })}
                  placeholder="e.g. Nike Football"
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tier *</label>
                  <select
                    value={sponsorForm.tier}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, tier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  >
                    <option value="Official Partner">Official Partner</option>
                    <option value="Technical Sponsor">Technical Sponsor</option>
                    <option value="Scouting Partner">Scouting Partner</option>
                    <option value="Media Partner">Media Partner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Order Priority</label>
                  <input
                    type="number"
                    value={sponsorForm.order}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, order: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Website URL</label>
                <input
                  type="text"
                  value={sponsorForm.websiteUrl}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, websiteUrl: e.target.value })}
                  placeholder="https://partner.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={sponsorForm.description}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, description: e.target.value })}
                  placeholder="Brief role in tournament..."
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Logo File (Cloudinary)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSponsorLogoFile(e.target.files[0])}
                    className="w-full text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-[#00E676]/20 file:text-[#00E676] file:font-bold file:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Or Logo URL</label>
                  <input
                    type="text"
                    value={sponsorForm.logoUrl}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, logoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E2536]">
                <button
                  type="button"
                  onClick={() => setShowSponsorModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#00E676] text-black font-bold flex items-center gap-2 cursor-pointer"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Partner</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: ABOUT SECTION SHOWCASE IMAGE */}
      {/* =================================================================== */}
      {subTab === 'about' && (
        <div className="space-y-6 animate-in fade-in duration-200">

          {/* Header */}
          <div className="flex items-center gap-3 pb-2 border-b border-[#1E2536]">
            <div className="w-9 h-9 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676]">
              <Image className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-white font-black font-display text-sm sm:text-base tracking-tight">About Section Showcase Image</h3>
              <p className="text-xs text-slate-400 mt-0.5">This image appears on the Homepage "About Skouted Youth League" section and the dedicated /about page. Changes propagate in real-time via WebSocket.</p>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left: Current Image Preview */}
            <div className="space-y-3">
              <div className="text-xs font-mono text-[#00E676] font-bold uppercase tracking-wider">Current Showcase Image</div>
              <div className="relative rounded-2xl overflow-hidden border border-[#1E2536] bg-[#0D1017] shadow-xl group">
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={aboutImagePreview || aboutImageUrl}
                    alt={aboutImageCaption}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200'; }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="text-[10px] font-mono text-[#00E676] font-bold mb-1 uppercase">LIVE ON HOMEPAGE & /ABOUT</div>
                  <div className="text-xs text-white font-semibold truncate">{aboutImageCaption}</div>
                </div>
                {aboutImagePreview && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500/90 text-black text-[10px] font-bold flex items-center gap-1.5 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                    PREVIEW — Not Saved Yet
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {aboutImagePreview ? '⚠️ You have an unsaved image selected. Click "Save" to apply it live.' : '✅ This image is currently live on your website.'}
              </p>
            </div>

            {/* Right: Upload Controls */}
            <form onSubmit={handleSaveAboutImage} className="space-y-4">
              <div className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">Upload New Image</div>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setAboutIsDragOver(true); }}
                onDragLeave={() => setAboutIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setAboutIsDragOver(false);
                  if (e.dataTransfer.files?.length) handleAboutFileSelect(e.dataTransfer.files);
                }}
                onClick={() => document.getElementById('about-image-file-input').click()}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                  aboutIsDragOver
                    ? 'border-[#00E676] bg-[#00E676]/10'
                    : aboutImageFile
                      ? 'border-[#00E676]/60 bg-[#00E676]/5'
                      : 'border-[#2A3045] bg-[#0E1220] hover:border-[#00E676]/40 hover:bg-[#00E676]/5'
                }`}
              >
                <input
                  id="about-image-file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleAboutFileSelect(e.target.files)}
                />
                {aboutImageFile ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-[#00E676]/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-[#00E676]" />
                    </div>
                    <div className="text-center">
                      <div className="text-white text-xs font-bold truncate max-w-[200px]">{aboutImageFile.name}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{(aboutImageFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleClearAboutSelectedFile(); }}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-400 text-[10px] font-bold cursor-pointer hover:bg-rose-500/25 transition-all"
                    >
                      Remove File
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="text-center">
                      <div className="text-white text-xs font-semibold">Drag & drop or click to select</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">PNG, JPG, WEBP — Recommended: 1200×800px or wider</div>
                    </div>
                  </>
                )}
              </div>

              {/* OR Direct URL */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#1E2536]" />
                <span className="text-[11px] text-slate-500 font-mono">OR USE URL</span>
                <div className="h-px flex-1 bg-[#1E2536]" />
              </div>

              <div className="relative">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={aboutDirectUrlInput}
                  onChange={(e) => {
                    setAboutDirectUrlInput(e.target.value);
                    if (e.target.value) handleClearAboutSelectedFile();
                  }}
                  placeholder="https://res.cloudinary.com/... or external image URL"
                  className="w-full bg-[#0E1220] border border-[#2A3045] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E676] transition-colors"
                />
              </div>

              {/* Caption input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Image Caption / Alt Text</label>
                <input
                  type="text"
                  value={aboutImageCaption}
                  onChange={(e) => setAboutImageCaption(e.target.value)}
                  placeholder="Youth talent competing in the Skouted Youth League..."
                  className="w-full bg-[#0E1220] border border-[#2A3045] rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E676] transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={aboutImageLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#00E676]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {aboutImageLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{aboutImageLoading ? 'Saving...' : 'Save & Push Live'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetToDefaultAboutImage}
                  disabled={aboutImageLoading}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#2A3045] text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-60"
                  title="Reset to default Unsplash photo"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Info Banner */}
          <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3 text-xs">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-slate-400 leading-relaxed">
              <strong className="text-blue-300">Real-time sync:</strong> When you save a new image, the Homepage and <code className="bg-white/10 px-1 rounded">/about</code> page update instantly via WebSocket without requiring a full page reload. The Cloudinary CDN ensures the image is globally fast.
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
