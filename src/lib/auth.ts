import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "@clerk/tanstack-react-start/server";
import { getWebRequest } from "@tanstack/react-start/server";
import { queryOptions } from "@tanstack/react-query";

export const fetchAuth = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await getAuth(getWebRequest());
  const token = await auth.getToken({ template: "convex" });

  return {
    userId: auth.userId,
    token,
  };
});

export const authQueries = {
  current: queryOptions({
    queryKey: ["auth", "current"],
    queryFn: async () => {
      const { userId, token } = await fetchAuth();
      return { userId, token };
    },
  }),
};
