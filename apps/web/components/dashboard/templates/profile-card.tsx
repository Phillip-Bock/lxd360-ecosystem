'use client';

import { Briefcase, Edit2, Globe, Mail, MapPin, Phone, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Skill {
  name: string;
  icon?: React.ReactNode;
}

interface Experience {
  company: string;
  logo?: string;
  role?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
}

interface ProfileCardProps {
  name: string;
  username?: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  email?: string;
  phone?: string;
  location?: string;
  position?: string;
  website?: string;
  skills?: Skill[];
  experience?: Experience[];
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
  onFollow?: () => void;
  className?: string;
}

export function ProfileCard({
  name,
  username,
  avatar,
  banner,
  bio,
  email,
  phone,
  location,
  position,
  website,
  skills = [],
  experience = [],
  isOwnProfile = false,
  onEditProfile,
  onFollow,
  className,
}: ProfileCardProps): React.JSX.Element {
  return (
    <div className={cn('bg-card border-2 border-border rounded-[10px] overflow-hidden', className)}>
      {/* Banner */}
      <div className="relative h-32 bg-linear-to-r from-primary/20 to-primary/5">
        {banner && <Image src={banner} alt="Profile banner" fill className="object-cover" />}
      </div>

      {/* Profile Header */}
      <div className="px-6 pb-6">
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="relative">
            {avatar ? (
              <Image
                src={avatar}
                alt={name}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full border-4 border-card object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-card bg-primary/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {isOwnProfile && onEditProfile && (
              <button
                type="button"
                onClick={onEditProfile}
                className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-[8px] text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit profile
              </button>
            )}
            {!isOwnProfile && onFollow && (
              <button
                type="button"
                onClick={onFollow}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-[8px] text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Follow
              </button>
            )}
          </div>
        </div>

        {/* Name & Username */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-foreground">{name}</h2>
          {username && <p className="text-sm text-muted-foreground">@{username}</p>}
        </div>

        {/* Bio */}
        {bio && <p className="text-sm text-muted-foreground mb-4">{bio}</p>}

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <a href={`mailto:${email}`} className="hover:text-primary transition-colors truncate">
                {email}
              </a>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <a href={`tel:${phone}`} className="hover:text-primary transition-colors">
                {phone}
              </a>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
          )}
          {position && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="w-4 h-4" />
              <span>{position}</span>
            </div>
          )}
          {website && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-4 h-4" />
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors truncate"
              >
                {website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground rounded-full text-xs font-medium"
                >
                  {skill.icon}
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Experience</h3>
            <div className="space-y-4">
              {experience.map((exp, index) => (
                <div key={index} className="flex items-start gap-3">
                  {exp.logo ? (
                    <Image
                      src={exp.logo}
                      alt={exp.company}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-[8px] object-contain bg-lxd-light-card p-1"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-[8px] bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{exp.company}</h4>
                    {exp.role && <p className="text-xs text-muted-foreground">{exp.role}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
