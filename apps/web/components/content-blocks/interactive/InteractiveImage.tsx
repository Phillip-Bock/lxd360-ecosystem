'use client';

import { MapPin, X } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Hotspot {
  id: string;
  x: number;
  y: number;
  title: string;
  content: string;
}

export function InteractiveImage(): React.JSX.Element {
  const [imageUrl, setImageUrl] = useState('/interactive-diagram.jpg');
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const addHotspot = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newHotspot: Hotspot = {
      id: Date.now().toString(),
      x,
      y,
      title: 'New Hotspot',
      content: 'Click to edit this hotspot content',
    };
    setHotspots([...hotspots, newHotspot]);
  };

  const removeHotspot = (id: string) => {
    setHotspots(hotspots.filter((h) => h.id !== id));
    if (activeHotspot === id) setActiveHotspot(null);
  };

  const updateHotspot = (id: string, field: keyof Hotspot, value: string) => {
    setHotspots(hotspots.map((h) => (h.id === id ? { ...h, [field]: value } : h)));
  };

  return (
    <Card className="p-6 border-l-4 border-l-lxd-blue bg-lxd-dark-page">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-lxd-text-light-heading">Interactive Image</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="border-lxd-dark-surface text-lxd-text-light-secondary hover:bg-lxd-dark-surface"
        >
          {isEditing ? 'Done Editing' : 'Edit Hotspots'}
        </Button>
      </div>

      {isEditing && (
        <div className="mb-4 p-4 bg-lxd-dark-surface/30 rounded-lg border border-lxd-dark-surface">
          <Label className="text-lxd-text-light-secondary">Image URL</Label>
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter image URL"
            className="bg-lxd-dark-page border-lxd-dark-surface text-lxd-text-light-heading"
          />
          <p className="text-xs text-lxd-success mt-2">Click on the image to add hotspots</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Interactive Image */}
        <div
          role="img"
          tabIndex={isEditing ? 0 : undefined}
          className={`relative aspect-video bg-lxd-dark-surface rounded-lg overflow-hidden ${isEditing ? 'cursor-crosshair' : ''}`}
          onClick={addHotspot}
          onKeyDown={
            isEditing
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click();
                }
              : undefined
          }
          aria-label={isEditing ? 'Click to add hotspot' : 'Interactive image with hotspots'}
        >
          <Image
            src={imageUrl || '/placeholder.svg'}
            alt="Interactive image with hotspots"
            fill
            className="object-cover"
          />

          {/* Hotspot Markers */}
          {hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              className="absolute"
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
            >
              <button
                type="button"
                className={`relative -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  activeHotspot === hotspot.id
                    ? 'bg-lxd-blue scale-125 shadow-lxd-blue/50'
                    : 'bg-lxd-blue/80 hover:bg-lxd-blue hover:scale-110'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHotspot(activeHotspot === hotspot.id ? null : hotspot.id);
                }}
              >
                <MapPin className="w-4 h-4 text-lxd-text-light-heading" />
                {isEditing && (
                  <button
                    type="button"
                    className="absolute -top-1 -right-1 w-5 h-5 bg-lxd-error rounded-full flex items-center justify-center hover:bg-lxd-error/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeHotspot(hotspot.id);
                    }}
                  >
                    <X className="w-3 h-3 text-lxd-text-light-heading" />
                  </button>
                )}
              </button>

              {/* Hotspot Popup */}
              {activeHotspot === hotspot.id && !isEditing && (
                <div className="absolute left-full ml-2 top-0 w-64 bg-lxd-dark-page border border-lxd-blue rounded-lg shadow-lg shadow-lxd-blue/20 p-4 z-10">
                  <h4 className="font-semibold text-lxd-text-light-heading mb-2">
                    {hotspot.title}
                  </h4>
                  <p className="text-sm text-lxd-text-light-muted">{hotspot.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Edit Hotspots */}
        {isEditing && hotspots.length > 0 && (
          <div className="space-y-3 border-t border-lxd-dark-surface pt-4">
            <h4 className="font-medium text-lxd-text-light-heading">Hotspot Details</h4>
            {hotspots.map((hotspot, idx) => (
              <Card key={hotspot.id} className="p-4 bg-lxd-dark-surface/30 border-lxd-dark-surface">
                <div className="flex items-start justify-between mb-3">
                  <h5 className="font-medium text-lxd-text-light-heading">Hotspot {idx + 1}</h5>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHotspot(hotspot.id)}
                    className="text-lxd-error hover:text-lxd-error/80 hover:bg-lxd-error/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-lxd-text-light-secondary">Title</Label>
                    <Input
                      value={hotspot.title}
                      onChange={(e) => updateHotspot(hotspot.id, 'title', e.target.value)}
                      placeholder="Hotspot title"
                      className="bg-lxd-dark-page border-lxd-dark-surface text-lxd-text-light-heading"
                    />
                  </div>
                  <div>
                    <Label className="text-lxd-text-light-secondary">Content</Label>
                    <Textarea
                      value={hotspot.content}
                      onChange={(e) => updateHotspot(hotspot.id, 'content', e.target.value)}
                      placeholder="Hotspot description"
                      rows={3}
                      className="bg-lxd-dark-page border-lxd-dark-surface text-lxd-text-light-heading resize-none"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
