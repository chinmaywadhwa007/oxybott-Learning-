const { app, Tray, Menu, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const AGENT_PORT = 8765;
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
    log(`Express Agent listening on http://127.0.0.1:${AGENT_PORT}`);
  } catch (err) {
    log('FATAL: Failed to start embedded agent server:', err);
    dialog.showErrorBox(
      'Oxybott Agent Error',
      `Failed to start Oxybott Local Agent server:\n${err.message}\n\nCheck logs at:\n${logFile}`
    );
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
          shell.openExternal('http://localhost:5173');
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
          app.setLoginItemSettings({
            openAtLogin: menuItem.checked,
            path: process.execPath,
          });
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
  log('Another instance of Oxybott Agent is already running. Exiting.');
  app.quit();
} else {
  app.on('second-instance', () => {
    log('Second instance attempt detected.');
    if (tray) {
      tray.displayBalloon({
        title: 'Oxybott Agent Active',
        content: 'Oxybott Local Agent is already running in the system tray.',
      });
    }
  });

  app.whenReady().then(() => {
    if (app.dock) app.dock.hide();

    startAgentServer();
    createTray();

    log('✅ Oxybott Agent application initialized and running in system tray.');
  });
}

app.on('window-all-closed', (e) => {
  e.preventDefault(); // Keep agent active in system tray
});
