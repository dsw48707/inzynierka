import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app.jsx'
import './index.css'
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";

const msalInstance = new PublicClientApplication(msalConfig);

// Inicjalizacja MSAL
msalInstance.initialize().then(() => {
  
  // Jeśli użytkownik wraca z logowania i ma konto, ustawiamy je jako aktywne
  if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
    msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
  }

  // Nasłuchiwanie zdarzeń (dla pewności)
  msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
      msalInstance.setActiveAccount(event.payload.account);
    }
  });

  // Obsługa powrotu z przekierowania (handleRedirectPromise)
  msalInstance.handleRedirectPromise().then((tokenResponse) => {
    // Tutaj MSAL przetwarza kod z adresu URL i czyści go
    // Dopiero po tym renderujemy aplikację
    ReactDOM.createRoot(document.getElementById('root')).render(
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    );
  }).catch(error => {
    console.error("Błąd podczas przetwarzania przekierowania:", error);
  });
});