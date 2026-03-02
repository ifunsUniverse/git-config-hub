/**
 * Demo/sample mod data for browser mode when Electron is not available.
 */

import { ElectronScannedMod } from "./electronFolderScanner";

const SAMPLE_CONFIG_1 = {
  lootMultiplier: 2.5,
  spawnRate: 1.0,
  enableExtraLoot: true,
  maxBotCount: 15,
  raidTimeMultiplier: 1.5,
  itemSettings: {
    allowFleaMarket: true,
    fleaMarketMinLevel: 15,
    maxItemsPerSlot: 3
  }
};

const SAMPLE_CONFIG_2 = {
  enabled: true,
  debug: false,
  logLevel: "info",
  features: {
    autoHeal: true,
    autoSort: false,
    quickSell: true
  },
  ui: {
    showNotifications: true,
    notificationDuration: 3000
  }
};

const SAMPLE_CONFIG_3 = {
  traderPriceMultiplier: 0.85,
  insuranceMultiplier: 1.2,
  repairCostMultiplier: 0.9,
  maxInsuranceTime: 48,
  traders: {
    prapor: { enabled: true, priceModifier: 1.0 },
    therapist: { enabled: true, priceModifier: 0.95 },
    skier: { enabled: true, priceModifier: 1.1 }
  }
};

export function getDemoMods(): ElectronScannedMod[] {
  return [
    {
      mod: {
        id: "spt-loot-config",
        name: "SPT Loot Config",
        version: "1.3.0",
        author: "DemoAuthor",
        description: "Configure loot multipliers and spawn rates",
        configCount: 1,
      },
      configs: [
        {
          fileName: "config.json",
          rawJson: SAMPLE_CONFIG_1,
          filePath: "/demo/SPT/user/mods/spt-loot-config/config.json",
          index: 0,
        },
      ],
      folderPath: "/demo/SPT/user/mods/spt-loot-config",
    },
    {
      mod: {
        id: "quality-of-life",
        name: "Quality of Life",
        version: "2.1.0",
        author: "ModMaker",
        description: "Various QoL improvements for SPT",
        configCount: 1,
      },
      configs: [
        {
          fileName: "config.json",
          rawJson: SAMPLE_CONFIG_2,
          filePath: "/demo/SPT/user/mods/quality-of-life/config.json",
          index: 0,
        },
      ],
      folderPath: "/demo/SPT/user/mods/quality-of-life",
    },
    {
      mod: {
        id: "trader-tweaks",
        name: "Trader Tweaks",
        version: "1.0.5",
        author: "TraderGuy",
        description: "Adjust trader prices and insurance settings",
        configCount: 1,
      },
      configs: [
        {
          fileName: "config.json",
          rawJson: SAMPLE_CONFIG_3,
          filePath: "/demo/SPT/user/mods/trader-tweaks/config.json",
          index: 0,
        },
      ],
      folderPath: "/demo/SPT/user/mods/trader-tweaks",
    },
  ];
}

/** Initialize demo file content in the virtual filesystem */
export function initDemoFiles() {
  const mods = getDemoMods();
  for (const mod of mods) {
    for (const config of mod.configs) {
      const key = `vfs:${config.filePath}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(config.rawJson, null, 2));
      }
    }
  }
}
