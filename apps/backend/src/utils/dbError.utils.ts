export function isUniqueViolation(error: any): boolean
{
    if (!error) {
        return false;
    }
    if (error.code === "23505") {
        return true;
    }
    return false;
}
