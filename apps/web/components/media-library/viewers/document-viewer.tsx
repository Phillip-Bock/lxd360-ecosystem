'use client';

import {
  ChevronLeft,
  ChevronRight,
  Columns,
  Download,
  FileSpreadsheet,
  FileText,
  Maximize2,
  Presentation,
  Printer,
  Search,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import * as React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ViewerContainer } from './viewer-container';
import { ToolbarButton, ToolbarGroup, ToolbarSeparator, ViewerToolbar } from './viewer-toolbar';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface DocumentViewerProps {
  src: string;
  mimeType: string;
  filename: string;
  pageCount?: number;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

type FitMode = 'width' | 'page' | 'custom';

export function DocumentViewer({ src, mimeType, filename }: DocumentViewerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [numPages, setNumPages] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [zoom, setZoom] = React.useState(1);
  const [fitMode, setFitMode] = React.useState<FitMode>('width');
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showThumbnails, setShowThumbnails] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSearch, setShowSearch] = React.useState(false);
  const [containerWidth, setContainerWidth] = React.useState(0);

  const isPdf = mimeType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf');
  const isDocx =
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filename.toLowerCase().endsWith('.docx');
  const isPptx =
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    filename.toLowerCase().endsWith('.pptx');
  const isXlsx =
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    filename.toLowerCase().endsWith('.xlsx');

  // Measure container width for responsive scaling
  React.useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width - (showThumbnails ? 180 : 0));
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [showThumbnails]);

  // PDF document load handlers
  const onDocumentLoadSuccess = React.useCallback(({ numPages: pages }: { numPages: number }) => {
    setNumPages(pages);
    setIsLoading(false);
  }, []);

  const onDocumentLoadError = React.useCallback(() => {
    setError('Failed to load document');
    setIsLoading(false);
  }, []);

  // Navigation
  const goToPage = React.useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(numPages, page)));
    },
    [numPages],
  );

  const prevPage = React.useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const nextPage = React.useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  // Zoom controls
  const handleZoomIn = React.useCallback(() => {
    setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
    setFitMode('custom');
  }, []);

  const handleZoomOut = React.useCallback(() => {
    setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM));
    setFitMode('custom');
  }, []);

  const handleFitWidth = React.useCallback(() => {
    setFitMode('width');
    setZoom(1);
  }, []);

  const handleFitPage = React.useCallback(() => {
    setFitMode('page');
    setZoom(1);
  }, []);

  // Fullscreen
  const toggleFullscreen = React.useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Silently ignore - fullscreen not supported or user declined
    }
  }, []);

  // Download
  const handleDownload = React.useCallback(async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Silently ignore - download failed, fallback to opening in new tab
      window.open(src, '_blank');
    }
  }, [src, filename]);

  // Print
  const handlePrint = React.useCallback(() => {
    const printWindow = window.open(src, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }, [src]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSearch && e.key !== 'Escape') return;

      switch (e.key) {
        case 'ArrowLeft':
          prevPage();
          break;
        case 'ArrowRight':
          nextPage();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'f':
        case 'F':
          if (!e.ctrlKey && !e.metaKey) {
            toggleFullscreen();
          } else {
            e.preventDefault();
            setShowSearch(true);
          }
          break;
        case 'Escape':
          if (showSearch) {
            setShowSearch(false);
            setSearchQuery('');
          } else if (isFullscreen) {
            document.exitFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevPage, nextPage, handleZoomIn, handleZoomOut, toggleFullscreen, showSearch, isFullscreen]);

  // Fullscreen change listener
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Calculate page width based on fit mode
  const pageWidth = React.useMemo(() => {
    if (fitMode === 'width' || fitMode === 'page') {
      return containerWidth - 40; // Subtract padding
    }
    return (containerWidth - 40) * zoom;
  }, [fitMode, containerWidth, zoom]);

  // Render non-PDF documents
  if (!isPdf) {
    const getIcon = () => {
      if (isDocx) return <FileText className="h-16 w-16 text-brand-blue" />;
      if (isPptx) return <Presentation className="h-16 w-16 text-orange-500" />;
      if (isXlsx) return <FileSpreadsheet className="h-16 w-16 text-brand-success" />;
      return <FileText className="h-16 w-16 text-muted-foreground" />;
    };

    const getTypeName = () => {
      if (isDocx) return 'Word Document';
      if (isPptx) return 'PowerPoint Presentation';
      if (isXlsx) return 'Excel Spreadsheet';
      return 'Document';
    };

    return (
      <ViewerContainer className="min-h-[400px]">
        <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
          {getIcon()}
          <h3 className="mt-4 font-medium text-lg">{filename}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{getTypeName()}</p>
          <p className="mt-4 text-sm text-muted-foreground max-w-md">
            This document format cannot be previewed directly. Download the file to view it in the
            appropriate application.
          </p>
          <button
            type="button"
            onClick={handleDownload}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download {getTypeName()}
          </button>
        </div>
      </ViewerContainer>
    );
  }

  return (
    <ViewerContainer
      isLoading={isLoading}
      error={error}
      onRetry={() => {
        setError(null);
        setIsLoading(true);
      }}
      fullscreen={isFullscreen}
      className="min-h-[600px]"
    >
      <div
        ref={containerRef}
        className={cn('relative w-full h-full flex', isFullscreen && 'bg-background')}
      >
        {/* Thumbnails sidebar */}
        {showThumbnails && numPages > 0 && (
          <div className="w-[160px] border-r bg-muted/30 shrink-0">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-2">
                {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    type="button"
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={cn(
                      'w-full p-1 rounded border-2 transition-colors',
                      currentPage === pageNum
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted-foreground/30',
                    )}
                  >
                    <Document file={src}>
                      <Page
                        pageNumber={pageNum}
                        width={130}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </Document>
                    <span className="text-xs text-muted-foreground mt-1 block">{pageNum}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Main document area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Search bar */}
          {showSearch && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-background/95 backdrop-blur-xs border rounded-lg p-2 shadow-lg">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in document..."
                className="w-64 h-8 border-0 focus-visible:ring-0"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                className="h-6 w-6 flex items-center justify-center hover:bg-accent rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Document content */}
          <ScrollArea className="flex-1">
            <div className="flex justify-center py-4 px-4">
              <Document
                file={src}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
              >
                <Page
                  pageNumber={currentPage}
                  width={pageWidth}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-lg"
                />
              </Document>
            </div>
          </ScrollArea>

          {/* Toolbar */}
          <ViewerToolbar floating={false}>
            <ToolbarGroup>
              <ToolbarButton
                icon={<Columns className="h-4 w-4" />}
                label="Toggle thumbnails"
                onClick={() => setShowThumbnails(!showThumbnails)}
                active={showThumbnails}
              />
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
              <ToolbarButton
                icon={<ChevronLeft className="h-4 w-4" />}
                label="Previous page"
                onClick={prevPage}
                disabled={currentPage <= 1}
              />
              <span className="px-2 text-sm tabular-nums whitespace-nowrap">
                {currentPage} / {numPages}
              </span>
              <ToolbarButton
                icon={<ChevronRight className="h-4 w-4" />}
                label="Next page"
                onClick={nextPage}
                disabled={currentPage >= numPages}
              />
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
              <ToolbarButton
                icon={<ZoomOut className="h-4 w-4" />}
                label="Zoom out"
                onClick={handleZoomOut}
                disabled={zoom <= MIN_ZOOM && fitMode === 'custom'}
              />
              <span className="px-2 text-sm tabular-nums min-w-[4rem] text-center">
                {fitMode === 'custom'
                  ? `${Math.round(zoom * 100)}%`
                  : fitMode === 'width'
                    ? 'Fit width'
                    : 'Fit page'}
              </span>
              <ToolbarButton
                icon={<ZoomIn className="h-4 w-4" />}
                label="Zoom in"
                onClick={handleZoomIn}
                disabled={zoom >= MAX_ZOOM && fitMode === 'custom'}
              />
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
              <ToolbarButton
                icon={<span className="text-xs font-medium">W</span>}
                label="Fit to width"
                onClick={handleFitWidth}
                active={fitMode === 'width'}
              />
              <ToolbarButton
                icon={<span className="text-xs font-medium">P</span>}
                label="Fit to page"
                onClick={handleFitPage}
                active={fitMode === 'page'}
              />
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
              <ToolbarButton
                icon={<Search className="h-4 w-4" />}
                label="Search"
                shortcut="Ctrl+F"
                onClick={() => setShowSearch(!showSearch)}
                active={showSearch}
              />
              <ToolbarButton
                icon={<Printer className="h-4 w-4" />}
                label="Print"
                onClick={handlePrint}
              />
              <ToolbarButton
                icon={<Download className="h-4 w-4" />}
                label="Download"
                onClick={handleDownload}
              />
              <ToolbarButton
                icon={<Maximize2 className="h-4 w-4" />}
                label="Fullscreen"
                shortcut="F"
                onClick={toggleFullscreen}
              />
            </ToolbarGroup>
          </ViewerToolbar>
        </div>
      </div>
    </ViewerContainer>
  );
}
