import { useState, useEffect } from "react";
import { Activity, Settings2, HelpCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SPTControlPanelProps {
  sptPath: string;
}

const isElectron = () => !!(window as any).electronBridge;

export const SPTControlPanel = ({ sptPath }: SPTControlPanelProps) => {
  if (!isElectron()) {
    return (
      <Card className="mx-3 my-3 p-3 bg-card/40 border-primary/20 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Browser Mode</h3>
        </div>
        <p className="text-[9px] text-muted-foreground italic">
          Reading real files from your disk. Server/launcher controls require the desktop app.
        </p>
      </Card>
    );
  }

  return <ElectronSPTControlPanel sptPath={sptPath} />;
};

const ElectronSPTControlPanel = ({ sptPath }: SPTControlPanelProps) => {
  return (
    <Card className="mx-3 my-3 p-3 bg-card/40 border-primary/20 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SPT Control Panel</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help relative">
                  <HelpCircle className="w-3.5 h-3.5 text-primary/60" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[200px] text-[11px] leading-relaxed">
                <p>Paths are auto-detected when you select an SPT folder.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <p className="text-[9px] text-muted-foreground text-center italic">
        Server & launcher controls available in Electron mode.
      </p>
    </Card>
  );
};
