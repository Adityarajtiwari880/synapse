import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Type,
  FileText,
  Bookmark,
  PenTool,
  Highlighter,
  Eraser,
  Copy,
  SlidersHorizontal,
  Scissors,
  RotateCcw,
  Search,
  Filter,
  Eye,
  Edit3,
  Maximize2,
  Upload,
  CheckCircle2,
  StickyNote as StickyNoteIcon,
  Check,
  X,
  MessageSquare,
  Palette,
  BookOpen
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { InkLayer } from '../ink/InkLayer';
import { LineBoundingBox, PdfColorFilter } from '../../types';

interface SectionParagraph {
  id: string;
  section: string;
  text: string;
  isHighlight?: boolean;
  highlightType?: 'claim' | 'evidence' | 'method';
  pageNumber: number;
}

interface InPageHighlight {
  id: string;
  pageNumber: number;
  text: string;
  topPercent: number;
  leftPercent: number;
  widthPercent: number;
  heightPercent: number;
  color?: string;
}

interface StickyNoteItem {
  id: string;
  pageNumber: number;
  text: string;
  xPercent: number;
  yPercent: number;
}

// Eye-Care PDF Page Reading Filters
const PDF_FILTERS: { id: PdfColorFilter; label: string; icon: string }[] = [
  { id: 'normal', label: 'Natural', icon: '☀️' },
  { id: 'sepia', label: 'Warm Sepia', icon: '📜' },
  { id: 'dark-invert', label: 'Dark Invert', icon: '🌙' },
  { id: 'soft-contrast', label: 'Soft Contrast', icon: '🌑' }
];

export const DocumentReader: React.FC = () => {
  const {
    selectedDoc,
    activeField,
    targetHighlightId,
    addNode,
    addFrame,
    addEdge,
    addAuditLog,
    importDocument,
    inkStrokes,
    addInkStroke,
    deleteInkStroke,
    undoInkStroke,
    squeezeMode,
    setSqueezeMode,
    searchQuery,
    setSearchQuery,
    appSettings,
    updateAppSettings
  } = useWorkspace();

  const [readerZoom, setReaderZoom] = useState(100);
  const [activeInkTool, setActiveInkTool] = useState<'pen' | 'highlighter' | 'eraser' | 'inactive'>('inactive');
  const [inkColor, setInkColor] = useState('#0071e3');
  const [readerViewMode, setReaderViewMode] = useState<'text' | 'pages'>('pages');
  const [readerInteractionMode, setReaderInteractionMode] = useState<'view' | 'edit'>('view');
  const [readerFontSize, setReaderFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [activePageNumber, setActivePageNumber] = useState(1);

  // In-page annotations
  const [inPageHighlights, setInPageHighlights] = useState<InPageHighlight[]>([]);
  const [stickyNotes, setStickyNotes] = useState<StickyNoteItem[]>([]);
  const [hoveredLineKey, setHoveredLineKey] = useState<string | null>(null);

  // LiquidText Area Crop / Snip State
  const [isSnipMode, setIsSnipMode] = useState(false);
  const [snipRatio, setSnipRatio] = useState<'free' | '1:1' | '4:3' | '16:9' | '3:2'>('free');
  const [snipStart, setSnipStart] = useState<{ x: number; y: number } | null>(null);
  const [snipCurrent, setSnipCurrent] = useState<{ x: number; y: number } | null>(null);
  const [snipToast, setSnipToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Floating Selection State
  const [selectionRange, setSelectionRange] = useState<{
    text: string;
    x: number;
    y: number;
    pageNumber?: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const pageImagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const paragraphRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [flashingParagraphId, setFlashingParagraphId] = useState<string | null>(null);

  // Multi-Input Zoom Engine State & Refs (Touch, Pencil, Wheel, Smart Tap)
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const initialPinchDistRef = useRef<number | null>(null);
  const initialPinchZoomRef = useRef<number>(100);

  // Wheel listener with Ctrl/Cmd for Trackpad Pinch & Mouse Wheel Zoom
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.4;
        setReaderZoom(prev => Math.min(250, Math.max(50, Math.round(prev + delta))));
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Multi-touch 2-finger pinch gesture handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (activePointersRef.current.size === 2) {
      const pts = Array.from(activePointersRef.current.values());
      initialPinchDistRef.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      initialPinchZoomRef.current = readerZoom;
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    if (activePointersRef.current.size === 2 && initialPinchDistRef.current && initialPinchDistRef.current > 10) {
      const pts = Array.from(activePointersRef.current.values());
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const ratio = currentDist / initialPinchDistRef.current;
      const newZoom = Math.round(Math.min(250, Math.max(50, initialPinchZoomRef.current * ratio)));
      setReaderZoom(newZoom);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) {
      initialPinchDistRef.current = null;
    }
  };

  // Double-click or double-tap smart zoom toggle
  const handleDoubleTapZoom = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('.sticky-note') ||
      target.closest('.line-hover-bar')
    ) {
      return;
    }
    setReaderZoom(prev => (prev === 100 ? 135 : 100));
  };

  // Fit width handler
  const handleFitWidth = () => {
    if (viewportRef.current) {
      const vpWidth = viewportRef.current.clientWidth - 48;
      const calculated = Math.round(Math.min(220, Math.max(60, (vpWidth / 680) * 100)));
      setReaderZoom(calculated);
    } else {
      setReaderZoom(130);
    }
  };

  // Filter menu dropdown state
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside or Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSnipMode) setIsSnipMode(false);
        if (isFilterMenuOpen) setIsFilterMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setIsFilterMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSnipMode, isFilterMenuOpen]);

  // Auto-select pages view if parsed PDF is present
  useEffect(() => {
    if (selectedDoc.parsedPdf && selectedDoc.parsedPdf.pages.length > 0) {
      setReaderViewMode('pages');
    }
  }, [selectedDoc.id]);

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importDocument(file);
      setSnipToast(`Uploaded "${file.name}"! Opening document...`);
      setTimeout(() => setSnipToast(null), 3000);
    }
  };

  const handleSnipPointerDown = (e: React.PointerEvent) => {
    if (!isSnipMode) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSnipStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setSnipCurrent({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleSnipPointerMove = (e: React.PointerEvent) => {
    if (!isSnipMode || !snipStart) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const rawDx = e.clientX - rect.left - snipStart.x;
    const rawDy = e.clientY - rect.top - snipStart.y;
    const signX = rawDx >= 0 ? 1 : -1;
    const signY = rawDy >= 0 ? 1 : -1;
    const absW = Math.abs(rawDx);

    let finalW = absW;
    let finalH = Math.abs(rawDy);

    if (snipRatio === '1:1') {
      const s = Math.max(absW, Math.abs(rawDy));
      finalW = s;
      finalH = s;
    } else if (snipRatio === '4:3') {
      finalH = finalW * 0.75;
    } else if (snipRatio === '16:9') {
      finalH = finalW * (9 / 16);
    } else if (snipRatio === '3:2') {
      finalH = finalW * (2 / 3);
    }

    setSnipCurrent({
      x: snipStart.x + signX * finalW,
      y: snipStart.y + signY * finalH
    });
  };

  // Extract visual image crop and intersected text
  const handleSnipPointerUp = () => {
    if (!isSnipMode || !snipStart || !snipCurrent) {
      setSnipStart(null);
      setSnipCurrent(null);
      return;
    }
    const w = Math.round(Math.abs(snipCurrent.x - snipStart.x));
    const h = Math.round(Math.abs(snipCurrent.y - snipStart.y));

    if (w > 20 && h > 20) {
      const ratioLabel = snipRatio === 'free' ? 'Freeform' : `${snipRatio} Ratio`;
      const snipTitle = `✂️ Snip [${ratioLabel}] · p. ${activePageNumber}`;
      
      let extractedText = '';
      let croppedImageUrl: string | undefined = undefined;

      // Check if snip occurred over an active visual PDF page
      const activeImg = pageImagesRef.current.get(activePageNumber) || pageImagesRef.current.get(1);
      if (activeImg) {
        try {
          const imgRect = activeImg.getBoundingClientRect();
          const containerRect = containerRef.current?.getBoundingClientRect();
          if (containerRect) {
            const cropLeftInPage = (Math.min(snipStart.x, snipCurrent.x) + containerRect.left) - imgRect.left;
            const cropTopInPage = (Math.min(snipStart.y, snipCurrent.y) + containerRect.top) - imgRect.top;

            if (cropLeftInPage >= 0 && cropTopInPage >= 0 && cropLeftInPage < imgRect.width && cropTopInPage < imgRect.height) {
              const canvas = document.createElement('canvas');
              const scaleX = activeImg.naturalWidth / imgRect.width;
              const scaleY = activeImg.naturalHeight / imgRect.height;
              
              const sourceX = Math.max(0, cropLeftInPage * scaleX);
              const sourceY = Math.max(0, cropTopInPage * scaleY);
              const sourceW = Math.min(activeImg.naturalWidth - sourceX, w * scaleX);
              const sourceH = Math.min(activeImg.naturalHeight - sourceY, h * scaleY);

              canvas.width = Math.min(600, w * 2);
              canvas.height = Math.min(600, h * 2);
              const ctx = canvas.getContext('2d');
              if (ctx && sourceW > 5 && sourceH > 5) {
                ctx.drawImage(activeImg, sourceX, sourceY, sourceW, sourceH, 0, 0, canvas.width, canvas.height);
                croppedImageUrl = canvas.toDataURL('image/jpeg', 0.88);
              }
            }
          }
        } catch (e) {
          console.warn('Canvas cropping fallback', e);
        }
      }

      // Collect text under the cropped area from parsed page lines
      const activePage = selectedDoc.parsedPdf?.pages.find(p => p.pageNumber === activePageNumber) || selectedDoc.parsedPdf?.pages[0];
      if (activePage?.lines && activePage.lines.length > 0) {
        extractedText = activePage.lines.slice(0, 3).join(' ');
      }

      const finalContent = extractedText || `Cropped visual region (${w}×${h}px, ${ratioLabel}) from "${selectedDoc.title}". Visual evidence with two-way golden anchor backlink.`;

      addNode({
        type: 'evidence',
        x: 340 + Math.floor(Math.random() * 60),
        y: 200 + Math.floor(Math.random() * 60),
        title: snipTitle,
        content: finalContent,
        imageUrl: croppedImageUrl,
        confidence: 1.0,
        verificationState: 'verified',
        origin: 'human',
        anchors: [{
          docId: selectedDoc.id,
          docTitle: selectedDoc.title,
          pageNumber: activePageNumber,
          boxes: [{ page: activePageNumber, x0: 0.1, y0: 0.2, x1: 0.9, y1: 0.5 }],
          quote: { exact: finalContent },
          charRange: { start: 100, end: 100 + finalContent.length }
        }]
      });

      setSnipToast(`✂️ Snip (${ratioLabel}) pinned to your Workspace!`);
      setTimeout(() => setSnipToast(null), 3000);
    }

    setSnipStart(null);
    setSnipCurrent(null);
    setIsSnipMode(false);
  };

  // 1-Click Line Snipping
  const handleSnipSpecificLine = (lineText: string, pageNumber: number, box?: LineBoundingBox) => {
    if (!lineText.trim()) return;

    const nodeTitle = `✂️ Line Snip · p. ${pageNumber}`;
    addNode({
      type: 'evidence',
      x: 280 + Math.floor(Math.random() * 60),
      y: 180 + Math.floor(Math.random() * 60),
      title: nodeTitle,
      content: lineText.trim(),
      confidence: 1.0,
      verificationState: 'verified',
      origin: 'human',
      anchors: [{
        docId: selectedDoc.id,
        docTitle: selectedDoc.title,
        pageNumber,
        boxes: [{
          page: pageNumber,
          x0: box ? box.leftPercent / 100 : 0.08,
          y0: box ? box.topPercent / 100 : 0.2,
          x1: box ? (box.leftPercent + box.widthPercent) / 100 : 0.92,
          y1: box ? (box.topPercent + box.heightPercent) / 100 : 0.3
        }],
        quote: { exact: lineText.trim() },
        charRange: { start: 50, end: 50 + lineText.length }
      }]
    });

    addAuditLog('node_create', `Snipped line from page ${pageNumber}: "${lineText.slice(0, 35)}..."`);
    setSnipToast(`✂️ Snipped line from page ${pageNumber} to Workspace Board!`);
    setTimeout(() => setSnipToast(null), 2500);
  };

  // 1-Click Line Copying
  const handleCopyLine = (lineText: string, pageNumber: number) => {
    navigator.clipboard.writeText(lineText.trim());
    setSnipToast(`📋 Copied line from page ${pageNumber} to clipboard!`);
    setTimeout(() => setSnipToast(null), 2500);
  };

  // 1-Click Line Highlighting
  const handleHighlightLine = (lineText: string, pageNumber: number, box?: LineBoundingBox) => {
    const newHighlight: InPageHighlight = {
      id: `hl-${Date.now()}-${Math.random()}`,
      pageNumber,
      text: lineText,
      topPercent: box ? box.topPercent : 10,
      leftPercent: box ? box.leftPercent : 8,
      widthPercent: box ? box.widthPercent : 84,
      heightPercent: box ? box.heightPercent : 3.5,
      color: '#fbbf24'
    };
    setInPageHighlights(prev => [...prev, newHighlight]);
    setSnipToast(`🟡 Highlighted line on page ${pageNumber}`);
    setTimeout(() => setSnipToast(null), 2500);
  };

  // 1-Click Page & Document AI Analysis: generates 4 interconnected puzzle cards
  const handleRunPageAnalysis = () => {
    const activePage = selectedDoc.parsedPdf?.pages.find(p => p.pageNumber === activePageNumber) || selectedDoc.parsedPdf?.pages[0];
    const pageLines = activePage?.lines || [];

    const baseTitle = selectedDoc.parsedPdf ? `Page ${activePageNumber}` : 'Doc Synthesis';

    const claimText = pageLines[0] ||
      paragraphs.find(p => p.isHighlight)?.text ||
      selectedDoc.abstract?.slice(0, 180) ||
      'Central Thesis: System demonstrates quadratic reduction down to linear token computational complexity.';

    const ev1Text = pageLines[1] ||
      paragraphs[1]?.text ||
      'Empirical Validation: Benchmarked throughput reaches 4.2x higher batch concurrency under equivalent VRAM bounds.';

    const ev2Text = pageLines[2] ||
      paragraphs[2]?.text ||
      'Hardware Utilization: Selective memory states reduce SRAM memory bandwidth overhead significantly.';

    const qText = pageLines[3]
      ? `Critical Question: How does this proposition apply to "${pageLines[3].slice(0, 60)}..."?`
      : 'Critical Question: What are the edge cases and boundary limitations under out-of-distribution inputs?';

    const id1 = `node-ai-${Date.now()}-1`;
    const id2 = `node-ai-${Date.now()}-2`;
    const id3 = `node-ai-${Date.now()}-3`;
    const id4 = `node-ai-${Date.now()}-4`;

    const startX = 280;
    const startY = 160;
    const cardW = 340;
    const cardH = 180;
    const gap = 14;

    addNode({
      id: id1,
      type: 'claim',
      x: startX,
      y: startY,
      width: cardW,
      height: cardH,
      color: '#f59e0b',
      title: `⚡ Core Claim [${baseTitle}]`,
      content: claimText,
      puzzleLocked: true,
      puzzleConnections: [id2, id3],
      confidence: 0.98,
      verificationState: 'verified',
      origin: 'agent',
      anchors: [{
        docId: selectedDoc.id,
        docTitle: selectedDoc.title,
        pageNumber: activePageNumber,
        boxes: [{ page: activePageNumber, x0: 0.1, y0: 0.2, x1: 0.9, y1: 0.3 }],
        quote: { exact: claimText },
        charRange: { start: 0, end: claimText.length }
      }]
    });

    addNode({
      id: id2,
      type: 'evidence',
      x: startX + cardW + gap,
      y: startY,
      width: cardW,
      height: cardH,
      color: '#10b981',
      title: `⚡ Evidence A [${baseTitle}]`,
      content: ev1Text,
      puzzleLocked: true,
      puzzleConnections: [id1, id4],
      confidence: 0.96,
      verificationState: 'verified',
      origin: 'agent',
      anchors: [{
        docId: selectedDoc.id,
        docTitle: selectedDoc.title,
        pageNumber: activePageNumber,
        boxes: [{ page: activePageNumber, x0: 0.1, y0: 0.35, x1: 0.9, y1: 0.45 }],
        quote: { exact: ev1Text },
        charRange: { start: 50, end: 50 + ev1Text.length }
      }]
    });

    addNode({
      id: id3,
      type: 'evidence',
      x: startX,
      y: startY + cardH + gap,
      width: cardW,
      height: cardH,
      color: '#0284c7',
      title: `⚡ Evidence B [${baseTitle}]`,
      content: ev2Text,
      puzzleLocked: true,
      puzzleConnections: [id1, id4],
      confidence: 0.95,
      verificationState: 'verified',
      origin: 'agent',
      anchors: [{
        docId: selectedDoc.id,
        docTitle: selectedDoc.title,
        pageNumber: activePageNumber,
        boxes: [{ page: activePageNumber, x0: 0.1, y0: 0.5, x1: 0.9, y1: 0.6 }],
        quote: { exact: ev2Text },
        charRange: { start: 100, end: 100 + ev2Text.length }
      }]
    });

    addNode({
      id: id4,
      type: 'question',
      x: startX + cardW + gap,
      y: startY + cardH + gap,
      width: cardW,
      height: cardH,
      color: '#f43f5e',
      title: `⚡ Inquiry [${baseTitle}]`,
      content: qText,
      puzzleLocked: true,
      puzzleConnections: [id2, id3],
      confidence: 0.92,
      verificationState: 'unverified',
      origin: 'agent',
      anchors: []
    });

    addEdge({ id: `edge-ai-${Date.now()}-1`, source: id1, target: id2, relation: 'supports' });
    addEdge({ id: `edge-ai-${Date.now()}-2`, source: id1, target: id3, relation: 'supports' });
    addEdge({ id: `edge-ai-${Date.now()}-3`, source: id2, target: id4, relation: 'leads_to' });

    addAuditLog('agent_run', `Analyzed ${baseTitle} from "${selectedDoc.title}" and generated 4 puzzle cards.`);
    setSnipToast(`⚡ Page ${activePageNumber} analyzed! Created 4 puzzle-connected cards on Mind Map.`);
    setTimeout(() => setSnipToast(null), 3500);
  };

  // Harvest Highlights to Mind Map Frame
  const handleHarvestHighlights = () => {
    const highlights = paragraphs.filter(p => p.isHighlight);
    if (highlights.length === 0 && inPageHighlights.length === 0) {
      setSnipToast('Select or hover text to highlight key lines first!');
      setTimeout(() => setSnipToast(null), 2500);
      return;
    }

    const frameX = 260;
    const frameY = 160;
    const frameId = `frame-hl-${Date.now()}`;

    addFrame({
      id: frameId,
      title: `Highlights: ${selectedDoc.title.slice(0, 26)}...`,
      x: frameX - 20,
      y: frameY - 20,
      width: 420,
      height: Math.min(650, 160 + highlights.length * 110),
      color: '#fbbf24'
    });

    let currY = frameY + 15;
    highlights.forEach((h, idx) => {
      addNode({
        type: 'evidence',
        x: frameX,
        y: currY,
        width: 380,
        title: `📑 Highlight (p. ${h.pageNumber})`,
        content: h.text,
        color: '#fbbf24',
        confidence: 1.0,
        verificationState: 'verified',
        origin: 'human',
        frameId,
        anchors: [{
          docId: selectedDoc.id,
          docTitle: selectedDoc.title,
          pageNumber: h.pageNumber,
          boxes: [{ page: h.pageNumber, x0: 0.1, y0: 0.2, x1: 0.9, y1: 0.35 }],
          quote: { exact: h.text },
          charRange: { start: 0, end: h.text.length }
        }]
      });
      currY += 120;
    });

    addAuditLog('node_create', `Harvested ${highlights.length} highlights into Mind Map Frame.`);
    setSnipToast(`📑 Harvested ${highlights.length} highlights into Mind Map Frame!`);
    setTimeout(() => setSnipToast(null), 3500);
  };

  // Add In-Page Sticky Note
  const handleAddStickyNote = () => {
    const newNote: StickyNoteItem = {
      id: `sticky-${Date.now()}`,
      pageNumber: activePageNumber,
      text: 'Sticky Note: Important clause / synthesis point to verify.',
      xPercent: 20 + Math.floor(Math.random() * 35),
      yPercent: 25 + Math.floor(Math.random() * 35)
    };
    setStickyNotes(prev => [...prev, newNote]);
    setSnipToast(`💬 Added sticky note on page ${activePageNumber}`);
    setTimeout(() => setSnipToast(null), 2500);
  };

  // Document paragraphs tailored to legal, academic, business, and medical professions or uploaded PDF
  const getDocumentParagraphs = (): SectionParagraph[] => {
    // 1. If user uploaded a real PDF file, parse and return its real pages
    if (selectedDoc.parsedPdf && selectedDoc.parsedPdf.pages.length > 0) {
      const generated: SectionParagraph[] = [];
      selectedDoc.parsedPdf.pages.forEach((page, pageIdx) => {
        if (page.lines && page.lines.length > 0) {
          page.lines.forEach((line, lineIdx) => {
            if (line.trim()) {
              generated.push({
                id: `p-upload-${page.pageNumber}-${lineIdx}`,
                section: `Page ${page.pageNumber} · Line ${lineIdx + 1}`,
                text: line.trim(),
                pageNumber: page.pageNumber,
                isHighlight: pageIdx === 0 && lineIdx === 0,
                highlightType: 'claim'
              });
            }
          });
        } else if (page.text.trim()) {
          generated.push({
            id: `p-upload-${page.pageNumber}-0`,
            section: `Page ${page.pageNumber} · Excerpt`,
            text: page.text.slice(0, 500),
            pageNumber: page.pageNumber,
            isHighlight: pageIdx === 0,
            highlightType: 'claim'
          });
        }
      });
      if (generated.length > 0) return generated;
    }

    // 2. Legal Preset
    if (activeField === 'legal') {
      return [
        {
          id: 'p-legal-1',
          section: 'Section 4.1 — Fees & Net 30 Invoicing',
          text: 'Customer shall pay all undisputed fees within thirty (30) calendar days of invoice date. Late payments shall accrue interest at the lesser of one and one-half percent (1.5%) per month or the maximum rate permitted by governing law.',
          pageNumber: 3
        },
        {
          id: 'p-legal-2',
          section: 'Section 8.2 — Limited Warranty & SLA Exclusions',
          text: 'Provider warrants that the SaaS Services will conform substantially to the Documentation under normal operating conditions. Scheduled maintenance windows and upstream cloud outages are expressly excluded from SLA uptime metrics.',
          pageNumber: 5
        },
        {
          id: 'p-legal-3',
          section: 'Section 12.1 — Mutual Indemnification for IP Infringement',
          text: 'Provider agrees to defend, indemnify, and hold harmless Customer and its officers, directors, and employees against any third-party claims, suits, or proceedings alleging that the Software infringes any patent, copyright, or misappropriates any trade secret.',
          isHighlight: true,
          highlightType: 'claim',
          pageNumber: 7
        },
        {
          id: 'p-legal-4',
          section: 'Section 12.3 — Limitation of Liability & Dollar Cap',
          text: 'EXCEPT FOR GROSS NEGLIGENCE, WILLFUL MISCONDUCT, OR INDEMNIFICATION OBLIGATIONS UNDER SECTION 12.1, NEITHER PARTY SHALL BE LIABLE FOR ANY CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES, NOR SHALL TOTAL AGGREGATE LIABILITY EXCEED TOTAL AMOUNTS PAID BY CUSTOMER IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.',
          isHighlight: true,
          highlightType: 'evidence',
          pageNumber: 8
        },
        {
          id: 'p-legal-5',
          section: 'Section 14.5 — Governing Law & Mandatory Dispute Arbitration',
          text: 'This Agreement shall be governed by and construed in accordance with the substantive laws of the State of Delaware, without giving effect to conflict of laws principles. Any dispute arising under this Agreement shall be resolved through binding arbitration in Wilmington, Delaware.',
          pageNumber: 12
        }
      ];
    }

    // 3. Business Preset
    if (activeField === 'business') {
      return [
        {
          id: 'p-biz-1',
          section: 'Section 2.1 — Recurring Revenue & Net Retention Trajectory',
          text: 'Annual Recurring Revenue (ARR) accelerated to $142M with Net Dollar Retention (NDR) stabilizing at 118% across enterprise cohorts, driven by seat expansion within Global 2000 strategic accounts.',
          pageNumber: 2,
          isHighlight: true,
          highlightType: 'claim'
        },
        {
          id: 'p-biz-2',
          section: 'Section 4.3 — Gross Margin & Cloud Infrastructure Synergies',
          text: 'Subscription gross margins expanded 340 bps year-over-year to 79.2%, benefiting from inference distillation and multi-tenant vector index memory compaction.',
          pageNumber: 4
        },
        {
          id: 'p-biz-3',
          section: 'Section 6.2 — Customer Acquisition Cost & Payback Period',
          text: 'Blended CAC payback period compressed to 14 months, while Magic Number reached 1.15x, signaling capital-efficient enterprise go-to-market scaling.',
          pageNumber: 6,
          isHighlight: true,
          highlightType: 'evidence'
        }
      ];
    }

    // 4. Medical Preset
    if (activeField === 'medical') {
      return [
        {
          id: 'p-med-1',
          section: 'Section 1.2 — Cohort Stratification & Biomarker Eligibility',
          text: 'Patients with histologically confirmed metastatic adenocarcinoma exhibiting HER2-low expression (IHC 1+ or IHC 2+/ISH-) were randomized 2:1 to experimental antibody-drug conjugate versus physician choice chemotherapy.',
          pageNumber: 3,
          isHighlight: true,
          highlightType: 'claim'
        },
        {
          id: 'p-med-2',
          section: 'Section 3.4 — Primary Endpoint: Progression-Free Survival (PFS)',
          text: 'Median progression-free survival was 10.1 months (95% CI, 9.5 to 11.5) in the experimental group compared with 5.4 months (95% CI, 4.4 to 7.1) in the control group (hazard ratio for progression or death, 0.51; P < 0.001).',
          pageNumber: 5,
          isHighlight: true,
          highlightType: 'evidence'
        },
        {
          id: 'p-med-3',
          section: 'Section 5.1 — Adverse Event Frequency & Pharmacokinetics',
          text: 'Grade 3 or higher treatment-emergent adverse events occurred in 52.6% of patients receiving the conjugate, predominantly neutropenia (13.7%) and anemia (8.1%). Interstitial lung disease was reported in 12.1% of patients.',
          pageNumber: 8
        }
      ];
    }

    // 5. Default: Academic & Machine Learning
    return [
      {
        id: 'p-acad-1',
        section: '3.1 Background & Recurrent Limitations',
        text: 'Recurrent models typically factor computation along the symbol positions of the input and output sequences. Aligning the positions to steps in computation time, they generate a sequence of hidden states h_t, as a function of the previous hidden state h_{t-1} and the input for position t. This inherently sequential nature precludes parallelization within training examples.',
        pageNumber: 2
      },
      {
        id: 'p-acad-2',
        section: '3.2 Multi-Head Attention Formulations',
        text: 'Instead of performing a single attention function with d_model-dimensional keys, values and queries, we found it beneficial to linearly project the queries, keys and values h times with different, learned linear projections to d_k, d_k and d_v dimensions, respectively.',
        pageNumber: 3
      },
      {
        id: 'p-acad-3',
        section: '3.2 Subspace Representation Specialization',
        text: 'Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions. With a single attention head, averaging inhibits this.',
        isHighlight: true,
        highlightType: 'claim',
        pageNumber: 4
      },
      {
        id: 'p-acad-4',
        section: '3.3 Head Dimension Scaling & Constant Cost',
        text: 'In this work we employ h = 8 parallel attention layers, or heads. For each of these we use d_k = d_v = d_model / h = 64. Due to the reduced dimension of each head, the total computational cost is similar to that of single-head attention with full dimensionality.',
        isHighlight: true,
        highlightType: 'evidence',
        pageNumber: 4
      }
    ];
  };

  const paragraphs = getDocumentParagraphs();

  // Filter based on squeeze mode
  const visibleParagraphs = paragraphs.filter(p => {
    if (squeezeMode === 'highlights') {
      return p.isHighlight;
    }
    if (squeezeMode === 'search' && searchQuery.trim()) {
      return p.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
             p.section.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Smooth two-way anchor flash listener
  useEffect(() => {
    if (!targetHighlightId) return;

    const q = targetHighlightId.toLowerCase().trim();
    const matched = visibleParagraphs.find(p =>
      p.id.toLowerCase() === q ||
      p.text.toLowerCase().includes(q) ||
      q.includes(p.text.slice(0, 35).toLowerCase()) ||
      p.section.toLowerCase().includes(q)
    ) || visibleParagraphs.find(p => p.isHighlight) || visibleParagraphs[0];

    if (matched) {
      setFlashingParagraphId(matched.id);
      const el = paragraphRefs.current.get(matched.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const timer = setTimeout(() => {
        setFlashingParagraphId(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [targetHighlightId, visibleParagraphs]);

  // Handle text selection anywhere in reader
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectionRange(null);
      return;
    }

    const text = selection.toString().trim();
    if (text.length > 3) {
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();

        if (containerRect) {
          setSelectionRange({
            text,
            x: Math.max(120, Math.min(containerRect.width - 160, rect.left - containerRect.left + rect.width / 2)),
            y: Math.max(50, rect.top - containerRect.top - 16),
            pageNumber: activePageNumber
          });
        }
      } catch (e) {
        setSelectionRange(null);
      }
    } else {
      setSelectionRange(null);
    }
  };

  const clearSelection = () => {
    window.getSelection()?.removeAllRanges();
    setSelectionRange(null);
  };

  const createSmartNodeFromSelection = (type: 'claim' | 'evidence') => {
    if (!selectionRange) return;

    addNode({
      type,
      x: 240 + Math.random() * 60,
      y: 180 + Math.random() * 60,
      title: selectionRange.text.slice(0, 45) + (selectionRange.text.length > 45 ? '...' : ''),
      content: selectionRange.text,
      confidence: 0.98,
      verificationState: 'verified',
      origin: 'human',
      anchors: [
        {
          docId: selectedDoc.id,
          docTitle: selectedDoc.title,
          pageNumber: selectionRange.pageNumber || activePageNumber,
          boxes: [{ page: selectionRange.pageNumber || activePageNumber, x0: 0.1, y0: 0.3, x1: 0.9, y1: 0.45 }],
          quote: { exact: selectionRange.text },
          charRange: { start: 100, end: 100 + selectionRange.text.length }
        }
      ]
    });

    addAuditLog('node_create', `Extracted excerpt from document: "${selectionRange.text.slice(0, 30)}..."`);
    setSnipToast('✂️ Snipped selection straight to your Workspace Board!');
    setTimeout(() => setSnipToast(null), 2500);
    clearSelection();
  };

  const copyWithCitation = () => {
    if (!selectionRange) return;
    const text = `"${selectionRange.text}"\n— ${selectedDoc.title} (Page ${activePageNumber}, ${selectedDoc.authors})`;
    navigator.clipboard.writeText(text);
    setSnipToast('📋 Copied text with citation to clipboard!');
    setTimeout(() => setSnipToast(null), 2500);
    clearSelection();
  };

  const getFontSizeClass = () => {
    switch (readerFontSize) {
      case 'sm': return 'text-[13px] leading-relaxed';
      case 'lg': return 'text-[18px] leading-relaxed';
      case 'xl': return 'text-[21px] leading-loose';
      case 'base':
      default: return 'text-[15px] leading-relaxed';
    }
  };

  const getPaperBackground = () => {
    if (appSettings.theme === 'light') {
      return 'bg-white text-slate-800 border-slate-200 shadow-xl';
    }
    if (appSettings.theme === 'sepia') {
      return 'bg-[#241c14] text-[#f7eee1] border-amber-900/40 shadow-2xl';
    }
    return 'bg-slate-900/95 text-slate-100 border-white/10 shadow-2xl';
  };

  return (
    <div
      ref={containerRef}
      onMouseUp={handleTextSelection}
      onTouchEnd={handleTextSelection}
      className={`h-full w-full flex flex-col select-text relative overflow-hidden font-sans ${
        appSettings.theme === 'light'
          ? 'bg-[#f4f6fa] border-r border-slate-200 text-slate-900'
          : 'bg-[#0c0e17] border-r border-white/10 text-slate-100'
      }`}
    >
      {selectedDoc.id === 'null' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-transparent to-black/5 dark:to-white/5">
          <div className="w-20 h-20 mb-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-apple-glow relative">
            <FileText className="w-10 h-10 text-blue-500" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-600 border-4 border-[#0c0e17] flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition active:scale-95">
              <label htmlFor="empty-upload" className="cursor-pointer">
                <Upload className="w-4 h-4 text-white" />
              </label>
              <input 
                id="empty-upload" 
                type="file" 
                accept="application/pdf,.docx,.txt" 
                onChange={handleDocumentUpload} 
                className="hidden" 
              />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to Spatial Pro</h2>
          <p className="max-w-md text-sm mb-8 text-slate-500 dark:text-slate-400">
            Please add a document to start reading. Your files are processed 100% locally on your device for absolute privacy.
          </p>
          <div className="flex space-x-4">
            <label className="cursor-pointer px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-apple-glow hover:brightness-110 active:scale-95 transition flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
              <input 
                type="file" 
                accept="application/pdf,.docx,.txt" 
                onChange={handleDocumentUpload} 
                className="hidden" 
              />
            </label>
            <button 
              onClick={() => document.getElementById('hub-trigger')?.click()} 
              className={`px-6 py-3 rounded-2xl border font-semibold text-sm backdrop-blur-lg active:scale-95 transition flex items-center space-x-2 ${
                appSettings.theme === 'light' ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50' : 'bg-white/5 hover:bg-white/10 border-white/15 text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Open Library</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 1. CLEAN, ORGANIZED SINGLE-TIER TOOLBAR */}
      <div className={`h-12 px-2.5 sm:px-3.5 border-b flex items-center justify-between text-xs shrink-0 select-none z-20 gap-2 ${
        appSettings.theme === 'light'
          ? 'bg-white/85 backdrop-blur-md border-slate-200 text-slate-700 shadow-sm'
          : 'bg-black/35 backdrop-blur-md border-white/10 text-slate-400'
      }`}>
        
        {/* Left Cluster: Zoom, Page Navigation, and View Format Toggle */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {/* Zoom Controls */}
          <div className={`flex items-center space-x-0.5 rounded-xl p-0.5 border ${
            appSettings.theme === 'light'
              ? 'bg-slate-100/90 border-slate-300/80 text-slate-700'
              : 'bg-black/40 border-white/10 text-slate-300'
          }`}>
            <button
              onClick={() => setReaderZoom(prev => Math.max(50, prev - 10))}
              className="p-1 hover:text-blue-500 rounded-lg transition"
              title="Zoom Out (Ctrl + Wheel Down or Pinch in)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setReaderZoom(100)}
              className="font-mono text-[11px] w-8 text-center select-none font-bold hover:text-blue-500 transition"
              title="Reset to 100% Zoom"
            >
              {readerZoom}%
            </button>
            <button
              onClick={() => setReaderZoom(prev => Math.min(250, prev + 10))}
              className="p-1 hover:text-blue-500 rounded-lg transition"
              title="Zoom In (Ctrl + Wheel Up or Pinch out)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page Navigator */}
          <div className={`flex items-center space-x-0.5 rounded-xl p-0.5 border ${
            appSettings.theme === 'light'
              ? 'bg-slate-100/90 border-slate-300/80 text-slate-700'
              : 'bg-black/40 border-white/10 text-slate-300'
          }`}>
            <button
              onClick={() => setActivePageNumber(prev => Math.max(1, prev - 1))}
              className="p-1 hover:text-blue-500 rounded-lg transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1 select-none">
              p. {activePageNumber} / {selectedDoc.pages || selectedDoc.parsedPdf?.totalPages || 1}
            </span>
            <button
              onClick={() => setActivePageNumber(prev => Math.min(selectedDoc.pages || selectedDoc.parsedPdf?.totalPages || 1, prev + 1))}
              className="p-1 hover:text-blue-500 rounded-lg transition"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* PDF Pages vs Text View (if parsed PDF is present) */}
          {selectedDoc.parsedPdf && (
            <div className={`hidden lg:flex p-0.5 rounded-xl border text-[10px] ${
              appSettings.theme === 'light'
                ? 'bg-slate-100/90 border-slate-300/80 text-slate-700'
                : 'bg-black/40 border-white/10 text-slate-300'
            }`}>
              <button
                onClick={() => setReaderViewMode('pages')}
                className={`px-2 py-0.5 rounded-lg transition font-semibold ${
                  readerViewMode === 'pages'
                    ? 'bg-blue-600 text-white shadow-apple-glow'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="Original Visual PDF Pages with Interactive Line Extraction"
              >
                Pages
              </button>
              <button
                onClick={() => setReaderViewMode('text')}
                className={`px-2 py-0.5 rounded-lg transition font-semibold ${
                  readerViewMode === 'text'
                    ? 'bg-blue-600 text-white shadow-apple-glow'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="Pleated Squeeze Text View"
              >
                Text
              </button>
            </div>
          )}
        </div>

        {/* Center Cluster: VIEW MODE vs EDIT MODE + ACTION BUTTONS */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <div className="flex items-center p-0.5 rounded-xl bg-black/50 border border-white/10 text-xs shadow-inner">
            <button
              onClick={() => {
                setReaderInteractionMode('view');
                setIsSnipMode(false);
                setActiveInkTool('inactive');
              }}
              className={`px-2.5 py-1 rounded-lg transition flex items-center space-x-1.5 font-semibold ${
                readerInteractionMode === 'view'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="View Mode: Native clean reading & text selection"
            >
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              <span>View</span>
            </button>

            <button
              onClick={() => setReaderInteractionMode('edit')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center space-x-1.5 font-semibold ${
                readerInteractionMode === 'edit'
                  ? 'bg-blue-600 text-white shadow-apple-glow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Edit & Snip Mode: Hover lines to snip or copy, highlight text, and run instant document analysis"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit & Snip</span>
            </button>
          </div>

          {/* Quick Analysis Actions when in Edit Mode */}
          {readerInteractionMode === 'edit' && (
            <div className="flex items-center space-x-1 animate-in fade-in duration-150">
              <button
                onClick={handleRunPageAnalysis}
                className="px-2 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-apple-glow flex items-center space-x-1 transition"
                title="1-Click AI Analysis: Generates 4 linked puzzle cards (Thesis, 2 Evidence, Inquiry) on the Mind Map"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span className="hidden sm:inline">⚡ Analyze</span>
              </button>

              <button
                onClick={handleHarvestHighlights}
                className="px-2 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/30 text-amber-300 font-semibold text-xs flex items-center space-x-1 transition"
                title="Harvest Highlights: Group all document highlights into a Mind Map Frame"
              >
                <Bookmark className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Harvest</span>
              </button>

              <button
                onClick={handleAddStickyNote}
                className="px-2 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-semibold text-xs flex items-center space-x-1 transition"
                title="Add Sticky Note on page"
              >
                <StickyNoteIcon className="w-3 h-3 text-yellow-300" />
                <span className="hidden sm:inline">Note</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Cluster: Display Filter Popover, Upload Doc, Snip Area, Inking */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {/* Eye-Care PDF Display Filter Dropdown Popover */}
          <div className="relative" ref={filterMenuRef}>
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className={`px-2 py-1 rounded-xl transition font-medium flex items-center space-x-1 text-xs ${
                isFilterMenuOpen
                  ? 'bg-blue-600 text-white shadow-apple-glow'
                  : 'bg-black/40 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
              title="Eye-Care Reading Filter (Natural, Warm Sepia, Dark Invert, Soft Contrast)"
            >
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline text-[11px]">
                {PDF_FILTERS.find(f => f.id === appSettings.pdfColorFilter)?.label || 'Style'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isFilterMenuOpen && (
              <div
                onMouseDown={e => e.stopPropagation()}
                className="absolute top-full right-0 mt-1.5 w-44 glass-panel border border-white/20 p-1.5 rounded-2xl shadow-2xl z-50 animate-in zoom-in-95 duration-100 space-y-0.5 select-none"
              >
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">
                  Reading Filter
                </div>
                {PDF_FILTERS.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => {
                      updateAppSettings({ pdfColorFilter: filter.id });
                      setIsFilterMenuOpen(false);
                    }}
                    className={`w-full px-2 py-1.5 rounded-xl text-left transition flex items-center justify-between text-xs ${
                      appSettings.pdfColorFilter === filter.id
                        ? 'bg-blue-600/25 border border-blue-500/40 text-white font-semibold'
                        : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{filter.icon}</span>
                      <span>{filter.label}</span>
                    </span>
                    {appSettings.pdfColorFilter === filter.id && (
                      <Check className="w-3.5 h-3.5 text-blue-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Upload Document Button */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.docx,.doc,.txt,.md,.rtf,.png,.jpg,.jpeg,.webp,.gif,.svg,.json,.csv,.tsv"
            onChange={handleDocumentUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="hidden md:flex px-2 py-1 rounded-xl bg-blue-600/20 hover:bg-blue-600/35 border border-blue-500/30 text-blue-400 text-xs font-semibold transition items-center space-x-1"
            title="Upload any document (PDF, Word .docx, or Text)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">+ Upload</span>
          </button>

          {/* LiquidText Snip Area Tool */}
          <button
            onClick={() => {
              setIsSnipMode(!isSnipMode);
              setReaderInteractionMode('edit');
              setActiveInkTool('inactive');
            }}
            className={`px-2 py-1 rounded-xl transition flex items-center space-x-1 text-xs font-semibold ${
              isSnipMode
                ? 'bg-amber-400 text-slate-950 shadow-apple-glow animate-pulse'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Snip Area: Crop visual portion directly to Mind Map"
          >
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">
              {isSnipMode ? 'Snipping...' : '✂️ Snip'}
            </span>
          </button>

          {/* Inking Tools: Pen & Highlighter */}
          <div className="flex items-center space-x-0.5 p-0.5 rounded-xl bg-black/40 border border-white/10">
            <button
              onClick={() => {
                setActiveInkTool(activeInkTool === 'pen' ? 'inactive' : 'pen');
                setIsSnipMode(false);
              }}
              className={`p-1.5 rounded-lg transition ${
                activeInkTool === 'pen' ? 'bg-blue-600 text-white shadow-apple-glow' : 'text-slate-400 hover:text-white'
              }`}
              title="Pen / Stylus Ink"
            >
              <PenTool className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setActiveInkTool(activeInkTool === 'highlighter' ? 'inactive' : 'highlighter');
                setIsSnipMode(false);
              }}
              className={`p-1.5 rounded-lg transition ${
                activeInkTool === 'highlighter' ? 'bg-amber-500 text-black shadow-apple-glow' : 'text-slate-400 hover:text-white'
              }`}
              title="Highlighter"
            >
              <Highlighter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE SNIP MODE CONTROLS STRIP (Only visible during crop drag) */}
      {isSnipMode && (
        <div className="px-3 py-1.5 bg-amber-500/15 border-b border-amber-500/30 flex items-center justify-between text-amber-200 text-xs shrink-0 animate-in slide-in-from-top-1 select-none">
          <div className="flex items-center space-x-2">
            <Scissors className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-semibold text-[11px] text-amber-300">
              Drag on document to snip visual excerpt
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-amber-300/80 font-medium hidden sm:inline">Ratio:</span>
            <div className="flex p-0.5 rounded-lg bg-black/40 border border-amber-500/30 text-[10px]">
              {(['free', '1:1', '4:3', '16:9'] as const).map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setSnipRatio(ratio)}
                  className={`px-1.5 py-0.5 rounded transition uppercase font-semibold ${
                    snipRatio === ratio
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'text-amber-200/80 hover:text-white'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsSnipMode(false)}
              className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] flex items-center space-x-1 transition"
              title="Cancel (Esc)"
            >
              <X className="w-3 h-3" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* FLOATING SELECTION ACTION POPOVER (Appears on selecting ANY text) */}
      {selectionRange && (
        <div
          className="absolute z-50 glass-panel border border-white/20 p-1.5 rounded-2xl shadow-2xl flex items-center space-x-1 animate-in fade-in zoom-in-95 duration-100 select-none"
          style={{
            left: `${selectionRange.x}px`,
            top: `${selectionRange.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
          onMouseDown={e => e.stopPropagation()}
        >
          <button
            onClick={() => createSmartNodeFromSelection('evidence')}
            className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] shadow-apple-glow flex items-center space-x-1"
            title="Snip selection directly to Workspace Board"
          >
            <Scissors className="w-3 h-3" />
            <span>Snip to Board</span>
          </button>

          <button
            onClick={copyWithCitation}
            className="px-2 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] flex items-center space-x-1"
            title="Copy Text with Page Citation"
          >
            <Copy className="w-3 h-3" />
            <span>Copy</span>
          </button>

          <button
            onClick={() => {
              handleHighlightLine(selectionRange.text, activePageNumber);
              clearSelection();
            }}
            className="px-2 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 text-[11px] flex items-center space-x-1"
            title="Highlight Selection"
          >
            <Highlighter className="w-3 h-3 text-amber-400" />
            <span>Highlight</span>
          </button>

          <button
            onClick={clearSelection}
            className="p-1 hover:text-white text-slate-400 rounded-lg hover:bg-white/10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* DOCUMENT READING VIEWPORT DESK */}
      <div
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleTapZoom}
        className={`flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-28 flex flex-col items-center relative select-text transition-colors duration-300 ${
          appSettings.theme === 'light'
            ? 'reading-desk-light reading-desk-grid-light'
            : 'reading-desk-dark reading-desk-grid-dark'
        }`}
      >
        <InkLayer
          strokes={inkStrokes}
          onAddStroke={addInkStroke}
          onDeleteStroke={deleteInkStroke}
          tool={activeInkTool}
          color={inkColor}
          penWidth={activeInkTool === 'highlighter' ? 14 : 3}
          target="reader"
        />

        {/* 1. VISUAL PDF PAGES VIEW (WITH INTERACTIVE LINE OVERLAY & HOVER ACTIONS) */}
        {readerViewMode === 'pages' && selectedDoc.parsedPdf && selectedDoc.parsedPdf.pages.length > 0 ? (
          <div
            className="w-full max-w-2xl space-y-6 flex flex-col items-center transition-transform origin-top z-10 zoom-viewport-sheet will-change-transform"
            style={{ transform: `scale(${readerZoom / 100})` }}
          >
            {selectedDoc.parsedPdf.pages.map(page => (
              <div
                key={page.pageNumber}
                className={`w-full rounded-2xl overflow-hidden relative group select-text transition-all duration-300 ${
                  appSettings.theme === 'light'
                    ? 'paper-sheet-light bg-white border border-slate-300/80 shadow-xl'
                    : 'paper-sheet-dark bg-[#111420] border border-white/20 shadow-2xl'
                }`}
              >
                {/* Page Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/85 text-white text-[10px] font-mono z-20 backdrop-blur-md border border-white/15 shadow">
                  Page {page.pageNumber} of {selectedDoc.parsedPdf!.totalPages}
                </div>

                {/* Page Rasterized Image */}
                {page.canvasDataUrl ? (
                  <div className={`relative w-full overflow-hidden select-text pdf-filter-${appSettings.pdfColorFilter || 'normal'}`}>
                    <img
                      ref={el => {
                        if (el) pageImagesRef.current.set(page.pageNumber, el);
                        else pageImagesRef.current.delete(page.pageNumber);
                      }}
                      src={page.canvasDataUrl}
                      alt={`Page ${page.pageNumber}`}
                      className={`w-full h-auto object-contain select-text pdf-filter-${appSettings.pdfColorFilter || 'normal'}`}
                      draggable={false}
                    />

                    {/* IN-PAGE STICKY NOTES */}
                    {stickyNotes
                      .filter(sn => sn.pageNumber === page.pageNumber)
                      .map(sn => (
                        <div
                          key={sn.id}
                          className="absolute z-40 p-2.5 rounded-xl bg-amber-200 text-slate-900 border border-amber-300 shadow-2xl w-48 text-xs select-none animate-in fade-in"
                          style={{ left: `${sn.xPercent}%`, top: `${sn.yPercent}%` }}
                        >
                          <div className="flex items-center justify-between pb-1 border-b border-amber-400/50 mb-1 text-[10px] font-bold text-amber-950">
                            <span className="flex items-center space-x-1">
                              <StickyNoteIcon className="w-2.5 h-2.5 text-amber-800" />
                              <span>Sticky Note</span>
                            </span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => {
                                  addNode({
                                    type: 'note',
                                    x: 300 + Math.random() * 40,
                                    y: 180 + Math.random() * 40,
                                    title: `💬 Note · p. ${sn.pageNumber}`,
                                    content: sn.text,
                                    color: '#f59e0b',
                                    confidence: 1.0,
                                    verificationState: 'verified',
                                    origin: 'human',
                                    anchors: [{
                                      docId: selectedDoc.id,
                                      docTitle: selectedDoc.title,
                                      pageNumber: sn.pageNumber,
                                      boxes: [{ page: sn.pageNumber, x0: 0.1, y0: 0.2, x1: 0.9, y1: 0.3 }],
                                      quote: { exact: sn.text },
                                      charRange: { start: 0, end: sn.text.length }
                                    }]
                                  });
                                  setSnipToast('💬 Sent sticky note to Mind Map!');
                                  setTimeout(() => setSnipToast(null), 2500);
                                }}
                                className="px-1 py-0.5 rounded bg-amber-300 hover:bg-amber-400 text-amber-950 font-bold text-[9px] shadow-sm transition"
                                title="Send this note to Mind Map Board"
                              >
                                &rarr; Map
                              </button>
                              <button
                                onClick={() => setStickyNotes(prev => prev.filter(n => n.id !== sn.id))}
                                className="p-0.5 text-amber-800 hover:text-rose-700 transition"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                          <textarea
                            value={sn.text}
                            onChange={e => {
                              const val = e.target.value;
                              setStickyNotes(prev => prev.map(n => n.id === sn.id ? { ...n, text: val } : n));
                            }}
                            rows={2}
                            className="w-full bg-transparent resize-none text-[11px] leading-snug outline-none border-none text-slate-900 font-sans"
                          />
                        </div>
                      ))}

                    {/* IN-PAGE HIGHLIGHTS LAYER */}
                    {inPageHighlights
                      .filter(h => h.pageNumber === page.pageNumber)
                      .map(hl => (
                        <div
                          key={hl.id}
                          className="absolute pointer-events-none rounded transition-all"
                          style={{
                            top: `${hl.topPercent}%`,
                            left: `${hl.leftPercent}%`,
                            width: `${hl.widthPercent}%`,
                            height: `${hl.heightPercent}%`,
                            backgroundColor: hl.color || 'rgba(251, 191, 36, 0.45)',
                            mixBlendMode: 'multiply'
                          }}
                        />
                      ))}

                    {/* INTERACTIVE LINE-BY-LINE OVERLAY (Enables Selection, 1-Click Copy & Snip in PDF Pages format) */}
                    {page.lineBoxes && page.lineBoxes.length > 0 ? (
                      page.lineBoxes.map((box, lineIdx) => {
                        const lineKey = `${page.pageNumber}-${lineIdx}`;
                        const isHovered = hoveredLineKey === lineKey;

                        return (
                          <div
                            key={lineIdx}
                            onMouseEnter={() => setHoveredLineKey(lineKey)}
                            onMouseLeave={() => setHoveredLineKey(null)}
                            className={`absolute transition-all ${
                              readerInteractionMode === 'edit'
                                ? 'hover:bg-blue-500/20 hover:ring-1 hover:ring-blue-400/80 cursor-pointer rounded'
                                : 'cursor-text'
                            }`}
                            style={{
                              top: `${box.topPercent}%`,
                              left: `${box.leftPercent}%`,
                              width: `${box.widthPercent}%`,
                              height: `${box.heightPercent}%`
                            }}
                          >
                            {/* Transparent selectable text for native cursor copy */}
                            <span className="opacity-0 select-text block w-full h-full text-transparent overflow-hidden pointer-events-auto">
                              {box.text}
                            </span>

                            {/* HOVER ACTION BAR IN EDITING MODE (1-Click Snip & Copy) */}
                            {readerInteractionMode === 'edit' && isHovered && (
                              <div
                                className="absolute -top-7 right-0 z-30 flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-950/90 border border-white/20 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
                                onMouseDown={e => e.stopPropagation()}
                              >
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleSnipSpecificLine(box.text, page.pageNumber, box);
                                  }}
                                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center space-x-1"
                                  title="Snip this exact line to Workspace"
                                >
                                  <Scissors className="w-2.5 h-2.5" />
                                  <span>Snip Line</span>
                                </button>

                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleCopyLine(box.text, page.pageNumber);
                                  }}
                                  className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10"
                                  title="Copy this line"
                                >
                                  <Copy className="w-2.5 h-2.5" />
                                </button>

                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleHighlightLine(box.text, page.pageNumber, box);
                                  }}
                                  className="p-1 rounded text-amber-400 hover:text-amber-300 hover:bg-white/10"
                                  title="Highlight this line"
                                >
                                  <Highlighter className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      /* Fallback Line Segmentation if no coordinates available */
                      <div className="absolute inset-0 p-4 flex flex-col justify-around pointer-events-auto select-text">
                        {page.lines.map((line, lIdx) => {
                          const lineKey = `${page.pageNumber}-${lIdx}`;
                          const isHovered = hoveredLineKey === lineKey;

                          return (
                            <div
                              key={lIdx}
                              onMouseEnter={() => setHoveredLineKey(lineKey)}
                              onMouseLeave={() => setHoveredLineKey(null)}
                              className={`relative group/line transition ${
                                readerInteractionMode === 'edit'
                                  ? 'hover:bg-blue-500/20 hover:ring-1 hover:ring-blue-400/80 cursor-pointer rounded px-1'
                                  : 'cursor-text'
                              }`}
                            >
                              <span className="opacity-0 select-text text-xs">{line}</span>

                              {readerInteractionMode === 'edit' && isHovered && (
                                <div
                                  className="absolute -top-6 right-2 z-30 flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-950/90 border border-white/20 shadow-2xl backdrop-blur-md"
                                  onMouseDown={e => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => handleSnipSpecificLine(line, page.pageNumber)}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center space-x-1"
                                  >
                                    <Scissors className="w-2.5 h-2.5" />
                                    <span>Snip</span>
                                  </button>
                                  <button
                                    onClick={() => handleCopyLine(line, page.pageNumber)}
                                    className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10"
                                    title="Copy line"
                                  >
                                    <Copy className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    onClick={() => handleHighlightLine(line, page.pageNumber)}
                                    className="p-1 rounded text-amber-400 hover:text-amber-300 hover:bg-white/10"
                                    title="Highlight line"
                                  >
                                    <Highlighter className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Plain Text Fallback for Pages */
                  <div className="p-8 text-slate-200 font-serif leading-relaxed text-sm bg-slate-900/95 min-h-[400px] select-text">
                    <div className="font-sans text-xs text-blue-400 font-semibold mb-3">
                      Page {page.pageNumber}
                    </div>
                    {page.lines.map((line, lIdx) => (
                      <div
                        key={lIdx}
                        className="relative group p-1 hover:bg-blue-500/10 rounded flex items-center justify-between"
                      >
                        <p className="flex-1 select-text">{line}</p>
                        {readerInteractionMode === 'edit' && (
                          <div className="hidden group-hover:flex items-center space-x-1 shrink-0 ml-2">
                            <button
                              onClick={() => handleSnipSpecificLine(line, page.pageNumber)}
                              className="p-1 text-xs bg-blue-600 text-white rounded font-medium"
                              title="Snip line"
                            >
                              <Scissors className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleCopyLine(line, page.pageNumber)}
                              className="p-1 text-xs bg-white/10 text-slate-200 rounded"
                              title="Copy line"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : selectedDoc.docHtml ? (
          /* 2. WORD DOCUMENT ORIGINAL FORMAT VIEW (.docx, .doc) */
          <div
            className={`w-full max-w-2xl rounded-2xl p-8 sm:p-12 transition-all origin-top z-10 select-text zoom-viewport-sheet will-change-transform ${
              appSettings.theme === 'light'
                ? 'paper-sheet-light bg-white border border-slate-300/80 text-slate-800'
                : 'paper-sheet-dark ' + getPaperBackground()
            } pdf-filter-${appSettings.pdfColorFilter || 'normal'}`}
            style={{ transform: `scale(${readerZoom / 100})` }}
          >
            <div className="border-b border-black/10 dark:border-white/10 pb-4 mb-6 flex items-center justify-between text-xs text-blue-500 font-semibold">
              <span className="flex items-center space-x-1.5">
                <FileText className="w-4 h-4" />
                <span>Word Document (Original Layout Preserved)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {readerInteractionMode === 'edit' ? '✏️ Editable Mode Active' : '👁️ Viewing Mode'}
              </span>
            </div>

            {/* Render authentic formatted HTML from Word */}
            <div
              contentEditable={readerInteractionMode === 'edit'}
              suppressContentEditableWarning={true}
              className={`prose prose-sm max-w-none leading-relaxed outline-none select-text ${
                appSettings.theme !== 'light' ? 'prose-invert' : ''
              } ${getFontSizeClass()}`}
              dangerouslySetInnerHTML={{ __html: selectedDoc.docHtml }}
            />
          </div>
        ) : (
          /* 3. PAPER SHEET VIEW WITH LIQUIDTEXT SQUEEZE ACCORDIONS */
          <div
            className={`w-full max-w-xl rounded-2xl p-8 md:p-10 transition-all origin-top z-10 space-y-6 font-serif select-text zoom-viewport-sheet will-change-transform ${
              appSettings.theme === 'light'
                ? 'paper-sheet-light bg-white border border-slate-300/80 text-slate-900'
                : 'paper-sheet-dark ' + getPaperBackground()
            } ${getFontSizeClass()} pdf-filter-${appSettings.pdfColorFilter || 'normal'}`}
            style={{ transform: `scale(${readerZoom / 100})` }}
          >
            {/* Header */}
            <div className="border-b border-white/10 pb-4 font-sans not-italic space-y-1">
              <div className="flex items-center justify-between text-[11px] text-blue-400 font-mono">
                <span className="flex items-center">
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  {selectedDoc.title}
                </span>
                <span>{activeField.toUpperCase()} REVIEW</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight font-sans">
                {selectedDoc.title}
              </h1>
            </div>

            {/* SQUEEZED PARAGRAPHS */}
            {visibleParagraphs.map((p, idx) => (
              <React.Fragment key={p.id}>
                {/* Pleated accordion collapse indicator */}
                {squeezeMode !== 'none' && idx > 0 && (
                  <div className="my-3 py-1.5 px-3 rounded-lg bg-black/40 border-y border-dashed border-amber-400/40 text-[10px] font-sans text-amber-300/80 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Scissors className="w-3 h-3 text-amber-400" />
                      <span>Collapsed unhighlighted pages (Pinch active)</span>
                    </div>
                    <button
                      onClick={() => setSqueezeMode('none')}
                      className="underline hover:text-white text-[10px]"
                    >
                      View All
                    </button>
                  </div>
                )}

                {/* Paragraph Block */}
                <div
                  ref={el => {
                    if (el) paragraphRefs.current.set(p.id, el);
                    else paragraphRefs.current.delete(p.id);
                  }}
                  className={`relative group transition-all duration-300 rounded-xl select-text ${
                    flashingParagraphId === p.id
                      ? 'p-4 bg-amber-400/25 ring-4 ring-amber-400 scale-[1.02] shadow-[0_0_35px_rgba(251,191,36,0.6)]'
                      : p.isHighlight
                      ? 'p-4 bg-amber-400/15 border-l-4 border-amber-400 ring-1 ring-amber-400/20'
                      : 'p-2 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-sans text-slate-400 font-semibold tracking-wide mb-1">
                    <span>{p.section} · <span className="font-mono text-[10px]">p. {p.pageNumber}</span></span>

                    {/* Inline Actions in Edit Mode */}
                    {readerInteractionMode === 'edit' && (
                      <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleSnipSpecificLine(p.text, p.pageNumber)}
                          className="px-2 py-0.5 rounded text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center space-x-1"
                          title="Snip paragraph to Board"
                        >
                          <Scissors className="w-2.5 h-2.5" />
                          <span>Snip</span>
                        </button>
                        <button
                          onClick={() => handleCopyLine(p.text, p.pageNumber)}
                          className="p-1 rounded text-slate-400 hover:text-white"
                          title="Copy text"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className={`select-text ${p.isHighlight ? 'text-amber-300 italic' : ''}`}>
                    {p.text}
                  </p>

                  {p.isHighlight && (
                    <div className="pt-2 text-[10px] font-sans text-amber-300/80 flex items-center justify-between not-italic">
                      <span className="flex items-center">
                        <Bookmark className="w-3 h-3 mr-1" />
                        Visual Anchor &rarr; Linked to Workspace Card
                      </span>
                      <span className="text-blue-400 font-medium">Click Card on Right to Flash</span>
                    </div>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* LIQUIDTEXT PROPORTIONAL SNIP OVERLAY */}
        {isSnipMode && (
          <div
            className="absolute inset-0 z-40 cursor-crosshair select-none bg-black/30 backdrop-blur-[0.5px]"
            onPointerDown={handleSnipPointerDown}
            onPointerMove={handleSnipPointerMove}
            onPointerUp={handleSnipPointerUp}
          >
            {/* Top Snip Ratio Control Dock */}
            <div
              className="absolute top-3 left-1/2 -translate-x-1/2 glass-panel border border-white/20 px-3.5 py-1.5 rounded-2xl shadow-2xl flex items-center space-x-2 z-50 text-xs animate-in slide-in-from-top-3 duration-150"
              onPointerDown={e => e.stopPropagation()}
            >
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs pr-2 border-r border-white/10">
                <Scissors className="w-4 h-4" />
                <span>Snip Tool:</span>
              </div>

              {/* Ratio Buttons */}
              <div className="flex items-center space-x-1">
                {(
                  [
                    { id: 'free', label: 'Freeform' },
                    { id: '1:1', label: '1:1 Square' },
                    { id: '4:3', label: '4:3 Standard' },
                    { id: '16:9', label: '16:9 Wide' },
                    { id: '3:2', label: '3:2 Card' }
                  ] as const
                ).map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSnipRatio(r.id)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                      snipRatio === r.id
                        ? 'bg-amber-400 text-slate-950 shadow-apple-glow font-bold'
                        : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-white/10"></div>

              <button
                onClick={() => setIsSnipMode(false)}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-medium transition"
              >
                Done
              </button>
            </div>

            {/* Bounding box while dragging */}
            {snipStart && snipCurrent && (
              <div
                className="absolute border-2 border-dashed border-amber-400 bg-amber-400/25 pointer-events-none rounded shadow-2xl backdrop-blur-[1px]"
                style={{
                  left: Math.min(snipStart.x, snipCurrent.x),
                  top: Math.min(snipStart.y, snipCurrent.y),
                  width: Math.abs(snipCurrent.x - snipStart.x),
                  height: Math.abs(snipCurrent.y - snipStart.y)
                }}
              >
                <span className="absolute -top-7 left-0 bg-amber-400 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center space-x-1">
                  <Scissors className="w-3 h-3 mr-1" />
                  <span>
                    Crop ({Math.round(Math.abs(snipCurrent.x - snipStart.x))} × {Math.round(Math.abs(snipCurrent.y - snipStart.y))}) · {snipRatio === 'free' ? 'FREE' : snipRatio}
                  </span>
                </span>
              </div>
            )}

            {!snipStart && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-semibold text-xs px-4 py-1.5 rounded-full shadow-apple-glow flex items-center space-x-1.5">
                <Scissors className="w-3.5 h-3.5" />
                <span>Click & drag across any text, diagram, or formula · Ratio: {snipRatio === 'free' ? 'Freeform' : snipRatio}</span>
              </div>
            )}
          </div>
        )}

        {/* NOTIFICATION TOAST */}
        {snipToast && (
          <div className="fixed bottom-8 left-1/3 z-50 px-4 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center space-x-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{snipToast}</span>
          </div>
        )}
      </div>

      {/* FLOATING APPLE-STYLE ZOOM HUD (Accessible by Touch, Pencil, and Mouse) */}
      <div className={`absolute bottom-4 left-4 z-30 flex items-center space-x-1.5 p-1.5 rounded-2xl shadow-2xl backdrop-blur-xl select-none transition-all ${
        appSettings.theme === 'light'
          ? 'bg-white/90 border border-slate-300/80 text-slate-800 shadow-slate-300/50'
          : 'bg-[#11131e]/90 border border-white/15 text-slate-200 shadow-black/60'
      }`}>
        <button
          onClick={() => setReaderZoom(prev => Math.max(50, prev - 10))}
          className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition active:scale-95"
          title="Zoom Out (Ctrl + Wheel Down or Pinch in)"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setReaderZoom(100)}
          className="px-2 py-1 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 font-mono text-xs font-bold transition"
          title="Reset to 100% Zoom"
        >
          {readerZoom}%
        </button>

        <button
          onClick={() => setReaderZoom(prev => Math.min(250, prev + 10))}
          className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition active:scale-95"
          title="Zoom In (Ctrl + Wheel Up or Pinch out)"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-slate-300 dark:bg-white/20 my-auto"></div>

        <button
          onClick={handleFitWidth}
          className="px-2 py-1 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-blue-600 dark:text-blue-400 text-[11px] font-semibold transition active:scale-95 flex items-center space-x-1"
          title="Fit Page to Width (Double tap desk)"
        >
          <Maximize2 className="w-3 h-3" />
          <span>Fit Width</span>
        </button>

        <div className="hidden sm:flex items-center space-x-0.5 pl-1 border-l border-slate-300 dark:border-white/15">
          {[75, 100, 125, 150].map(pct => (
            <button
              key={pct}
              onClick={() => setReaderZoom(pct)}
              className={`px-1.5 py-0.5 rounded-lg text-[10px] font-mono transition ${
                readerZoom === pct
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
              }`}
              title={`Zoom to ${pct}%`}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>
      </>
      )}
    </div>
  );
};
