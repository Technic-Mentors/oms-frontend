// src/utils/tabManager.ts

interface TriggerData {
  value: number;
  screenId: string;
  triggerId: string;
  timestamp: number;
}

class GlobalTabManager {
  private modalTriggers: Map<string, TriggerData>;
  public activeScreen: string | null;

  constructor() {
    this.modalTriggers = new Map();
    this.activeScreen = null;
  }

  // Register a modal trigger
  registerModalTrigger(screenId: string, triggerId: string, currentValue: number): string {
    const key = `${screenId}-${triggerId}`;
    if (!this.modalTriggers.has(key)) {
      this.modalTriggers.set(key, { 
        value: currentValue, 
        screenId, 
        triggerId,
        timestamp: Date.now()
      });
    }
    return key;
  }

  // Update trigger value
  updateTriggerValue(key: string, newValue: number): void {
    if (this.modalTriggers.has(key)) {
      const trigger = this.modalTriggers.get(key);
      if (trigger) {
        trigger.value = newValue;
      }
    }
  }

  // Reset all triggers (called on tab change)
  resetAllTriggers(): void {
    console.log('GlobalTabManager: Resetting all modal triggers');
    this.modalTriggers.forEach((trigger) => {
      trigger.value = 0;
    });
  }

  // Reset triggers for a specific screen
  resetScreenTriggers(screenId: string): void {
    this.modalTriggers.forEach((trigger) => {
      if (trigger.screenId === screenId) {
        trigger.value = 0;
      }
    });
  }

  // Get trigger value
  getTriggerValue(key: string): number {
    return this.modalTriggers.has(key) ? this.modalTriggers.get(key)?.value || 0 : 0;
  }

  // Clear all triggers
  clearAll(): void {
    this.modalTriggers.clear();
  }
}

export const globalTabManager = new GlobalTabManager();

// Helper function to dispatch tab change event
export const dispatchGlobalTabChange = (): void => {
  window.dispatchEvent(new CustomEvent('globalTabChange', { 
    detail: { timestamp: Date.now() } 
  }));
};

// Hook for components to use
export const useGlobalTabFix = () => {
  return {
    onTabChange: () => {
      globalTabManager.resetAllTriggers();
      dispatchGlobalTabChange();
    }
  };
};