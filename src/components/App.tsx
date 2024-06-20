import styled from "styled-components";
import Content from "./Content";
import axios from "axios";
import { World, DC } from "../types";
import { useEffect, useState } from "react";
const UNIVERSALIS_URL = "https://universalis.app/api/v2";
//there is no api endpoint for these so we're just hard coding these
const regions = ["North-America", "Japan", "Europe", "Oceania"];

const Wrapper = styled.div`
  font-family: "Noto Sans", sans-serif;
`;

const Main = styled.div`
  max-width: min(80vw, 2000px);
  padding: 20px;
  margin: 50px auto;
  background: rgba(23, 60, 145, 0.3);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const App = () => {
  const [datacenters, setDatacenters] = useState<DC[]>([]);
  const [worlds, setWorlds] = useState<World[]>([]);

  useEffect(() => {
    const getDCInfo = async () => {
      const url = `${UNIVERSALIS_URL}/data-centers`;
      const response = await axios.get(url).catch((err) => console.error(err));
      const datacenters: DC[] = response?.data ?? [];
      setDatacenters(datacenters);
    };
    const getWorldInfo = async () => {
      const url = `${UNIVERSALIS_URL}/worlds`;
      const response = await axios.get(url).catch((err) => console.error(err));
      const worlds: World[] = response?.data ?? [];
      setWorlds(worlds);
    };

    getDCInfo();
    getWorldInfo();
  }, []);

  return (
    <Wrapper>
      <Main>
        <Content regions={regions} datacenters={datacenters} worlds={worlds} />
      </Main>
    </Wrapper>
  );
};

export default App;
