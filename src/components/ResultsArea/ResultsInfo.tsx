import styled from "styled-components";
import { Display, Item, Purchase } from "../../types";

const Section = styled.div``;

const Wrapper = styled.div`
  background: rgba(6, 15, 39, 1);
  color: white;
  height: max-content;
  padding: 20px;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  ul {
    padding: 0;
    margin: 0;
  }
  li {
    list-style-type: none;
    padding: 2px 0;
  }
  span {
    color: #2d72ad;
  }
  input {
    margin: 0 5px 0 0;
  }
  ${Section}:not(:last-of-type) {
    margin: 0 0 10px 0;
  }
`;

const Subheader = styled.p`
  padding: 0 0 5px 0;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  input {
    margin: 0 5px 0 0;
  }
`;

export const ResultsInfo = (props: {
  itemList: Item[];
  updateAllPurchasesByItem: (
    item: Item,
    field: keyof Purchase,
    /* eslint-disable @typescript-eslint/no-explicit-any */
    newValue: any
  ) => void;
  cost: number;
  display: Display;
  setDisplay: (display: Display) => void;
}) => {
  const { itemList, cost, updateAllPurchasesByItem, display, setDisplay } =
    props;
  return itemList.length > 0 ? (
    <Wrapper>
      <Section>
        <Subheader>
          <strong>Items to Buy:</strong>
        </Subheader>
        <ul>
          {itemList.map((item) => {
            return (
              <li key={item.name}>
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      updateAllPurchasesByItem(item, "active", !isChecked);
                    }}
                  />
                  {item.name} <span>x</span>
                  {item.quantity.toLocaleString()}
                </label>
              </li>
            );
          })}
        </ul>
      </Section>
      <Section>
        <Subheader>
          <strong>Total Cost:</strong>
        </Subheader>
        <p>{cost.toLocaleString()} gil</p>
      </Section>
      <Section>
        <Subheader>
          <strong>Display results by:</strong>
        </Subheader>
        <RadioGroup>
          <label htmlFor="DC">
            <input
              type="radio"
              name="display"
              id="DC"
              checked={display === "DC"}
              onChange={() => {
                setDisplay("DC");
              }}
            />
            DC
          </label>
          <label htmlFor="World">
            <input
              type="radio"
              name="display"
              id="World"
              checked={display === "WORLD"}
              onChange={() => {
                setDisplay("WORLD");
              }}
            />
            World
          </label>
          <label htmlFor="Item">
            <input
              type="radio"
              name="display"
              id="Item"
              checked={display === "ITEM"}
              onChange={() => {
                setDisplay("ITEM");
              }}
            />
            Item
          </label>
        </RadioGroup>
      </Section>
    </Wrapper>
  ) : (
    <></>
  );
};

export default ResultsInfo;
