/**
 * Cache court des reponses publiques couteuses.
 *
 * Le profilage V8 de GET /api/jobs montre que le temps CPU par requete est
 * domine par du travail rigoureusement identique d'un visiteur a l'autre :
 * mapping Drizzle des 501 lignes et de leurs relations (18 % du CPU),
 * serialisation JSON des ~550 Ko (12 %) et le GC que ces allocations
 * declenchent (6 %). On memorise donc la reponse deja serialisee.
 *
 * Seules les reponses publiques (non administrateur) sont memorisees : un
 * administrateur voit aussi le contenu modere, sa vue ne doit jamais etre
 * servie a un visiteur.
 */

export const PUBLIC_CACHE_TTL_MS = 30_000;

type Entry = {
    body: string;
    expiresAt: number;
};

const entries = new Map<string, Entry>();

/** Reponse memorisee encore valide, sinon null. */
export function readPublicCache(key: string, now: number = Date.now()): string | null
{
    const entry = entries.get(key);
    if (entry === undefined) {
        return null;
    }
    if (entry.expiresAt <= now) {
        entries.delete(key);
        return null;
    }
    return entry.body;
}

export function writePublicCache(key: string, body: string, now: number = Date.now())
{
    entries.set(key, {body: body, expiresAt: now + PUBLIC_CACHE_TTL_MS});
}

/**
 * A appeler des qu'une ecriture change ce que le public doit voir : publication
 * ou retrait d'une offre, moderation d'un compte ou d'une entreprise.
 */
export function invalidatePublicCache(key: string)
{
    entries.delete(key);
}

/** Utilise par les tests pour repartir d'un etat connu. */
export function clearPublicCache()
{
    entries.clear();
}

export const JOBS_CACHE_KEY = "jobs:public";
