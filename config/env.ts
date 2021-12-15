import dotenv from "dotenv";

dotenv.config();

export const MARKET = process.env.MARKET || "";
export const ALCHEMY_KEY = process.env.ALCHEMY_KEY || "";
export const SKIP_LOAD = process.env.SKIP_LOAD === "true";
