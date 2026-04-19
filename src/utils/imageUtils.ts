const BASE_URL = 'http://10.48.61.171:5000';

export const getAvatarUrl = (path: string | null | undefined) => {
  if (!path) return 'https://api.dicebear.com/7.x/avataaars/png?seed=Felix';
  
  // If it's already a full URL (http/https), return it
  if (path.startsWith('http')) return path;
  
  // If it's a relative path, prefix with BASE_URL
  // Ensure we don't double slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
};
