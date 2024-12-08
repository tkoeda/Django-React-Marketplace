import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Group, Burger, UnstyledButton, Button, Box } from "@mantine/core";
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
    label: string;
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
    }) =>
        onClick ? (
            <Button onClick={onClick} variant={variant} leftSection={icon}>
                {label}
            </Button>
        ) : (
            <Button
                component={Link}
                to={to!} // Non-null assertion since we know it exists when onClick doesn't
                variant={variant}
                leftSection={icon}
            >
                {label}
            </Button>
        );
        
        const navItems = isLoggedIn ? (
        <>
            {!isMobile && (
                <>
                    <NavButton 
                        to="/profile"
                        label="Profile"
                        icon={<IconUser className="w-4 h-4" />}
                    />
                    <NavButton 
                        to="/sell"
                        label="Sell"
                        icon={<IconPlus className="w-4 h-4" />}
                        variant="default"
                    />
                </>
            )}
            <NavButton 
                onClick={handleLogout}
                label="Logout"
                icon={<IconLogout className="w-4 h-4" />}
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
