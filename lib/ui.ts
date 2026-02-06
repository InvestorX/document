import { t } from './i18n';
import { showLoading } from './loading';
import { onOpenDocument } from './document';

// Hide control panel and show top floating bar
export const hideControlPanel = (): void => {
  const container = document.querySelector('#control-panel-container') as HTMLElement;
  const fabContainer = document.querySelector('#fab-container') as HTMLElement;

  // Always ensure FAB is visible when hiding control panel
  if (fabContainer) {
    fabContainer.style.display = 'block';
  }

  if (container) {
    // Immediately disable pointer events to prevent blocking
    container.style.pointerEvents = 'none';
    container.style.opacity = '0';
    // Hide after transition for smooth animation
    setTimeout(() => {
      container.style.display = 'none';
    }, 300);
  }
};

// Show control panel and hide FAB
export const showControlPanel = (): void => {
  const container = document.querySelector('#control-panel-container') as HTMLElement;
  const fabContainer = document.querySelector('#fab-container') as HTMLElement;
  if (container) {
    container.style.display = 'flex';
    setTimeout(() => {
      container.style.opacity = '1';
    }, 10);
  }
  // Only hide FAB if editor is not open
  // If editor is already open, keep FAB visible so user can access menu
  if (fabContainer && !window.editor) {
    fabContainer.style.display = 'none';
  }
};

// Create fixed action button in bottom right corner
export const createFixedActionButton = (): HTMLElement => {
  const fabContainer = document.createElement('div');
  fabContainer.id = 'fab-container';
  fabContainer.className = 'fab-container';

  // Main FAB button
  const fabButton = document.createElement('button');
  fabButton.id = 'fab-button';
  fabButton.textContent = t('menu');
  fabButton.className = 'fab-button';

  // Menu panel - compact style
  const menuPanel = document.createElement('div');
  menuPanel.id = 'fab-menu';
  menuPanel.className = 'fab-menu';

  const createMenuButton = (text: string, onClick: () => void | Promise<void>, showLoadingImmediately = true) => {
    // Create wrapper for the entire menu item
    const menuItem = document.createElement('div');
    menuItem.className = 'fab-menu-item';

    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'fab-menu-button';

    // Handle hover on the wrapper
    menuItem.addEventListener('mouseenter', () => {
      menuItem.style.background = '#f5f5f5';
    });
    menuItem.addEventListener('mouseleave', () => {
      menuItem.style.background = 'transparent';
    });

    button.addEventListener('click', async () => {
      hideMenu();
      // Only show loading immediately if specified (for operations that don't require user interaction)
      let removeLoading: (() => void) | null = null;
      if (showLoadingImmediately) {
        const loadingResult = showLoading();
        removeLoading = loadingResult.removeLoading;
      }
      try {
        // Small delay to ensure menu hide animation completes
        await new Promise((resolve) => setTimeout(resolve, 100));
        await onClick();
      } catch (error) {
        console.error('Error in menu button action:', error);
        // Show control panel on error
        showControlPanel();
      } finally {
        // Only remove loading if it was shown
        if (removeLoading) {
          removeLoading();
        }
      }
    });

    menuItem.appendChild(button);
    return menuItem;
  };

  menuPanel.appendChild(
    createMenuButton(
      t('openDocument'),
      () => {
        onOpenDocument();
      },
      false, // Don't show loading immediately - wait for file selection
    ),
  );

  let isMenuOpen = false;
  let hideMenuTimeout: NodeJS.Timeout;

  const showMenu = () => {
    clearTimeout(hideMenuTimeout);
    isMenuOpen = true;
    menuPanel.style.display = 'flex';
    menuPanel.style.pointerEvents = 'auto';
    setTimeout(() => {
      menuPanel.style.opacity = '1';
      menuPanel.style.transform = 'translateY(0) scale(1)';
    }, 10);
  };

  const hideMenu = () => {
    isMenuOpen = false;
    menuPanel.style.opacity = '0';
    menuPanel.style.transform = 'translateY(10px) scale(0.95)';
    setTimeout(() => {
      menuPanel.style.display = 'none';
      menuPanel.style.pointerEvents = 'none';
    }, 200);
  };

  // Show menu on hover button
  fabButton.addEventListener('mouseenter', () => {
    showMenu();
  });

  // Hide menu when leaving button (if not moving to menu)
  fabButton.addEventListener('mouseleave', (e) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    // If moving to menu panel, don't hide
    if (relatedTarget && (relatedTarget === menuPanel || menuPanel.contains(relatedTarget))) {
      return;
    }
    hideMenuTimeout = setTimeout(() => {
      hideMenu();
    }, 200);
  });

  // Keep menu visible when hovering over it
  menuPanel.addEventListener('mouseenter', () => {
    clearTimeout(hideMenuTimeout);
    if (!isMenuOpen) {
      showMenu();
    }
  });

  // Hide menu when leaving menu panel
  menuPanel.addEventListener('mouseleave', () => {
    hideMenuTimeout = setTimeout(() => {
      hideMenu();
    }, 200);
  });

  fabContainer.appendChild(menuPanel);
  fabContainer.appendChild(fabButton);
  document.body.appendChild(fabContainer);
  return fabContainer;
};

// Create and append the control panel
export const createControlPanel = (): void => {
  // Create control panel container - centered in viewport
  const container = document.createElement('div');
  container.id = 'control-panel-container';
  container.className = 'control-panel-container';

  // Create button group - centered horizontally with wrap support
  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'control-panel-button-group';

  // Helper function to create text button
  const createTextButton = (id: string, text: string, onClick: () => void) => {
    const button = document.createElement('r-button');
    button.id = id;
    button.textContent = text;
    button.setAttribute('variant', 'text');
    button.setAttribute('type', 'text');
    button.className = 'control-panel-button';

    button.addEventListener('mouseenter', () => {
      button.style.color = '#667eea';
      button.style.transform = 'scale(1.05)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.color = '#333';
      button.style.transform = 'scale(1)';
    });
    button.addEventListener('click', onClick);

    return button;
  };

  // Create upload button
  const uploadButton = createTextButton('upload-button', t('openDocument'), () => {
    onOpenDocument();
  });
  buttonGroup.appendChild(uploadButton);

  container.appendChild(buttonGroup);
  document.body.appendChild(container);
};
