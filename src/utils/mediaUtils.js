/**
 * Helper to ensure media URLs resolve cleanly whether they are
 * absolute URLs (Cloudinary/External/CDN) or relative /api/media/file/ endpoints.
 */
export function getMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';

  const isLocalhostEnv = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const backendUrl = import.meta.env.VITE_API_URL || 
    (isLocalhostEnv ? '' : 'https://api.skoutedyouthleague.com');

  const cleanBase = backendUrl.replace(/\/$/, '');

  // If URL has localhost:5055 but client is running on remote/production, rewrite to production backend
  if (!isLocalhostEnv && (url.includes('localhost:5055') || url.includes('127.0.0.1:5055'))) {
    const path = url.replace(/^https?:\/\/[^/]+/, '');
    return `${cleanBase}${path}`;
  }

  // Already a full external/CDN/remote absolute URL
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // Relative endpoint path
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
}
