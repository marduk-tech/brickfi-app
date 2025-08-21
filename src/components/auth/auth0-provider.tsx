"use client";

import { AppState, Auth0Provider } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import {
  auth0CallbackUrl,
  auth0ClientId,
  auth0Domain,
} from "../../libs/constants";

/**
 * Custom Auth0 Provider component
 * @param children Child components to be wrapped by the Auth0 provider
 */
export const CustomAuth0Provider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const domain = auth0Domain;
  const clientId = auth0ClientId;
  const redirectUri = auth0CallbackUrl;

  /**
   * Callback function to handle redirection after authentication
   * @param appState The application state after authentication
   */
  const onRedirectCallback = (appState?: AppState) => {
    router.push(appState?.returnTo || window.location.pathname);
  };

  if (!(domain && clientId && redirectUri)) {
    return null;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};
