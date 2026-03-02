import { Save, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileTree } from "@/components/FileTree";
import { EditorView } from "@/components/EditorView";
import { useConfigEditor } from "@/hooks/use-config-editor";

const Index = () => {
  const { files, activeFile, activeFileId, setActiveFileId, searchQuery, setSearchQuery, updateValue, saveFile, resetFile, saveAll } = useConfigEditor();

  const modifiedCount = files.filter((f) => f.modified).length;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-11 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2.5">
          <Settings className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold font-mono tracking-tight text-foreground">SPT Config Editor</h1>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono">v1.0</span>
        </div>
        <div className="flex items-center gap-2">
          {modifiedCount > 0 && (
            <span className="text-[10px] text-warning font-mono">{modifiedCount} unsaved</span>
          )}
          <Button size="sm" onClick={saveAll} className="h-7 px-3 text-xs gap-1" disabled={modifiedCount === 0}>
            <Save className="h-3 w-3" /> Save All
          </Button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0">
        <FileTree
          files={files}
          activeFileId={activeFileId}
          onSelect={setActiveFileId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <EditorView file={activeFile} onUpdate={updateValue} onSave={saveFile} onReset={resetFile} />
      </div>
    </div>
  );
};

export default Index;
