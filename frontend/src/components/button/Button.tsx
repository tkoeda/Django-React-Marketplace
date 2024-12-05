import styles from "./Button.module.css";
import clsx from "clsx";

interface Props {
    type?: "primary" | "secondary";
    size?: "small" | "medium" | "large";
    children?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
}

function Button({ type, size, children, onClick, disabled = false }: Props) {
    return (
        <div
            className={clsx(
                styles["button-container"],
                styles[size],
                styles[type],
                {
                  [styles.disabled]: disabled,
                }
            )}
        >
            <button onClick={onClick} disabled={disabled}>
                {children}
            </button>
        </div>
    );
}

export default Button;
