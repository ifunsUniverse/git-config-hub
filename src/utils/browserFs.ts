/**
 * Browser File System Access API wrapper.
 * Stores real FileSystemDirectoryHandle references for reading/writing actual files.
 */

// Global store for directory handles keyed by path
const handleMap = new Map<string, FileSystemDirectoryHandle | FileSystemFileHandle>();
let rootHandle: FileSystemDirectoryHandle | null = null;
let rootPath = "";

export function isFileSystemAccessSupported(): boolean {
  return "showDirectoryPicker" in window;
}

export async function pickDirectory(): Promise<{ canceled: boolean; path: string; handle?: FileSystemDirectoryHandle }> {
  if (!isFileSystemAccessSupported()) {
    throw new Error("File System Access API is not supported in this browser. Use Chrome or Edge.");
  }

  try {
    const handle = await (window as any).showDirectoryPicker({ mode: "readwrite" });
    const path = "/" + handle.name;
    rootHandle = handle;
    rootPath = path;
    handleMap.set(path, handle);
    return { canceled: false, path, handle };
  } catch (err: any) {
    if (err.name === "AbortError") {
      return { canceled: true, path: "" };
    }
    throw err;
  }
}

export function getRootHandle(): FileSystemDirectoryHandle | null {
  return rootHandle;
}

export function getRootPath(): string {
  return rootPath;
}

/** Resolve a sub-path under a directory handle */
async function resolveHandle(
  dirHandle: FileSystemDirectoryHandle,
  pathSegments: string[]
): Promise<FileSystemDirectoryHandle> {
  let current = dirHandle;
  for (const segment of pathSegments) {
    if (!segment) continue;
    current = await current.getDirectoryHandle(segment);
  }
  return current;
}

/** Read directory entries */
export async function readdirBrowser(
  dirHandle: FileSystemDirectoryHandle
): Promise<Array<{ name: string; isFile: boolean; isDirectory: boolean }>> {
  const entries: Array<{ name: string; isFile: boolean; isDirectory: boolean }> = [];
  for await (const [name, handle] of (dirHandle as any).entries()) {
    entries.push({
      name,
      isFile: handle.kind === "file",
      isDirectory: handle.kind === "directory",
    });
  }
  return entries;
}

/** Get a directory handle from a virtual path */
export async function getDirHandle(virtualPath: string): Promise<FileSystemDirectoryHandle | null> {
  if (!rootHandle) return null;
  
  // Strip root path prefix
  let relative = virtualPath;
  if (relative.startsWith(rootPath)) {
    relative = relative.slice(rootPath.length);
  }
  relative = relative.replace(/^\/+/, "");
  
  if (!relative) return rootHandle;
  
  const segments = relative.split("/").filter(Boolean);
  try {
    return await resolveHandle(rootHandle, segments);
  } catch {
    return null;
  }
}

/** Get a file handle from a virtual path */
export async function getFileHandle(virtualPath: string): Promise<FileSystemFileHandle | null> {
  if (!rootHandle) return null;
  
  let relative = virtualPath;
  if (relative.startsWith(rootPath)) {
    relative = relative.slice(rootPath.length);
  }
  relative = relative.replace(/^\/+/, "");
  
  const segments = relative.split("/").filter(Boolean);
  if (segments.length === 0) return null;
  
  const fileName = segments.pop()!;
  try {
    const dirHandle = segments.length > 0 
      ? await resolveHandle(rootHandle, segments) 
      : rootHandle;
    return await dirHandle.getFileHandle(fileName);
  } catch {
    return null;
  }
}

/** Read file content as text */
export async function readFileBrowser(virtualPath: string): Promise<string> {
  const fileHandle = await getFileHandle(virtualPath);
  if (!fileHandle) throw new Error(`File not found: ${virtualPath}`);
  const file = await fileHandle.getFile();
  return await file.text();
}

/** Write file content */
export async function writeFileBrowser(virtualPath: string, content: string): Promise<void> {
  if (!rootHandle) throw new Error("No directory selected");
  
  let relative = virtualPath;
  if (relative.startsWith(rootPath)) {
    relative = relative.slice(rootPath.length);
  }
  relative = relative.replace(/^\/+/, "");
  
  const segments = relative.split("/").filter(Boolean);
  if (segments.length === 0) throw new Error("Invalid path");
  
  const fileName = segments.pop()!;
  const dirHandle = segments.length > 0 
    ? await resolveHandle(rootHandle, segments) 
    : rootHandle;
  
  const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
  const writable = await (fileHandle as any).createWritable();
  await writable.write(content);
  await writable.close();
}

/** Check if path exists */
export async function existsBrowser(virtualPath: string): Promise<boolean> {
  if (!rootHandle) return false;
  
  // Try as directory first, then as file
  const dirHandle = await getDirHandle(virtualPath);
  if (dirHandle) return true;
  
  const fileHandle = await getFileHandle(virtualPath);
  return fileHandle !== null;
}

/** Get stat info */
export async function statBrowser(virtualPath: string): Promise<{ isFile: boolean; isDirectory: boolean }> {
  const dirHandle = await getDirHandle(virtualPath);
  if (dirHandle) return { isFile: false, isDirectory: true };
  
  const fileHandle = await getFileHandle(virtualPath);
  if (fileHandle) return { isFile: true, isDirectory: false };
  
  throw new Error(`Path not found: ${virtualPath}`);
}
