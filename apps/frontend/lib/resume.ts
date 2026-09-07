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
