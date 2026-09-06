import {Request, Response, NextFunction} from "express";
import {HttpError} from "../types/httpError.js";
import {users, addresses, companies, userSkills, experience, availability, applications, jobs, jobSkills} from "../db/schema.js";
import {db} from "../db/index.js";
import {eq} from "drizzle-orm";

export async function extract(req: Request, res: Response, next: NextFunction)
{
    const userId = Number(req.user!.id);

    const [user] = await db
        .select({
            id: users.id,
            name: users.name,
            rank: users.rank,
            firstname: users.firstname,
            lastname: users.lastname,
            email: users.email,
            emailContact: users.emailContact,
            emailVerified: users.emailVerified,
            address: users.address,
            addressId: users.addressId,
            description: users.description,
            resume: users.resume,
            localisation: users.localisation,
            allowedAt: users.allowedAt,
            lastLoginAt: users.lastLoginAt,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
            companiesId: users.companiesId,
        })
        .from(users)
        .where(eq(users.id, userId));

    if (!user) {
        throw new HttpError(404, "Utilisateur introuvable");
    }

    const [address, company, skills, experiences, availabilities, userApplications] = await Promise.all([
        user.addressId
            ? db.select().from(addresses).where(eq(addresses.id, user.addressId)).then((r: any) => r[0] ?? null)
            : Promise.resolve(null),
        user.companiesId
            ? db.select().from(companies).where(eq(companies.id, user.companiesId)).then((r: any) => r[0] ?? null)
            : Promise.resolve(null),
        db.select().from(userSkills).where(eq(userSkills.userId, userId)),
        db
            .select({
                id: experience.id,
                name: experience.name,
                description: experience.description,
                type: experience.type,
                partTime: experience.partTime,
                start: experience.start,
                end: experience.end,
                company: companies.name,
            })
            .from(experience)
            .leftJoin(companies, eq(experience.companiesId, companies.id))
            .where(eq(experience.userId, userId)),
        db.select().from(availability).where(eq(availability.userId, userId)),
        db
            .select({
                id: applications.id,
                description: applications.description,
                jobId: applications.jobId,
                jobTitle: jobs.title,
                companyName: companies.name,
            })
            .from(applications)
            .leftJoin(jobs, eq(applications.jobId, jobs.id))
            .leftJoin(companies, eq(jobs.companiesId, companies.id))
            .where(eq(applications.userId, userId)),
    ]);

    // Offres postées : uniquement pertinent pour un employeur (rank 0 admin / 1 employer)
    let postedJobs: any[] = [];
    if (user.rank <= 1) {
        const rawJobs = await db.select().from(jobs).where(eq(jobs.userId, userId));
        postedJobs = await Promise.all(
            rawJobs.map(async (job: any) => ({
                ...job,
                skills: await db.select().from(jobSkills).where(eq(jobSkills.jobId, job.id)),
            }))
        );
    }

    res.json({
        exportedAt: new Date().toISOString(),
        user,
        address,
        company,
        skills,
        experiences,
        availabilities,
        applications: userApplications,
        postedJobs,
    });
}
