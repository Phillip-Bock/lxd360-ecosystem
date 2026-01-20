'use client';

import { Building2, ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ContactCardProps {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  company?: string;
  companyLogo?: string;
  avatar?: string;
  status?: 'active' | 'inactive' | 'pending';
  onClick?: () => void;
  className?: string;
}

export function ContactCard({
  name,
  email,
  phone,
  location,
  company,
  companyLogo,
  avatar,
  status,
  onClick,
  className,
}: ContactCardProps): React.JSX.Element {
  const statusStyles = {
    active: 'bg-brand-success/10 text-green-600 dark:text-brand-success',
    inactive: 'bg-lxd-light-surface/10 text-lxd-text-dark-body dark:text-lxd-text-light-muted',
    pending: 'bg-brand-warning/10 text-amber-600 dark:text-brand-warning',
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'bg-card border-2 border-border rounded-[10px] p-5 w-full text-left',
        'hover:border-primary/30 transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-semibold text-primary">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground truncate">{name}</h3>
            {status && (
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                  statusStyles[status],
                )}
              >
                {status}
              </span>
            )}
          </div>
          {company && (
            <div className="flex items-center gap-2 mt-1">
              {companyLogo ? (
                <Image
                  src={companyLogo}
                  alt={company}
                  width={16}
                  height={16}
                  className="w-4 h-4 object-contain"
                />
              ) : (
                <Building2 className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              )}
              <span className="text-sm text-muted-foreground">{company}</span>
            </div>
          )}
        </div>
      </div>

      {/* Contact Details */}
      <div className="space-y-2">
        {email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" aria-hidden="true" />
            <a
              href={`mailto:${email}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-primary transition-colors truncate"
            >
              {email}
            </a>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" aria-hidden="true" />
            <a
              href={`tel:${phone}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-primary transition-colors"
            >
              {phone}
            </a>
          </div>
        )}
        {location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span>{location}</span>
          </div>
        )}
      </div>
    </button>
  );
}

// Company Card Component
interface CompanyCardProps {
  name: string;
  logo?: string;
  category?: string;
  website?: string;
  phone?: string;
  location?: string;
  employeeCount?: number;
  addedDate?: string;
  onClick?: () => void;
  className?: string;
}

export function CompanyCard({
  name,
  logo,
  category,
  website,
  phone,
  location,
  employeeCount,
  addedDate,
  onClick,
  className,
}: CompanyCardProps): React.JSX.Element {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'bg-card border-2 border-border rounded-[10px] p-5 w-full text-left',
        'hover:border-primary/30 transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {logo ? (
          <Image
            src={logo}
            alt={name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-[8px] object-contain bg-lxd-light-card p-1"
          />
        ) : (
          <div className="w-12 h-12 rounded-[8px] bg-primary/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground truncate">{name}</h3>
          {category && <span className="text-sm text-muted-foreground">{category}</span>}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        {website && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:text-primary transition-colors truncate"
            >
              {website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" aria-hidden="true" />
            <span>{phone}</span>
          </div>
        )}
        {location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span>{location}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      {(employeeCount !== undefined || addedDate) && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          {employeeCount !== undefined && (
            <span className="text-xs text-muted-foreground">
              {employeeCount.toLocaleString()} employees
            </span>
          )}
          {addedDate && <span className="text-xs text-muted-foreground">Added {addedDate}</span>}
        </div>
      )}
    </button>
  );
}
