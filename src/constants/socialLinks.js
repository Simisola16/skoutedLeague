export const YOUTUBE_CHANNEL_ID = 'UCy_dA9AmAWwGcDhh1PQtARA';
export const YOUTUBE_LIVE_EMBED_URL = 'https://www.youtube.com/embed/live_stream?channel=UCy_dA9AmAWwGcDhh1PQtARA';

export const SOCIAL_LINKS = {
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    handle: 'Skouted Youth League',
    url: 'https://www.facebook.com/share/1BcNGQkKGm/?mibextid=wwXIfr',
    accentColor: '#1877F2',
    bgHover: 'hover:bg-[#1877F2]/15',
    borderHover: 'hover:border-[#1877F2]/40',
    textHover: 'hover:text-[#1877F2]',
    glowClass: 'hover:shadow-[0_0_20px_rgba(24,119,242,0.35)]',
    description: 'Tournament announcements, photo albums, and official league community updates.'
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    handle: '@skouted_youth_league',
    url: 'https://www.instagram.com/skouted_youth_league',
    accentColor: '#E1306C',
    bgHover: 'hover:bg-[#E1306C]/15',
    borderHover: 'hover:border-[#E1306C]/40',
    textHover: 'hover:text-[#E1306C]',
    glowClass: 'hover:shadow-[0_0_20px_rgba(225,48,108,0.35)]',
    description: 'Matchday highlights, behind-the-scenes stories, and player spotlights.'
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    handle: '@Skoutedyouthleague',
    channelId: YOUTUBE_CHANNEL_ID,
    url: 'https://www.youtube.com/channel/UCy_dA9AmAWwGcDhh1PQtARA?sub_confirmation=1',
    liveEmbedUrl: YOUTUBE_LIVE_EMBED_URL,
    accentColor: '#FF0000',
    bgHover: 'hover:bg-[#FF0000]/15',
    borderHover: 'hover:border-[#FF0000]/40',
    textHover: 'hover:text-[#FF0000]',
    glowClass: 'hover:shadow-[0_0_20px_rgba(255,0,0,0.35)]',
    description: 'Official YouTube Live broadcasts, full match replays, and video scouting dossiers.'
  }
};

export const SOCIAL_LINKS_ARRAY = [
  SOCIAL_LINKS.youtube,
  SOCIAL_LINKS.instagram,
  SOCIAL_LINKS.facebook
];
