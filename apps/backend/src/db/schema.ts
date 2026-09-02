import {pgTable, serial,integer, varchar, text, boolean, timestamp, unique} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";

export const companies = pgTable(
    "companies",
    {
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 255 }).notNull(),
        siret: varchar("siret", { length: 20 }).notNull(),
        description: text("description"),
        link: varchar("link", { length: 500 }),
        employeeRange: integer("employee_range").notNull(),
    },
    (t) => [unique().on(t.name, t.siret)]
);

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    rank: integer("rank").notNull().default(2), // 0 admin, 1 employer, 2 job-seeker
    companiesId: integer("companies_id").references(() => companies.id),
    firstname: varchar("firstname", { length: 100 }).notNull(),
    lastname: varchar("lastname", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailContact: varchar("email_contact", { length: 255 }),
    emailVerified: boolean("email_verified").notNull().default(false), // better-auth
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    address: text("address"),
    description: text("description"),
    resume: text("resume"), // base64 blob
    localisation: boolean("localisation").default(false),
    allowedAt: timestamp("allowed_at"),
    createdAt: timestamp("created_at").defaultNow(),
        updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()), // better-auth
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 512 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const userSkills = pgTable("user_skills", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
});

export const experience = pgTable("experience", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    companiesId: integer("companies_id").notNull().references(() => companies.id),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    type: integer("type").notNull(), // 0 stage, 1 alternance, ...
    partTime: boolean("part_time").default(false),
    start: timestamp("start"),
    end: timestamp("end"),
});

export const availability = pgTable("availability", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    title: varchar("title", { length: 255 }),
    type: integer("type").notNull(),
    partTime: boolean("part_time").default(false),
    start: timestamp("start").notNull(),
    end: timestamp("end"),
});

export const jobs = pgTable(
    "jobs",
    {
        id: serial("id").primaryKey(),
        companiesId: integer("companies_id").notNull().references(() => companies.id),
        userId: integer("user_id").notNull().references(() => users.id),
        title: varchar("title", { length: 255 }).notNull(),
        description: text("description"),
        type: integer("type").notNull(),
        salaryMin: integer("salary_min"),
        salaryMax: integer("salary_max"),
        createdAt: timestamp("created_at").defaultNow(),
    },
    (t) => [unique().on(t.title, t.companiesId)]
);

export const jobSkills = pgTable("job_skills", {
    id: serial("id").primaryKey(),
    jobId: integer("job_id").notNull().references(() => jobs.id),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
});

export const applications = pgTable(
    "applications",
    {
        id: serial("id").primaryKey(),
        jobId: integer("job_id").notNull().references(() => jobs.id),
        userId: integer("user_id").notNull().references(() => users.id),
    },
    (t) => [unique().on(t.jobId, t.userId)]
);

export const usersRelations = relations(users, ({ one, many }) => ({
    company: one(companies, { fields: [users.companiesId], references: [companies.id] }),
    skills: many(userSkills),
    experiences: many(experience),
    applications: many(applications),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, { fields: [userSkills.userId], references: [users.id] }),
}));

export const experienceRelations = relations(experience, ({ one }) => ({
  user: one(users, { fields: [experience.userId], references: [users.id] }),
  company: one(companies, { fields: [experience.companiesId], references: [companies.id] }),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  user: one(users, { fields: [availability.userId], references: [users.id] }),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
    employees: many(users),
    jobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
    company: one(companies, { fields: [jobs.companiesId], references: [companies.id] }),
    poster: one(users, { fields: [jobs.userId], references: [users.id] }),
    skills: many(jobSkills),
    applications: many(applications),
}));

export const jobSkillsRelations = relations(jobSkills, ({ one }) => ({
  job: one(jobs, { fields: [jobSkills.jobId], references: [jobs.id] }),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, { fields: [applications.jobId], references: [jobs.id] }),
  user: one(users, { fields: [applications.userId], references: [users.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(users, { fields: [session.userId], references: [users.id] }),
}));
