'use client';

import { AlertCircle, Check, Loader, Upload, User } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  displayName: string;
  pronouns: string;
  customPronouns: string;
  jobTitle: string;
  department: string;
  location: string;
  country: string;
  shortBio: string;
  linkedinUrl: string;
  twitterUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  secondaryEmail: string;
}

export const PersonalInformationTab: React.FC = () => {
  const [formData, setFormData] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    displayName: '',
    pronouns: '',
    customPronouns: '',
    jobTitle: '',
    department: '',
    location: '',
    country: '',
    shortBio: '',
    linkedinUrl: '',
    twitterUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    secondaryEmail: '',
  });

  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = (): void => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const charCount = formData.shortBio.length;
  const maxChars = 500;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-lxd-text-dark-heading flex items-center gap-2">
          <User className="w-6 h-6" />
          Personal Information
        </h2>
        <p className="text-lxd-text-dark-body mt-1">
          Update your personal details and public profile information
        </p>
      </div>

      {/* Profile Picture */}
      <div className="border-b border-lxd-light-border pb-8">
        <label
          htmlFor="PersonalInformationTab-input-1"
          className="block text-sm font-medium text-lxd-text-dark-body mb-4"
        >
          Profile Picture
        </label>
        <div className="flex items-center gap-6">
          <div className="relative">
            {profilePicture ? (
              <div className="relative w-24 h-24 rounded-full border-4 border-lxd-light-border">
                <Image
                  src={profilePicture}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-green-500 flex items-center justify-center text-brand-primary font-semibold text-2xl border-4 border-lxd-light-border">
                {formData.firstName?.[0] || 'U'}
              </div>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary-hover transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Photo
            </button>
            <p className="text-xs text-lxd-text-dark-muted mt-2">
              JPG or PNG. Max 5MB. Recommended 400x400px
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="PersonalInformationTab-input-2"
            className="block text-sm font-medium text-lxd-text-dark-body mb-2"
          >
            First Name <span className="text-brand-error">*</span>
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            maxLength={50}
            className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="John"
            required
          />
        </div>

        <div>
          <label
            htmlFor="PersonalInformationTab-input-3"
            className="block text-sm font-medium text-lxd-text-dark-body mb-2"
          >
            Last Name <span className="text-brand-error">*</span>
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            maxLength={50}
            className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="Doe"
            required
          />
        </div>

        <div>
          <label
            htmlFor="PersonalInformationTab-input-4"
            className="block text-sm font-medium text-lxd-text-dark-body mb-2"
          >
            Display Name
          </label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="How you&apos;d like to be addressed"
          />
        </div>

        <div>
          <label
            htmlFor="PersonalInformationTab-input-5"
            className="block text-sm font-medium text-lxd-text-dark-body mb-2"
          >
            Pronouns
          </label>
          <select
            value={formData.pronouns}
            onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
            className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          >
            <option value="">Select pronouns</option>
            <option value="he/him">He/Him</option>
            <option value="she/her">She/Her</option>
            <option value="they/them">They/Them</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {formData.pronouns === 'custom' && (
          <div className="md:col-span-2">
            <label
              htmlFor="PersonalInformationTab-input-6"
              className="block text-sm font-medium text-lxd-text-dark-body mb-2"
            >
              Custom Pronouns
            </label>
            <input
              type="text"
              value={formData.customPronouns}
              onChange={(e) => setFormData({ ...formData, customPronouns: e.target.value })}
              className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="e.g., ze/zir"
            />
          </div>
        )}
      </div>

      {/* Professional Information */}
      <div className="border-t border-lxd-light-border pt-6">
        <h3 className="text-lg font-semibold text-lxd-text-dark-heading mb-4">
          Professional Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="PersonalInformationTab-input-7"
              className="block text-sm font-medium text-lxd-text-dark-body mb-2"
            >
              Job Title
            </label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="Senior Developer"
            />
          </div>

          <div>
            <label
              htmlFor="PersonalInformationTab-input-8"
              className="block text-sm font-medium text-lxd-text-dark-body mb-2"
            >
              Department
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="Engineering"
            />
          </div>

          <div>
            <label
              htmlFor="PersonalInformationTab-input-9"
              className="block text-sm font-medium text-lxd-text-dark-body mb-2"
            >
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="San Francisco, CA"
            />
          </div>

          <div>
            <label
              htmlFor="PersonalInformationTab-input-10"
              className="block text-sm font-medium text-lxd-text-dark-body mb-2"
            >
              Country
            </label>
            <select
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              <option value="">Select country</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
            </select>
          </div>
        </div>
      </div>

      {/* Short Bio */}
      <div className="border-t border-lxd-light-border pt-6">
        <label
          htmlFor="PersonalInformationTab-input-11"
          className="block text-sm font-medium text-lxd-text-dark-body mb-2"
        >
          Short Bio
        </label>
        <textarea
          value={formData.shortBio}
          onChange={(e) => setFormData({ ...formData, shortBio: e.target.value })}
          maxLength={maxChars}
          rows={4}
          className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="Tell us a bit about yourself..."
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-lxd-text-dark-muted">
            This will be visible on your public profile
          </p>
          <span
            className={`text-sm ${
              charCount > maxChars * 0.9 ? 'text-orange-600' : 'text-lxd-text-dark-muted'
            }`}
          >
            {charCount}/{maxChars}
          </span>
        </div>
      </div>

      {/* Social Links */}
      <div className="border-t border-lxd-light-border pt-6">
        <h3 className="text-lg font-semibold text-lxd-text-dark-heading mb-4">Social Links</h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="PersonalInformationTab-input-12"
              className="block text-sm font-medium text-lxd-text-dark-body mb-2"
            >
              LinkedIn
            </label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div>
            <label
              htmlFor="PersonalInformationTab-input-13"
              className="block text-sm font-medium text-lxd-text-dark-body mb-2"
            >
              Twitter/X
            </label>
            <input
              type="url"
              value={formData.twitterUrl}
              onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
              className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="https://twitter.com/username"
            />
          </div>

          <div>
            <label
              htmlFor="PersonalInformationTab-input-14"
              className="block text-sm font-medium text-lxd-text-dark-body mb-2"
            >
              GitHub
            </label>
            <input
              type="url"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="https://github.com/username"
            />
          </div>

          <div>
            <label
              htmlFor="PersonalInformationTab-input-15"
              className="block text-sm font-medium text-lxd-text-dark-body mb-2"
            >
              Portfolio URL
            </label>
            <input
              type="url"
              value={formData.portfolioUrl}
              onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
              className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="https://yourportfolio.com"
            />
          </div>
        </div>
      </div>

      {/* Secondary Email */}
      <div className="border-t border-lxd-light-border pt-6">
        <label
          htmlFor="PersonalInformationTab-input-16"
          className="block text-sm font-medium text-lxd-text-dark-body mb-2"
        >
          Secondary Email (Recovery)
        </label>
        <input
          type="email"
          value={formData.secondaryEmail}
          onChange={(e) => setFormData({ ...formData, secondaryEmail: e.target.value })}
          className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="backup@example.com"
        />
        <p className="text-sm text-lxd-text-dark-muted mt-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Verification email will be sent to confirm this address
        </p>
      </div>

      {/* Save Button */}
      <div className="border-t border-lxd-light-border pt-6 flex justify-end gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary-hover transition-colors disabled:bg-lxd-blue-light/30 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  );
};
