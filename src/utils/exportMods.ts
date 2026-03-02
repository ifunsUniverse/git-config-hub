import JSZip from "jszip";
import { ElectronScannedMod } from "./electronFolderScanner";
import { readdir, readFile } from "./electronBridge";

const isElectron = () => !!(window as any).electronBridge;

/**
 * Recursively adds all files from an Electron directory path to a JSZip instance
 */
async function addDirectoryToZipElectron(
  zip: JSZip,
  dirPath: string,
  basePath: string
): Promise<void> {
  const entries = await readdir(dirPath);
  
  for (const entry of entries) {
    const fullPath = dirPath.includes("\\") 
      ? `${dirPath}\\${entry.name}` 
      : `${dirPath}/${entry.name}`;
    const entryPath = `${basePath}/${entry.name}`;

    if (entry.isFile) {
      const content = await readFile(fullPath);
      zip.file(entryPath, content);
    } else if (entry.isDirectory) {
      await addDirectoryToZipElectron(zip, fullPath, entryPath);
    }
  }
}

/**
 * Exports all scanned mods as a ZIP file
 */
export async function exportModsAsZip(
  scannedMods: ElectronScannedMod[],
  isFourOhStyle: boolean,                      
  onProgress?: (percent: number, currentFile?: string) => void
): Promise<void> {                           
  const zip = new JSZip();
  const baseFolder = isFourOhStyle ? "SPT/user/mods" : "user/mods";

  if (isElectron()) {
    for (const mod of scannedMods) {
      const modFolderName = mod.mod.id;
      const modZipPath = `${baseFolder}/${modFolderName}`;
      await addDirectoryToZipElectron(zip, mod.folderPath, modZipPath);
    }
  } else {
    // Browser mode: add config files from localStorage
    for (const mod of scannedMods) {
      for (const config of mod.configs) {
        const modZipPath = `${baseFolder}/${mod.mod.id}/${config.fileName}`;
        const content = await readFile(config.filePath);
        zip.file(modZipPath, content);
      }
    }
  }

  const blob = await zip.generateAsync(
    {
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 5 },
    },
    (meta) => {
      onProgress?.(meta.percent ?? 0, meta.currentFile);
    }
  );

  if (isElectron()) {
    const saveResult = await (window as any).electronBridge.saveFile({
      title: 'Export Mods ZIP',
      defaultPath: 'SPT_Mods_Backup.zip',
      filters: [{ name: 'ZIP Files', extensions: ['zip'] }]
    });

    if (!saveResult.canceled && saveResult.filePath) {
      const arrayBuffer = await blob.arrayBuffer();
      await (window as any).electronBridge.writeFile(saveResult.filePath, new Uint8Array(arrayBuffer));
    }
  } else {
    // Browser: trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "SPT_Mods_Backup.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
