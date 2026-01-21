// =============================================================================
// Spatial Utilities
// =============================================================================
// Exports for 360° spatial editor utilities.
// =============================================================================

// Camera animation
export type {
  AnimationController,
  EasingFunction,
  TourSequencer,
  TourStop,
} from './cameraAnimator';
export {
  calculateLookAtRotation,
  createCameraAnimation,
  createTourSequencer,
  cubicBezierEasing,
  easingFunctions,
  lerpRotation,
} from './cameraAnimator';
// Raycasting and positioning
export {
  calculateDistance,
  cartesianToSpherical,
  findNearestPosition,
  isInFieldOfView,
  lerpVector,
  normalizeVector,
  screenToSpherePosition,
  spherePositionToScreen,
  sphericalToCartesian,
} from './raycaster';
// Texture loading
export {
  clearTextureCache,
  getCachedTexture,
  getTextureLoadProgress,
  isTextureLoaded,
  loadPanoramaTexture,
  preloadTextures,
} from './textureLoader';

// xAPI spatial verbs
export {
  buildExplorationStartedStatement,
  buildHotspotFocusedStatement,
  buildHotspotInteractedStatement,
  buildSceneCompletedStatement,
  buildSceneInitializedStatement,
  buildSceneNavigatedStatement,
  buildTourStopReachedStatement,
  buildViewDirectionStatement,
} from './xapiSpatialVerbs';
