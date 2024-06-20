import styled from "styled-components";
import errorIcon from "../../assets/images/e.png";
import { Oval } from "react-loader-spinner";
import { Item, Purchase, DC, World, Display } from "../../types";
import ResultsItems from "./ResultsItems";
import ResultsInfo from "./ResultsInfo";
import { useState } from "react";

const Header = styled.div`
  background: rgba(6, 15, 39, 1);
  color: white;
  padding: 20px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  gap: 10px;
  ul {
    padding: 0;
  }
  li {
    list-style-type: none;
    padding: 2px 0;
  }
`;

const ErrorMessage = styled(Header)`
  background: rgba(6, 15, 39, 1);
  color: white;
  padding: 20px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  img {
    width: 40px;
    height: 40px;
  }
`;

const Spinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  margin-top: 20px;
`;

const Results = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 20px;
`;

export const ResultsArea = (props: {
  errorMessage: string | undefined;
  loading: boolean;
  itemList: Item[];
  updateAllPurchasesByItem: (
    item: Item,
    field: keyof Purchase,
    /* eslint-disable @typescript-eslint/no-explicit-any */
    newValue: any
  ) => void;
  cost: number;
  shoppingList: Purchase[];
  updatePurchase: (
    purchase: Purchase,
    field: keyof Purchase,
    /* eslint-disable @typescript-eslint/no-explicit-any */
    newValue: any
  ) => void;
  unavailableList: Item[];
  datacenters: DC[];
  worlds: World[];
}) => {
  const {
    errorMessage,
    loading,
    itemList,
    updateAllPurchasesByItem,
    cost,
    shoppingList,
    unavailableList,
    datacenters,
    worlds,
    updatePurchase,
  } = props;
  const [displayType, setDisplayType] = useState<Display>("DC");
  return (
    <>
      {errorMessage && (
        <ErrorMessage>
          <img src={errorIcon} alt="Error Icon" />
          {errorMessage}
        </ErrorMessage>
      )}
      {loading ? (
        <Spinner>
          <Oval
            visible={true}
            height="50"
            width="50"
            color="#a1dcfc"
            strokeWidth={0}
            strokeWidthSecondary={3}
            ariaLabel="oval-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </Spinner>
      ) : (
        <Results>
          <ResultsInfo
            itemList={itemList}
            updateAllPurchasesByItem={updateAllPurchasesByItem}
            cost={cost}
            display={displayType}
            setDisplay={setDisplayType}
          />
          <ResultsItems
            shoppingList={shoppingList}
            itemList={itemList}
            updatePurchase={updatePurchase}
            unavailableList={unavailableList}
            datacenters={datacenters}
            worlds={worlds}
            display={displayType}
          />
        </Results>
      )}
    </>
  );
};

export default ResultsArea;
