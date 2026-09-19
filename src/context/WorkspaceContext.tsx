import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DocumentItem,
  CanvasNode,
  CanvasEdge,
  CanvasFrame,
  GhostNode,
  SynthesisRow,
  AuditLogEntry,
  InkStroke,
  Collaborator,
  AppSettings,
  ProfessionalField,
  SqueezeMode,
  AppView,
  EnterpriseMatter
} from '../types';
import { useAuth } from './AuthContext';
import { parseDocumentFile } from '../services/pdfService';
import { useMatters } from '../hooks/useMatters';
import { useCanvas } from '../hooks/useCanvas';
import { useDocuments } from '../hooks/useDocuments';
import { isSupabaseConfigured } from '../lib/supabase';

export type { ProfessionalField, SqueezeMode, AppView, EnterpriseMatter };


interface WorkspaceContextType {

  // Professional Preset
  activeField: ProfessionalField;
  switchField: (field: ProfessionalField) => void;

  // Documents
  documents: DocumentItem[];
  selectedDoc: DocumentItem;
  selectDocument: (id: string) => void;
  importDocument: (file: File) => void;

  // Liquid Squeeze Engine (Signature LiquidText Feature)
  squeezeMode: SqueezeMode;
  setSqueezeMode: (mode: SqueezeMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Spatial Canvas
  nodes: CanvasNode[];
  frames: CanvasFrame[];
  edges: CanvasEdge[];
  ghosts: GhostNode[];
  ghostLayerActive: boolean;
  toggleGhostLayer: () => void;
  addNode: (node: Omit<CanvasNode, 'id' | 'createdAt'> & { id?: string }) => string;
  updateNode: (id: string, partial: Partial<CanvasNode>) => void;
  updateNodePos: (id: string, x: number, y: number) => void;
  updateNodesPos: (updates: { id: string; x: number; y: number }[]) => void;
  deleteNode: (id: string) => void;
  addFrame: (frame: CanvasFrame) => void;
  deleteFrame: (frameId: string) => void;
  addEdge: (edge: CanvasEdge) => void;
  updateEdge: (id: string, partial: Partial<CanvasEdge>) => void;
  deleteEdge: (edgeId: string) => void;
  acceptGhost: (ghostId: string) => void;
  dismissGhost: (ghostId: string) => void;

  // Freehand Inking Layer
  inkStrokes: InkStroke[];
  addInkStroke: (stroke: InkStroke) => void;
  deleteInkStroke: (strokeId: string) => void;
  undoInkStroke: (target: 'canvas' | 'reader') => void;

  // Multi-user & Settings
  collaborators: Collaborator[];
  appSettings: AppSettings;
  updateAppSettings: (partial: Partial<AppSettings>) => void;
  isTabletLayout: boolean;


  // Synthesis Matrix
  synthesisRows: SynthesisRow[];
  updateCellByHuman: (docId: string, colKey: 'architecture' | 'scaling' | 'advantage', value: string) => void;
  runAgentSynthesis: () => void;

  // View & Navigation
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  navigateTo: (view: AppView) => void;
  splitLayout: '50/50' | '70/30' | '30/70' | 'canvas-only' | 'reader-only';
  setSplitLayout: (layout: '50/50' | '70/30' | '30/70' | 'canvas-only' | 'reader-only') => void;

  // Enterprise Matters / Dossiers
  matters: EnterpriseMatter[];
  activeMatter: EnterpriseMatter | null;
  selectMatter: (matterId: string) => void;
  createMatter: (matter: Partial<EnterpriseMatter>) => void;

  // Audit Logs
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: AuditLogEntry['action'], details: string, status?: 'success' | 'warning' | 'error') => void;

  // Anchoring Jump Event
  targetHighlightId: string | null;
  flashAnchorInReader: (anchorId: string) => void;
}

// MULTI-INDUSTRY PROFESSIONAL PAPERS (Legal, Consulting, Medical, Research)
const INDUSTRY_DOCS: Record<ProfessionalField, DocumentItem[]> = {
  legal: [
    {
      id: 'doc-contract',
      title: 'Master Enterprise Cloud Agreement & Indemnification Rider',
      authors: 'Apex Global Counsel & Defense Partners',
      year: 2024,
      pages: 18,
      highlightsCount: 7,
      fileSize: '1.8 MB',
      ingestStatus: 'ready',
      abstract: 'Standard enterprise software agreement detailing limitation of liability, mutual IP indemnification caps, GDPR data processing addenda, and dispute arbitration clauses.'
    },
    {
      id: 'doc-patent',
      title: 'Patent Claim 104: Asymmetric Cryptographic Handshake Protocol',
      authors: 'US Patent & Trademark Office (USPTO)',
      year: 2023,
      pages: 24,
      highlightsCount: 5,
      fileSize: '3.1 MB',
      ingestStatus: 'ready',
      abstract: 'Detailed specification of hardware-isolated enclave key distribution during multi-tenant network renegotiations.'
    }
  ],
  academic: [
    {
      id: 'doc-vaswani',
      title: 'Attention Is All You Need',
      authors: 'A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, et al.',
      year: 2017,
      pages: 15,
      highlightsCount: 6,
      fileSize: '2.4 MB',
      ingestStatus: 'ready',
      abstract: 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.'
    },
    {
      id: 'doc-mamba',
      title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
      authors: 'Albert Gu, Tri Dao',
      year: 2023,
      pages: 32,
      highlightsCount: 4,
      fileSize: '3.8 MB',
      ingestStatus: 'ready',
      abstract: 'Foundation models face computational bottlenecks over long sequences due to quadratic attention scaling. We introduce Mamba, a fast, linear-time architecture based on selective state spaces.'
    }
  ],
  business: [
    {
      id: 'doc-consulting',
      title: 'Global Semiconductor Supply Chain Risk & Sourcing Audit',
      authors: 'McKinsey & Bain Strategic Industry Analysis',
      year: 2025,
      pages: 28,
      highlightsCount: 8,
      fileSize: '4.2 MB',
      ingestStatus: 'ready',
      abstract: 'Comprehensive assessment of lithography equipment lead times, secondary source wafer capacity, and geopolitical tariffs across automotive and datacenter hardware.'
    }
  ],
  medical: [
    {
      id: 'doc-clinical',
      title: 'Phase III Multicenter Double-Blind Clinical Efficacy Trial',
      authors: 'New England Journal of Clinical Oncology',
      year: 2024,
      pages: 22,
      highlightsCount: 9,
      fileSize: '3.5 MB',
      ingestStatus: 'ready',
      abstract: 'Evaluation of combination antibody-drug conjugates versus standard paclitaxel chemotherapy in HER2-low metastatic breast cancer cohorts.'
    }
  ]
};

const INITIAL_NODES: CanvasNode[] = [
  {
    id: 'node-attn-claim',
    type: 'claim',
    x: 120,
    y: 140,
    title: 'Multi-Head Subspace Specialization',
    content: 'Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.',
    confidence: 0.98,
    verificationState: 'verified',
    origin: 'human',
    createdAt: Date.now() - 3600000,
    anchors: [
      {
        docId: 'doc-vaswani',
        docTitle: 'Attention Is All You Need',
        pageNumber: 4,
        boxes: [{ page: 4, x0: 0.12, y0: 0.35, x1: 0.88, y1: 0.42 }],
        quote: {
          exact: 'Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.'
        },
        charRange: { start: 4210, end: 4340 }
      }
    ]
  },
  {
    id: 'node-head-dim',
    type: 'evidence',
    x: 140,
    y: 380,
    title: 'Head Dimensionality Parameterization',
    content: 'We employ h = 8 parallel attention layers. For each of these we use d_k = d_v = d_model / h = 64, maintaining constant compute.',
    confidence: 0.95,
    verificationState: 'verified',
    origin: 'human',
    createdAt: Date.now() - 1800000,
    anchors: [
      {
        docId: 'doc-vaswani',
        docTitle: 'Attention Is All You Need',
        pageNumber: 4,
        boxes: [{ page: 4, x0: 0.12, y0: 0.55, x1: 0.88, y1: 0.62 }],
        quote: {
          exact: 'For each of these we use d_k = d_v = d_model / h = 64.'
        },
        charRange: { start: 4500, end: 4550 }
      }
    ]
  }
];

const INITIAL_FRAMES: CanvasFrame[] = [
  {
    id: 'frame-1',
    title: 'Core Arguments & Supporting Evidence',
    x: 80,
    y: 90,
    width: 420,
    height: 480,
    color: '#6366f1'
  }
];

const INITIAL_EDGES: CanvasEdge[] = [
  {
    id: 'edge-1',
    source: 'node-attn-claim',
    target: 'node-head-dim',
    relation: 'supports'
  }
];

const INITIAL_GHOSTS: GhostNode[] = [
  {
    id: 'ghost-mamba-1',
    targetAnchor: {
      docId: 'doc-mamba',
      docTitle: 'Mamba: Linear-Time Sequence Modeling',
      pageNumber: 2,
      boxes: [{ page: 2, x0: 0.1, y0: 0.2, x1: 0.9, y1: 0.28 }],
      quote: {
        exact: 'Selective state spaces eliminate quadratic attention matrices while retaining associative recall.'
      },
      charRange: { start: 1200, end: 1290 }
    },
    title: 'Linear Alternative: Selective State Space',
    content: 'Mamba replaces multi-head attention with hardware-aware selective state space parameters, attaining linear sequence scaling.',
    score: 0.94,
    suggestedX: 600,
    suggestedY: 200,
    relation: 'contradicts'
  }
];

const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    id: 'collab-1',
    name: 'Aditya Raj Tiwari (You)',
    role: 'admin',
    color: '#0071e3',
    isOnline: true
  },
  {
    id: 'collab-2',
    name: 'Dr. Elena Rostova',
    role: 'researcher',
    color: '#8b5cf6',
    isOnline: true
  },
  {
    id: 'collab-3',
    name: 'Marcus Vance (Counsel)',
    role: 'reviewer',
    color: '#10b981',
    isOnline: false
  }
];

const DEFAULT_SETTINGS: AppSettings = {
  deviceMode: 'auto',
  theme: 'dark',
  workflowMode: 'ai_assistant',
  canvasDesign: 'dots',
  pdfColorFilter: 'normal',
  aiTone: 'beginner',
  fontFamily: 'sans',
  density: 'comfortable',
  geminiApiKey: '',
  openaiApiKey: '',
  anthropicApiKey: '',
  ollamaEndpoint: 'http://localhost:11434',
  activeProvider: 'local-simulated',
  enablePalmRejection: true,
  enableSoundEffects: true,
  autoProposeGhosts: true,
  showGestureHints: true,
  defaultFontSize: 'base'
};

const INITIAL_SYNTHESIS: SynthesisRow[] = [
  {
    docId: 'doc-contract',
    docTitle: 'Master Cloud Agreement (Legal)',
    architecture: {
      value: 'Mutual Indemnity Cap ($5M)',
      evidence: [{ quote: 'Aggregate liability shall not exceed twelve months fees paid', docTitle: 'Master Agreement', page: 7 }],
      confidence: 0.99,
      verificationState: 'verified',
      editedByHuman: false
    },
    scaling: {
      value: 'Net 30 Payment Terms',
      evidence: [{ quote: 'Invoices due thirty calendar days post receipt', docTitle: 'Master Agreement', page: 3 }],
      confidence: 0.98,
      verificationState: 'verified',
      editedByHuman: false
    },
    advantage: {
      value: 'IP Infringement Defense Covered',
      evidence: [{ quote: 'Vendor defends customer against third party copyright claims', docTitle: 'Master Agreement', page: 8 }],
      confidence: 0.95,
      verificationState: 'verified',
      editedByHuman: false
    }
  },
  {
    docId: 'doc-vaswani',
    docTitle: 'Vaswani et al. (2017)',
    architecture: {
      value: 'Multi-Head Self-Attention',
      evidence: [{ quote: 'Linear projection into h attention heads', docTitle: 'Attention Is All You Need', page: 4 }],
      confidence: 0.99,
      verificationState: 'verified',
      editedByHuman: false
    },
    scaling: {
      value: 'Quadratic O(N²)',
      evidence: [{ quote: 'Total computational complexity per layer is O(n² · d)', docTitle: 'Attention Is All You Need', page: 6 }],
      confidence: 0.96,
      verificationState: 'verified',
      editedByHuman: false
    },
    advantage: {
      value: 'Full context cross-token routing',
      evidence: [{ quote: 'Connecting all pairs of input and output positions', docTitle: 'Attention Is All You Need', page: 2 }],
      confidence: 0.94,
      verificationState: 'verified',
      editedByHuman: false
    }
  }
];

const INITIAL_MATTERS: EnterpriseMatter[] = [
  {
    id: 'mat-101',
    title: 'In re Apex Cloud Technologies M&A Indemnity Audit',
    matterNumber: 'MAT-2026-089',
    client: 'Apex Global Holdings Ltd.',
    field: 'legal',
    status: 'active',
    lastModified: '12 minutes ago',
    documentCount: 4,
    nodeCount: 18,
    collaboratorCount: 6,
    description: 'Deep spatial cross-examination of mutual indemnity caps, IP defense obligations, and regulatory disclosure riders across bilateral SaaS purchase agreements.',
    tags: ['M&A', 'Indemnity', 'High Value', 'Tier 1']
  },
  {
    id: 'mat-102',
    title: 'Phase III Multi-Center Oncology Protocol & Adverse Event Meta-Synthesis',
    matterNumber: 'CLIN-2026-441',
    client: 'GeneSys Therapeutics Consortium',
    field: 'medical',
    status: 'in_review',
    lastModified: '1 hour ago',
    documentCount: 6,
    nodeCount: 29,
    collaboratorCount: 4,
    description: 'Comparative spatial synthesis of cytokine release markers and progression-free survival statistics across European and US cohorts.',
    tags: ['Oncology', 'FDA 510(k)', 'Double-Blind']
  },
  {
    id: 'mat-103',
    title: 'Global Sovereign Fund Q3 2026 Macro Strategic Due Diligence',
    matterNumber: 'FIN-2026-902',
    client: 'Nordic Sovereign Reserve',
    field: 'business',
    status: 'active',
    lastModified: '3 hours ago',
    documentCount: 8,
    nodeCount: 34,
    collaboratorCount: 8,
    description: 'Synthesizing central bank liquidity trajectories, semiconductor supply chain lead times, and private credit stress tests.',
    tags: ['Private Equity', 'Macro Risk', 'Sovereign']
  },
  {
    id: 'mat-104',
    title: 'Multi-Head Attention & Latent Diffusion Scaling Limits',
    matterNumber: 'RES-2026-012',
    client: 'Oxford AI Foundational Lab',
    field: 'academic',
    status: 'archived',
    lastModified: '2 days ago',
    documentCount: 5,
    nodeCount: 42,
    collaboratorCount: 3,
    description: 'Mathematical derivation cards connecting FlashAttention-3 memory bandwidth constraints with autoregressive transformer context window saturation.',
    tags: ['Neural Arch', 'Transformers', 'Scaling Laws']
  }
];

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);


export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [activeField, setActiveField] = useState<ProfessionalField>('academic');
  const [documents, setDocuments] = useState<DocumentItem[]>(INDUSTRY_DOCS['academic']);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem>(INDUSTRY_DOCS['academic'][0]);

  // LiquidText Squeeze Engine
  const [squeezeMode, setSqueezeMode] = useState<SqueezeMode>('none');
  const [searchQuery, setSearchQuery] = useState('');

  const [ghosts, setGhosts] = useState<GhostNode[]>(INITIAL_GHOSTS);
  const [ghostLayerActive, setGhostLayerActive] = useState(true);
  const [inkStrokes, setInkStrokes] = useState<InkStroke[]>([]);
  const [collaborators] = useState<Collaborator[]>(INITIAL_COLLABORATORS);

  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('synapse_app_settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const [synthesisRows, setSynthesisRows] = useState<SynthesisRow[]>(INITIAL_SYNTHESIS);
  const [activeView, setActiveView] = useState<AppView>('landing');

  // ─── SUPABASE INTEGRATION HOOKS ───
  const { matters, createMatter: supCreateMatter, updateMatter, deleteMatter } = useMatters(
    currentUser?.id ?? null,
    (() => {
      const saved = localStorage.getItem('synapse_matters');
      return saved ? JSON.parse(saved) : INITIAL_MATTERS;
    })()
  );

  const [activeMatter, setActiveMatter] = useState<EnterpriseMatter | null>(matters[0] || null);

  const {
    nodes, edges, frames,
    addNode: supAddNode, updateNode: supUpdateNode, updateNodePos: supUpdateNodePos, updateNodesPos: supUpdateNodesPos, deleteNode: supDeleteNode,
    addEdge: supAddEdge, updateEdge: supUpdateEdge, deleteEdge: supDeleteEdge,
    addFrame: supAddFrame, deleteFrame: supDeleteFrame
  } = useCanvas(activeMatter?.id ?? null, INITIAL_NODES, INITIAL_EDGES, INITIAL_FRAMES);

  const { uploadDocument, fetchDocuments, deleteDocument: supDeleteDocument } = useDocuments(activeMatter?.id ?? null, currentUser?.id ?? null);

  // Sync documents from Supabase or fallback
  useEffect(() => {
    if (activeMatter) {
      fetchDocuments().then((docs) => {
        if (docs && docs.length > 0) {
          setDocuments(docs);
          setSelectedDoc(docs[0]);
        } else {
          // Fallback to industry docs
          const docs = INDUSTRY_DOCS[activeMatter.field] || INDUSTRY_DOCS['academic'];
          setDocuments(docs);
          setSelectedDoc(docs[0]);
        }
      });
    }
  }, [activeMatter, fetchDocuments]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('synapse_matters', JSON.stringify(matters));
    }
  }, [matters]);

  const navigateTo = (view: AppView) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectMatter = (matterId: string) => {
    const found = matters.find(m => m.id === matterId);
    if (found) {
      setActiveMatter(found);
      switchField(found.field);
      navigateTo('workspace');
    }
  };

  const createMatter = async (matterData: Partial<EnterpriseMatter>) => {
    const newMatter = await supCreateMatter(matterData as any);
    if (newMatter) {
      setActiveMatter(newMatter);
      switchField(newMatter.field);
      navigateTo('workspace');
    }
  };

  const [splitLayout, setSplitLayout] = useState<'50/50' | '70/30' | '30/70' | 'canvas-only' | 'reader-only'>('50/50');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [targetHighlightId, setTargetHighlightId] = useState<string | null>(null);


  // Auto-detect tablet vs desktop
  const [isTouchHardware, setIsTouchHardware] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchHardware(
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (window.innerWidth < 1024)
      );
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const isTabletLayout =
    appSettings.deviceMode === 'tablet' ||
    (appSettings.deviceMode === 'auto' && isTouchHardware);

  useEffect(() => {
    localStorage.setItem('synapse_app_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  const updateAppSettings = (partial: Partial<AppSettings>) => {
    setAppSettings(prev => ({ ...prev, ...partial }));
  };

  const switchField = (field: ProfessionalField) => {
    setActiveField(field);
    const docs = INDUSTRY_DOCS[field] || INDUSTRY_DOCS['academic'];
    setDocuments(docs);
    setSelectedDoc(docs[0]);
    addAuditLog('node_create', `Switched professional workspace persona to: "${field.toUpperCase()}".`);
  };

  const addAuditLog = (action: AuditLogEntry['action'], details: string, status: 'success' | 'warning' | 'error' = 'success') => {
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
      actorId: currentUser?.id || 'sys',
      actorName: currentUser?.name || 'System',
      action,
      details,
      status
    };
    setAuditLogs(prev => [entry, ...prev]);
  };

  const selectDocument = (id: string) => {
    const match = documents.find(d => d.id === id);
    if (match) {
      setSelectedDoc(match);
      addAuditLog('document_import', `Switched active reader to: ${match.title}`);
    }
  };

  const importDocument = async (file: File) => {
    addAuditLog('document_import', `Parsing and uploading: ${file.name}...`);
    try {
      const parsed = await uploadDocument(file);
      if (parsed) {
        const newDoc: DocumentItem = {
          id: `doc-${Date.now()}`,
          title: parsed.title,
          authors: currentUser?.name || 'Local User',
          year: new Date().getFullYear(),
          pages: parsed.totalPages || 1,
          highlightsCount: 0,
          fileSize: parsed.fileSize,
          fileType: parsed.fileType,
          docHtml: parsed.docHtml,
          docContent: parsed.docContent,
          ingestStatus: 'ready',
          abstract: parsed.fullText ? parsed.fullText.slice(0, 300) + '...' : `Uploaded ${parsed.fileType.toUpperCase()} document.`,
          parsedPdf: parsed,
          storageUrl: parsed.storageUrl,
        };
        setDocuments(prev => [newDoc, ...prev]);
        setSelectedDoc(newDoc);
        addAuditLog('document_import', `Successfully ingested ${file.name}`);
      }
    } catch (err) {
      console.error('Document import failed', err);
      addAuditLog('document_import', `Failed to import ${file.name}`, 'error');
    }
  };


  const toggleGhostLayer = () => {
    setGhostLayerActive(prev => !prev);
  };

  const addNode = (nodeData: Omit<CanvasNode, 'id' | 'createdAt'> & { id?: string }) => {
    const id = nodeData.id || `node-${Date.now()}`;
    const newNode = { ...nodeData, id };
    supAddNode(newNode);
    addAuditLog('node_create', `Created Smart Node: "${nodeData.title}"`);
    return id;
  };

  const updateNode = (id: string, partial: Partial<CanvasNode>) => {
    supUpdateNode(id, partial);
    if (partial.title) {
      addAuditLog('node_create', `Updated node: "${partial.title}"`);
    }
  };

  const updateNodePos = (id: string, x: number, y: number) => {
    supUpdateNodePos(id, x, y);
  };

  const updateNodesPos = (updates: { id: string; x: number; y: number }[]) => {
    supUpdateNodesPos(updates);
  };

  const deleteNode = (id: string) => {
    supDeleteNode(id);
  };

  const addFrame = (frame: CanvasFrame) => {
    supAddFrame(frame);
    addAuditLog('frame_create', `Created Group Frame: "${frame.title}"`);
  };

  const deleteFrame = (frameId: string) => {
    supDeleteFrame(frameId);
  };

  const addEdge = (edge: CanvasEdge) => {
    supAddEdge(edge);
  };

  const updateEdge = (id: string, partial: Partial<CanvasEdge>) => {
    supUpdateEdge(id, partial);
  };

  const deleteEdge = (edgeId: string) => {
    supDeleteEdge(edgeId);
  };

  const acceptGhost = (ghostId: string) => {
    const ghost = ghosts.find(g => g.id === ghostId);
    if (!ghost) return;

    const newNodeId = `node-accepted-${Date.now()}`;
    const newNode: CanvasNode = {
      id: newNodeId,
      type: 'claim',
      x: ghost.suggestedX,
      y: ghost.suggestedY,
      title: ghost.title,
      content: ghost.content,
      confidence: ghost.score,
      verificationState: 'verified',
      origin: 'agent',
      createdAt: Date.now(),
      anchors: [ghost.targetAnchor]
    };

    supAddNode(newNode);

    if (nodes.length > 0) {
      supAddEdge({
        id: `edge-${Date.now()}`,
        source: nodes[0].id,
        target: newNodeId,
        relation: ghost.relation
      });
    }

    setGhosts(prev => prev.filter(g => g.id !== ghostId));
    addAuditLog('agent_run', `Accepted AI Ghost Claim: "${ghost.title}" into Canvas.`);
  };

  const dismissGhost = (ghostId: string) => {
    setGhosts(prev => prev.filter(g => g.id !== ghostId));
  };

  const addInkStroke = (stroke: InkStroke) => {
    setInkStrokes(prev => [...prev, stroke]);
  };

  const deleteInkStroke = (strokeId: string) => {
    setInkStrokes(prev => prev.filter(s => s.id !== strokeId));
  };

  const undoInkStroke = (target: 'canvas' | 'reader') => {
    setInkStrokes(prev => {
      const idx = [...prev].reverse().findIndex(s => s.target === target);
      if (idx === -1) return prev;
      const actualIdx = prev.length - 1 - idx;
      return prev.filter((_, i) => i !== actualIdx);
    });
  };

  const updateCellByHuman = (docId: string, colKey: 'architecture' | 'scaling' | 'advantage', value: string) => {
    setSynthesisRows(prev =>
      prev.map(row => {
        if (row.docId === docId) {
          return {
            ...row,
            [colKey]: {
              ...row[colKey],
              value,
              editedByHuman: true,
              verificationState: 'verified'
            }
          };
        }
        return row;
      })
    );
    addAuditLog('cell_lock', `User locked cell [${colKey}] for document ID: ${docId}`);
  };

  const runAgentSynthesis = () => {
    addAuditLog('agent_run', 'Dispatched multi-document synthesis agent across 2 papers.');
    setTimeout(() => {
      setGhosts(prev => [
        ...prev,
        {
          id: `ghost-stream-${Date.now()}`,
          targetAnchor: {
            docId: selectedDoc.id,
            docTitle: selectedDoc.title,
            pageNumber: 8,
            boxes: [{ page: 8, x0: 0.15, y0: 0.3, x1: 0.85, y1: 0.38 }],
            quote: { exact: 'Standard limitation provisions apply to direct damages only.' },
            charRange: { start: 7800, end: 7890 }
          },
          title: 'Risk Exemption Clause',
          content: 'Indemnification obligations bypass standard aggregate liability caps under Section 12.3.',
          score: 0.97,
          suggestedX: 440,
          suggestedY: 480,
          relation: 'extends'
        }
      ]);
    }, 500);
  };

  const flashAnchorInReader = (anchorId: string) => {
    setTargetHighlightId(anchorId);
    setTimeout(() => setTargetHighlightId(null), 2000);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeField,
        switchField,
        documents,
        selectedDoc,
        selectDocument,
        importDocument,
        squeezeMode,
        setSqueezeMode,
        searchQuery,
        setSearchQuery,
        nodes,
        edges,
        frames,
        ghosts,
        ghostLayerActive,
        toggleGhostLayer,
        addNode,
        updateNode,
        updateNodePos,
        updateNodesPos,
        deleteNode,
        addFrame,
        deleteFrame,
        addEdge,
        updateEdge,
        deleteEdge,
        acceptGhost,
        dismissGhost,
        inkStrokes,
        addInkStroke,
        deleteInkStroke,
        undoInkStroke,
        collaborators,
        appSettings,
        updateAppSettings,
        isTabletLayout,
        synthesisRows,
        updateCellByHuman,
        runAgentSynthesis,
        activeView,
        setActiveView,
        navigateTo,
        splitLayout,
        setSplitLayout,
        matters,
        activeMatter,
        selectMatter,
        createMatter,
        auditLogs,
        addAuditLog,
        targetHighlightId,
        flashAnchorInReader
      }}

    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
};
