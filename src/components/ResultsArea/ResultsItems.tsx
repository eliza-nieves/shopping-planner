import styled from "styled-components";
import check from "../../assets/images/check.png";
import cross from "../../assets/images/cross.png";
import part from "../../assets/images/excl2.png";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { DC, Display, Purchase, PurchaseStatus, World } from "../../types";
import { Item } from "../../types";
import { useEffect, useState } from "react";

interface WorldItem {
  name: string;
  items: Purchase[];
}

export interface DatacenterItem {
  name: string;
  worlds: WorldItem[];
}

export interface ItemItem {
  name: string;
  worlds: WorldItem[];
}

const Wrapper = styled(ResponsiveMasonry)`
  margin-top: 20px;
`;

const DatacenterDiv = styled.div`
  background: linear-gradient(to right, rgba(0, 0, 0, 0), #083993),
    linear-gradient(to right, rgba(0, 90, 255, 0.33), rgba(255, 100, 127, 0.2)),
    linear-gradient(to top right, #1c4482, rgba(0, 0, 0, 0)),
    radial-gradient(closest-corner at 20% 80%, #1c77c6, #153b5c);
  background-attachment: fixed;

  color: rgba(255, 255, 255, 0.9);
  text-shadow: #0d69d5 1px 0 10px;
  letter-spacing: 1px;
  padding: 10px 0;

  h3 {
    margin: 0;
    font-size: 16px;
    font-family: "Orbitron", sans-serif;
    font-weight: normal;
  }
  p {
    padding: 5px 10px;
  }
`;

const DCTitle = styled.div`
  padding: 0 10px;
  font-weight: 700;
`;

const WorldDiv = styled.div`
  background: rgba(6, 15, 39, 0.6);
  padding: 10px;
  margin-top: 10px;
`;

const PurchaseDiv = styled.div<{ $active: boolean }>`
  background: transparent;
  text-align: left;
  text-shadow: #0d69d5 0px 0 1px;
  letter-spacing: normal;
  align-items: center;
  opacity: ${(props) => (props.$active ? "1" : "0.2")};

  display: grid;
  grid-gap: 1px;
  grid-template-columns: 1fr 30px 30px 30px;
  p {
    margin: 0 15px 0 0;
    padding: 0;
    display: inline;
    text-align: left;
  }

  span {
    color: #2d72ad;
  }
`;

const PurchaseItem = styled.div``;

const IMG = styled.div<{ $active: boolean }>`
  display: flex;
  align-content: center;
  opacity: ${(props) => (props.$active ? "1" : "0.2")};
  img {
    width: 25px;
    height: 25px;
    cursor: pointer;
  }
`;

function groupPurchasesByDC(
  purchases: Purchase[],
  dcs: DC[],
  worlds: World[]
): DatacenterItem[] {
  const dcGroups: DatacenterItem[] = [];
  for (const dc of dcs) {
    const ownedWorlds: WorldItem[] = [];
    dc.worlds.forEach((worldID) => {
      const worldShoppingList = purchases.filter(
        (purchase) => purchase.worldID === worldID
      );
      if (!worldShoppingList || worldShoppingList.length <= 0) return;

      const foundWorldItem: WorldItem = {
        name:
          worlds.find((world) => parseInt(world.id) === worldID)?.name ??
          worldID.toString(),
        items: worldShoppingList,
      };

      ownedWorlds.push(foundWorldItem);
    });

    const dcItem = {
      name: dc.name,
      worlds: ownedWorlds,
    };

    if (ownedWorlds.length > 0) {
      dcGroups.push(dcItem);
    }
  }
  return dcGroups;
}

function groupPurchasesByWorld(
  purchases: Purchase[],
  worlds: World[]
): WorldItem[] {
  const worldItems: WorldItem[] = [];
  for (const world of worlds) {
    const worldID = parseInt(world.id);
    const worldShoppingList = purchases.filter(
      (purchase) => purchase.worldID === worldID
    );
    if (!worldShoppingList || worldShoppingList.length <= 0) continue;

    const foundWorldItem: WorldItem = {
      name:
        worlds.find((world) => parseInt(world.id) === worldID)?.name ??
        worldID.toString(),
      items: worldShoppingList,
    };

    worldItems.push(foundWorldItem);
  }
  return worldItems;
}

function groupPurchasesByItem(
  purchases: Purchase[],
  items: Item[],
  worlds: World[]
): ItemItem[] {
  const itemGroups: ItemItem[] = [];
  for (const item of items) {
    const ownedPurchases = purchases.filter(
      (purchase) => purchase.itemID === item.id
    );
    if (!ownedPurchases || ownedPurchases.length <= 0) continue;

    const ownedWorlds: WorldItem[] = [];
    ownedPurchases.forEach((purchase) => {
      const purchaseWorldItem: WorldItem = {
        name:
          worlds.find((world) => parseInt(world.id) === purchase.worldID)
            ?.name ?? purchase.worldID.toString(),
        items: [purchase],
      };
      ownedWorlds.push(purchaseWorldItem);
    });

    const itemItem = {
      name: item.name ?? item.id.toString(),
      worlds: ownedWorlds,
    };

    itemGroups.push(itemItem);
  }
  return itemGroups;
}

const ListItem = (props: {
  title: string;
  purchase: Purchase;
  updatePurchase: (
    purchase: Purchase,
    field: keyof Purchase,
    /* eslint-disable @typescript-eslint/no-explicit-any */
    newValue: any
  ) => void;
}) => {
  const { title, purchase, updatePurchase } = props;
  return (
    <PurchaseDiv $active={purchase.active}>
      <PurchaseItem>
        <p>{title}</p>
        <p>
          <span>x</span>
          {purchase.quantityToBuy}
        </p>
        {purchase.priceMax === purchase.priceMin ? (
          <p>
            <span>@</span>
            {purchase.priceMin.toLocaleString()} gil
          </p>
        ) : (
          <p>
            <span>@</span>
            {purchase.priceMin.toLocaleString()} <span>-</span>{" "}
            {purchase.priceMax.toLocaleString()} gil
          </p>
        )}
      </PurchaseItem>
      <IMG $active={purchase.status === PurchaseStatus.complete}>
        <img
          src={check}
          onClick={() => {
            const newStatus =
              purchase.status === PurchaseStatus.complete
                ? undefined
                : PurchaseStatus.complete;
            updatePurchase(purchase, "status", newStatus);
          }}
          alt="Check Button"
        />
      </IMG>
      <IMG $active={purchase.status === PurchaseStatus.incomplete}>
        <img
          src={cross}
          onClick={() => {
            const newStatus =
              purchase.status === PurchaseStatus.incomplete
                ? undefined
                : PurchaseStatus.incomplete;
            updatePurchase(purchase, "status", newStatus);
          }}
          alt="Cross Button"
        />
      </IMG>
      <IMG $active={purchase.status === PurchaseStatus.partial}>
        <img
          src={part}
          onClick={() => {
            const newStatus =
              purchase.status === PurchaseStatus.partial
                ? undefined
                : PurchaseStatus.partial;
            updatePurchase(purchase, "status", newStatus);
          }}
          alt="Alert Button"
        />
      </IMG>
    </PurchaseDiv>
  );
};

export const ResultsItems = (props: {
  shoppingList: Purchase[];
  itemList: Item[];
  unavailableList: Item[];
  datacenters: DC[];
  worlds: World[];
  updatePurchase: (
    purchase: Purchase,
    field: keyof Purchase,
    /* eslint-disable @typescript-eslint/no-explicit-any */
    newValue: any
  ) => void;
  display: Display;
}) => {
  const {
    shoppingList,
    itemList,
    unavailableList,
    datacenters,
    worlds,
    updatePurchase,
    display,
  } = props;

  const [purchasesSortedByDC, setPurchasesSortedByDC] = useState<
    DatacenterItem[]
  >([]);
  const [purchasesSortedByWorld, setPurchasesSortedByWorld] = useState<
    WorldItem[]
  >([]);
  const [purchasesSortedByItem, setPurchasesSortedByItem] = useState<
    ItemItem[]
  >([]);

  useEffect(() => {
    switch (display) {
      case "DC": {
        setPurchasesSortedByDC(
          groupPurchasesByDC(shoppingList, datacenters, worlds)
        );
        break;
      }
      case "WORLD": {
        setPurchasesSortedByWorld(groupPurchasesByWorld(shoppingList, worlds));
        break;
      }
      case "ITEM": {
        setPurchasesSortedByItem(
          groupPurchasesByItem(shoppingList, itemList, worlds)
        );
      }
    }
  }, [display, shoppingList, datacenters, worlds, itemList]);

  return purchasesSortedByDC.length <= 0 ? (
    <></>
  ) : (
    <Wrapper columnsCountBreakPoints={{ 400: 1, 800: 2, 1200: 3, 1600: 4 }}>
      <Masonry gutter="20px">
        {display === "DC" &&
          purchasesSortedByDC.map((dc) => {
            return (
              <DatacenterDiv key={dc.name}>
                <h3>
                  <DCTitle>{dc.name}</DCTitle>
                </h3>
                {dc.worlds.map((world) => {
                  return (
                    <WorldDiv key={world.name}>
                      <h3>{world.name}</h3>
                      {world.items.map((purchase) => {
                        return (
                          <ListItem
                            key={`${purchase.worldID}_${purchase.itemID}`}
                            title={
                              purchase.name?.toString() ??
                              purchase.itemID.toString()
                            }
                            purchase={purchase}
                            updatePurchase={updatePurchase}
                          />
                        );
                      })}
                    </WorldDiv>
                  );
                })}
              </DatacenterDiv>
            );
          })}
        {display === "WORLD" &&
          purchasesSortedByWorld.map((world) => {
            return (
              <DatacenterDiv key={world.name}>
                <h3>
                  <DCTitle>{world.name}</DCTitle>
                </h3>
                <WorldDiv>
                  {world.items.map((purchase) => {
                    return (
                      <ListItem
                        key={`${purchase.worldID}_${purchase.itemID}`}
                        title={
                          purchase.name?.toString() ??
                          purchase.itemID.toString()
                        }
                        purchase={purchase}
                        updatePurchase={updatePurchase}
                      />
                    );
                  })}
                </WorldDiv>
              </DatacenterDiv>
            );
          })}
        {display === "ITEM" &&
          purchasesSortedByItem.map((item) => {
            return (
              <DatacenterDiv key={item.name}>
                <h3>
                  <DCTitle>{item.name}</DCTitle>
                </h3>
                <WorldDiv key={item.name}>
                  {item.worlds.map((world) => {
                    const purchase = world.items[0];
                    return (
                      <ListItem
                        key={`${purchase.worldID}_${purchase.itemID}`}
                        title={world.name}
                        purchase={purchase}
                        updatePurchase={updatePurchase}
                      />
                    );
                  })}
                </WorldDiv>
              </DatacenterDiv>
            );
          })}
        {unavailableList.length > 0 && (
          <DatacenterDiv key="unavailable-notice">
            <h3>
              <DCTitle>Could Not Be Found</DCTitle>
            </h3>
            <p>Market data could not be found for the following items:</p>
            <WorldDiv key="unavailable-items">
              {unavailableList.map((item) => {
                return (
                  <PurchaseDiv key={item.id} $active={true}>
                    <p>{item.name}</p>
                  </PurchaseDiv>
                );
              })}
            </WorldDiv>
          </DatacenterDiv>
        )}
      </Masonry>
    </Wrapper>
  );
};

export default ResultsItems;
