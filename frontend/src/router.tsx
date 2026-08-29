import { MutationCache, QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  let router: any = null;

  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onSuccess: () => {
        if (router) {
          router.invalidate();
        }
      },
    }),
  });

  router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
