import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import App from "./App";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./styles.css";

const theme = createTheme({
  primaryColor: "green",
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5c5f66',
      '#373A40',
      '#2C2E33',
      '#1A1B1E',
      '#141517',
      '#101113',
      '#0a0a0a',
    ],
  },
  defaultRadius: 'md',
  components: {
    Paper: {
      defaultProps: {
        shadow: 'none',
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" zIndex={2077} />
      <App />
    </MantineProvider>
  </React.StrictMode>
);
