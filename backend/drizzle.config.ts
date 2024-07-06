import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: "127.0.0.1",
    port: 15432,
    user: "user",
    password: "password",
    database: "postgres",
    ssl: false,
  },
  verbose: true,
  strict: true,
});
