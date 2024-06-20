import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  body {
    background: #02030a;
    background-size: 10px 10px;
    background-image:
      linear-gradient(to right, rgba(24, 99, 185, 0.1) 1px, transparent 1px),
      linear-gradient(to bottom,  rgba(24, 99, 185, 0.2) 1px, transparent 1px);
      margin: 0;
    }

  :root {
    --primary-color: #8f00ff; 
  }

`;

export default GlobalStyle;
