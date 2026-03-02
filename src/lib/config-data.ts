export interface ConfigFile {
  id: string;
  name: string;
  path: string;
  content: Record<string, unknown>;
  modified: boolean;
}

export const SAMPLE_CONFIGS: ConfigFile[] = [
  {
    id: "1",
    name: "core.json",
    path: "config/core.json",
    content: {
      "allowFreeCam": false,
      "serverName": "SPT Server",
      "maxPlayers": 1,
      "version": "3.9.0",
      "ip": "127.0.0.1",
      "port": 6969,
      "backendUrl": "https://127.0.0.1:6969",
      "natHelper": { "enabled": false, "port": 6970 }
    },
    modified: false,
  },
  {
    id: "2",
    name: "gameplay.json",
    path: "config/gameplay.json",
    content: {
      "inRaid": {
        "MIAOnRaidEnd": false,
        "raidMenuSettings": { "aiAmount": "AsOnline", "aiDifficulty": "AsOnline", "bossEnabled": true, "scavWars": false, "taggedAndCursed": false },
        "save": { "loot": true, "durability": true }
      },
      "trading": { "purchasesAreFoundInRaid": false, "traderPurchasesAreFiR": false, "maxRagfairOfferCount": 30 }
    },
    modified: false,
  },
  {
    id: "3",
    name: "inventory.json",
    path: "config/inventory.json",
    content: {
      "newItemsMarkedFound": false,
      "randomLootContainers": { "enabled": true, "useWeighting": true },
      "sealedAirdropContainer": { "weaponRewardWeight": 50, "gearRewardWeight": 30, "foodRewardWeight": 10, "medRewardWeight": 10 }
    },
    modified: false,
  },
  {
    id: "4",
    name: "bots.json",
    path: "config/bots.json",
    content: {
      "presetBatch": { "assault": 40, "bossBully": 5, "bossGluhar": 5, "bossKilla": 5, "cursedAssault": 20, "followerBully": 10 },
      "pmc": { "isUsec": 50, "usecType": "random", "bearType": "random", "difficulty": "AsOnline", "maxBotCap": 15, "convertIntoPmcChance": { "assault": 20, "cursedAssault": 30 } }
    },
    modified: false,
  },
];
