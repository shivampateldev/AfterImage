export interface PlatformCapabilities {
  isElectron: boolean;
  isCapacitor: boolean;
  isWeb: boolean;
  hasTouch: boolean;
  platformName: 'windows' | 'android' | 'web';
}

export class PlatformBridge {
  private static instance: PlatformBridge;

  private constructor() {}

  public static getInstance(): PlatformBridge {
    if (!PlatformBridge.instance) {
      PlatformBridge.instance = new PlatformBridge();
    }
    return PlatformBridge.instance;
  }

  public getCapabilities(): PlatformCapabilities {
    const isElectron = typeof window !== 'undefined' && !!(window as unknown as { electron?: unknown }).electron;
    const isCapacitor = typeof window !== 'undefined' && !!(window as unknown as { Capacitor?: unknown }).Capacitor;
    const hasTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    let platformName: 'windows' | 'android' | 'web' = 'web';
    if (isElectron) {
      platformName = 'windows';
    } else if (isCapacitor) {
      platformName = 'android';
    }

    return {
      isElectron,
      isCapacitor,
      isWeb: !isElectron && !isCapacitor,
      hasTouch,
      platformName,
    };
  }

  public async toggleFullscreen(): Promise<boolean> {
    if (typeof document === 'undefined') return false;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        return true;
      } else {
        await document.exitFullscreen();
        return false;
      }
    } catch {
      return false;
    }
  }

  public exitApp(): void {
    const cap = this.getCapabilities();
    if (cap.isElectron) {
      const electron = (window as unknown as { electron?: { closeApp: () => void } }).electron;
      if (electron?.closeApp) {
        electron.closeApp();
        return;
      }
    }
    if (cap.isCapacitor) {
      const app = (window as unknown as { Capacitor?: { Plugins?: { App?: { exitApp: () => void } } } }).Capacitor?.Plugins?.App;
      if (app?.exitApp) {
        app.exitApp();
        return;
      }
    }
    window.close();
  }
}

export const platform = PlatformBridge.getInstance();

