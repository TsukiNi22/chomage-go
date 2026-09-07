import { execSync } from "child_process";
import { writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";

const OUT = "apps/frontend/lib/changelog.json";

const TYPES = {
    feat: "Nouveauté",
    fix: "Correction",
    docs: "Documentation",
    refactor: "Refonte",
    perf: "Performance",
    test: "Tests",
    chore: "Maintenance",
    style: "Présentation",
    build: "Build",
    ci: "Intégration",
};

function readLog() {
    try {
        return execSync(
            'git log --pretty=format:%h%x1f%ad%x1f%an%x1f%s --date=short --no-merges -200',
            { encoding: "utf8" },
        );
    } catch {
        return "";
    }
}

function parse(line) {
    const [hash, date, author, subject] = line.split("\x1f");

    let type = "Divers";
    let scope = null;
    let title = subject;

    const match = subject.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/);
    if (match) {
        const label = TYPES[match[1]];
        if (label !== undefined) {
            type = label;
        }
        if (match[2] !== undefined) {
            scope = match[2];
        }
        title = match[3];
    }

    title = title.charAt(0).toUpperCase() + title.slice(1);

    return { hash, date, author, type, scope, title };
}

const raw = readLog();
const entries = [];

if (raw !== "") {
    for (const line of raw.split("\n")) {
        if (line.trim() !== "") {
            entries.push(parse(line));
        }
    }
}

const days = [];
for (const entry of entries) {
    let day = days.find(function (item) {
        return item.date === entry.date;
    });
    if (day === undefined) {
        day = { date: entry.date, entries: [] };
        days.push(day);
    }
    day.entries.push(entry);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), days }, null, 2));
console.log("[changelog]", entries.length, "commits sur", days.length, "jours ->", OUT);
