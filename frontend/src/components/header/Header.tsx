import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Group, Burger, UnstyledButton, Button, Box } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconLogout, IconUser, IconChevronLeft, IconPlus } from "@tabler/icons-react";
import styles from "./Header.module.css";

import BackButton from "../backbutton/BackButton";

function Header({ isMobile }) {
    const [opened, { toggle }] = useDisclosure(false);
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Common links that appear on both mobile and desktop
    const commonLinks = isLoggedIn
        ? [
              {
                  link: "#",
                  label: "Logout",
                  icon: <IconLogout className="w-4 h-4" />,
                  onClick: handleLogout,
                  variant: "ghost",
              },
          ]
        : [
              {
                  link: "/login",
                  label: "Login",
                  icon: <IconUser className="w-4 h-4" />,
                  variant: "ghost",
              },
              {
                  link: "/register",
                  label: "Register",
                  variant: "default",
              },
          ];

    // Desktop-only links for logged-in users
    const desktopLinks = isLoggedIn
        ? [
              {
                  link: "/profile",
                  label: "Profile",
                  icon: <IconUser className="w-4 h-4" />,
                  variant: "ghost",
              },
              {
                  link: "/sell",
                  label: "Sell",
                  icon: <IconPlus className="w-4 h-4" />,
                  variant: "default",
              },
              ...commonLinks,
          ]
        : commonLinks;

    const links = isMobile ? commonLinks : desktopLinks;

    const items = links.map((link) => (
        <a
            key={link.label}
            href={link.link}
            className={styles.link}
        >
            {link.label}
        </a>
    ));

    return (
        <>
            <Group justify="space-between" h="100%">
                <Group>
                    <UnstyledButton component="a" href="/" fw={700} size="xl">
                        Logo
                    </UnstyledButton>
                </Group>
                <Group>{items}</Group>
            </Group>
            <BackButton />
        </>
    );
}

export default Header;
