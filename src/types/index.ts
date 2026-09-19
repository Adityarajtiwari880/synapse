export type Role = 'admin' | 'researcher' | 'reviewer' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
  lastActive: string;
  status: 'active' | 'suspended';
}

export interface Collaborator {
  id: string;
  name: string;
  role: Role;
  color: string;
  isOnline: boolean;
  activeCardId?: string;
  cursorPos?: { x: number; y: number };
}

export interface CardComment {
  id: string;
  cardId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  timestamp: string;
}

export interface ActiveSession {
  id: string;
  userId: string;
  userName: string;
  device: string;
  browser: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: 'login' | 'passkey_auth' | 'document_import' | 'node_create' | 'agent_run' | 'cell_lock' | 'role_change' | 'session_kill' | 'export' | 'ink_draw' | 'frame_create' | 'collaborate_share' | 'comment_add';
  details: string;
  status: 'success' | 'warning' | 'error';
}

export interface BoundingBox {
  page: number;
  x0: number; // 0.0 to 1.0 normalized
  y0: number;
  x1: number;
  y1: number;
}

export interface GroundedAnchor {
  docId: string;
  docTitle: string;
  pageNumber: number;
  boxes: BoundingBox[];
  quote: {
    exact: string;
    prefix?: string;
    suffix?: string;
  };
  charRange: {
    start: number;
    end: number;
  };
}

export type NodeType = 'claim' | 'evidence' | 'question' | 'note' | 'concept';

export interface CanvasNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  title: string;
  content: string;
  simplifiedContent?: string; // Plain-English beginner translation
  imageUrl?: string; // Cropped visual image snippet from PDF or Doc
  frameId?: string;
  anchors: GroundedAnchor[];
  verificationState: 'verified' | 'unsupported' | 'unverified';
  confidence: number;
  origin: 'human' | 'agent';
  color?: string;
  puzzleLocked?: boolean; // When true, moves with its puzzle-connected cluster
  puzzleConnections?: string[]; // IDs of neighboring cards locked together like a puzzle
  commentsCount?: number;
  createdAt: number;
}

export interface CanvasFrame {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  relation: 'supports' | 'contradicts' | 'extends' | 'leads_to';
  label?: string;
}

export interface GhostNode {
  id: string;
  targetAnchor: GroundedAnchor;
  title: string;
  content: string;
  score: number;
  suggestedX: number;
  suggestedY: number;
  relation: 'supports' | 'contradicts' | 'extends';
}

export interface InkPoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface InkStroke {
  id: string;
  points: InkPoint[];
  color: string;
  width: number;
  isHighlighter?: boolean;
  target: 'canvas' | 'reader';
}

export interface LineBoundingBox {
  text: string;
  topPercent: number;
  leftPercent: number;
  widthPercent: number;
  heightPercent: number;
  isHighlight?: boolean;
}

export interface DocumentItem {
  id: string;
  title: string;
  authors: string;
  year: number;
  pages: number;
  highlightsCount: number;
  fileSize: string;
  fileType?: 'pdf' | 'docx' | 'doc' | 'txt' | 'md' | 'image' | 'svg' | 'json' | 'csv' | 'generic';
  docHtml?: string; // Authentic HTML layout for Word .docx documents
  docContent?: string; // Raw editable text content
  ingestStatus: 'ready' | 'processing' | 'failed';
  abstract?: string;
  storageUrl?: string;
  parsedPdf?: {
    title: string;
    totalPages: number;
    fileSize: string;
    pages: Array<{
      pageNumber: number;
      text: string;
      lines: string[];
      lineBoxes?: LineBoundingBox[];
      canvasDataUrl?: string;
      width?: number;
      height?: number;
    }>;
    fullText: string;
  };
}

export interface TableCell {
  value: string;
  evidence: {
    quote: string;
    docTitle: string;
    page: number;
  }[];
  confidence: number;
  verificationState: 'verified' | 'unsupported' | 'contradicted';
  editedByHuman: boolean;
}

export interface SynthesisRow {
  docId: string;
  docTitle: string;
  architecture: TableCell;
  scaling: TableCell;
  advantage: TableCell;
  limitations?: TableCell;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: {
    docTitle: string;
    page: number;
    quote: string;
  }[];
  suggestedCards?: {
    title: string;
    content: string;
    type: NodeType;
  }[];
}

export type ProfessionalField = 'academic' | 'legal' | 'business' | 'medical';
export type SqueezeMode = 'none' | 'highlights' | 'search';
export type ProjectWorkflowMode = 'manual' | 'ai_assistant';

export type DeviceMode = 'auto' | 'tablet' | 'desktop';
export type AppTheme = 'dark' | 'sepia' | 'light' | 'midnight';
export type AITone = 'beginner' | 'academic' | 'concise';
export type TypographyFamily = 'sans' | 'serif' | 'dyslexic';
export type DensityMode = 'comfortable' | 'compact';
export type CanvasPageDesign = 'dots' | 'graph' | 'cornell' | 'minimal' | 'nebula' | 'sepia';
export type PdfColorFilter = 'normal' | 'sepia' | 'dark-invert' | 'soft-contrast';

export interface AppSettings {
  deviceMode: DeviceMode;
  theme: AppTheme;
  workflowMode: ProjectWorkflowMode;
  canvasDesign: CanvasPageDesign;
  pdfColorFilter: PdfColorFilter;
  aiTone: AITone;
  fontFamily: TypographyFamily;
  density: DensityMode;
  geminiApiKey: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  ollamaEndpoint: string;
  activeProvider: 'gemini' | 'openai' | 'anthropic' | 'ollama' | 'local-simulated';
  enablePalmRejection: boolean;
  enableSoundEffects: boolean;
  autoProposeGhosts: boolean;
  showGestureHints: boolean;
  defaultFontSize: 'sm' | 'base' | 'lg' | 'xl';
}

export type AppView =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'workspace'
  | 'library'
  | 'matrix'
  | 'admin'
  | 'organization'
  | 'trust'
  | 'docs'
  | 'pricing';

export interface EnterpriseMatter {
  id: string;
  title: string;
  matterNumber: string;
  client: string;
  field: ProfessionalField;
  workflowMode?: ProjectWorkflowMode;
  status: 'active' | 'in_review' | 'archived' | 'urgent';
  lastModified: string;
  documentCount: number;
  nodeCount: number;
  collaboratorCount: number;
  description: string;
  tags: string[];
}

