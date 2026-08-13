[Setup]
AppName=Oxybott Agent
AppVersion=1.0.0
AppPublisher=Oxymora Technology Pvt. Ltd.
DefaultDirName={autopf}\Oxybott Agent
DefaultGroupName=Oxybott Agent
OutputBaseFilename=Oxybott-Agent-Setup
OutputDir=..\installer-dist
Compression=lzma2/fast
SolidCompression=yes
UninstallDisplayIcon={app}\Oxybott Agent.exe

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "..\installer-dist\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\Oxybott Agent"; Filename: "{app}\Oxybott Agent.exe"
Name: "{autodesktop}\Oxybott Agent"; Filename: "{app}\Oxybott Agent.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\Oxybott Agent.exe"; Description: "Launch Oxybott Agent"; Flags: nowait postinstall skipifsilent
