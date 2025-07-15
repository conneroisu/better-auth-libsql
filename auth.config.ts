import { betterAuth } from "better-auth";
import { libsqlAdapter } from "./src";

export const auth = betterAuth({
  database: libsqlAdapter({
    url: ":memory:",
  }),
  emailAndPassword: {
    enabled: true,
  },
});