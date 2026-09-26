/**
 * Helper to ensure media URLs resolve cleanly whether they are
 * absolute URLs (Cloudinary/External/CDN) or relative /api/media/file/ endpoints.
 */
export function getMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const backendUrl = import.meta.env.VITE_API_URL || 
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? ''
      : 'https://api.skoutedyouthleague.com');

  const cleanBase = backendUrl.replace(/\/$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
}
