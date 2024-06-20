import { useState } from "react";
import { styled } from "styled-components";
import { DC } from "../types";

const Wrapper = styled.div`
  color: #d2f9fc;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  margin-top: 10px;
  text-align: center;
`;

const Button = styled.div<{ $active: boolean }>`
  background: ${(props) => (props.$active ? "#083993" : "rgba(6, 15, 39, 1)")};
  padding: 10px;
  text-align: center;
  width: max-content;
  cursor: pointer;
`;

const DropdownButtons = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: center;
  align-content: center;
  align-items: center;
`;

const Dropdown = styled.div<{ $open: boolean }>`
  height: ${(props) => (props.$open ? "57px" : "0")};
  overflow: hidden;
  transition: all 500ms ease-in-out;
`;

const DropdownContent = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: center;
`;

export const RegionSelect = (props: {
  regions: string[];
  dcs: DC[];
  currentRegion: string;
  setCurrentRegion: (regions: string) => void;
  currentDC: DC | null;
  setCurrentDC: (dc: DC | null) => void;
  setCurrentScope: (scope: "DC" | "Region") => void;
}) => {
  const {
    regions,
    dcs,
    currentRegion,
    setCurrentRegion,
    currentDC,
    setCurrentDC,
    setCurrentScope,
  } = props;
  const [regionOpen, setRegionOpen] = useState(false);
  const [dcOpen, setDCOpen] = useState(false);

  const handleDCOpen = () => {
    setDCOpen(!dcOpen);
  };
  const handleRegionOpen = () => {
    setDCOpen(false);
    setRegionOpen(!regionOpen);
  };

  return (
    <Wrapper>
      <DropdownButtons>
        <p>Limit Results To:</p>
        <Button onClick={handleRegionOpen} $active={false}>
          <p>Region (current: {currentRegion})</p>
        </Button>
        <Button onClick={handleDCOpen} $active={false}>
          <p>DC (current: {currentDC?.name ?? "None"})</p>
        </Button>
      </DropdownButtons>
      <Dropdown $open={regionOpen || dcOpen}>
        <DropdownContent>
          {regions.map((region) => {
            return (
              <Button
                $active={region === currentRegion}
                key={region}
                onClick={() => {
                  setCurrentRegion(region);
                  setCurrentDC(null);
                  setCurrentScope("Region");
                }}
              >
                {region}
              </Button>
            );
          })}
        </DropdownContent>
      </Dropdown>
      <Dropdown $open={dcOpen}>
        <DropdownContent>
          {dcs
            .filter((dc) => dc.region === currentRegion)
            .map((dc) => {
              return (
                <Button
                  $active={dc === currentDC}
                  key={dc.name}
                  onClick={() => {
                    if (currentDC === dc) {
                      setCurrentDC(null);
                      setCurrentScope("Region");
                    } else {
                      setCurrentDC(dc);
                      setCurrentScope("DC");
                    }
                  }}
                >
                  {dc.name}
                </Button>
              );
            })}
        </DropdownContent>
      </Dropdown>
    </Wrapper>
  );
};

export default RegionSelect;
