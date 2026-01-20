// ============================================================================
// Types
// ============================================================================

export interface FocusTrapOptions {
  /** Initial element to focus when trap is activated */
  initialFocus?: HTMLElement | string | null;
  /** Element to focus when trap is deactivated (defaults to previously focused) */
  returnFocus?: HTMLElement | string | boolean;
  /** Allow focus to leave when pressing Escape */
  escapeDeactivates?: boolean;
  /** Callback when Escape is pressed */
  onEscape?: () => void;
  /** Prevent scroll when focusing */
  preventScroll?: boolean;
  /** Allow clicking outside to deactivate */
  clickOutsideDeactivates?: boolean;
  /** Callback when clicking outside */
  onClickOutside?: (event: MouseEvent) => void;
}

export interface FocusTrap {
  /** Activate the focus trap */
  activate: () => void;
  /** Deactivate the focus trap */
  deactivate: () => void;
  /** Check if trap is active */
  isActive: () => boolean;
  /** Update focusable elements (call after DOM changes) */
  updateElements: () => void;
  /** Pause the trap temporarily */
  pause: () => void;
  /** Resume the trap */
  resume: () => void;
}

export interface LiveRegionOptions {
  /** Politeness level */
  politeness?: 'polite' | 'assertive' | 'off';
  /** Whether to clear after announcement */
  clearAfter?: number;
  /** Whether announcement is atomic */
  atomic?: boolean;
  /** Relevant changes to announce */
  relevant?: 'additions' | 'removals' | 'text' | 'all';
}

// ============================================================================
// Focusable Element Selectors
// ============================================================================

/**
 * Selector for all potentially focusable elements
 */
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'audio[controls]',
  'video[controls]',
  'details > summary:first-of-type',
  'iframe',
  'object',
  'embed',
].join(',');

/**
 * Selector for tabbable elements (visible and not hidden)
 */
export const TABBABLE_SELECTOR = FOCUSABLE_SELECTOR;

// ============================================================================
// Focus Query Functions
// ============================================================================

/**
 * Check if an element is visible and can receive focus
 */
export function isFocusable(element: HTMLElement): boolean {
  if (element.hidden || element.getAttribute('aria-hidden') === 'true') {
    return false;
  }

  // Check visibility
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }

  // Check if element is within a hidden ancestor
  let parent = element.parentElement;
  while (parent) {
    const parentStyle = window.getComputedStyle(parent);
    if (
      parentStyle.display === 'none' ||
      parentStyle.visibility === 'hidden' ||
      parent.getAttribute('aria-hidden') === 'true'
    ) {
      return false;
    }
    parent = parent.parentElement;
  }

  // Check disabled state
  if (element.hasAttribute('disabled')) {
    return false;
  }

  // Check tabindex
  const tabindex = element.getAttribute('tabindex');
  if (tabindex === '-1') {
    return false;
  }

  return true;
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return elements.filter(isFocusable);
}

/**
 * Get the first focusable element in a container
 */
export function getFirstFocusable(container: HTMLElement): HTMLElement | null {
  const elements = getFocusableElements(container);
  return elements[0] || null;
}

/**
 * Get the last focusable element in a container
 */
export function getLastFocusable(container: HTMLElement): HTMLElement | null {
  const elements = getFocusableElements(container);
  return elements[elements.length - 1] || null;
}

/**
 * Get the currently focused element
 */
export function getActiveElement(): HTMLElement | null {
  let active = document.activeElement as HTMLElement | null;

  // Handle shadow DOM
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement as HTMLElement;
  }

  return active;
}

// ============================================================================
// Focus Trap Implementation
// ============================================================================

/**
 * Create a focus trap for modal dialogs and other contained interactions
 */
export function createFocusTrap(container: HTMLElement, options: FocusTrapOptions = {}): FocusTrap {
  const {
    initialFocus = null,
    returnFocus = true,
    escapeDeactivates = true,
    onEscape,
    preventScroll = false,
    clickOutsideDeactivates = false,
    onClickOutside,
  } = options;

  let active = false;
  let paused = false;
  let previouslyFocused: HTMLElement | null = null;
  let focusableElements: HTMLElement[] = [];

  function updateElements(): void {
    focusableElements = getFocusableElements(container);
  }

  function getInitialFocusElement(): HTMLElement | null {
    if (initialFocus === null) {
      return getFirstFocusable(container);
    }
    if (typeof initialFocus === 'string') {
      return container.querySelector<HTMLElement>(initialFocus);
    }
    return initialFocus;
  }

  function getReturnFocusElement(): HTMLElement | null {
    if (returnFocus === false) {
      return null;
    }
    if (returnFocus === true) {
      return previouslyFocused;
    }
    if (typeof returnFocus === 'string') {
      return document.querySelector<HTMLElement>(returnFocus);
    }
    return returnFocus;
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (!active || paused) return;

    if (event.key === 'Tab') {
      handleTab(event);
    } else if (event.key === 'Escape' && escapeDeactivates) {
      event.preventDefault();
      onEscape?.();
    }
  }

  function handleTab(event: KeyboardEvent): void {
    updateElements();

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    const current = getActiveElement();

    if (event.shiftKey) {
      // Shift+Tab: wrap to last if at first
      if (current === first || !focusableElements.includes(current as HTMLElement)) {
        event.preventDefault();
        last.focus({ preventScroll });
      }
    } else {
      // Tab: wrap to first if at last
      if (current === last) {
        event.preventDefault();
        first.focus({ preventScroll });
      }
    }
  }

  function handleFocusIn(event: FocusEvent): void {
    if (!active || paused) return;

    const target = event.target as HTMLElement;
    if (!container.contains(target)) {
      // Focus escaped the trap, bring it back
      const first = getFirstFocusable(container);
      first?.focus({ preventScroll });
    }
  }

  function handleClick(event: MouseEvent): void {
    if (!active || paused || !clickOutsideDeactivates) return;

    const target = event.target as HTMLElement;
    if (!container.contains(target)) {
      onClickOutside?.(event);
    }
  }

  function activate(): void {
    if (active) return;

    previouslyFocused = getActiveElement();
    updateElements();

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('focusin', handleFocusIn, true);
    if (clickOutsideDeactivates) {
      document.addEventListener('click', handleClick, true);
    }

    active = true;
    paused = false;

    // Focus initial element
    const initialElement = getInitialFocusElement();
    if (initialElement) {
      initialElement.focus({ preventScroll });
    } else {
      // Make container focusable if no focusable elements
      if (!container.hasAttribute('tabindex')) {
        container.setAttribute('tabindex', '-1');
      }
      container.focus({ preventScroll });
    }
  }

  function deactivate(): void {
    if (!active) return;

    // Remove event listeners
    document.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('focusin', handleFocusIn, true);
    document.removeEventListener('click', handleClick, true);

    active = false;
    paused = false;

    // Return focus
    const returnElement = getReturnFocusElement();
    if (returnElement && document.body.contains(returnElement)) {
      returnElement.focus({ preventScroll });
    }
  }

  function pause(): void {
    paused = true;
  }

  function resume(): void {
    paused = false;
  }

  function isActive(): boolean {
    return active && !paused;
  }

  return {
    activate,
    deactivate,
    isActive,
    updateElements,
    pause,
    resume,
  };
}

// ============================================================================
// Focus Save/Restore
// ============================================================================

const focusStack: HTMLElement[] = [];

/**
 * Save the currently focused element to restore later
 */
export function saveFocus(): void {
  const active = getActiveElement();
  if (active && active !== document.body) {
    focusStack.push(active);
  }
}

/**
 * Restore focus to the previously saved element
 */
export function restoreFocus(): void {
  const element = focusStack.pop();
  if (element && document.body.contains(element)) {
    element.focus();
  }
}

/**
 * Clear the focus stack
 */
export function clearFocusStack(): void {
  focusStack.length = 0;
}

// ============================================================================
// Screen Reader Announcements
// ============================================================================

let liveRegion: HTMLDivElement | null = null;
let assertiveLiveRegion: HTMLDivElement | null = null;

function getLiveRegion(assertive = false): HTMLDivElement {
  if (typeof document === 'undefined') {
    return null as unknown as HTMLDivElement;
  }

  const region = assertive ? assertiveLiveRegion : liveRegion;
  if (region) return region;

  const newRegion = document.createElement('div');
  newRegion.setAttribute('role', 'status');
  newRegion.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
  newRegion.setAttribute('aria-atomic', 'true');
  newRegion.className = 'sr-only';
  newRegion.id = assertive ? 'aria-live-assertive' : 'aria-live-polite';

  // Styling to be visually hidden but accessible
  Object.assign(newRegion.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
  });

  document.body.appendChild(newRegion);

  if (assertive) {
    assertiveLiveRegion = newRegion;
  } else {
    liveRegion = newRegion;
  }

  return newRegion;
}

/**
 * Announce a message to screen readers
 */
export function announce(message: string, options: LiveRegionOptions = {}): void {
  const { politeness = 'polite', clearAfter = 5000, atomic = true } = options;

  if (politeness === 'off') return;

  const region = getLiveRegion(politeness === 'assertive');
  if (!region) return;

  region.setAttribute('aria-atomic', String(atomic));

  // Clear and announce (forces re-announcement)
  region.textContent = '';

  // Use requestAnimationFrame to ensure DOM update
  requestAnimationFrame(() => {
    region.textContent = message;

    // Clear after delay
    if (clearAfter > 0) {
      setTimeout(() => {
        if (region.textContent === message) {
          region.textContent = '';
        }
      }, clearAfter);
    }
  });
}

/**
 * Announce politely (waits for idle)
 */
export function announcePolite(message: string): void {
  announce(message, { politeness: 'polite' });
}

/**
 * Announce assertively (interrupts)
 */
export function announceAssertive(message: string): void {
  announce(message, { politeness: 'assertive' });
}

/**
 * Clear all announcements
 */
export function clearAnnouncements(): void {
  if (liveRegion) liveRegion.textContent = '';
  if (assertiveLiveRegion) assertiveLiveRegion.textContent = '';
}

// ============================================================================
// Roving Tabindex
// ============================================================================

export interface RovingTabindexOptions {
  /** Orientation for arrow key navigation */
  orientation?: 'horizontal' | 'vertical' | 'both';
  /** Wrap around when reaching ends */
  wrap?: boolean;
  /** Allow Home/End keys */
  allowHomeEnd?: boolean;
  /** Callback when active item changes */
  onActiveChange?: (element: HTMLElement, index: number) => void;
}

/**
 * Set up roving tabindex for a list of items
 * (e.g., tabs, menus, toolbars)
 */
export function setupRovingTabindex(
  container: HTMLElement,
  itemSelector: string,
  options: RovingTabindexOptions = {},
): () => void {
  const { orientation = 'horizontal', wrap = true, allowHomeEnd = true, onActiveChange } = options;

  let items: HTMLElement[] = [];
  let activeIndex = 0;

  function updateItems(): void {
    items = Array.from(container.querySelectorAll<HTMLElement>(itemSelector));
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === activeIndex ? '0' : '-1');
    });
  }

  function setActiveIndex(index: number): void {
    if (index < 0 || index >= items.length) return;

    // Update tabindex
    items[activeIndex]?.setAttribute('tabindex', '-1');
    items[index]?.setAttribute('tabindex', '0');
    items[index]?.focus();

    activeIndex = index;
    onActiveChange?.(items[index], index);
  }

  function handleKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (!items.includes(target)) return;

    const currentIndex = items.indexOf(target);
    let nextIndex = currentIndex;

    const isHorizontal = orientation === 'horizontal' || orientation === 'both';
    const isVertical = orientation === 'vertical' || orientation === 'both';

    switch (event.key) {
      case 'ArrowRight':
        if (isHorizontal) {
          event.preventDefault();
          nextIndex = wrap
            ? (currentIndex + 1) % items.length
            : Math.min(currentIndex + 1, items.length - 1);
        }
        break;
      case 'ArrowLeft':
        if (isHorizontal) {
          event.preventDefault();
          nextIndex = wrap
            ? (currentIndex - 1 + items.length) % items.length
            : Math.max(currentIndex - 1, 0);
        }
        break;
      case 'ArrowDown':
        if (isVertical) {
          event.preventDefault();
          nextIndex = wrap
            ? (currentIndex + 1) % items.length
            : Math.min(currentIndex + 1, items.length - 1);
        }
        break;
      case 'ArrowUp':
        if (isVertical) {
          event.preventDefault();
          nextIndex = wrap
            ? (currentIndex - 1 + items.length) % items.length
            : Math.max(currentIndex - 1, 0);
        }
        break;
      case 'Home':
        if (allowHomeEnd) {
          event.preventDefault();
          nextIndex = 0;
        }
        break;
      case 'End':
        if (allowHomeEnd) {
          event.preventDefault();
          nextIndex = items.length - 1;
        }
        break;
    }

    if (nextIndex !== currentIndex) {
      setActiveIndex(nextIndex);
    }
  }

  // Initialize
  updateItems();
  container.addEventListener('keydown', handleKeyDown);

  // Watch for DOM changes
  const observer = new MutationObserver(updateItems);
  observer.observe(container, { childList: true, subtree: true });

  // Cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
    observer.disconnect();
  };
}

// ============================================================================
// Focus Ring Management
// ============================================================================

let usingKeyboard = false;

/**
 * Initialize focus ring visibility management
 * Shows focus rings only for keyboard navigation
 */
export function initFocusRingManagement(): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Tab') {
      usingKeyboard = true;
      document.body.classList.add('keyboard-navigation');
      document.body.classList.remove('mouse-navigation');
    }
  };

  const handleMouseDown = () => {
    usingKeyboard = false;
    document.body.classList.remove('keyboard-navigation');
    document.body.classList.add('mouse-navigation');
  };

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('mousedown', handleMouseDown);

  // Add initial class
  document.body.classList.add('mouse-navigation');

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('mousedown', handleMouseDown);
  };
}

/**
 * Check if user is navigating with keyboard
 */
export function isUsingKeyboard(): boolean {
  return usingKeyboard;
}

// ============================================================================
// Focus Within Detection
// ============================================================================

/**
 * Check if focus is within an element
 */
export function focusWithin(element: HTMLElement): boolean {
  const active = getActiveElement();
  return active ? element.contains(active) : false;
}

/**
 * Wait for an element to be focusable and focus it
 */
export async function focusWhenReady(
  elementOrSelector: HTMLElement | string,
  timeout = 5000,
): Promise<boolean> {
  const startTime = Date.now();

  return new Promise((resolve) => {
    const attempt = (): void => {
      const element =
        typeof elementOrSelector === 'string'
          ? document.querySelector<HTMLElement>(elementOrSelector)
          : elementOrSelector;

      if (element && isFocusable(element)) {
        element.focus();
        resolve(true);
        return;
      }

      if (Date.now() - startTime >= timeout) {
        resolve(false);
        return;
      }

      requestAnimationFrame(attempt);
    };

    attempt();
  });
}

// ============================================================================
// Exports
// ============================================================================

export { FOCUSABLE_SELECTOR as focusableSelector, TABBABLE_SELECTOR as tabbableSelector };
