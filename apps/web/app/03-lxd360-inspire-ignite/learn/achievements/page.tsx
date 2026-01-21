'use client';

export const dynamic = 'force-dynamic';

import { Award, Download, Medal, Shield, Star, Trophy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock achievements data - TODO: Replace with Firestore queries
const achievementsData = {
  badges: [
    {
      id: 'badge-1',
      name: 'Quick Learner',
      description: 'Complete 5 courses in one month',
      icon: 'star',
      earned: true,
      earnedDate: '2024-01-12',
      rarity: 'common',
    },
    {
      id: 'badge-2',
      name: 'Safety Champion',
      description: 'Score 100% on all safety assessments',
      icon: 'shield',
      earned: true,
      earnedDate: '2024-01-10',
      rarity: 'rare',
    },
    {
      id: 'badge-3',
      name: 'Leadership Master',
      description: 'Complete all leadership courses',
      icon: 'trophy',
      earned: false,
      progress: 75,
      rarity: 'epic',
    },
    {
      id: 'badge-4',
      name: 'Perfect Streak',
      description: 'Maintain a 30-day learning streak',
      icon: 'medal',
      earned: false,
      progress: 40,
      rarity: 'legendary',
    },
    {
      id: 'badge-5',
      name: 'Knowledge Seeker',
      description: 'Complete 10 courses total',
      icon: 'award',
      earned: true,
      earnedDate: '2024-01-05',
      rarity: 'common',
    },
    {
      id: 'badge-6',
      name: 'Data Wizard',
      description: 'Master all data analytics skills',
      icon: 'star',
      earned: false,
      progress: 65,
      rarity: 'rare',
    },
  ],
  certificates: [
    {
      id: 'cert-1',
      name: 'Workplace Safety Certification',
      issueDate: '2024-01-15',
      expiryDate: '2025-01-15',
      status: 'active',
      credentialId: 'WSC-2024-001234',
    },
    {
      id: 'cert-2',
      name: 'Leadership Fundamentals',
      issueDate: '2024-01-08',
      expiryDate: null,
      status: 'active',
      credentialId: 'LF-2024-005678',
    },
    {
      id: 'cert-3',
      name: 'Compliance Basics',
      issueDate: '2023-12-20',
      expiryDate: '2024-12-20',
      status: 'active',
      credentialId: 'CB-2023-009012',
    },
  ],
  stats: {
    totalBadges: 12,
    earnedBadges: 5,
    totalCertificates: 3,
    activeCertificates: 3,
  },
};

type TabType = 'badges' | 'certificates';

/**
 * Achievements page - Badges, certificates, and accomplishments
 */
export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('badges');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">Achievements</h1>
        <p className="text-muted-foreground mt-1">
          Your badges, certificates, and learning accomplishments
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" aria-hidden="true" />
            <p className="text-2xl font-bold text-brand-primary">
              {achievementsData.stats.earnedBadges}
            </p>
            <p className="text-sm text-muted-foreground">Badges Earned</p>
          </CardContent>
        </Card>
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" aria-hidden="true" />
            <p className="text-2xl font-bold text-brand-primary">
              {achievementsData.stats.totalBadges - achievementsData.stats.earnedBadges}
            </p>
            <p className="text-sm text-muted-foreground">Badges Available</p>
          </CardContent>
        </Card>
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4 text-center">
            <Medal className="w-8 h-8 text-blue-500 mx-auto mb-2" aria-hidden="true" />
            <p className="text-2xl font-bold text-brand-primary">
              {achievementsData.stats.activeCertificates}
            </p>
            <p className="text-sm text-muted-foreground">Active Certificates</p>
          </CardContent>
        </Card>
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-green-500 mx-auto mb-2" aria-hidden="true" />
            <p className="text-2xl font-bold text-brand-primary">
              {Math.round(
                (achievementsData.stats.earnedBadges / achievementsData.stats.totalBadges) * 100,
              )}
              %
            </p>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-lxd-dark-border">
        <button
          type="button"
          onClick={() => setActiveTab('badges')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'badges'
              ? 'border-lxd-purple text-lxd-purple'
              : 'border-transparent text-muted-foreground hover:text-brand-primary',
          )}
          aria-pressed={activeTab === 'badges'}
        >
          Badges
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('certificates')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'certificates'
              ? 'border-lxd-purple text-lxd-purple'
              : 'border-transparent text-muted-foreground hover:text-brand-primary',
          )}
          aria-pressed={activeTab === 'certificates'}
        >
          Certificates
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'badges' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievementsData.badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {achievementsData.certificates.map((cert) => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </div>
      )}
    </div>
  );
}

interface BadgeCardProps {
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedDate?: string;
    progress?: number;
    rarity: string;
  };
}

function BadgeCard({ badge }: BadgeCardProps) {
  const IconComponent = getBadgeIcon(badge.icon);
  const rarityColors = {
    common: 'text-gray-400 border-gray-400',
    rare: 'text-blue-400 border-blue-400',
    epic: 'text-purple-400 border-purple-400',
    legendary: 'text-yellow-400 border-yellow-400',
  };
  const rarityColor =
    rarityColors[badge.rarity as keyof typeof rarityColors] || rarityColors.common;

  return (
    <Card
      className={cn(
        'bg-lxd-dark-surface border-lxd-dark-border transition-all',
        badge.earned ? 'hover:border-lxd-purple/50' : 'opacity-60',
      )}
    >
      <CardContent className="p-6 text-center">
        <div
          className={cn(
            'w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto mb-4',
            rarityColor,
            !badge.earned && 'border-dashed',
          )}
        >
          <IconComponent
            className={cn('w-8 h-8', badge.earned ? rarityColor.split(' ')[0] : 'text-gray-600')}
            aria-hidden="true"
          />
        </div>
        <h3 className="text-lg font-semibold text-brand-primary mb-1">{badge.name}</h3>
        <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
        <div className="text-xs">
          {badge.earned ? (
            <span className="text-green-500">
              Earned on {new Date(badge.earnedDate as string).toLocaleDateString()}
            </span>
          ) : (
            <span className="text-muted-foreground">{badge.progress}% progress</span>
          )}
        </div>
        <span
          className={cn(
            'inline-block mt-2 px-2 py-0.5 text-xs rounded-full capitalize',
            badge.rarity === 'legendary' && 'bg-yellow-500/20 text-yellow-400',
            badge.rarity === 'epic' && 'bg-purple-500/20 text-purple-400',
            badge.rarity === 'rare' && 'bg-blue-500/20 text-blue-400',
            badge.rarity === 'common' && 'bg-gray-500/20 text-gray-400',
          )}
        >
          {badge.rarity}
        </span>
      </CardContent>
    </Card>
  );
}

function getBadgeIcon(iconName: string) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    star: Star,
    shield: Shield,
    trophy: Trophy,
    medal: Medal,
    award: Award,
  };
  return icons[iconName] || Award;
}

interface CertificateCardProps {
  certificate: {
    id: string;
    name: string;
    issueDate: string;
    expiryDate: string | null;
    status: string;
    credentialId: string;
  };
}

function CertificateCard({ certificate }: CertificateCardProps) {
  return (
    <Card className="bg-lxd-dark-surface border-lxd-dark-border">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-brand-primary">{certificate.name}</CardTitle>
            <CardDescription>Credential ID: {certificate.credentialId}</CardDescription>
          </div>
          <span
            className={cn(
              'px-2 py-1 text-xs rounded-full',
              certificate.status === 'active'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400',
            )}
          >
            {certificate.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <p>Issued: {new Date(certificate.issueDate).toLocaleDateString()}</p>
            {certificate.expiryDate && (
              <p>Expires: {new Date(certificate.expiryDate).toLocaleDateString()}</p>
            )}
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" aria-hidden="true" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
