// Placeholder image constants
// Centralized configuration for stock/placeholder images used in development and demos

/**
 * Pexels stock images for course thumbnails and backgrounds
 * These are used for demo/development purposes
 */
export const PLACEHOLDER_IMAGES = {
  // Business/Corporate
  BUSINESS_MEETING: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
  TEAM_COLLABORATION: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg',
  PRESENTATION: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg',
  TEAM_DISCUSSION: 'https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg',
  OFFICE_MEETING: 'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg',
  BRAINSTORMING: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',

  // Learning/Education
  ONLINE_LEARNING: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg',
  STUDY_SESSION: 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg',
  EDUCATION: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',

  // Technology
  DATA_ANALYTICS: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg',
  SECURITY:
    'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg',
  LAPTOP_WORK: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg',

  // Leadership
  LEADERSHIP_MEETING: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
  EXECUTIVE: 'https://images.pexels.com/photos/6694543/pexels-photo-6694543.jpeg',
  MANAGER: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg',

  // Healthcare/Compliance
  HEALTHCARE: 'https://images.pexels.com/photos/3759657/pexels-photo-3759657.jpeg',
  COMPLIANCE: 'https://images.pexels.com/photos/4181785/pexels-photo-4181785.jpeg',

  // Abstract/Backgrounds
  ABSTRACT_TECH: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
  MOUNTAIN_LANDSCAPE: 'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg',
  NATURE_ABSTRACT: 'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg',
} as const;

/**
 * Helper to get image URL with Pexels optimization params
 */
export function getPexelsUrl(
  baseUrl: string,
  options?: { width?: number; height?: number; quality?: 'auto' | 'tinysrgb' },
): string {
  const params = new URLSearchParams();
  params.set('auto', 'compress');
  params.set('cs', options?.quality || 'tinysrgb');
  if (options?.width) params.set('w', options.width.toString());
  if (options?.height) params.set('h', options.height.toString());
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Default placeholder for missing images
 */
export const DEFAULT_PLACEHOLDER = '/placeholder.jpg';
