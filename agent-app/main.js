const { app, Tray, Menu, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const AGENT_PORT = 8765;
const VISUAL_PROGRAMMER_URL = 'https://oxybott-learning.vercel.app/visual-programmer';
let tray = null;

// Ensure log directory exists
const logDir = app.getPath('userData');
const logFile = path.join(logDir, 'agent.log');

function log(msg, err = null) {
  const time = new Date().toISOString();
  const text = `[${time}] ${msg}${err ? '\n' + (err.stack || err) : ''}\n`;
  console.log(text);
  try {
    fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(logFile, text);
  } catch (_) {}
}

log('====================================================');
log(`Starting Oxybott Agent v${app.getVersion()}`);
log(`Exec Path: ${process.execPath}`);
log(`Resources Path: ${process.resourcesPath}`);

// Process resilience - catch unhandled errors in Electron main process
process.on('uncaughtException', (err) => {
  log('Uncaught Exception in Main Process:', err);
});

process.on('unhandledRejection', (reason) => {
  log('Unhandled Rejection in Main Process:', reason);
});

// Load the compiled agent server bundle
function startAgentServer() {
  try {
    log('Loading embedded Express Agent server bundle...');
    const serverPath = path.join(__dirname, 'dist', 'agentServer.cjs');
    log(`Server bundle path: ${serverPath}`);

    if (!fs.existsSync(serverPath)) {
      throw new Error(`Server bundle file missing at: ${serverPath}`);
    }

    require(serverPath);
    log(`Express Agent module initialized for http://127.0.0.1:${AGENT_PORT}`);
  } catch (err) {
    log('FATAL: Failed to start embedded agent server:', err);
    try {
      dialog.showErrorBox(
        'Oxybott Agent Error',
        `Failed to start Oxybott Local Agent server:\n${err.message}\n\nCheck logs at:\n${logFile}`
      );
    } catch (_) {}
  }
}

// Open Visual Programmer web app in default browser
function openWebUI() {
  try {
    shell.openExternal(VISUAL_PROGRAMMER_URL);
  } catch (err) {
    log('Failed to open web UI:', err);
  }
}

// Create System Tray Menu
function createTray() {
  const iconPath = path.join(__dirname, 'resources', 'icon.png');

  try {
    tray = new Tray(iconPath);
  } catch (_) {
    const nativeImage = require('electron').nativeImage;
    const emptyIcon = nativeImage.createEmpty();
    tray = new Tray(emptyIcon);
  }

  tray.setToolTip('Oxybott Local Arduino Agent (http://127.0.0.1:8765)');

  // Click or double-click on tray icon opens Visual Programmer in browser
  tray.on('click', () => {
    openWebUI();
  });
  tray.on('double-click', () => {
    openWebUI();
  });

  const updateMenu = () => {
    let isAutoStart = false;
    try {
      isAutoStart = app.getLoginItemSettings().openAtLogin;
    } catch (_) {}

    const contextMenu = Menu.buildFromTemplate([
      { label: '⚡ Oxybott Local Arduino Agent', enabled: false },
      { label: `🟢 Status: Active (http://127.0.0.1:${AGENT_PORT})`, enabled: false },
      { type: 'separator' },
      {
        label: '🌐 Open Visual Programmer',
        click: () => {
          openWebUI();
        },
      },
      {
        label: '🔌 Check Hardware Ports',
        click: () => {
          shell.openExternal(`http://127.0.0.1:${AGENT_PORT}/ports`);
        },
      },
      { type: 'separator' },
      {
        label: '🚀 Start with Windows',
        type: 'checkbox',
        checked: isAutoStart,
        click: (menuItem) => {
          try {
            app.setLoginItemSettings({
              openAtLogin: menuItem.checked,
              openAsHidden: true,
              path: process.execPath,
            });
          } catch (_) {}
          updateMenu();
        },
      },
      { type: 'separator' },
      {
        label: '🛑 Exit Agent',
        click: () => {
          app.isQuitting = true;
          app.quit();
        },
      },
    ]);

    tray.setContextMenu(contextMenu);
  };

  updateMenu();
}

// Prevent multiple instances of the agent
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  log('Another instance of Oxybott Agent is already running in background. Exiting duplicate process.');
  app.quit();
} else {
  app.on('second-instance', () => {
    log('Second instance attempt detected. Opening web interface in browser.');
    openWebUI();
    if (tray && tray.displayBalloon) {
      try {
        tray.displayBalloon({
          title: 'Oxybott Agent Active',
          content: 'Oxybott Local Arduino Agent is active. Opening Visual Programmer in browser...',
        });
      } catch (_) {}
    }
  });

  app.whenReady().then(() => {
    if (app.dock) app.dock.hide();

    // Ensure agent automatically runs on Windows boot headlessly
    try {
      app.setLoginItemSettings({
        openAtLogin: true,
        openAsHidden: true,
        path: process.execPath,
      });
    } catch (_) {}

    startAgentServer();
    createTray();
    openWebUI(); // Automatically launch Visual Programmer in user's default browser

    log('✅ Oxybott Agent application initialized and running in system tray.');
  });
}

// Keep agent running headlessly in system tray when all windows close
app.on('window-all-closed', () => {
  // Intentionally blank: keep background agent active in system tray without crashing
});
