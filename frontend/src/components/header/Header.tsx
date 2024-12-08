import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Group, ActionIcon, UnstyledButton, Button } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
    IconLogout,
    IconUser,
    IconChevronLeft,
    IconPlus,
} from "@tabler/icons-react";
import styles from "./Header.module.css";

import BackButton from "../backbutton/BackButton";

interface HeaderProps {
    isMobile: boolean;
}

interface NavButtonProps {
    to?: string;
    onClick?: () => void;
    label?: string;
    icon?: React.ReactNode;
    variant?: string;
}

function Header({ isMobile }: HeaderProps) {
    const [opened, { toggle }] = useDisclosure(false);
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const NavButton: React.FC<NavButtonProps> = ({
        to,
        onClick,
        label,
        icon,
        variant = "ghost",
    }) => {
        if (!label) {
            // Use ActionIcon for icon-only buttons
            if (onClick) {
                return (
                    <ActionIcon onClick={onClick} variant={variant} size="lg">
                        {icon}
                    </ActionIcon>
                );
            }
            return (
                <ActionIcon
                    component={Link}
                    to={to!}
                    variant={variant}
                    size="lg"
                >
                    {icon}
                </ActionIcon>
            );
        }

        // Use regular Button when there's a label
        if (onClick) {
            return (
                <Button onClick={onClick} variant={variant} leftSection={icon}>
                    {label}
                </Button>
            );
        }

        return (
            <Button
                component={Link}
                to={to!}
                variant={variant}
                leftSection={icon}
            >
                {label}
            </Button>
        );
    };

    const navItems = isLoggedIn ? (
        <>
            {!isMobile && (
                <>
                    <NavButton to="/mypage" icon={<IconUser />} />
                    <NavButton
                        to="/sell"
                        label="Sell"
                        variant="default"
                    />
                </>
            )}
            <NavButton
                onClick={handleLogout}
                label="Logout"
                icon={<IconLogout />}
            />
        </>
    ) : (
        <>
            <NavButton to="/login" label="Login" />
            <NavButton to="/register" label="Register" variant="default" />
        </>
    );

    return (
        <>
            <Group justify="space-between" h="100%">
                <Group>
                    <UnstyledButton component="a" href="/" fw={700} size="xl">
                        Logo
                    </UnstyledButton>
                </Group>
                <Group>{navItems}</Group>
            </Group>
            <BackButton />
        </>
    );
}

export default Header;
