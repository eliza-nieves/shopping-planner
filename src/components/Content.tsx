import styled from "styled-components";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Listing, Item, DC, World, Purchase } from "../types";
import { TextInput } from "./TextInput";
import ResultsArea from "./ResultsArea/ResultsArea";
import update from "immutability-helper";
import _ from "lodash";
import RegionSelect from "./RegionSelect";

// Config section
const UNIVERSALIS_URL = "https://universalis.app/api/v2";
const UNIVERSALIS_FIELDS =
  "listings.pricePerUnit,listings.worldID,listings.quantity";
const XIVAPI_URL = "https://xivapi.com";

const Wrapper = styled.div`
  font-size: 16px;
  p {
    margin: 0;
  }
`;

const HelpArea = styled.div<{ $open: boolean }>`
  background: #041236;
  color: white;
  text-align: center;
  max-height: ${(props) => (props.$open ? "300px" : "0")};
  padding: ${(props) => (props.$open ? "20px 10px" : "0")};
  overflow: hidden;
  transition: all 500ms ease-in-out;
  li {
    list-style: none;
  }
  a {
    text-decoration: none;
    color: blue;
    text-shadow: #0d69d5 0px 0 1px;
  }
`;

async function getShoppingList(
  url: string,
  region: string
): Promise<{
  items: Item[];
  purchases: Purchase[];
  cost: number;
  unavailable: Item[];
}> {
  const items = await itemsFromURL(url);
  const { purchases, unavailable, cost } = await getItemPurchases(
    region,
    items
  );
  return { items, purchases, cost, unavailable };
}

async function itemsFromURL(url: string): Promise<Item[]> {
  const decodedURL = decodeURIComponent(url);
  const urlRegex = /{(.*?)}/;
  const matches = decodedURL.match(urlRegex);
  const itemIds = matches && matches[1] ? matches[1].split("|") : undefined;
  if (itemIds === undefined || itemIds.length < 1) {
    throw new Error("Link not valid.");
  }
  const items = itemIds?.map((item) => {
    const splitItem = item.substr(5).split("+");
    const id = parseInt(splitItem[0]);
    const quantity = splitItem[1] ? parseInt(splitItem[1]) : 1;
    return {
      id,
      quantity,
      name: id.toString(),
    };
  });
  for (const item of items) {
    const url = `${XIVAPI_URL}/item/${item.id}`;
    const response = await axios.get(url);
    const name = response.data?.Name;
    item.name = name ?? item.id.toString();
  }
  return items;
}

/**
 * Given an array of listings, returns a subset of the array where:
 * The sum of the quantities for each item in the array >= quantityNeeded
 * The sum of the prices to buy the listings (defined as quantity * ppu for each)
 * is minimized
 * Not 100% optimal but slightly better than just going from the lowest price up
 * @param listings
 * @param quantityNeeded
 * @returns listings to buy
 */
function optimalListings(
  listings: Listing[],
  quantityNeeded: number
): Listing[] {
  // initialize DP table
  const maxquantityNeeded = listings.reduce(
    (acc, item) => acc + item.quantity,
    0
  );
  const dp: number[] = new Array(maxquantityNeeded + 1).fill(
    Number.POSITIVE_INFINITY
  );
  dp[0] = 0;

  // fill DP table
  for (const item of listings) {
    const { quantity, pricePerUnit } = item;
    for (let q = maxquantityNeeded; q >= quantity; q--) {
      dp[q] = Math.min(dp[q], dp[q - quantity] + quantity * pricePerUnit);
    }
  }

  // find minimum cost for at least quantityNeeded
  let minCost = Number.POSITIVE_INFINITY;
  let minQ = -1;
  for (let q = quantityNeeded; q <= maxquantityNeeded; q++) {
    if (dp[q] < minCost) {
      minCost = dp[q];
      minQ = q;
    }
  }

  // find subset of listings that achieves the minimum cost
  if (minQ === -1 || dp[minQ] === Number.POSITIVE_INFINITY) {
    return []; // No valid subset found
  } else {
    const result: Listing[] = [];
    let currentQ = minQ;
    for (let i = listings.length - 1; i >= 0; i--) {
      const { quantity, pricePerUnit } = listings[i];
      while (
        currentQ >= quantity &&
        dp[currentQ] === dp[currentQ - quantity] + quantity * pricePerUnit
      ) {
        result.push(listings[i]);
        currentQ -= quantity;
      }
    }
    return result;
  }
}

/**
 * Given an item and its array of listings, returns a list of all purchases to be made and the cost to buy all.
 * @param item
 * @param listings
 * @returns
 */
function addPurchases(
  item: Item,
  listings: Listing[]
): { purchases: Purchase[]; cost: number } | null {
  let cost = 0;
  //failsafe for if there are no listings (not available to buy)
  if (!listings || listings.length < 1) {
    return null;
  }

  const purchases: Purchase[] = [];
  for (const listing of listings) {
    //check to see if we already have a purchase at the world of this listing
    const foundPurchase = purchases.find(
      (purchase) => purchase.worldID === listing.worldID
    );

    //if so update that purchase's quantity, priceMax
    if (foundPurchase) {
      foundPurchase.quantityToBuy += listing.quantity;
      foundPurchase.priceMax = listing.pricePerUnit;
    }

    //else make a new purchase
    else {
      purchases.push({
        itemID: item.id,
        name: item.name,
        worldID: listing.worldID,
        quantityToBuy: listing.quantity,
        priceMin: listing.pricePerUnit,
        priceMax: listing.pricePerUnit,
        active: true,
      });
    }

    //add cost of listing to running cost
    cost += listing.quantity * listing.pricePerUnit;
  }
  return { purchases, cost };
}

/**
 * Given a list of items, each with their own quantity, creates a series of shopping lists.
 * Each shopping list gives the items to buy on a given world so when
 * all items are bought from every world, every item on the given item list
 * has been bought at the necessitated quantity at the cheapest possible price.
 * @param items
 * @returns
 */
async function getItemPurchases(
  region: string,
  items: Item[]
): Promise<{ purchases: Purchase[]; unavailable: Item[]; cost: number }> {
  let allPurchases: Purchase[] = [];
  const unavailableItems: Item[] = [];
  let cost = 0;
  for (const item of items) {
    const url = `${UNIVERSALIS_URL}/${region}/${item.id}?listings=${
      item.quantity
    }&fields=${encodeURI(UNIVERSALIS_FIELDS)}`;
    const response = await axios.get(url);
    const listings: Listing[] = response.data?.listings;
    const optimizedListings = optimalListings(listings, item.quantity);
    const itemPurchaseInfo = addPurchases(item, optimizedListings);
    if (itemPurchaseInfo) {
      allPurchases = allPurchases.concat(itemPurchaseInfo.purchases);
      cost += itemPurchaseInfo.cost;
    } else {
      unavailableItems.push(item);
    }
  }
  return { purchases: allPurchases, unavailable: unavailableItems, cost };
}

export const Content = (props: {
  regions: string[];
  datacenters: DC[];
  worlds: World[];
}) => {
  const { regions, datacenters, worlds } = props;
  const [urlInput, setUrlInput] = useState("");
  const [itemList, setItemList] = useState<Item[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [shoppingList, setShoppingList] = useState<Purchase[]>([]);
  const [unavailableList, setUnavailableList] = useState<Item[]>([]);
  const [helpVisible, setHelpVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [currentRegion, setCurrentRegion] = useState<string>(regions[0]);
  //current DC is the singular dc if we are only searching on one.
  //available DCs is all DCS in the current region.
  const [currentDC, setCurrentDC] = useState<DC | null>(null);
  const [availableDCs, setavailableDCs] = useState<DC[]>([]);
  const [currentScope, setCurrentScope] = useState<"DC" | "Region">("Region");

  useEffect(() => {
    setavailableDCs(datacenters.filter((dc) => dc.region === currentRegion));
  }, [setavailableDCs, datacenters, currentRegion]);

  const getList = useCallback(async () => {
    setErrorMessage(undefined);
    setLoading(true);
    try {
      const scope =
        currentScope === "DC"
          ? currentDC?.name ?? currentRegion
          : currentRegion;
      const { items, purchases, cost, unavailable } = await getShoppingList(
        urlInput,
        scope
      );
      setShoppingList(purchases);
      setUnavailableList(unavailable);
      setTotalCost(cost);
      setItemList(items);
      setLoading(false);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Unexpected error, Please try again";
      setErrorMessage(errorMessage);
      setLoading(false);
    }
  }, [currentScope, currentDC, currentRegion, urlInput]);

  const updatePurchase = useCallback(
    /* eslint-disable @typescript-eslint/no-explicit-any */
    (purchase: Purchase, field: keyof Purchase, newValue: any) => {
      const indexToUpdate = shoppingList.findIndex(
        (item) =>
          item.itemID === purchase.itemID && item.worldID === purchase.worldID
      );
      if (indexToUpdate >= 0) {
        const updatedShoppingList = update(shoppingList, {
          [indexToUpdate]: { [field]: { $set: newValue } },
        });
        setShoppingList(updatedShoppingList);
      } else {
        throw new Error("Item not found");
      }
    },
    [shoppingList, setShoppingList]
  );

  const updateAllPurchasesByItem = useCallback(
    /* eslint-disable @typescript-eslint/no-explicit-any */
    (item: Item, field: keyof Purchase, newValue: any) => {
      const [affectedPurchases, unaffectedPurchases] = _.partition(
        shoppingList,
        {
          itemID: item.id,
        }
      );
      const updatedPurchases = affectedPurchases.map((item) => {
        return { ...item, [field]: newValue };
      });
      setShoppingList([...unaffectedPurchases, ...updatedPurchases]);
    },
    [shoppingList, setShoppingList]
  );

  return (
    <Wrapper>
      <TextInput
        id={"url-input"}
        value={urlInput}
        label={"Garland Tools URL"}
        onChange={setUrlInput}
        onEnter={getList}
        onHelp={() => setHelpVisible(!helpVisible)}
      />
      <HelpArea $open={helpVisible}>
        <p>
          <strong>How to get the URL:</strong>
        </p>
        <ul>
          <li>
            Make a group in{" "}
            <a href="https://www.garlandtools.org/">Garland Tools</a> by
            pressing <i>Tools</i>, then <i>New Group</i>.
          </li>
          <li>Add all desired items to the group.</li>
          <li>
            Select the group with your mouse. (Make sure it's highlighted!)
          </li>
          <li>Copy the URL from your browser.</li>
          <li>
            <strong>Note:</strong> Does NOT work with crafting lists at the
            moment. For now, add each individual item with its quantity to a new
            group.
          </li>
        </ul>
      </HelpArea>
      <RegionSelect
        regions={regions}
        dcs={availableDCs}
        currentRegion={currentRegion}
        setCurrentRegion={setCurrentRegion}
        currentDC={currentDC}
        setCurrentDC={setCurrentDC}
        setCurrentScope={setCurrentScope}
      />
      <ResultsArea
        errorMessage={errorMessage}
        loading={loading}
        itemList={itemList}
        cost={totalCost}
        shoppingList={shoppingList}
        unavailableList={unavailableList}
        updatePurchase={updatePurchase}
        updateAllPurchasesByItem={updateAllPurchasesByItem}
        datacenters={availableDCs}
        worlds={worlds}
      />
    </Wrapper>
  );
};

export default Content;
