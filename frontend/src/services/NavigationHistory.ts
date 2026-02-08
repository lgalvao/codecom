/**
 * Navigation history service for back/forward navigation
 * Implements FR.29: Cross-Reference Navigation
 */

export interface NavigationEntry {
  filePath: string;
  line: number;
  timestamp: number;
}

class NavigationHistory {
  private history: NavigationEntry[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 50;

  /**
   * Add a new entry to navigation history
   */
  push(entry: Omit<NavigationEntry, 'timestamp'>): void {
    // Remove any forward history if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new entry
    this.history.push({
      ...entry,
      timestamp: Date.now()
    });

    // Maintain max history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  /**
   * Go back in navigation history
   */
  back(): NavigationEntry | null {
    if (!this.canGoBack()) {
      return null;
    }

    this.currentIndex--;
    return this.history[this.currentIndex];
  }

  /**
   * Go forward in navigation history
   */
  forward(): NavigationEntry | null {
    if (!this.canGoForward()) {
      return null;
    }

    this.currentIndex++;
    return this.history[this.currentIndex];
  }

  /**
   * Check if we can go back
   */
  canGoBack(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if we can go forward
   */
  canGoForward(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current entry
   */
  current(): NavigationEntry | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
      return null;
    }
    return this.history[this.currentIndex];
  }

  /**
   * Clear history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get all history entries
   */
  getAll(): NavigationEntry[] {
    return [...this.history];
  }

  /**
   * Get current index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }
}

// Export singleton instance
export const navigationHistory = new NavigationHistory();
