'use client';

import { Box, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// CRITICAL FIX: Import the Safe Auth Hook
import { useSafeAuth } from '@/providers/SafeAuthProvider';
import { ScormUploader, type ScormUploadResult } from './ScormUploader';

interface CreateCourseModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId?: string;
}

export default function CreateCourseModal({
  isOpen,
  onOpenChange,
  tenantId = 'lxd360-dev',
}: CreateCourseModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState('scorm');
  const [isCreating, setIsCreating] = useState(false);

  // Use the correct hook that matches our RootLayout provider
  const { user } = useSafeAuth();

  const handleUploadComplete = async (result: ScormUploadResult) => {
    setIsCreating(true);

    try {
      // 1. Get Fresh Token for the API
      const token = await user?.getIdToken();
      if (!token) throw new Error('Authentication missing');

      // 2. Call the Enterprise API
      const response = await fetch('/api/ignite/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title,
          description: description || '',
          type: 'SCORM',
          filePath: result.packageUrl,
          tenantId: tenantId, // Enterprise Standard
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to create course');

      // 3. Success
      onOpenChange(false);
      window.location.reload();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert('Error saving course: ' + message);
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gray-950 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Course</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose how you want to create your course
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Tabs
            defaultValue="scorm"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-gray-900">
              <TabsTrigger value="native" disabled className="data-[state=active]:bg-gray-800">
                <Box className="mr-2 h-4 w-4" />
                Native INSPIRE
                <span className="ml-2 text-xs text-gray-500">(Coming Soon)</span>
              </TabsTrigger>
              <TabsTrigger
                value="scorm"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <FileText className="mr-2 h-4 w-4" />
                SCORM Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="native"
              className="mt-4 p-8 text-center border border-dashed border-gray-800 rounded"
            >
              <p className="text-gray-400">Native Course Builder is under development.</p>
            </TabsContent>

            <TabsContent value="scorm" className="mt-4 space-y-4">
              {/* Metadata Fields */}
              <div className="space-y-2">
                <Label>Course Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cybersecurity Basics"
                  className="bg-gray-900 border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary..."
                  className="bg-gray-900 border-gray-700"
                />
              </div>

              {/* The Uploader */}
              {title.length > 3 ? (
                <div className="mt-4">
                  {isCreating ? (
                    <div className="flex items-center justify-center p-8 border border-gray-800 rounded bg-gray-900">
                      <Loader2 className="animate-spin mr-2" />
                      <span>Finalizing Course...</span>
                    </div>
                  ) : (
                    <ScormUploader
                      tenantId={tenantId}
                      onUploadComplete={handleUploadComplete}
                      onUploadError={(err) => alert('Upload failed: ' + err.message)}
                    />
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-900 text-gray-500 text-sm text-center rounded">
                  Enter a title to enable upload.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Also export the named export for backward compatibility
export { CreateCourseModal };
