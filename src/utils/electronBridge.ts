/**
 * Browser-compatible bridge that provides localStorage-based fallbacks
 * when the Electron bridge is not available.
 */

const isElectron = () => !!(window as any).electronBridge;
const getBridge = () => (window as any).electronBridge;

// In-memory virtual filesystem for browser demo mode
const STORAGE_PREFIX = "vfs:";

const vfs = {
  get: (path: string): string | null => {
    try { return localStorage.getItem(STORAGE_PREFIX + path); } catch { return null; }
  },
  set: (path: string, content: string) => {
    try { localStorage.setItem(STORAGE_PREFIX + path, content); } catch {}
  },
  delete: (path: string) => {
    try { localStorage.removeItem(STORAGE_PREFIX + path); } catch {}
  },
  list: (prefix: string): string[] => {
    const keys: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_PREFIX + prefix)) {
          keys.push(key.replace(STORAGE_PREFIX, ""));
        }
      }
    } catch {}
    return keys;
  },
};

export const selectFolder = async () => {
  if (isElectron()) return await getBridge().selectFolder();
  // Browser mode: return a fake path
  return { canceled: false, path: "/demo/SPT" };
};

export const readdir = async (path: string) => {
  if (isElectron()) return await getBridge().readdir(path);
  // Return empty for browser
  return [];
};

export const readFile = async (path: string): Promise<string> => {
  if (isElectron()) return await getBridge().readFile(path);
  const content = vfs.get(path);
  if (content !== null) return content;
  return "{}";
};

export const writeFile = async (path: string, content: any) => {
  if (isElectron()) return await getBridge().writeFile(path, content);
  vfs.set(path, typeof content === "string" ? content : JSON.stringify(content));
};

export const exists = async (path: string): Promise<boolean> => {
  if (isElectron()) return await getBridge().exists(path);
  return vfs.get(path) !== null;
};

export const stat = async (path: string) => {
  if (isElectron()) return await getBridge().stat(path);
  return { isFile: true, isDirectory: false };
};

export const writeCategoryFile = async (content: string) => {
  if (isElectron()) return await getBridge().writeCategoryFile(content);
  vfs.set("__categories__", content);
};

export const readCategoryFile = async (): Promise<string> => {
  if (isElectron()) return await getBridge().readCategoryFile();
  return vfs.get("__categories__") || "{}";
};

export const writeHistoryBackup = async (modName: string, configFile: string, timestamp: number, content: string) => {
  if (isElectron()) return await getBridge().writeHistoryBackup(modName, configFile, timestamp, content);
  const key = `__history__/${modName}/${configFile}/${timestamp}`;
  vfs.set(key, content);
};

export const readHistoryBackups = async (modName: string, configFile: string) => {
  if (isElectron()) return await getBridge().readHistoryBackups(modName, configFile);
  const prefix = `__history__/${modName}/${configFile}/`;
  const keys = vfs.list(prefix);
  return keys
    .map((key) => {
      const timestamp = parseInt(key.split("/").pop() || "0");
      const content = vfs.get(key) || "{}";
      return { timestamp, content, filename: key };
    })
    .sort((a, b) => b.timestamp - a.timestamp);
};

export const deleteHistoryBackup = async (modName: string, filename: string) => {
  if (isElectron()) return await getBridge().deleteHistoryBackup(modName, filename);
  vfs.delete(filename);
};

export const clearHistoryBackups = async (modName: string, configFile: string) => {
  if (isElectron()) return await getBridge().clearHistoryBackups(modName, configFile);
  const prefix = `__history__/${modName}/${configFile}/`;
  vfs.list(prefix).forEach((key) => vfs.delete(key));
};

export const saveFile = async (options: any) => {
  if (isElectron()) return await getBridge().saveFile(options);
  // Browser fallback: trigger a download
  return { canceled: true, filePath: null };
};
