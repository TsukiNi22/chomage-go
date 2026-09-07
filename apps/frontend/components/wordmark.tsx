type Props = {
    compact?: boolean;
};

export default function Wordmark(props: Props) {
    let sizeClass = "text-xl";
    if (props.compact === true) {
        sizeClass = "text-base";
    }

    return (
        <span
            className={
                "font-heading font-extrabold tracking-tight text-primary " + sizeClass
            }
        >
            Chômage
            <span className="text-action-text">Go</span>
        </span>
    );
}
