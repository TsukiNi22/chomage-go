export type UserProfile = {
    id: number;
    firstname: string;
    lastname: string;
    companiesId: number | null;
    emailContact: string | null;
    address: string | null;
    description: string | null;
    resume: string | null;
    rank?: number;
    email?: string;
    emailVerified?: boolean;
    localisation?: boolean;
};

const base = process.env.NEXT_PUBLIC_API_URL || "";

export async function fetchMyProfile(): Promise<UserProfile | null> {
    const response = await fetch(base + "/api/users", {
        credentials: "include",
    });

    if (!response.ok) {
        return null;
    }

    return await response.json();
}
