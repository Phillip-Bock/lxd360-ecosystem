// Learning Components - Master Export

export { AudioPlayer } from '@/components/content-blocks/media/AudioPlayer';
export { ImageGallery } from '@/components/content-blocks/media/ImageGallery';
// Media Components (re-export from content-blocks/media)
export { VideoPlayer } from '@/components/content-blocks/media/VideoPlayer';
// Assessment
export { AssessmentArchitect } from '@/components/inspire/assessment';
// 360 Panorama
export * from './360';
export type { LessonContentRendererProps } from './LessonContentRenderer';
// Lesson Renderer
export { LessonContentRenderer } from './LessonContentRenderer';

// Placeholder exports for future components
// export { ModelViewer } from "./ModelViewer" // 3D model viewer
// export { PDFViewer } from "./PDFViewer" // PDF document viewer
// export { LottieAnimation } from "./LottieAnimation" // Lottie animations
// export { WaveformPlayer } from "./WaveformPlayer" // Advanced audio with waveform
// export { VRViewer } from "./VRViewer" // VR content viewer
