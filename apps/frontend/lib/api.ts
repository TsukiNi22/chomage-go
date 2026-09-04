import { API_URL } from "./env";

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

export async function fetchMyProfile(): Promise<UserProfile | null> {
    const response = await fetch(API_URL + "/api/users", {
        credentials: "include",
    });

    if (!response.ok) {
        return null;
    }

    return await response.json();
}
