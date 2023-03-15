import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import {
  ThemeContext,
} from "~/modules/avl-components/src"

import {
  FalcorProvider, 
  falcorGraph
} from "~/modules/avl-falcor"

import styles from "./styles/app.css"
import avl_theme from "./theme"

export function links() {
  return [{ rel: "stylesheet", href: styles }]
}

export const meta = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />

<script src="http://d3js.org/d3.v3.min.js"></script>
<script src="http://d3js.org/colorbrewer.v1.min.js"></script>
<script type="text/javascript" src="colorbrewer_interpolate.js"></script>
        <Links />
      </head>
      <body className='bg-gray-100'>
          <ThemeContext.Provider value={avl_theme}>
            <FalcorProvider falcor={ falcorGraph('https://graph.availabs.org') }>
              <Outlet />
            </FalcorProvider>
          </ThemeContext.Provider>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
      </body>
    </html>
  );
}

