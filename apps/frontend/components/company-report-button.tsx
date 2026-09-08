"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import ReportDialog from "@/components/report-dialog";
import { authClient } from "@/lib/auth-client";

type Props = {
    companyId: number;
    companyName: string;
};

export default function CompanyReportButton(props: Props) {
    const { data: session } = authClient.useSession();
    const [open, setOpen] = useState(false);

    if (!session) {
        return null;
    }

    return (
        <>
            <button
                type="button"
                onClick={function () {
                    setOpen(true);
                }}
                className="flex items-center gap-1.5 font-heading text-sm font-medium text-destructive underline underline-offset-4 hover:no-underline"
            >
                <Flag className="h-3.5 w-3.5" />
                Signaler cette entreprise
            </button>

            <ReportDialog
                open={open}
                onClose={function () {
                    setOpen(false);
                }}
                companyId={props.companyId}
                subject={props.companyName}
            />
        </>
    );
}
