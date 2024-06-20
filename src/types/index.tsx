export interface Listing {
  pricePerUnit: number;
  quantity: number;
  worldID: number;
}

export interface Item {
  id: number;
  quantity: number;
  name: string | null;
}

export enum PurchaseStatus {
  complete,
  incomplete,
  partial,
}

export interface Purchase {
  itemID: number;
  name: string | null;
  worldID: number;
  quantityToBuy: number;
  //we may want to buy multiple listings from one world
  //at different price points, so we set a minimum
  //and a maximum instead of one set price
  priceMin: number;
  priceMax: number;
  active: boolean;
  status?: PurchaseStatus;
}

export interface DC {
  name: string;
  region: string;
  worlds: number[];
}

export interface World {
  id: string;
  name: string;
}

export type Display = "DC" | "WORLD" | "ITEM";
