import { ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { nhost } from "./nhost";

// HTTP link
const httpLink = new HttpLink({
  uri: `${nhost.backendUrl}/v1/graphql`,
  headers: async () => {
    const token = await nhost.auth.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
});

// WebSocket link
const wsLink = new GraphQLWsLink(
  createClient({
    url: nhost.backendUrl.replace("https", "wss") + "/v1/graphql",
    connectionParams: async () => {
      const token = await nhost.auth.getAccessToken();
      return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    },
  })
);

// Split between queries/mutations and subscriptions
const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === "OperationDefinition" && def.operation === "subscription";
  },
  wsLink,
  httpLink
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
});
