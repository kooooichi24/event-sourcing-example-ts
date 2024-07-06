import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const accountRoles = pgTable("account_roles", {
  role: varchar("role", { length: 32 }).primaryKey(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  role: varchar("role", { length: 32 })
    .notNull()
    .references(() => accountRoles.role),
});
