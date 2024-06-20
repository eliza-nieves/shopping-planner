import styled from "styled-components";
import question from "../assets/images/q.png";

//styling thanks to https://medium.com/@whwrd/building-a-beautiful-text-input-component-in-react-f85564cc7e86
const Input = styled.input`
  height: 50px;
  position: relative;
  padding: 0px 16px;
  border: none;
  font-size: 16px;
  font-family: "Noto Sans", sans-serif;
  color: white;
  text-shadow: none;

  background-color: transparent !important
;
  outline: none;
  -webkit-appearance: none;

  &::placeholder {
    color: rgba(0, 137, 255, 0.5);
    text-shadow: none;
  }

  &:focus {
    padding: 8px 16px;
    color: #000b28;

    &::placeholder {
      opacity: 0;
    }
  }

  /*stupid hack to stop autofill from making bg blue*/
  &:-webkit-autofill,
  &:-webkit-autofill:hover {
    -webkit-background-clip: text;
    -webkit-text-fill-color: #ffffff;
    transition: background-color 5000s ease-in-out 0s;
  }
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    -webkit-background-clip: text;
    -webkit-text-fill-color: #000b28;
    transition: background-color 5000s ease-in-out 0s;
  }
`;

const Field = styled.div`
  width: calc(100% - 8px);
  height: 50px;
  position: relative;
  background-color: rgba(6, 15, 39, 1);
  transition: 0.3s all;
  display: grid;
  grid-template-columns: 18fr 40px;
  padding: 0 8px 0 0;

  &:hover {
    background-color: rgba(17, 42, 106, 1);
    transition: 0.2s all ease-in-out;
  }

  &:focus-within {
    background-color: white;
    transition: 0.2s all ease-in-out;
  }

  &:focus-within input + label {
    top: 4px;
    opacity: 1;
    transition: 0.2s all ease-in-out;
    color: #13389a;
  }

  input + label {
    position: absolute;
    top: 24px;
    left: 16px;
    font-size: 12px;
    font-weight: 600;
    line-height: 24px;
    color: #ffffff;
    opacity: 0;
    pointer-events: none;
    transition: 0.2s all ease-in-out;
  }
`;

const IMG = styled.div`
  height: 48px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    cursor: pointer;

    height: 40px;
    width: 40px;
  }
`;

export const TextInput = (props: {
  id: string;
  value: string;
  label: string;
  onChange: (val: string) => void;
  onEnter?: () => void;
  onHelp?: () => void;
}) => {
  const { id, value, label, onChange, onEnter, onHelp } = props;

  return (
    <Field>
      <Input
        id={id}
        value={value}
        placeholder={label}
        onChange={({ target: { value } }) => onChange(value)}
        onKeyDown={(e) => {
          if (e.keyCode === 13 && onEnter) {
            onEnter();
          }
        }}
      />
      <label htmlFor={id}>{label}</label>

      <IMG>
        <img src={question} onClick={onHelp} alt="help button" />
      </IMG>
    </Field>
  );
};
