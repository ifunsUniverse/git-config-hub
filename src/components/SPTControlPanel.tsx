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
import { cn } from "@/lib/utils";

interface SPTControlPanelProps {
  sptPath: string;
}

const isElectron = () => !!(window as any).electronBridge;

export const SPTControlPanel = ({ sptPath }: SPTControlPanelProps) => {
  // If not in Electron, show a simplified info panel
  if (!isElectron()) {
    return (
      <Card className="mx-3 my-3 p-3 bg-card/40 border-primary/20 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Browser Demo Mode</h3>
        </div>
        <p className="text-[9px] text-muted-foreground italic">
          Server/launcher controls are available in the desktop app.
        </p>
      </Card>
    );
  }

  // Full Electron version
  return <ElectronSPTControlPanel sptPath={sptPath} />;
};

/** Full Electron-only control panel */
const ElectronSPTControlPanel = ({ sptPath }: SPTControlPanelProps) => {
  const [isLaunchingServer, setIsLaunchingServer] = useState(false);
  const [isLaunchingLauncher, setIsLaunchingLauncher] = useState(false);
  const [showDetectionDialog, setShowDetectionDialog] = useState(false);
  const [detectionMessage, setDetectionMessage] = useState("");
  
  const [serverExePath, setServerExePath] = useState<string>(() => localStorage.getItem("spt_server_exe_path") || "");
  const [launcherExePath, setLauncherExePath] = useState<string>(() => localStorage.getItem("spt_launcher_exe_path") || "");

  useEffect(() => {
    const detectExecutables = async () => {
      if (!sptPath) return;
      const bridge = (window as any).electronBridge;
      if (!bridge) return;

      const serverNames = ["Server.exe", "SPT.Server.exe", "Aki.Server.exe"];
      const launcherNames = ["Launcher.exe", "SPT.Launcher.exe", "Aki.Launcher.exe"];
      
      let foundServer = "";
      let foundLauncher = "";

      const separator = sptPath.includes("\\") ? "\\" : "/";
      const subPaths = ["", `${separator}SPT`];

      for (const sub of subPaths) {
        for (const name of serverNames) {
          const fullPath = `${sptPath}${sub}${separator}${name}`;
          if (await bridge.exists(fullPath)) {
            foundServer = fullPath;
            break;
          }
        }
        if (foundServer) break;
      }

      for (const sub of subPaths) {
        for (const name of launcherNames) {
          const fullPath = `${sptPath}${sub}${separator}${name}`;
          if (await bridge.exists(fullPath)) {
            foundLauncher = fullPath;
            break;
          }
        }
        if (foundLauncher) break;
      }

      if (foundServer) {
        setServerExePath(foundServer);
        localStorage.setItem("spt_server_exe_path", foundServer);
      }
      if (foundLauncher) {
        setLauncherExePath(foundLauncher);
        localStorage.setItem("spt_launcher_exe_path", foundLauncher);
      }
    };

    detectExecutables();
  }, [sptPath]);

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
