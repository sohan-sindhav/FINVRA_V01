import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/authcontext.jsx";
import { BrowserRouter } from "react-router-dom";
import { ConnectionProvider } from "./context/ConnectionContext.jsx";
import { BankAccProvider } from "./context/BankAccContext.jsx";
import { TransactionProvider } from "./context/TransactionContext.jsx";
import { ThemeProvider } from "./theme/ThemeContext.jsx";
import { IPOProvider } from "./context/IPOContext.jsx";
import { PanProvider } from "./context/PanContext.jsx";
import { RoughNoteProvider } from "./context/RoughNoteContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BankAccProvider>
          <ConnectionProvider>
            <TransactionProvider>
              <IPOProvider>
                <PanProvider>
                  <RoughNoteProvider>
                    <BrowserRouter>
                      <App />
                    </BrowserRouter>
                  </RoughNoteProvider>
                </PanProvider>
              </IPOProvider>
            </TransactionProvider>
          </ConnectionProvider>
        </BankAccProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
