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

const NULL_DOC: DocumentItem = {
  id: 'empty',
  title: 'No Document',
  authors: '',
  year: new Date().getFullYear(),
  pages: 1,
  highlightsCount: 0,
  fileSize: '0 B',
  fileType: 'pdf',
  ingestStatus: 'ready'
};

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

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [activeField, setActiveField] = useState<ProfessionalField>('academic');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem>(NULL_DOC);

  // LiquidText Squeeze Engine
  const [squeezeMode, setSqueezeMode] = useState<SqueezeMode>('none');
  const [searchQuery, setSearchQuery] = useState('');

  const [ghosts, setGhosts] = useState<GhostNode[]>([]);
  const [ghostLayerActive, setGhostLayerActive] = useState(true);
  const [inkStrokes, setInkStrokes] = useState<InkStroke[]>([]);
  const [collaborators] = useState<Collaborator[]>([]);

  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('synapse_app_settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const [synthesisRows, setSynthesisRows] = useState<SynthesisRow[]>([]);
  const [activeView, setActiveView] = useState<AppView>('landing');

  // ─── SUPABASE INTEGRATION HOOKS ───
  const { matters, createMatter: supCreateMatter, updateMatter, deleteMatter } = useMatters(
    currentUser?.id ?? null,
    []
  );

  const [activeMatter, setActiveMatter] = useState<EnterpriseMatter | null>(matters[0] || null);

  const {
    nodes, edges, frames,
    addNode: supAddNode, updateNode: supUpdateNode, updateNodePos: supUpdateNodePos, updateNodesPos: supUpdateNodesPos, deleteNode: supDeleteNode,
    addEdge: supAddEdge, updateEdge: supUpdateEdge, deleteEdge: supDeleteEdge,
    addFrame: supAddFrame, deleteFrame: supDeleteFrame
  } = useCanvas(activeMatter?.id ?? null, [], [], []);

  const { uploadDocument, fetchDocuments, deleteDocument: supDeleteDocument } = useDocuments(activeMatter?.id ?? null, currentUser?.id ?? null);

  // Sync documents from Supabase
  useEffect(() => {
    if (activeMatter) {
      fetchDocuments().then((docs) => {
        if (docs && docs.length > 0) {
          setDocuments(docs);
          setSelectedDoc(docs[0]);
        } else {
          setDocuments([]);
          setSelectedDoc(NULL_DOC);
        }
      });
    } else {
      setDocuments([]);
      setSelectedDoc(NULL_DOC);
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
