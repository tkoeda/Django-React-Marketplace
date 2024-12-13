import { useState } from "react";
import { AppShell, Container, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Header from "../header/Header";
import BottomNavigation from "../bottomnavigation/BottomNavigation";
import styles from "./Navbar.module.css";

function Navbar({ children }) {
    const [opened, setOpened] = useState(false);
    const theme = useMantineTheme();

    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

    return (
        <AppShell>
            <AppShell.Header className={styles.header}>
                <Header isMobile={isMobile}/>
            </AppShell.Header>

            <AppShell.Main>
                <Container size="xl">{children}</Container>
            </AppShell.Main>
            { isMobile && <BottomNavigation />}
        </AppShell>
    );
}

export default Navbar;
