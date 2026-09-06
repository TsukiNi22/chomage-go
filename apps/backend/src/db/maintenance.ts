import {db} from "./index.js";
import {users, jobs, jobsArchive, jobSkills, jobSkillsArchive} from "./schema.js";
import {lt, sql, eq} from "drizzle-orm";

const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function purgeInactiveUsers()
{
    const cutoff = new Date(Date.now() - TWO_YEARS_MS);

    const deleted = await db
        .delete(users)
        .where(lt(users.lastLoginAt, cutoff))
        .returning({ id: users.id });

    console.log(`[cleanup] ${deleted.length} compte(s) inactif(s) supprimé(s)`);
    return deleted.length;
}

export async function archiveOldJobs()
{
    const cutoff = new Date(Date.now() - THIRTY_DAYS_MS);

    const oldJobs = await db.select().from(jobs).where(lt(jobs.createdAt, cutoff));

    for (const job of oldJobs) {
        await db.transaction(async (tx: any) => {
            const [archived] = await tx
                .insert(jobsArchive)
                .values({
                    originalJobId: job.id,
                    companiesId: job.companiesId,
                    userId: job.userId,
                    addressId: job.addressId,
                    title: job.title,
                    description: job.description,
                    type: job.type,
                    salaryMin: job.salaryMin,
                    salaryMax: job.salaryMax,
                    createdAt: job.createdAt,
                })
                .returning({ id: jobsArchive.id });

            const skills = await tx.select().from(jobSkills).where(eq(jobSkills.jobId, job.id));
            if (skills.length > 0) {
                await tx.insert(jobSkillsArchive).values(
                    skills.map((s: any) => ({
                        jobArchiveId: archived.id,
                        name: s.name,
                        description: s.description,
                    }))
                );
            }

            // Supprime l'offre d'origine (cascade -> job_skills, applications)
            await tx.delete(jobs).where(eq(jobs.id, job.id));
        });
    }

    console.log(`[cleanup] ${oldJobs.length} offre(s) archivée(s)`);
    return oldJobs.length;
}

export async function purgeOldArchives()
{
    const cutoff = new Date(Date.now() - TWO_YEARS_MS);

    const deleted = await db
        .delete(jobsArchive)
        .where(lt(jobsArchive.archivedAt, cutoff))
        .returning({ id: jobsArchive.id });

    console.log(`[cleanup] ${deleted.length} offre(s) archivée(s) purgée(s)`);
    return deleted.length;
}

export async function runDailyMaintenance()
{
    await archiveOldJobs();
    await purgeOldArchives();
    await purgeInactiveUsers();
}
