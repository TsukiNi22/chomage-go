import type { CompanyListItem } from "@/lib/api";

export type CompanyPin = {
    id: number;
    name: string;
    legalName: string | null;
    siret: string;
    activity: string;
    description: string;
    link: string | null;
    employeeRange: number;
    jobsCount: number;
    addressLabel: string;
    city: string;
    postalCode: string;
    lat: number;
    lon: number;
    located: boolean;
};

export function toCompanyPin(row: CompanyListItem): CompanyPin {
    const address = row.address;

    let lat = 0;
    let lon = 0;
    let located = false;
    if (address && address.latitude !== null && address.longitude !== null) {
        lat = address.latitude;
        lon = address.longitude;
        located = true;
    }

    return {
        id: row.id,
        name: row.name,
        legalName: row.legalName,
        siret: row.siret,
        activity: row.activity || "Non renseignée",
        description: row.description || "",
        link: row.link,
        employeeRange: row.employeeRange,
        jobsCount: row.jobsCount,
        addressLabel: address?.label || "",
        city: address?.city || "",
        postalCode: address?.postalCode || "",
        lat: lat,
        lon: lon,
        located: located,
    };
}

export function locatedCompanies(list: CompanyPin[]): CompanyPin[] {
    return list.filter(function (company) {
        return company.located;
    });
}
