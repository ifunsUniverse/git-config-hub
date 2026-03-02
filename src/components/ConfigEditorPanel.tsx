import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface ConfigEditorPanelProps {
  data: Record<string, unknown>;
  path?: string[];
  onUpdate: (path: string[], value: unknown) => void;
}

export function ConfigEditorPanel({ data, path = [], onUpdate }: ConfigEditorPanelProps) {
  return (
    <div className="space-y-0.5">
      {Object.entries(data).map(([key, value]) => (
        <ConfigRow key={key} label={key} value={value} path={[...path, key]} onUpdate={onUpdate} />
      ))}
    </div>
  );
}

function ConfigRow({ label, value, path, onUpdate }: { label: string; value: unknown; path: string[]; onUpdate: (path: string[], value: unknown) => void }) {
  const [expanded, setExpanded] = useState(true);

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return (
      <div className="border-l border-border ml-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 w-full px-3 py-1.5 hover:bg-editor-highlight transition-colors text-xs"
        >
          {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          <span className="font-mono text-primary font-medium">{label}</span>
          <span className="text-muted-foreground ml-1">{"{"}{Object.keys(value as object).length}{"}"}</span>
        </button>
        {expanded && (
          <div className="ml-3">
            <ConfigEditorPanel data={value as Record<string, unknown>} path={path} onUpdate={onUpdate} />
          </div>
        )}
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-between px-3 py-1.5 hover:bg-editor-highlight transition-colors ml-2">
        <span className="font-mono text-xs text-foreground">{label}</span>
        <Switch checked={value} onCheckedChange={(v) => onUpdate(path, v)} className="scale-75" />
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div className="flex items-center justify-between gap-4 px-3 py-1.5 hover:bg-editor-highlight transition-colors ml-2">
        <span className="font-mono text-xs text-foreground">{label}</span>
        <Input
          type="number"
          value={value}
          onChange={(e) => onUpdate(path, Number(e.target.value))}
          className="w-24 h-6 text-xs font-mono bg-secondary border-border text-right"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 px-3 py-1.5 hover:bg-editor-highlight transition-colors ml-2">
      <span className="font-mono text-xs text-foreground">{label}</span>
      <Input
        value={String(value)}
        onChange={(e) => onUpdate(path, e.target.value)}
        className="w-48 h-6 text-xs font-mono bg-secondary border-border"
      />
    </div>
  );
}
