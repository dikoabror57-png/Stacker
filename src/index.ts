export type FileKind = 'image' | 'calibration' | 'unknown';

export interface FileMeta {
  id: string;
  /** On-disk file name (UUID-prefixed, unique). */
  name: string;
  /** Upload name as provided by the user, for display. */
  originalName?: string;
  kind: FileKind;
  mime: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  channelCount: number;
  bitDepth: number | null;
  fitsInfo: FitsInfo | null;
  hash: string | null;
  createdAt: string;
  projectId?: string;
}

export interface FitsInfo {
  extensions: FitsExtension[];
  header: Record<string, string>;
  hasWcs: boolean;
  hasUncertainty: boolean;
  hasMask: boolean;
  units: string | null;
  exposure: string | null;
  detector: string | null;
  filter: string | null;
  observationDate: string | null;
}

export interface FitsExtension {
  hdu: number;
  name: string;
  extensionType: string;
  shape: number[];
  dtype: string;
  isImage: boolean;
  bUnit: string | null;
}

export type Workflow = 'multi-exposure' | 'single-image' | 'fits-science' | 'unclassified';

export type CombineMethod = 'mean' | 'median' | 'sigma-clip';

export type JobStatus =
  | 'queued'
  | 'running'
  | 'calibration'
  | 'alignment'
  | 'combining'
  | 'enhancing'
  | 'analyzing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface ProcessingParameters {
  combineMethod: CombineMethod;
  sigmaClipSigma: number;
  sigmaClipIter: number;
  enableEnhancement: boolean;
  enhancementMode: 'denoise' | 'deconvolve' | 'both' | 'none';
  psfEstimate: 'auto' | 'manual' | 'none';
  psfSigma: number | null;
  displayStretch: DisplayStretch;
}

export interface DisplayStretch {
  type: 'linear' | 'log' | 'sqrt' | 'asinh';
  percentileLow: number;
  percentileHigh: number;
  asinhScaling: number;
  gamma: number;
}

export type OutputFormat = 'fits' | 'tiff' | 'png' | 'json-report' | 'html-report';

export interface OutputProduct {
  id: string;
  projectId: string;
  jobId: string;
  label: string;
  productType: 'stack' | 'enhanced' | 'preview' | 'report' | 'manifest';
  format: OutputFormat;
  status: 'pending' | 'ready' | 'failed';
  remotePath: string | null;
  sizeBytes: number | null;
  checksum: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export type MetricKind =
  | 'noise'
  | 'signalToNoise'
  | 'starCount'
  | 'fwhm'
  | 'saturation'
  | 'coverage'
  | 'alignment'
  | 'frameQuality'
  | 'dynamicRange'
  | 'xyCoverage';

export interface QualityMetric {
  id: string;
  projectId: string;
  jobId: string;
  kind: MetricKind;
  name: string;
  value: number | null;
  unit: string;
  method: string;
  isEstimate: boolean;
  assumptions: string[];
  notes: string;
  frameId: string | null;
  createdAt: string;
}

export type ProjectVisibility = 'private' | 'shared';

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  workflow: Workflow;
  visibility: ProjectVisibility;
  status: 'draft' | 'ready' | 'processing' | 'completed' | 'archived';
  frameCount: number;
  regionOfSky: string | null;
  createdAt: string;
  updatedAt: string;
}

export type EventLevel = 'info' | 'warn' | 'error' | 'stage';

export interface ProcessingEvent {
  id: string;
  projectId: string;
  jobId: string;
  stage: string | null;
  message: string;
  level: EventLevel;
  detail: string | null;
  createdAt: string;
}

export interface Job {
  id: string;
  projectId: string;
  ownerId: string;
  workflow: Workflow;
  status: JobStatus;
  progress: number;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
  parameters: ProcessingParameters;
  combineMethod: CombineMethod;
  rejectedFrameIds: string[];
  rejectionReasons: string[];
  alignmentResult: AlignmentResult | null;
  coverageResult: CoverageResult | null;
  scientificResultAvailable: boolean;
  enhancedResultAvailable: boolean;
  createdAt: string;
}

export interface AlignmentResult {
  success: boolean;
  referenceFrameId: string | null;
  registeredFrameCount: number;
  misalignedFrameIds: string[];
  transformType: string | null;
  residualArcseconds: number | null;
  notes: string[];
}

export interface CoverageResult {
  outputShape: number[];
  validFraction: number | null;
  edgeCropped: boolean;
}

export type ApiStatus = 'ok' | 'degraded' | 'offline' | 'not-configured';

export interface ApiHealth {
  status: ApiStatus;
  version: string;
  stack: string[];
  configured: {
    authentication: boolean;
    storage: boolean;
    processingBackend: boolean;
  };
  message: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ValidationError {
  fileId: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface UploadSession {
  id: string;
  projectId: string;
  expectedFileCount: number;
  stage: 'collecting' | 'validating' | 'finalizing' | 'completed';
  receivedBytes: number;
  totalBytes: number;
  expiresAt: string;
}

export interface PixelInspector {
  x: number;
  y: number;
  value: number | string | null;
  rawValue: number | string | null;
  unit: string | null;
  inSaturatedRegion: boolean;
}

export interface ProcessingManifest {
  application: string;
  version: string;
  generatedAt: string;
  projectId: string;
  jobId: string;
  workflow: Workflow;
  inputs: { id: string; name: string; hash: string | null; sizeBytes: number }[];
  parameters: ProcessingParameters & { combineMethod: CombineMethod };
  alignment: AlignmentResult | null;
  coverage: CoverageResult | null;
  metrics: QualityMetric[];
  outputs: { label: string; format: OutputFormat; checksum: string | null }[];
  scientificIntegrity: {
    enhancementIndicated: boolean;
    enhancementLabel: string | null;
    limitations: string[];
    unavailableCapabilities: string[];
  };
}

export const DEFAULT_PARAMS: ProcessingParameters = {
  combineMethod: 'median',
  sigmaClipSigma: 3,
  sigmaClipIter: 5,
  enableEnhancement: false,
  enhancementMode: 'denoise',
  psfEstimate: 'auto',
  psfSigma: null,
  displayStretch: {
    type: 'linear',
    percentileLow: 0.5,
    percentileHigh: 99.5,
    asinhScaling: 1000,
    gamma: 1,
  },
};

export const MAX_FRAME_BYTES = 500 * 1024 * 1024; // 500 MB
export const MAX_FRAMES = 100;
export const MAX_TOTAL_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB
export const SUPPORTED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/tiff',
  'image/x-tiff',
];
export const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.fits', '.fit', '.fz']);
