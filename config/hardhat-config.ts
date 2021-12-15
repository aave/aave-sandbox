import path from "path";
import fs from "fs";
import { MARKET, ALCHEMY_KEY } from "./env";

export const buildForkConfig = () => {
  switch (MARKET) {
    case "main":
    case "arc":
      return {
        url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
        blockNumber: getForkNumber(),
      };
    default:
      return undefined;
  }
};

export const getForkNumber = () => {
  switch (MARKET) {
    case "main":
    case "arc":
      return 13431462;
    default:
      return undefined;
  }
};

export const loadTasks = (taskFolders: string[]): void =>
  taskFolders.forEach((folder) => {
    const tasksPath = path.join(__dirname, "../tasks", folder);
    fs.readdirSync(tasksPath)
      .filter((pth) => pth.includes(".ts") || pth.includes(".js"))
      .forEach((task) => {
        require(`${tasksPath}/${task}`);
      });
  });
