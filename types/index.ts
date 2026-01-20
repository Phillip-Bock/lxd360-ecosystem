// ============================================================================
// DATABASE TYPES - Firestore document types
// ============================================================================

/**
 * JSON-compatible type for Firestore documents
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ============================================================================
// RBAC TYPES
// NOTE: lib/rbac removed during GCP migration. Using types/rbac.ts instead.
// ============================================================================

// Re-export from local rbac.ts (types/rbac.ts has the canonical definitions)
export type { Permission as RBACSimplePermission, Role, RouteProtection, UserRole } from './rbac';

export { getRoleDisplayName, hasMinimumRole, isValidRole, ROLE_LEVELS } from './rbac';

// ============================================================================
// PRICING TYPES
// ============================================================================

export type {
  AddonCategory,
  // Addon types
  AddonLimits,
  BillingPeriod,
  // Checkout types
  CheckoutItem,
  CheckoutRequest,
  CheckoutResponse,
  CheckoutSession,
  // Comparison types
  ComparisonFeatureRow,
  ComparisonTable,
  DiscountType,
  FeatureCategory,
  PricingAddon,
  // Discount types
  PricingDiscount,
  // Feature types
  PricingFeature,
  // Page types
  PricingPageData,
  // Product types
  PricingProduct,
  // Testimonial types
  PricingTestimonial,
  // Tier types
  PricingTier,
  ProductPricingPageData,
  // Enums
  ProductType as PricingProductType,
  // ROI types
  ROIInputs,
  ROIResults,
  TierFeature,
  TierLevel,
  VerificationMethod,
} from './pricing';

export {
  ADDON_CATEGORY_LABELS,
  // Constants
  BILLING_PERIOD_LABELS,
  calculateSavings,
  formatLimit,
  // Helper functions
  formatPrice,
  getMonthlyEquivalent,
  getStripePriceId,
  getTierPrice,
  isTierHigher,
  TIER_LEVEL_ORDER,
} from './pricing';

// ============================================================================
// STRIPE TYPES - Payment & Subscription Management (LXD-133)
// ============================================================================

export type {
  BillingApiResponse,
  BillingError,
  BillingInterval,
  // Checkout types
  CreateCheckoutParams,
  CustomerData,
  FeatureFlags,
  // Invoice & Payment types
  InvoiceSummary,
  PaymentIntentStatus,
  // Customer types
  PaymentMethodSummary,
  PaymentRecord,
  PlanLimits,
  // Plan types
  PlanType,
  // Error types
  StripeErrorCode,
  // Webhook types
  StripeEventType,
  SubscriptionDetails,
  SubscriptionPlan,
  // Subscription types
  SubscriptionStatus,
  // API types
  UpdateSubscriptionRequest,
  UpdateSubscriptionResponse,
  // Usage types
  UsageAction,
  UsageLimitCheckResult,
  UsageMetrics,
  WebhookEvent,
  WebhookEventData,
  WebhookHandler,
  WebhookHandlerRegistry,
} from './stripe';

export {
  formatAmount,
  hasActiveSubscription,
  isActiveSubscription,
  // Helper functions
  isPlanType,
  isUnlimited,
  // Constants
  PLAN_LIMITS,
} from './stripe';

// ============================================================================
// XAPI TYPES - Learning Analytics & LRS (LXD-134)
// ============================================================================

export type {
  // Actor types
  Account,
  Activity,
  ActivityDefinition,
  Actor,
  ADLVerbId,
  Agent,
  AgentWithAccount,
  AgentWithMbox,
  AssessmentScore,
  ContentAnalytics,
  Context,
  // Context types
  ContextActivities,
  CreateStatementParams,
  Duration as XAPIDuration,
  Extensions,
  Group,
  InteractionComponent,
  // Object types
  InteractionType,
  IRI,
  // Core xAPI types
  LanguageMap,
  LearnerProgress as XAPILearnerProgress,
  MailtoIRI,
  // Analytics types
  MasteryLevel,
  OrganizationAnalytics,
  Result,
  // Result types
  Score,
  // Builder types
  StatementBuilderConfig,
  StatementObject,
  StatementQuery,
  StatementRef,
  StatementResult,
  SubStatement,
  Timestamp as XAPITimestamp,
  UUID as XAPIUUID,
  // Verb types
  Verb,
  // Statement types
  XAPIStatement,
} from './xapi';

export {
  // ADL Verbs constant
  ADL_VERBS,
  createAgentFromAccount,
  createAgentFromEmail,
  // Helper functions
  createVerb,
  formatSecondsToDuration,
  isActivity,
  // Type guards
  isAgent,
  isGroup,
  isStatementRef,
  isSubStatement,
  LXP360_ACTIVITY_TYPES,
  LXP360_EXTENSIONS,
  parseDurationToSeconds,
} from './xapi';

// ============================================================================
// RBAC EXTENDED TYPES - Comprehensive Role-Based Access Control
// ============================================================================

export type {
  Action as RBACAction,
  Permission as RBACPermission,
  PermissionCheckResult,
  PermissionCondition,
  PermissionContext,
  PermissionRule,
  // Permission types
  Resource,
  // Role types (aliased to avoid conflict with lib/rbac)
  Role as RBACRole,
  RoleScope,
  // Route protection types
  RouteProtection as RBACRouteProtection,
  RouteProtectionMap,
  TemporaryElevation,
  // User role types
  UserRole as RBACUserRole,
} from './rbac';

export {
  ASSESSMENT_TAKER_ROLES,
  BILLING_ROLES,
  COURSE_CREATE_ROLES,
  canAssignRole,
  DEFAULT_ROUTE_PROTECTIONS,
  getRolesAtOrBelow,
  isEmployeeEmail,
  isValidRole as isValidRBACRole,
  PUBLISH_ROLES,
  USER_MANAGEMENT_ROLES,
} from './rbac';

// ============================================================================
// CONTENT BLOCK TYPES - INSPIRE Studio Authoring
// ============================================================================

export type {
  // Accessibility types
  A11yFeature,
  // Interactive block configs
  AccordionConfig,
  AccordionItem,
  // AI block configs
  AIMentorConfig,
  BaseBlockConfig,
  BlockCategory,
  BlockConfig,
  // Block definition types
  BlockDefinition,
  // Block types
  BlockType,
  BranchingChoice,
  // Scenario block configs
  BranchingConfig,
  BranchingNode,
  CalloutConfig,
  // Data block configs
  ChartConfig,
  ChartDataSeries,
  ContentBlock,
  FITBBlank,
  FITBQuestionConfig,
  // Text block configs
  HeadingConfig,
  // Media block configs
  ImageConfig,
  // Interactivity types
  InteractivityLevel,
  MatchingConfig,
  MatchingPair,
  // Assessment block configs
  MCQuestionConfig,
  ParagraphConfig,
  // Portable Text types
  PortableTextBlock,
  PortableTextMarkDef,
  PortableTextSpan,
  QuestionOption,
  QuizCuePoint,
  RichTextConfig,
  TabItem,
  TabsConfig,
  TFQuestionConfig,
  VideoChapter,
  VideoConfig,
  VRHotspot,
  // Immersive block configs
  VRSceneConfig,
  WCAGLevel,
} from './content-blocks';

export {
  BLOCK_DEFINITIONS,
  calculateCognitiveLoad,
  calculateDuration,
  // Helper functions
  getBlockDefinition,
  getBlocksByCategory,
  getBlocksByLevel,
  getExpectedXAPIVerbs,
  // Constants
  INTERACTIVITY_LEVELS,
  INTERACTIVITY_MULTIPLIERS,
} from './content-blocks';

// ============================================================================
// THREE.JS / XR TYPES - 3D/VR/AR Experiences (LXD-136)
// ============================================================================

export type {
  AmbientLightConfig,
  AnimationClip,
  // Animation types
  AnimationKeyframe,
  AnimationTrack,
  // Audio types
  Audio3DConfig,
  AudioSourceConfig,
  BaseLightConfig,
  BaseMaterialConfig,
  BloomEffect,
  BoxGeometryConfig,
  CameraConfig,
  // Camera types
  CameraType,
  // React Three Fiber types
  Canvas3DProps,
  ChromaticAberrationEffect,
  ColliderConfig,
  ColliderType,
  ColorAlphaTuple,
  ColorTuple,
  CSSColor,
  CylinderGeometryConfig,
  DirectionalLightConfig,
  DOFEffect,
  EasingFunction,
  EnvironmentConfig,
  // Environment types
  EnvironmentPreset,
  Euler,
  EulerTuple,
  FogConfig,
  GeometryConfig,
  // Geometry types
  GeometryType,
  GLTFResult,
  GroundConfig,
  HemisphereLightConfig,
  HexColor,
  HotspotAction,
  Learning3DExperience,
  LearningHotspot,
  // Learning experience types
  LearningInteractionType,
  LightConfig,
  LightingConfig,
  // Lighting types
  LightType,
  MaterialConfig,
  // Material types
  MaterialType,
  Model3DConfig,
  ModelAnimationConfig,
  // Model types
  ModelFormat,
  OrthographicCameraConfig,
  PerspectiveCameraConfig,
  PhysicalMaterialConfig,
  // Physics types
  PhysicsConfig,
  PlaneGeometryConfig,
  PointLightConfig,
  // Post processing types
  PostProcessingConfig,
  PostProcessingEffect,
  RectAreaLightConfig,
  RigidBodyConfig,
  RigidBodyType,
  RootState,
  // Scene types
  SceneConfig,
  ShadowConfig,
  SphereGeometryConfig,
  SpotLightConfig,
  SSAOEffect,
  StandardMaterialConfig,
  ToneMappingEffect,
  UseFrameCallback,
  // Alias types
  Vec3,
  Vec4,
  // Core 3D types
  Vector3Tuple,
  Vector4Tuple,
  VignetteEffect,
  XRButtonState,
  XRConfig,
  XRControllerConfig,
  XRControllerState,
  XRHandConfig,
  XRHandedness,
  XRHitTestConfig,
  XRInteractionEvent,
  // XR types
  XRMode,
  XRReferenceSpaceType,
  XRSessionMode,
} from './three';

export {
  // Factory functions
  createDefaultSceneConfig,
  createXRSceneConfig,
  isOrthographicCamera,
  // Type guards
  isPerspectiveCamera,
} from './three';

// ============================================================================
// STUDIO TYPES - INSPIRE Studio Store & Blocks
// ============================================================================

export type {
  BlockConfigMap,
  BlockContentMap,
  BlockInstance,
  CourseState,
  CourseStatus,
  StarterBlockType,
} from './studio';
