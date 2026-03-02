import { Search, FileJson } from "lucide-react";
import { ConfigFile } from "@/lib/config-data";
import { Input } from "@/components/ui/input";

interface FileTreeProps {
  files: ConfigFile[];
  activeFileId: string;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function FileTree({ files, activeFileId, onSelect, searchQuery, onSearchChange }: FileTreeProps) {
  const filtered = files.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-sidebar flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search configs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs bg-secondary border-border font-mono"
          />
        </div>
      </div>
      <div className="px-3 py-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Config Files</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-1.5 pb-3 space-y-0.5">
        {filtered.map((file) => (
          <button
            key={file.id}
            onClick={() => onSelect(file.id)}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors ${
              file.id === activeFileId
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <FileJson className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{file.name}</span>
            {file.modified && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-warning shrink-0" />}
          </button>
        ))}
      </nav>
    </aside>
  );
}
