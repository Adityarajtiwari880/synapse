/**
 * CameraManager.ts
 * 60fps hardware-accelerated pan/zoom camera engine using CSS matrix3d
 * Decoupled from React renders to eliminate frame drops on tablets and laptops.
 */
export class CameraManager {
  public x: number = 0;
  public y: number = 0;
  public zoom: number = 1.0;

  private targetX: number = 0;
  private targetY: number = 0;
  private targetZoom: number = 1.0;

  private isDirty: boolean = true;
  private domLayer: HTMLElement | null = null;
  private onFrameCallback: ((cam: { x: number; y: number; zoom: number }) => void) | null = null;

  private readonly MIN_ZOOM = 0.15;
  private readonly MAX_ZOOM = 3.5;
  private readonly LERP_DAMPING = 0.28;

  constructor() {
    this.startLoop();
  }

  public bind(domLayer: HTMLElement, onFrame?: (cam: { x: number; y: number; zoom: number }) => void) {
    this.domLayer = domLayer;
    this.onFrameCallback = onFrame || null;
    this.isDirty = true;
  }

  public unbind() {
    this.domLayer = null;
    this.onFrameCallback = null;
  }

  public panBy(dx: number, dy: number): void {
    this.targetX += dx;
    this.targetY += dy;
    this.isDirty = true;
  }

  public zoomAt(screenX: number, screenY: number, factor: number): void {
    const prevZoom = this.targetZoom;
    const newZoom = Math.min(this.MAX_ZOOM, Math.max(this.MIN_ZOOM, prevZoom * factor));
    if (newZoom === prevZoom) return;

    this.targetX = screenX - (screenX - this.targetX) * (newZoom / prevZoom);
    this.targetY = screenY - (screenY - this.targetY) * (newZoom / prevZoom);
    this.targetZoom = newZoom;
    this.isDirty = true;
  }

  public setZoom(newZoom: number): void {
    const clamped = Math.min(this.MAX_ZOOM, Math.max(this.MIN_ZOOM, newZoom));
    this.targetZoom = clamped;
    this.isDirty = true;
  }

  public reset(centerX = 0, centerY = 0): void {
    this.targetX = centerX;
    this.targetY = centerY;
    this.targetZoom = 1.0;
    this.isDirty = true;
  }

  public screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return {
      x: (sx - this.x) / this.zoom,
      y: (sy - this.y) / this.zoom
    };
  }

  public worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return {
      x: wx * this.zoom + this.x,
      y: wy * this.zoom + this.y
    };
  }

  private startLoop = () => {
    const render = () => {
      const deltaX = Math.abs(this.x - this.targetX);
      const deltaY = Math.abs(this.y - this.targetY);
      const deltaZ = Math.abs(this.zoom - this.targetZoom);

      if (this.isDirty || deltaX > 0.05 || deltaY > 0.05 || deltaZ > 0.0005) {
        this.x += (this.targetX - this.x) * this.LERP_DAMPING;
        this.y += (this.targetY - this.y) * this.LERP_DAMPING;
        this.zoom += (this.targetZoom - this.zoom) * this.LERP_DAMPING;

        if (this.domLayer) {
          this.domLayer.style.transform = `matrix3d(${this.zoom}, 0, 0, 0, 0, ${this.zoom}, 0, 0, 0, 0, 1, 0, ${this.x}, ${this.y}, 0, 1)`;
        }

        if (this.onFrameCallback) {
          this.onFrameCallback({ x: this.x, y: this.y, zoom: this.zoom });
        }

        if (deltaX <= 0.05 && deltaY <= 0.05 && deltaZ <= 0.0005) {
          this.isDirty = false;
        }
      }
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  };
}
