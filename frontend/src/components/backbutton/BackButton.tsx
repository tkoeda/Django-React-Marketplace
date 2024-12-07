import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";

import styles from "./BackButton.module.css";

function BackButton() {
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show back button on these routes
    const hideBackButtonRoutes = ["/", "/login", "/register", "/logout", "/sell", "/mypage"];

    // Show back button on these paths and their sub-paths
    const showBackButtonPaths = [
        "/sell",
        "/mypage",
        "/listings",
        "/mylistings",
    ];

    const shouldShowBackButton = () => {
        // Don't show on specific routes
        if (hideBackButtonRoutes.includes(location.pathname)) {
            return false;
        }

        // Show if the current path starts with any of the showBackButtonPaths
        return showBackButtonPaths.some((path) =>
            location.pathname.startsWith(path)
        );
    };

    if (!shouldShowBackButton()) {
        return null;
    }

    return (
        <Button
            variant="subtle"
            leftSection={<IconChevronLeft size={18} />}
            onClick={() => navigate(-1)}
            className={styles.backButton}
        ></Button>
    );
}

export default BackButton;
