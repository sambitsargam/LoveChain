import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import "./assets/css/tailwind.output.css";
import App from "./App";
import { SidebarProvider } from "./context/SidebarContext";
import ThemedSuspense from "./components/ThemedSuspense";
import { Windmill } from "@windmill/react-ui";
import * as serviceWorker from "./serviceWorker";
import AuthProvider from "./utils/AuthProvider";

// if (process.env.NODE_ENV !== 'production') {
//   const axe = require('react-axe')
//   axe(React, ReactDOM, 1000)
// }

// lets create for avalanche fuji

 
ReactDOM.render(
  // <ThemeProvider attribute="class">
  <SidebarProvider>
    <Suspense fallback={<ThemedSuspense />}>
      <Windmill usePreferences>
        <AuthProvider>
         
            <App />
        </AuthProvider>  
      </Windmill>
    </Suspense>
  </SidebarProvider>,
  // </ThemeProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
