const RESUME_PATTERN = /^data:application\/pdf;base64,[A-Za-z0-9+/=]+$/;

export function isSafeResume(value: string | null | undefined): boolean {
    if (!value) {
        return false;
    }
    return RESUME_PATTERN.test(value);
}

export function safeResume(value: string | null | undefined): string | null {
    if (!isSafeResume(value)) {
        return null;
    }
    return value as string;
}

/**
 * Ouvre un CV dans un nouvel onglet.
 * Les URL `data:` étant bloquées par les navigateurs en navigation de premier niveau,
 * le PDF est reconstruit en Blob avant d'être affiché.
 */
export function openResume(value: string | null | undefined): boolean {
    const resume = safeResume(value);
    if (resume === null) {
        return false;
    }

    const base64 = resume.slice(resume.indexOf(",") + 1);

    let bytes;
    try {
        const binary = atob(base64);
        bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
    } catch {
        return false;
    }

    const url = URL.createObjectURL(
        new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }),
    );
    const opened = window.open(url, "_blank", "noopener");

    // Le navigateur garde la main sur l'onglet ouvert : on libère l'URL un peu plus tard.
    setTimeout(function () {
        URL.revokeObjectURL(url);
    }, 60000);

    return opened !== null;
}
