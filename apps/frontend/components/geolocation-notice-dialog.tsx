"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    GEO_NOTICE_DATE,
    GEO_NOTICE_INTRO,
    GEO_NOTICE_SECTIONS,
    GEO_NOTICE_VERSION,
} from "@/lib/geolocation-notice";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAccept?: () => void;
};

export default function GeolocationNoticeDialog(props: Props) {
    let footer = (
        <Button
            type="button"
            variant="ghost"
            onClick={function () {
                props.onOpenChange(false);
            }}
            className="font-heading font-semibold text-primary hover:bg-accent"
        >
            Fermer
        </Button>
    );

    if (props.onAccept !== undefined) {
        const accept = props.onAccept;
        footer = (
            <>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={function () {
                        props.onOpenChange(false);
                    }}
                    className="font-heading font-semibold text-primary hover:bg-accent"
                >
                    Ne pas activer
                </Button>
                <Button
                    type="button"
                    onClick={function () {
                        accept();
                    }}
                    className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                >
                    J&apos;ai lu et j&apos;active la géolocalisation
                </Button>
            </>
        );
    }

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-heading text-primary">
                        Géolocalisation : mention d&apos;information
                    </DialogTitle>
                    <DialogDescription>{GEO_NOTICE_INTRO}</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-5">
                    {GEO_NOTICE_SECTIONS.map(function (section) {
                        return (
                            <section
                                key={section.title}
                                className="border-l-2 border-primary pl-4"
                            >
                                <h3 className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    {section.title}
                                </h3>
                                <ul className="mt-2 flex flex-col gap-2">
                                    {section.items.map(function (item) {
                                        return (
                                            <li
                                                key={item}
                                                className="text-sm leading-relaxed text-foreground"
                                            >
                                                {item}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>
                        );
                    })}

                    <p className="font-heading text-xs text-muted-foreground">
                        Version {GEO_NOTICE_VERSION} du {GEO_NOTICE_DATE}. Contenu
                        identique à la fiche de registre des activités de traitement du
                        service.
                    </p>
                </div>

                <DialogFooter>{footer}</DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
