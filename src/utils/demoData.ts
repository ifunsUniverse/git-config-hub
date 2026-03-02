/**
 * Demo mod data for browser preview environments where
 * the File System Access API is unavailable (iframes, etc.).
 */

export const demoMods = [
  {
    mod: {
      id: "loot-config",
      name: "Loot Multiplier",
      version: "1.2.0",
      author: "DemoAuthor",
      description: "Adjusts loot spawn rates across all maps",
    },
    configs: [
      {
        fileName: "config.json",
        filePath: "/demo/loot-config/config.json",
        rawJson: JSON.stringify(
          {
            lootMultiplier: 2.5,
            rareItemChance: 0.15,
            enableCustomLoot: true,
            maps: {
              customs: { multiplier: 2.0, enabled: true },
              interchange: { multiplier: 3.0, enabled: true },
              reserve: { multiplier: 1.5, enabled: false },
            },
            blacklistedItems: ["item1", "item2"],
          },
          null,
          2
        ),
      },
    ],
  },
  {
    mod: {
      id: "trader-tweaks",
      name: "Trader Tweaks",
      version: "3.1.0",
      author: "DemoAuthor",
      description: "Customize trader inventories and prices",
    },
    configs: [
      {
        fileName: "config.json",
        filePath: "/demo/trader-tweaks/config.json",
        rawJson: JSON.stringify(
          {
            priceMultiplier: 0.8,
            unlockAllItems: false,
            traderRefreshTime: 3600,
            traders: {
              prapor: { discount: 10, enabled: true },
              therapist: { discount: 5, enabled: true },
              mechanic: { discount: 15, enabled: false },
            },
          },
          null,
          2
        ),
      },
      {
        fileName: "advanced.json",
        filePath: "/demo/trader-tweaks/advanced.json",
        rawJson: JSON.stringify(
          {
            enableBarter: true,
            maxItems: 500,
            restockChance: 0.75,
          },
          null,
          2
        ),
      },
    ],
  },
  {
    mod: {
      id: "qol-mod",
      name: "Quality of Life",
      version: "2.0.1",
      author: "DemoAuthor",
      description: "Various quality of life improvements",
    },
    configs: [
      {
        fileName: "config.json",
        filePath: "/demo/qol-mod/config.json",
        rawJson: JSON.stringify(
          {
            removeLoadingScreen: true,
            fastSorting: true,
            autoHeal: false,
            stackSize: { ammo: 120, meds: 5 },
            keybinds: { quickSort: "F5", autoHeal: "F6" },
          },
          null,
          2
        ),
      },
    ],
  },
];
