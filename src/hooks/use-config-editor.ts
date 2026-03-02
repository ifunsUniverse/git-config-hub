import { useState, useCallback } from "react";
import { ConfigFile, SAMPLE_CONFIGS } from "@/lib/config-data";
import { toast } from "sonner";

export function useConfigEditor() {
  const [files, setFiles] = useState<ConfigFile[]>(SAMPLE_CONFIGS);
  const [activeFileId, setActiveFileId] = useState<string>(SAMPLE_CONFIGS[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  const activeFile = files.find((f) => f.id === activeFileId) ?? files[0];

  const updateValue = useCallback((fileId: string, path: string[], value: unknown) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== fileId) return f;
        const newContent = JSON.parse(JSON.stringify(f.content));
        let obj = newContent;
        for (let i = 0; i < path.length - 1; i++) {
          obj = obj[path[i]];
        }
        obj[path[path.length - 1]] = value;
        return { ...f, content: newContent, modified: true };
      })
    );
  }, []);

  const saveFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, modified: false } : f)));
    toast.success("Config saved successfully");
  }, []);

  const resetFile = useCallback((fileId: string) => {
    const original = SAMPLE_CONFIGS.find((f) => f.id === fileId);
    if (original) {
      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...original } : f)));
      toast.info("Config reset to default");
    }
  }, []);

  const saveAll = useCallback(() => {
    setFiles((prev) => prev.map((f) => ({ ...f, modified: false })));
    toast.success("All configs saved");
  }, []);

  return { files, activeFile, activeFileId, setActiveFileId, searchQuery, setSearchQuery, updateValue, saveFile, resetFile, saveAll };
}
