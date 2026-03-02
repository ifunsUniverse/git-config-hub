import { Save, RotateCcw, FileJson, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfigFile } from "@/lib/config-data";
import { ConfigEditorPanel } from "./ConfigEditorPanel";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditorViewProps {
  file: ConfigFile;
  onUpdate: (fileId: string, path: string[], value: unknown) => void;
  onSave: (fileId: string) => void;
  onReset: (fileId: string) => void;
}

export function EditorView({ file, onUpdate, onSave, onReset }: EditorViewProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 h-10 shrink-0">
        <div className="flex items-center gap-2 text-xs font-mono">
          <FileJson className="h-3.5 w-3.5 text-primary" />
          <span className="text-foreground">{file.path}</span>
          {file.modified && <span className="text-warning text-[10px]">● modified</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => onReset(file.id)} className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
          <Button size="sm" onClick={() => onSave(file.id)} className="h-7 px-3 text-xs gap-1" disabled={!file.modified}>
            <Save className="h-3 w-3" /> Save
          </Button>
        </div>
      </div>

      {/* Editor content */}
      <Tabs defaultValue="visual" className="flex-1 flex flex-col min-h-0">
        <div className="border-b border-border bg-card px-4">
          <TabsList className="bg-transparent h-8 p-0 gap-4">
            <TabsTrigger value="visual" className="h-8 px-0 text-xs data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none font-medium">
              Visual Editor
            </TabsTrigger>
            <TabsTrigger value="json" className="h-8 px-0 text-xs data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none font-medium gap-1">
              <Code className="h-3 w-3" /> JSON
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="visual" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              <ConfigEditorPanel data={file.content} onUpdate={(path, value) => onUpdate(file.id, path, value)} />
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="json" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            <pre className="p-4 text-xs font-mono text-foreground leading-relaxed whitespace-pre-wrap">
              {JSON.stringify(file.content, null, 2)}
            </pre>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
