import type {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from 'firebase/firestore';
import type {
  Assessment,
  ContentBlock,
  Course,
  Lesson,
  MediaAsset,
  Organization,
  UserProgress,
} from '@/types/firestore/cms';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Creates a base converter that adds the document ID to the data
 * @param transform - Optional transform function for additional processing
 */
function createConverter<T extends { id: string }>(
  transform?: (data: DocumentData, id: string) => T,
): FirestoreDataConverter<T> {
  return {
    toFirestore(data: WithFieldValue<T>): DocumentData {
      // Remove the id field before storing (it's stored as the document ID)
      const { id, ...rest } = data as T & { id: string };
      return rest as DocumentData;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>, options?: SnapshotOptions): T {
      const data = snapshot.data(options);
      if (transform) {
        return transform(data, snapshot.id);
      }
      return {
        id: snapshot.id,
        ...data,
      } as T;
    },
  };
}

// =============================================================================
// COURSE CONVERTER
// =============================================================================

/**
 * Firestore converter for Course documents
 */
export const courseConverter: FirestoreDataConverter<Course> = createConverter<Course>(
  (data, id) => ({
    id,
    organizationId: data.organizationId ?? '',
    title: data.title ?? '',
    slug: data.slug ?? '',
    description: data.description ?? '',
    shortDescription: data.shortDescription ?? '',
    thumbnailUrl: data.thumbnailUrl ?? '',
    coverImageUrl: data.coverImageUrl,
    previewVideoUrl: data.previewVideoUrl,
    durationMinutes: data.durationMinutes ?? 0,
    difficulty: data.difficulty ?? 'beginner',
    categoryId: data.categoryId ?? '',
    categoryName: data.categoryName ?? '',
    subcategoryId: data.subcategoryId,
    tags: data.tags ?? [],
    inspireStages: data.inspireStages ?? [],
    cognitiveLoadTarget: data.cognitiveLoadTarget ?? 'medium',
    instructorId: data.instructorId ?? '',
    instructorName: data.instructorName ?? '',
    coInstructorIds: data.coInstructorIds ?? [],
    prerequisiteIds: data.prerequisiteIds ?? [],
    status: data.status ?? 'draft',
    version: data.version ?? '1.0.0',
    publishedAt: data.publishedAt,
    lessonCount: data.lessonCount ?? 0,
    moduleCount: data.moduleCount ?? 0,
    assessmentCount: data.assessmentCount ?? 0,
    averageRating: data.averageRating ?? 0,
    reviewCount: data.reviewCount ?? 0,
    enrollmentCount: data.enrollmentCount ?? 0,
    completionRate: data.completionRate ?? 0,
    language: data.language ?? 'en',
    captionLanguages: data.captionLanguages ?? [],
    xpTotal: data.xpTotal ?? 0,
    certificateTemplateId: data.certificateTemplateId,
    accessType: data.accessType ?? 'free',
    priceInCents: data.priceInCents,
    salePriceInCents: data.salePriceInCents,
    currency: data.currency ?? 'USD',
    isComplianceRequired: data.isComplianceRequired ?? false,
    complianceType: data.complianceType,
    regulatoryBody: data.regulatoryBody,
    ceuCredits: data.ceuCredits,
    recertificationDays: data.recertificationDays,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdBy: data.createdBy ?? '',
    updatedBy: data.updatedBy ?? '',
  }),
);

// =============================================================================
// LESSON CONVERTER
// =============================================================================

/**
 * Firestore converter for Lesson documents
 */
export const lessonConverter: FirestoreDataConverter<Lesson> = createConverter<Lesson>(
  (data, id) => ({
    id,
    organizationId: data.organizationId ?? '',
    courseId: data.courseId ?? '',
    moduleId: data.moduleId,
    moduleName: data.moduleName,
    title: data.title ?? '',
    slug: data.slug ?? '',
    description: data.description,
    order: data.order ?? 0,
    durationMinutes: data.durationMinutes ?? 0,
    contentType: data.contentType ?? 'text',
    contentUrl: data.contentUrl,
    thumbnailUrl: data.thumbnailUrl,
    inspireStage: data.inspireStage ?? 'scaffold',
    cognitiveLoadTarget: data.cognitiveLoadTarget ?? 'medium',
    isPreviewable: data.isPreviewable ?? false,
    isRequired: data.isRequired ?? true,
    status: data.status ?? 'draft',
    xpReward: data.xpReward ?? 0,
    assessmentId: data.assessmentId,
    scormPackageId: data.scormPackageId,
    xapiActivityId: data.xapiActivityId,
    hasTranscript: data.hasTranscript ?? false,
    hasCaptions: data.hasCaptions ?? false,
    hasAudioDescription: data.hasAudioDescription ?? false,
    transcriptContent: data.transcriptContent,
    captionsUrl: data.captionsUrl,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdBy: data.createdBy ?? '',
    updatedBy: data.updatedBy ?? '',
  }),
);

// =============================================================================
// CONTENT BLOCK CONVERTER
// =============================================================================

/**
 * Firestore converter for ContentBlock documents
 */
export const contentBlockConverter: FirestoreDataConverter<ContentBlock> =
  createConverter<ContentBlock>((data, id) => ({
    id,
    organizationId: data.organizationId ?? '',
    lessonId: data.lessonId ?? '',
    type: data.type ?? 'text',
    order: data.order ?? 0,
    content: data.content ?? { type: 'text', content: '' },
    className: data.className,
    styles: data.styles,
    durationSeconds: data.durationSeconds,
    cognitiveLoadWeight: data.cognitiveLoadWeight,
    isRequired: data.isRequired ?? false,
    ariaLabel: data.ariaLabel,
    status: data.status ?? 'draft',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdBy: data.createdBy ?? '',
    updatedBy: data.updatedBy ?? '',
  }));

// =============================================================================
// ASSESSMENT CONVERTER
// =============================================================================

/**
 * Firestore converter for Assessment documents
 */
export const assessmentConverter: FirestoreDataConverter<Assessment> = createConverter<Assessment>(
  (data, id) => ({
    id,
    organizationId: data.organizationId ?? '',
    title: data.title ?? '',
    slug: data.slug ?? '',
    description: data.description,
    assessmentType: data.assessmentType ?? 'quiz',
    courseId: data.courseId,
    lessonId: data.lessonId,
    questionIds: data.questionIds ?? [],
    totalPoints: data.totalPoints ?? 0,
    passingScore: data.passingScore ?? 70,
    timeLimitMinutes: data.timeLimitMinutes ?? 0,
    maxAttempts: data.maxAttempts ?? 0,
    shuffleQuestions: data.shuffleQuestions ?? false,
    shuffleOptions: data.shuffleOptions ?? false,
    showCorrectAnswers: data.showCorrectAnswers ?? true,
    showScore: data.showScore ?? true,
    status: data.status ?? 'draft',
    allowReview: data.allowReview ?? true,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdBy: data.createdBy ?? '',
    updatedBy: data.updatedBy ?? '',
  }),
);

// =============================================================================
// MEDIA ASSET CONVERTER
// =============================================================================

/**
 * Firestore converter for MediaAsset documents
 */
export const mediaAssetConverter: FirestoreDataConverter<MediaAsset> = createConverter<MediaAsset>(
  (data, id) => ({
    id,
    organizationId: data.organizationId ?? '',
    filename: data.filename ?? '',
    assetType: data.assetType ?? 'other',
    mimeType: data.mimeType ?? 'application/octet-stream',
    sizeBytes: data.sizeBytes ?? 0,
    storageUrl: data.storageUrl ?? '',
    cdnUrl: data.cdnUrl,
    altText: data.altText,
    title: data.title,
    description: data.description,
    tags: data.tags ?? [],
    folderPath: data.folderPath ?? '/',
    width: data.width,
    height: data.height,
    durationSeconds: data.durationSeconds,
    thumbnailUrl: data.thumbnailUrl,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdBy: data.createdBy ?? '',
    updatedBy: data.updatedBy ?? '',
  }),
);

// =============================================================================
// USER PROGRESS CONVERTER
// =============================================================================

/**
 * Firestore converter for UserProgress documents
 */
export const userProgressConverter: FirestoreDataConverter<UserProgress> =
  createConverter<UserProgress>((data, id) => ({
    id,
    organizationId: data.organizationId ?? '',
    userId: data.userId ?? '',
    courseId: data.courseId ?? '',
    lessonId: data.lessonId,
    progressPercent: data.progressPercent ?? 0,
    status: data.status ?? 'not_started',
    startedAt: data.startedAt,
    completedAt: data.completedAt,
    lastAccessedAt: data.lastAccessedAt,
    timeSpentSeconds: data.timeSpentSeconds ?? 0,
    lastPosition: data.lastPosition,
    assessmentScores: data.assessmentScores,
    xpEarned: data.xpEarned ?? 0,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdBy: data.createdBy ?? '',
    updatedBy: data.updatedBy ?? '',
  }));

// =============================================================================
// ORGANIZATION CONVERTER
// =============================================================================

/**
 * Firestore converter for Organization documents
 */
export const organizationConverter: FirestoreDataConverter<Organization> =
  createConverter<Organization>((data, id) => ({
    id,
    name: data.name ?? '',
    slug: data.slug ?? '',
    logoUrl: data.logoUrl,
    contactEmail: data.contactEmail ?? '',
    subscriptionPlan: data.subscriptionPlan ?? 'free',
    stripeCustomerId: data.stripeCustomerId,
    subscriptionStatus: data.subscriptionStatus ?? 'active',
    maxUsers: data.maxUsers ?? 10,
    maxStorageBytes: data.maxStorageBytes ?? 1073741824, // 1GB default
    customDomain: data.customDomain,
    branding: data.branding,
    features: data.features ?? {
      xapiEnabled: false,
      scormEnabled: false,
      customBranding: false,
      ssoEnabled: false,
      apiAccess: false,
    },
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }));
