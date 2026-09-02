export type ContractType = "CDI" | "CDD" | "Alternance" | "Stage" | "Freelance";

export type EmployerJobPosting = {
    id: number;
    title: string;
    description: string;
    contractType: ContractType;
    requiredSkills: string[];
    salaryMin: number;
    applicantsCount: number;
};

export const employerJobPostings: EmployerJobPosting[] = [
    {
        id: 1,
        title: "Développeur Full-stack",
        description: "Développement d'une plateforme web avec React et Node.js.",
        contractType: "CDI",
        requiredSkills: ["React", "Node.js", "TypeScript"],
        salaryMin: 38000,
        applicantsCount: 12,
    },
    {
        id: 2,
        title: "Designer UX/UI",
        description: "Conception d'interfaces pour nos applications mobiles.",
        contractType: "CDD",
        requiredSkills: ["Figma", "Design System"],
        salaryMin: 32000,
        applicantsCount: 7,
    },
    {
        id: 3,
        title: "Stage Développement Back-end",
        description: "Participation au développement de l'API interne.",
        contractType: "Stage",
        requiredSkills: ["Python", "PostgreSQL"],
        salaryMin: 1200,
        applicantsCount: 21,
    },
];
