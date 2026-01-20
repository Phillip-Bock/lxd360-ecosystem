/**
 * Achievement, badge, and gamification type definitions
 */

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type AchievementType =
  | 'completion'
  | 'streak'
  | 'score'
  | 'speed'
  | 'engagement'
  | 'social'
  | 'skill'
  | 'milestone'
  | 'special';

export interface Badge {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  icon: string;
  image?: string;
  rarity: BadgeRarity;
  category: string;
  // Criteria
  type: AchievementType;
  criteria: BadgeCriteria;
  // Rewards
  xpReward: number;
  pointsReward: number;
  // Display
  isHidden: boolean;
  isStackable: boolean;
  maxStack: number;
  // Stats
  earnedCount: number;
  earnedPercentage: number;
  // Metadata
  createdAt: string;
  isActive: boolean;
}

export interface BadgeCriteria {
  type: AchievementType;
  conditions: BadgeCondition[];
  allRequired: boolean; // AND vs OR
}

export interface BadgeCondition {
  metric: string;
  operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'between';
  value: number | string;
  value2?: number | string; // for 'between'
  courseId?: string;
  skillId?: string;
  categoryId?: string;
}

export interface EarnedBadge {
  id: string;
  badgeId: string;
  badge: Badge;
  learnerId: string;
  earnedAt: string;
  source: {
    type: 'course' | 'quiz' | 'streak' | 'skill' | 'social' | 'manual';
    id?: string;
    title?: string;
  };
  stackCount: number;
  isDisplayed: boolean;
  shareUrl?: string;
}

export interface Certificate {
  id: string;
  templateId: string;
  learnerId: string;
  learnerName: string;
  courseId?: string;
  pathId?: string;
  certificationId?: string;
  title: string;
  description: string;
  // Details
  issuedAt: string;
  expiresAt?: string;
  validityPeriod?: number; // months
  // Verification
  credentialId: string;
  verificationCode: string;
  verificationUrl: string;
  // Blockchain (optional)
  blockchainTxId?: string;
  blockchainNetwork?: string;
  // Content
  completionDate: string;
  score?: number;
  hours?: number;
  credits?: number;
  ceuCredits?: number;
  instructor?: string;
  organization?: string;
  // Status
  status: 'issued' | 'expired' | 'revoked' | 'renewed';
  revokedAt?: string;
  revokedReason?: string;
  renewedAt?: string;
  // Display
  pdfUrl?: string;
  imageUrl?: string;
  linkedInAddUrl?: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description?: string;
  // Design
  templateType: 'completion' | 'achievement' | 'certification' | 'compliance';
  design: CertificateDesign;
  // Fields
  showScore: boolean;
  showHours: boolean;
  showCredits: boolean;
  showInstructor: boolean;
  showExpiration: boolean;
  customFields: CertificateField[];
  // Signatures
  signatures: CertificateSignature[];
  // Organization
  organizationLogo?: string;
  organizationName?: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
}

export interface CertificateDesign {
  backgroundImage?: string;
  backgroundColor: string;
  borderColor?: string;
  borderWidth?: number;
  headerImage?: string;
  footerImage?: string;
  accentColor: string;
  fontFamily: string;
  layout: 'landscape' | 'portrait';
}

export interface CertificateField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'date' | 'number';
}

export interface CertificateSignature {
  id: string;
  name: string;
  title: string;
  signatureImage?: string;
}

export interface GamificationProfile {
  learnerId: string;
  // Level
  level: number;
  levelName: string;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  // Points
  points: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  // Streaks
  currentStreak: number;
  longestStreak: number;
  freezesAvailable: number;
  // Badges
  badgeCount: number;
  badges: EarnedBadge[];
  // Ranking
  rank: number;
  percentile: number;
  leaderboardPosition?: LeaderboardPosition;
  // Recent activity
  recentXpGains: XPGain[];
  recentBadges: EarnedBadge[];
}

export interface XPGain {
  id: string;
  amount: number;
  source: string;
  sourceId: string;
  description: string;
  earnedAt: string;
}

export interface LeaderboardPosition {
  leaderboardId: string;
  rank: number;
  score: number;
  change: number; // position change from last period
  previousRank?: number;
}

export interface Leaderboard {
  id: string;
  name: string;
  type: 'global' | 'organization' | 'team' | 'course' | 'skill';
  metric: 'xp' | 'points' | 'completions' | 'streak' | 'badges';
  period: 'all-time' | 'yearly' | 'monthly' | 'weekly' | 'daily';
  scopeId?: string; // course/team/org ID if applicable
  entries: LeaderboardEntry[];
  lastUpdated: string;
}

export interface LeaderboardEntry {
  rank: number;
  learnerId: string;
  learnerName: string;
  learnerAvatar?: string;
  score: number;
  level?: number;
  change: number;
  trend: 'up' | 'down' | 'same';
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  image: string;
  category: 'digital' | 'physical' | 'experience' | 'course' | 'subscription';
  // Cost
  pointsCost: number;
  // Inventory
  stock: number | null; // null = unlimited
  claimed: number;
  // Availability
  isActive: boolean;
  availableFrom?: string;
  availableUntil?: string;
  // Restrictions
  minLevel?: number;
  requiredBadge?: string;
  limitPerUser?: number;
  // Fulfillment
  fulfillmentType: 'automatic' | 'manual' | 'code';
  digitalContent?: string;
  couponCode?: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface RewardClaim {
  id: string;
  rewardId: string;
  reward: Reward;
  learnerId: string;
  pointsSpent: number;
  status: 'pending' | 'approved' | 'fulfilled' | 'rejected' | 'cancelled';
  claimedAt: string;
  fulfilledAt?: string;
  shippingInfo?: ShippingInfo;
  notes?: string;
}

export interface ShippingInfo {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface LevelDefinition {
  level: number;
  name: string;
  minXp: number;
  maxXp: number;
  icon?: string;
  color?: string;
  perks?: string[];
}
