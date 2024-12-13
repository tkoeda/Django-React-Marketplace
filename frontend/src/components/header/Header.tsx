import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Group, ActionIcon, UnstyledButton, Button } from "@mantine/core";
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
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
    };

    const handleSellClick = () => {
        if (!isLoggedIn) {
            navigate("/login", { state: { from: "/sell" } });
        } else {
            navigate("/sell");
        }
    };

    const NavButton: React.FC<NavButtonProps> = ({
        to,
        onClick,
        label,
        icon,
        variant = "ghost",
    }) => {
        if (!label) {
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

    const navItems = (
        <>
            {isLoggedIn ? (
                <NavButton
                    onClick={handleLogout}
                    label="Logout"
                    icon={<IconLogout />}
                />
            ) : (
                <>
                    <NavButton to="/login" label="Login" />
                    <NavButton to="/register" label="Register" variant="default" />
                </>
            )}
            {!isMobile && (
                <>
                    {isLoggedIn && <NavButton to="/mypage" icon={<IconUser />} />}
                    <NavButton
                        onClick={handleSellClick}
                        label="Sell"
                        variant="default"
                    />
                </>
            )}
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
