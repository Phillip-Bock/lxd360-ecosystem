'use client';

import {
  ArrowLeft,
  Box,
  Clock,
  Download,
  Eye,
  Folder,
  GraduationCap,
  Image,
  MessageSquare,
  Settings,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

export default function CourseEditorSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <Link
          href="/"
          className="flex items-center gap-x-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Back to Dashboard</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Block Library */}
        <SidebarGroup>
          <SidebarGroupLabel>Insert</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Text Blocks">
                  <span className="text-lg">Aa</span>
                  <span>Text</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Media Blocks">
                  <Image className="h-5 w-5" />
                  <span>Media</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Interactive Blocks">
                  <Box className="h-5 w-5" />
                  <span>Interactive</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Assessment Blocks">
                  <GraduationCap className="h-5 w-5" />
                  <span>Assessment</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="AI Generate">
                  <Sparkles className="h-5 w-5" />
                  <span>AI Generate</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Course Structure */}
        <SidebarGroup>
          <SidebarGroupLabel>Course</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Slides/Pages">
                  <Folder className="h-5 w-5" />
                  <span>Slides</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Timeline">
                  <Clock className="h-5 w-5" />
                  <span>Timeline</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Comments">
                  <MessageSquare className="h-5 w-5" />
                  <span>Comments</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Preview">
                  <Eye className="h-5 w-5" />
                  <span>Preview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Export">
                  <Download className="h-5 w-5" />
                  <span>Export</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
