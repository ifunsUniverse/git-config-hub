/**
 * Unified bridge: uses Electron bridge when available, otherwise
 * uses the browser File System Access API for real file operations.
 */

import {
  pickDirectory,
  readFileBrowser,
  writeFileBrowser,
  existsBrowser,
  statBrowser,
  getDirHandle,
  readdirBrowser,
  getRootHandle,
} from "@/utils/browserFs";

const isElectron = () => !!(window as any).electronBridge;
const getBridge = () => (window as any).electronBridge;

// localStorage helpers for categories & history (no file system needed)
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
  // Use File System Access API
  return await pickDirectory();
};

export const readdir = async (path: string): Promise<Array<{ name: string; isFile: boolean; isDirectory: boolean }>> => {
  if (isElectron()) return await getBridge().readdir(path);
  const dirHandle = await getDirHandle(path);
  if (!dirHandle) return [];
  return await readdirBrowser(dirHandle);
};

export const readFile = async (path: string): Promise<string> => {
  if (isElectron()) return await getBridge().readFile(path);
  return await readFileBrowser(path);
};

export const writeFile = async (path: string, content: any) => {
  if (isElectron()) return await getBridge().writeFile(path, content);
  await writeFileBrowser(path, typeof content === "string" ? content : JSON.stringify(content));
};

export const exists = async (path: string): Promise<boolean> => {
  if (isElectron()) return await getBridge().exists(path);
  return await existsBrowser(path);
};

export const stat = async (path: string) => {
  if (isElectron()) return await getBridge().stat(path);
  return await statBrowser(path);
};

// Categories & history use localStorage (no real FS path for these)
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
  return { canceled: true, filePath: null };
};
