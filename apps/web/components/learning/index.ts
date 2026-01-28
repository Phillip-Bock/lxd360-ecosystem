// Learning Components - Master Export

export { AudioPlayer } from '@/components/content-blocks/media/audio-player';
export { ImageGallery } from '@/components/content-blocks/media/image-gallery';
// Media Components (re-export from content-blocks/media)
export { VideoPlayer } from '@/components/content-blocks/media/video-player';
// Assessment
export { AssessmentArchitect } from '@/components/inspire/assessment';
// 360 Panorama
export * from './360';
export type { LessonContentRendererProps } from './lesson-content-renderer';
// Lesson Renderer
export { LessonContentRenderer } from './lesson-content-renderer';

// Placeholder exports for future components
// export { ModelViewer } from "./ModelViewer" // 3D model viewer
// export { PDFViewer } from "./PDFViewer" // PDF document viewer
// export { LottieAnimation } from "./LottieAnimation" // Lottie animations
// export { WaveformPlayer } from "./WaveformPlayer" // Advanced audio with waveform
// export { VRViewer } from "./VRViewer" // VR content viewer
