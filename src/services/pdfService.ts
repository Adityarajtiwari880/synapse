import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { LineBoundingBox, DocumentItem } from '../types';

// Set up worker source for browser environment
if (typeof window !== 'undefined' && 'Worker' in window) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF Worker initialization fallback', e);
  }
}

export interface ParsedPdfPage {
  pageNumber: number;
  text: string;
  lines: string[];
  lineBoxes?: LineBoundingBox[];
  canvasDataUrl?: string;
  width?: number;
  height?: number;
}

export interface ParsedDocumentResult {
  title: string;
  totalPages: number;
  fileSize: string;
  fileType: 'pdf' | 'docx' | 'doc' | 'txt' | 'md' | 'image' | 'svg' | 'json' | 'csv' | 'generic';
  pages: ParsedPdfPage[];
  fullText: string;
  docHtml?: string;
  docContent?: string;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Parses any uploaded binary PDF file directly in the user's browser,
 * extracting line-by-line bounding boxes for exact line copying and visual snipping.
 */
export async function parsePdfFile(file: File): Promise<ParsedDocumentResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;

  const totalPages = pdfDoc.numPages;
  const parsedPages: ParsedPdfPage[] = [];
  let fullTextAccumulator = '';

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 }); // Higher DPI for crystal clear text & snipping
    const textContent = await page.getTextContent();

    // 1. Extract raw items with viewport coordinates
    interface RawTextToken {
      str: string;
      vx: number; // Viewport X (from left)
      vy: number; // Viewport Y (from top)
      width: number;
      height: number;
    }

    const rawTokens: RawTextToken[] = [];
    for (const item of textContent.items as any[]) {
      if (!item.str || !item.transform) continue;
      const tx = item.transform[4];
      const ty = item.transform[5];
      // Convert PDF coords to viewport coords (where 0,0 is top-left)
      const [vx, vy] = viewport.convertToViewportPoint(tx, ty);
      const itemWidth = (item.width || 0) * (viewport.scale / (viewport.scale || 1));
      const itemHeight = Math.max(12, (item.height || 14) * (viewport.scale / (viewport.scale || 1)));

      rawTokens.push({
        str: item.str,
        vx,
        vy: vy - itemHeight, // Normalize so vy is top of text line
        width: itemWidth || item.str.length * 8,
        height: itemHeight
      });
    }

    // 2. Sort tokens by vertical position (top to bottom), then horizontal (left to right)
    rawTokens.sort((a, b) => {
      const dy = a.vy - b.vy;
      if (Math.abs(dy) > 6) return dy;
      return a.vx - b.vx;
    });

    // 3. Cluster tokens into cohesive lines
    interface ClusteredLine {
      text: string;
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
    }

    const clusteredLines: ClusteredLine[] = [];
    let currentCluster: ClusteredLine | null = null;

    for (const tok of rawTokens) {
      if (!currentCluster) {
        currentCluster = {
          text: tok.str,
          minX: tok.vx,
          maxX: tok.vx + tok.width,
          minY: tok.vy,
          maxY: tok.vy + tok.height
        };
      } else {
        const isSameLine = Math.abs(tok.vy - currentCluster.minY) < 10;
        if (isSameLine) {
          currentCluster.text += (tok.str.startsWith(' ') || currentCluster.text.endsWith(' ') ? '' : ' ') + tok.str;
          currentCluster.minX = Math.min(currentCluster.minX, tok.vx);
          currentCluster.maxX = Math.max(currentCluster.maxX, tok.vx + tok.width);
          currentCluster.minY = Math.min(currentCluster.minY, tok.vy);
          currentCluster.maxY = Math.max(currentCluster.maxY, tok.vy + tok.height);
        } else {
          if (currentCluster.text.trim()) {
            clusteredLines.push(currentCluster);
          }
          currentCluster = {
            text: tok.str,
            minX: tok.vx,
            maxX: tok.vx + tok.width,
            minY: tok.vy,
            maxY: tok.vy + tok.height
          };
        }
      }
    }
    if (currentCluster && currentCluster.text.trim()) {
      clusteredLines.push(currentCluster);
    }

    // 4. Convert clustered lines into LineBoundingBoxes with percentage coordinates
    const lineBoxes: LineBoundingBox[] = clusteredLines.map(line => ({
      text: line.text.trim(),
      leftPercent: Math.max(0, Math.min(100, (line.minX / viewport.width) * 100)),
      topPercent: Math.max(0, Math.min(100, (line.minY / viewport.height) * 100)),
      widthPercent: Math.max(5, Math.min(100, ((line.maxX - line.minX) / viewport.width) * 100)),
      heightPercent: Math.max(1.8, Math.min(20, ((line.maxY - line.minY) / viewport.height) * 100))
    }));

    const cleanLines = clusteredLines.map(l => l.text.trim()).filter(Boolean);
    const pageText = cleanLines.join('\n');
    fullTextAccumulator += pageText + '\n\n';

    // 5. High-resolution canvas rasterization for crisp visual rendering
    let canvasDataUrl: string | undefined = undefined;
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport, canvas } as any).promise;
        canvasDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      }
    } catch (renderErr) {
      console.warn(`Page ${pageNum} rasterization skipped`, renderErr);
    }

    parsedPages.push({
      pageNumber: pageNum,
      text: pageText,
      lines: cleanLines.length > 0 ? cleanLines : [pageText],
      lineBoxes: lineBoxes.length > 0 ? lineBoxes : undefined,
      canvasDataUrl,
      width: viewport.width,
      height: viewport.height
    });
  }

  return {
    title: file.name.replace(/\.[^/.]+$/, ''),
    totalPages,
    fileSize: formatFileSize(file.size),
    fileType: 'pdf',
    pages: parsedPages,
    fullText: fullTextAccumulator
  };
}

/**
 * Parses Microsoft Word documents (.docx, .doc) while preserving their original
 * rich formatting (headings, tables, lists, bold, italics, structure).
 */
export async function parseDocxFile(file: File): Promise<ParsedDocumentResult> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Convert Word document to clean HTML
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
  const docHtml = htmlResult.value;

  // Extract raw text
  const textResult = await mammoth.extractRawText({ arrayBuffer });
  const rawText = textResult.value || '';
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // Group lines into simulated reading pages (~25 lines per page)
  const pageSize = 25;
  const totalPages = Math.max(1, Math.ceil(lines.length / pageSize));
  const pages: ParsedPdfPage[] = [];

  for (let i = 0; i < totalPages; i++) {
    const pageLines = lines.slice(i * pageSize, (i + 1) * pageSize);
    const lineBoxes: LineBoundingBox[] = pageLines.map((l, idx) => ({
      text: l,
      leftPercent: 8,
      topPercent: 8 + (idx * (84 / Math.max(1, pageLines.length))),
      widthPercent: 84,
      heightPercent: 3.2
    }));

    pages.push({
      pageNumber: i + 1,
      text: pageLines.join('\n'),
      lines: pageLines,
      lineBoxes
    });
  }

  return {
    title: file.name.replace(/\.[^/.]+$/, ''),
    totalPages,
    fileSize: formatFileSize(file.size),
    fileType: 'docx',
    pages,
    fullText: rawText,
    docHtml,
    docContent: rawText
  };
}

/**
 * Parses Plain Text (.txt) or Markdown (.md) documents, preserving structure.
 */
export async function parseTextFile(file: File): Promise<ParsedDocumentResult> {
  const rawText = await file.text();
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const ext = file.name.toLowerCase().endsWith('.md') ? 'md' : 'txt';

  const pageSize = 30;
  const totalPages = Math.max(1, Math.ceil(lines.length / pageSize));
  const pages: ParsedPdfPage[] = [];

  for (let i = 0; i < totalPages; i++) {
    const pageLines = lines.slice(i * pageSize, (i + 1) * pageSize);
    const lineBoxes: LineBoundingBox[] = pageLines.map((l, idx) => ({
      text: l,
      leftPercent: 8,
      topPercent: 8 + (idx * (84 / Math.max(1, pageLines.length))),
      widthPercent: 84,
      heightPercent: 2.8
    }));

    pages.push({
      pageNumber: i + 1,
      text: pageLines.join('\n'),
      lines: pageLines,
      lineBoxes
    });
  }

  // Format simple HTML for viewing
  const docHtml = lines.map(l => {
    if (l.startsWith('# ')) return `<h1 class="text-2xl font-bold my-3 text-blue-400">${l.slice(2)}</h1>`;
    if (l.startsWith('## ')) return `<h2 class="text-xl font-bold my-2 text-indigo-300">${l.slice(3)}</h2>`;
    if (l.startsWith('### ')) return `<h3 class="text-lg font-semibold my-2 text-cyan-300">${l.slice(4)}</h3>`;
    if (l.startsWith('- ') || l.startsWith('* ')) return `<li class="ml-4 list-disc my-1">${l.slice(2)}</li>`;
    return `<p class="my-2 leading-relaxed">${l}</p>`;
  }).join('');

  return {
    title: file.name.replace(/\.[^/.]+$/, ''),
    totalPages,
    fileSize: formatFileSize(file.size),
    fileType: ext,
    pages,
    fullText: rawText,
    docHtml,
    docContent: rawText
  };
}

/**
 * Ingests Visual Image Documents (.png, .jpg, .jpeg, .webp, .gif, .bmp)
 * Displays them as high-resolution visual pages on the Reading Desk with full inking, snipping, and annotations.
 */
export async function parseImageFile(file: File): Promise<ParsedDocumentResult> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const dimensions = await new Promise<{ width: number; height: number }>(resolve => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || 800, height: img.naturalHeight || 1000 });
    img.onerror = () => resolve({ width: 800, height: 1000 });
    img.src = dataUrl;
  });

  const title = file.name.replace(/\.[^/.]+$/, '');
  const description = `Visual Document Asset: ${file.name} (${dimensions.width} × ${dimensions.height}px)`;

  return {
    title,
    totalPages: 1,
    fileSize: formatFileSize(file.size),
    fileType: 'image',
    pages: [
      {
        pageNumber: 1,
        text: description,
        lines: [description],
        canvasDataUrl: dataUrl,
        width: dimensions.width,
        height: dimensions.height,
        lineBoxes: [
          {
            text: description,
            leftPercent: 5,
            topPercent: 5,
            widthPercent: 90,
            heightPercent: 5
          }
        ]
      }
    ],
    fullText: `${title}\n${description}\nVisual image asset ready for area cropping, diagram extraction, and spatial mind mapping.`,
    docContent: description
  };
}

/**
 * Ingests Scalable Vector Graphics (.svg)
 * Extracts embedded text tokens and renders crisp vector graphic on the reading desk.
 */
export async function parseSvgFile(file: File): Promise<ParsedDocumentResult> {
  const svgText = await file.text();
  const title = file.name.replace(/\.[^/.]+$/, '');

  // Extract embedded text tokens from SVG (<text>, <tspan>, <title>)
  const textMatches = Array.from(svgText.matchAll(/<(?:text|tspan|title)[^>]*>([\s\S]*?)<\/(?:text|tspan|title)>/gi))
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(Boolean);

  const lines = textMatches.length > 0 ? textMatches : [`Vector Graphic Illustration: ${file.name}`];
  const fullText = `${title}\n` + lines.join('\n');

  // Convert SVG string to base64 Data URL
  const base64Svg = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgText)));

  const lineBoxes: LineBoundingBox[] = lines.map((l, idx) => ({
    text: l,
    leftPercent: 8,
    topPercent: 8 + (idx * (84 / Math.max(1, lines.length))),
    widthPercent: 84,
    heightPercent: 4
  }));

  return {
    title,
    totalPages: 1,
    fileSize: formatFileSize(file.size),
    fileType: 'svg',
    pages: [
      {
        pageNumber: 1,
        text: fullText,
        lines,
        canvasDataUrl: base64Svg,
        lineBoxes
      }
    ],
    fullText,
    docHtml: `<div class="p-6 flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10">${svgText}</div>`,
    docContent: fullText
  };
}

/**
 * Ingests Tabular & Structured Data (.csv, .tsv, .json)
 * Parses records, formats high-contrast HTML table for viewing and creates searchable page slices.
 */
export async function parseDataFile(file: File): Promise<ParsedDocumentResult> {
  const raw = await file.text();
  const title = file.name.replace(/\.[^/.]+$/, '');
  const isJson = file.name.toLowerCase().endsWith('.json');

  let docHtml = '';
  let lines: string[] = [];

  if (isJson) {
    try {
      const parsed = JSON.parse(raw);
      const pretty = JSON.stringify(parsed, null, 2);
      lines = pretty.split('\n');
      docHtml = `<pre class="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto"><code>${pretty.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    } catch {
      lines = raw.split('\n');
      docHtml = `<pre class="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs"><code>${raw}</code></pre>`;
    }
  } else {
    // CSV / TSV
    const delimiter = file.name.toLowerCase().endsWith('.tsv') ? '\t' : ',';
    const rows = raw.split(/\r?\n/).filter(r => r.trim()).map(r => r.split(delimiter));
    lines = raw.split(/\r?\n/).filter(r => r.trim());

    if (rows.length > 0) {
      const headerRow = rows[0];
      const dataRows = rows.slice(1, 100);
      docHtml = `
        <div class="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-blue-600/15 border-b border-black/10 dark:border-white/10 font-bold">
                ${headerRow.map(h => `<th class="p-2.5 text-blue-400">${h.trim()}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${dataRows.map(row => `
                <tr class="border-b border-black/5 dark:border-white/5 hover:bg-white/5 transition">
                  ${row.map(cell => `<td class="p-2 text-slate-300 font-mono text-[11px]">${cell.trim()}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  }

  const pageSize = 25;
  const totalPages = Math.max(1, Math.ceil(lines.length / pageSize));
  const pages: ParsedPdfPage[] = [];

  for (let i = 0; i < totalPages; i++) {
    const pageLines = lines.slice(i * pageSize, (i + 1) * pageSize);
    pages.push({
      pageNumber: i + 1,
      text: pageLines.join('\n'),
      lines: pageLines,
      lineBoxes: pageLines.map((l, idx) => ({
        text: l,
        leftPercent: 6,
        topPercent: 6 + (idx * (88 / Math.max(1, pageLines.length))),
        widthPercent: 88,
        heightPercent: 3.2
      }))
    });
  }

  return {
    title,
    totalPages,
    fileSize: formatFileSize(file.size),
    fileType: isJson ? 'json' : 'csv',
    pages,
    fullText: raw,
    docHtml,
    docContent: raw
  };
}

/**
 * Universal Multi-Format Document Ingestion Engine:
 * Intelligently routes PDF, Word (.docx, .doc), Images (.png, .jpg, .webp, .gif),
 * Vector Graphics (.svg), Tabular Data (.csv, .json), and Plain Text (.txt, .md).
 */
export async function parseDocumentFile(file: File): Promise<ParsedDocumentResult> {
  const name = file.name.toLowerCase();

  // Images & Pictures
  if (
    name.endsWith('.png') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.webp') ||
    name.endsWith('.gif') ||
    name.endsWith('.bmp')
  ) {
    return parseImageFile(file);
  }

  // Scalable Vector Graphics
  if (name.endsWith('.svg')) {
    return parseSvgFile(file);
  }

  // Structured & Tabular Data
  if (name.endsWith('.json') || name.endsWith('.csv') || name.endsWith('.tsv')) {
    return parseDataFile(file);
  }

  // Word Documents
  if (name.endsWith('.docx') || name.endsWith('.doc')) {
    return parseDocxFile(file);
  }

  // Text & Markdown
  if (name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.rtf') || name.endsWith('.html') || name.endsWith('.htm')) {
    return parseTextFile(file);
  }

  // PDF
  return parsePdfFile(file);
}

