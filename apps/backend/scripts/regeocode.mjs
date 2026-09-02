import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const JOBS_FILE =
    process.env.JOBS_FILE ||
    path.join(root, "..", "frontend", "lib", "jobs.json");
const STATE_DIR = path.join(root, ".geocode");
const CHECKPOINT_FILE = path.join(STATE_DIR, "checkpoint.json");
const REPORT_FILE = path.join(STATE_DIR, "rapport-ecarts.md");

const ENDPOINT = "https://api-adresse.data.gouv.fr/search/csv/";
const SOURCE = "api-adresse.data.gouv.fr";
const BATCH_SIZE = 100;
const PAUSE_MS = 1200;
const MAX_ATTEMPTS = 4;
const MIN_SCORE = 0.5;
const ACCEPTED_TYPES = ["housenumber", "street"];

function log(message) {
    const now = new Date().toISOString().slice(11, 19);
    console.log("[" + now + "] " + message);
}

function sleep(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

function distanceInMeters(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toLambert93(lat, lon) {
    const a = 6378137.0;
    const e = 0.0818191910428158;
    const n = 0.7256077650532670;
    const c = 11754255.426096;
    const xs = 700000.0;
    const ys = 12655612.049876;

    const phi = (lat * Math.PI) / 180;
    const lambda = (lon * Math.PI) / 180;
    const lambda0 = (3 * Math.PI) / 180;

    const sinPhi = Math.sin(phi);
    const latIso =
        Math.log(Math.tan(Math.PI / 4 + phi / 2)) -
        (e / 2) * Math.log((1 + e * sinPhi) / (1 - e * sinPhi));

    const r = c * Math.exp(-n * latIso);
    const gamma = n * (lambda - lambda0);

    return {
        x: Math.round((xs + r * Math.sin(gamma)) * 100) / 100,
        y: Math.round((ys - r * Math.cos(gamma)) * 100) / 100,
    };
}

function csvEscape(value) {
    const text = String(value === null || value === undefined ? "" : value);
    if (text.includes('"') || text.includes(",") || text.includes("\n")) {
        return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
}

function parseCsvLine(line) {
    const cells = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (inQuotes) {
            if (char === '"') {
                if (line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                current += char;
            }
        } else if (char === '"') {
            inQuotes = true;
        } else if (char === ",") {
            cells.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    cells.push(current);
    return cells;
}

function parseCsv(text) {
    const lines = text.trim().split("\n");
    const header = parseCsvLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const cells = parseCsvLine(lines[i]);
        const row = {};
        for (let j = 0; j < header.length; j++) {
            row[header[j]] = cells[j];
        }
        rows.push(row);
    }
    return rows;
}

function buildCsv(batch) {
    let csv = "id,adresse,ville,cp\n";
    for (const job of batch) {
        csv +=
            csvEscape(job.id) +
            "," +
            csvEscape(job.address) +
            "," +
            csvEscape(job.city) +
            "," +
            csvEscape(job.postalCode) +
            "\n";
    }
    return csv;
}

async function geocodeBatch(batch, batchNumber) {
    const csv = buildCsv(batch);

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const form = new FormData();
        form.append("data", new Blob([csv], { type: "text/csv" }), "lot.csv");
        form.append("columns", "adresse");
        form.append("columns", "ville");
        form.append("postcode", "cp");

        let response;
        try {
            response = await fetch(ENDPOINT, {
                method: "POST",
                body: form,
                headers: { "User-Agent": "GeoEmploi/0.1 (Ministere du Job et Bonheur)" },
            });
        } catch (error) {
            log("  lot " + batchNumber + " : reseau injoignable (" + error.message + ")");
            response = null;
        }

        if (response !== null && response.ok) {
            return parseCsv(await response.text());
        }

        const status = response === null ? "reseau" : response.status;
        const wait = PAUSE_MS * Math.pow(2, attempt);
        log(
            "  lot " +
                batchNumber +
                " : echec (" +
                status +
                "), tentative " +
                attempt +
                "/" +
                MAX_ATTEMPTS +
                ", nouvelle tentative dans " +
                Math.round(wait / 1000) +
                " s",
        );
        await sleep(wait);
    }

    throw new Error("lot " + batchNumber + " : abandon apres " + MAX_ATTEMPTS + " tentatives");
}

function isResolved(result) {
    if (result.apiStatus !== "ok") {
        return false;
    }
    if (result.lat === null || result.lon === null || result.score === null) {
        return false;
    }
    if (result.score < MIN_SCORE) {
        return false;
    }
    return ACCEPTED_TYPES.includes(result.type);
}

function loadCheckpoint() {
    if (!existsSync(CHECKPOINT_FILE)) {
        return {};
    }
    try {
        return JSON.parse(readFileSync(CHECKPOINT_FILE, "utf8"));
    } catch {
        log("point de reprise illisible, on repart de zero");
        return {};
    }
}

function saveCheckpoint(checkpoint) {
    mkdirSync(STATE_DIR, { recursive: true });
    const tmp = CHECKPOINT_FILE + ".tmp";
    writeFileSync(tmp, JSON.stringify(checkpoint, null, 2));
    writeFileSync(CHECKPOINT_FILE, readFileSync(tmp));
}

function buildReport(jobs, checkpoint, stats, durationMs) {
    const moves = [];

    for (const job of jobs) {
        const result = checkpoint[job.id];
        if (result === undefined || !isResolved(result)) {
            continue;
        }
        if (result.previousLat === null || result.previousLon === null) {
            continue;
        }
        moves.push({
            id: job.id,
            address: job.address + ", " + job.postalCode + " " + job.city,
            label: result.label,
            score: result.score,
            meters: distanceInMeters(
                result.previousLat,
                result.previousLon,
                result.lat,
                result.lon,
            ),
        });
    }

    let sum = 0;
    for (const move of moves) {
        sum += move.meters;
    }
    const average = moves.length === 0 ? 0 : sum / moves.length;

    moves.sort(function (a, b) {
        return b.meters - a.meters;
    });
    const top = moves.slice(0, 5);

    let md = "# Relevé d'écarts — reprise du géocodage\n\n";
    md += "Source : " + SOURCE + "  \n";
    md += "Exécutée le : " + new Date().toISOString().slice(0, 19).replace("T", " ") + "  \n";
    md += "Durée : " + (durationMs / 1000).toFixed(1) + " s\n\n";
    md += "## Chiffres\n\n";
    md += "| Indicateur | Valeur |\n|---|---|\n";
    md += "| Offres traitées | " + stats.total + " |\n";
    md += "| Regéocodées avec succès | " + stats.ok + " |\n";
    md += "| En échec (localisation à vérifier) | " + stats.failed + " |\n";
    md += "| Score faible (< " + MIN_SCORE + ") | " + stats.lowScore + " |\n";
    md += "| Déplacement moyen | " + Math.round(average) + " m |\n\n";
    md += "## Les cinq plus grands déplacements\n\n";
    md += "| Offre | Adresse d'origine | Adresse retenue par l'API | Score | Écart |\n";
    md += "|---|---|---|---|---|\n";

    for (const move of top) {
        md +=
            "| #" +
            move.id +
            " | " +
            move.address +
            " | " +
            move.label +
            " | " +
            move.score.toFixed(2) +
            " | " +
            Math.round(move.meters) +
            " m |\n";
    }

    md += "\n## Offres en localisation à vérifier\n\n";
    const failures = jobs.filter(function (job) {
        const result = checkpoint[job.id];
        return result !== undefined && !isResolved(result);
    });

    if (failures.length === 0) {
        md += "Aucune.\n";
    } else {
        md += "| Offre | Adresse non résolue |\n|---|---|\n";
        for (const job of failures.slice(0, 20)) {
            md += "| #" + job.id + " | " + job.address + ", " + job.postalCode + " " + job.city + " |\n";
        }
        if (failures.length > 20) {
            md += "\n" + (failures.length - 20) + " autres non listées ici.\n";
        }
    }

    mkdirSync(STATE_DIR, { recursive: true });
    writeFileSync(REPORT_FILE, md);
    return { average: average, top: top, failures: failures.length };
}

async function main() {
    const startedAt = Date.now();
    const jobs = JSON.parse(readFileSync(JOBS_FILE, "utf8"));
    const checkpoint = loadCheckpoint();

    const pending = jobs.filter(function (job) {
        return checkpoint[job.id] === undefined;
    });

    log("offres en base : " + jobs.length);
    log("deja reprises  : " + (jobs.length - pending.length));
    log("a reprendre    : " + pending.length);

    if (pending.length === 0) {
        log("rien a reprendre, on passe directement au rapport");
    }

    let batchNumber = 0;
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
        batchNumber++;
        const batch = pending.slice(i, i + BATCH_SIZE);
        log("lot " + batchNumber + " : " + batch.length + " adresses envoyees");

        const rows = await geocodeBatch(batch, batchNumber);
        const geocodedAt = new Date().toISOString().slice(0, 10);

        for (const row of rows) {
            const id = Number(row.id);
            const job = jobs.find(function (candidate) {
                return candidate.id === id;
            });
            if (job === undefined) {
                continue;
            }

            const lat = Number(row.latitude);
            const lon = Number(row.longitude);
            const score = Number(row.result_score);

            checkpoint[id] = {
                apiStatus: row.result_status,
                lat: Number.isFinite(lat) ? lat : null,
                lon: Number.isFinite(lon) ? lon : null,
                score: Number.isFinite(score) ? score : null,
                label: row.result_label || "",
                type: row.result_type || "",
                previousLat: job.lat,
                previousLon: job.lon,
                geocodedAt: geocodedAt,
            };
        }

        saveCheckpoint(checkpoint);
        log("lot " + batchNumber + " : point de reprise enregistre");

        if (i + BATCH_SIZE < pending.length) {
            await sleep(PAUSE_MS);
        }
    }

    const stats = { total: 0, ok: 0, failed: 0, lowScore: 0 };

    for (const job of jobs) {
        const result = checkpoint[job.id];
        if (result === undefined) {
            continue;
        }
        stats.total++;

        if (isResolved(result)) {
            stats.ok++;
            const lambert = toLambert93(result.lat, result.lon);
            job.lat = Math.round(result.lat * 100000) / 100000;
            job.lon = Math.round(result.lon * 100000) / 100000;
            job.lambertX = lambert.x;
            job.lambertY = lambert.y;
            job.geocodingSource = SOURCE;
            job.geocodingScore = Math.round(result.score * 1000) / 1000;
            job.geocodedAt = result.geocodedAt;
            job.needsLocationCheck = false;
        } else {
            stats.failed++;
            if (result.apiStatus === "ok") {
                stats.lowScore++;
            }
            job.lambertX = null;
            job.lambertY = null;
            job.geocodingSource = null;
            job.geocodingScore = result.score;
            job.geocodedAt = result.geocodedAt;
            job.needsLocationCheck = true;
        }
    }

    writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 4) + "\n");

    const durationMs = Date.now() - startedAt;
    const report = buildReport(jobs, checkpoint, stats, durationMs);

    console.log("");
    console.log("Reprise du geocodage - " + SOURCE);
    console.log("  offres traitees          : " + stats.total);
    console.log("  regeocodees              : " + stats.ok);
    console.log("  localisation a verifier  : " + stats.failed);
    console.log("  dont score insuffisant   : " + stats.lowScore);
    console.log("  deplacement moyen        : " + Math.round(report.average) + " m");
    console.log("  duree                    : " + (durationMs / 1000).toFixed(1) + " s");
    console.log("  rapport                  : " + path.relative(root, REPORT_FILE));
}

main().catch(function (error) {
    console.error("");
    console.error("ECHEC : " + error.message);
    console.error("Le point de reprise est conserve. Relancez la commande pour reprendre.");
    process.exit(1);
});
