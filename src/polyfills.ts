/**
 * Polyfills & Compatibility Shims for Older iPads & Safari/WebKit
 * 
 * Supports:
 * - iPadOS 12, 13, 14, 15, 16, 17
 * - Safari, Chrome on iOS, Edge on iOS, Firefox on iOS (all use WebKit)
 * - Safari Private Browsing mode
 */

// 1. globalThis polyfill (iOS < 12.2)
if (typeof (window as any).globalThis === 'undefined') {
  (window as any).globalThis = window;
}

// 2. Promise.withResolvers polyfill (iOS / Safari < 17.4)
// Essential for pdfjs-dist and modern async libraries
if (typeof (Promise as any).withResolvers !== 'function') {
  (Promise as any).withResolvers = function <T = any>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// 3. Array.prototype.at & String.prototype.at polyfills (iOS / Safari < 15.4)
if (!Array.prototype.at) {
  Array.prototype.at = function (n: number) {
    n = Math.trunc(n) || 0;
    if (n < 0) n += this.length;
    if (n < 0 || n >= this.length) return undefined;
    return this[n];
  };
}

if (!String.prototype.at) {
  String.prototype.at = function (n: number) {
    n = Math.trunc(n) || 0;
    if (n < 0) n += this.length;
    if (n < 0 || n >= this.length) return undefined;
    return this[n];
  };
}

// 4. Object.hasOwn polyfill (iOS / Safari < 15.4)
if (!Object.hasOwn) {
  Object.hasOwn = function (obj: object, prop: PropertyKey): boolean {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };
}

// 5. crypto.randomUUID polyfill (iOS / Safari < 15.4)
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  (crypto as any).randomUUID = function (): string {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: any) =>
      (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
    );
  };
}

// 6. structuredClone fallback (iOS / Safari < 15.4)
if (typeof (window as any).structuredClone !== 'function') {
  (window as any).structuredClone = function <T>(obj: T): T {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return obj;
    }
  };
}

// 7. MediaQueryList.addEventListener polyfill (iOS / Safari < 14)
if (typeof window !== 'undefined' && window.MediaQueryList && !window.MediaQueryList.prototype.addEventListener) {
  window.MediaQueryList.prototype.addEventListener = function (event: string, handler: any) {
    if (event === 'change') {
      (this as any).addListener(handler);
    }
  };
  window.MediaQueryList.prototype.removeEventListener = function (event: string, handler: any) {
    if (event === 'change') {
      (this as any).removeListener(handler);
    }
  };
}

// 8. requestIdleCallback fallback (Safari on iOS)
if (typeof window !== 'undefined' && typeof (window as any).requestIdleCallback === 'undefined') {
  (window as any).requestIdleCallback = function (cb: any) {
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => 50,
      });
    }, 1);
  };
  (window as any).cancelIdleCallback = function (id: any) {
    clearTimeout(id);
  };
}

// 9. ResizeObserver basic fallback (iOS < 13.4)
if (typeof window !== 'undefined' && typeof (window as any).ResizeObserver === 'undefined') {
  (window as any).ResizeObserver = class {
    callback: any;
    constructor(callback: any) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

export {};
