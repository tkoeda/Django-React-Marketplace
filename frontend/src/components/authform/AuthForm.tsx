import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    TextInput,
    PasswordInput,
    Paper,
    Title,
    Container,
    Button,
    Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import api from "../../api";
import * as jwtDecode from "jwt-decode";
import { useAuth } from "../../context/AuthContext";

interface AuthFormProps {
    route: string;
    method: "login" | "register";
}

function AuthForm({ route, method }: AuthFormProps) {
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const name = method === "login" ? "Login" : "Register";

    const form = useForm({
        initialValues: {
            username: "",
            password: "",
        },
        validate: {
            username: (value) =>
                value.length < 2
                    ? "Username must have at least 2 characters"
                    : null,
            password: (value) =>
                value.length < 2
                    ? "Password must have at least 6 characters"
                    : null,
        },
        validateInputOnBlur: true,
    });

    const handleSubmit = async (values: {
        username: string;
        password: string;
    }) => {
        setLoading(true);
        setGlobalError(null);
        form.clearErrors();

        try {
            const res = await api.post(route, values);

            if (method === "login") {
                const decoded = jwtDecode.jwtDecode(res.data.access);
                login(res.data.access, res.data.refresh, decoded.user_id);
                const from = location.state?.from || "/";
                navigate(from);
            } else {
                navigate("/login");
            }
        } catch (error: any) {
            if (error.response?.data) {
                const errors = error.response.data;

                if (errors.detail || errors.non_field_errors) {
                    setGlobalError(errors.detail || errors.non_field_errors[0]);
                    return;
                }

                Object.entries(errors).forEach(([field, messages]) => {
                    const message = Array.isArray(messages)
                        ? messages[0]
                        : messages;

                    if (field in form.values) {
                        form.setFieldError(field, message);
                    } else {
                        setGlobalError(message);
                    }
                });
            } else {
                setGlobalError(
                    error.message ||
                        "An unexpected error occurred. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size={420} my={40}>
            <Title order={2} mb={30}>
                {name}
            </Title>

            <Paper withBorder shadow="md" p={30} radius="md">
                {globalError && (
                    <Alert
                        icon={<IconAlertCircle size={16} />}
                        title="Error"
                        color="red"
                        mb="md"
                        variant="filled"
                    >
                        {globalError}
                    </Alert>
                )}

                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <TextInput
                        label="Username"
                        placeholder="Your username"
                        required
                        error={form.errors.username}
                        {...form.getInputProps("username")}
                    />

                    <PasswordInput
                        label="Password"
                        placeholder="Your password"
                        required
                        mt="md"
                        error={form.errors.password}
                        {...form.getInputProps("password")}
                    />

                    <Button
                        fullWidth
                        mt="xl"
                        color="var(--color-background-attention)"
                        type="submit"
                        loading={loading}
                        disabled={!form.isValid()}
                    >
                        {name}
                    </Button>
                </form>
            </Paper>
        </Container>
    );
}

export default AuthForm;
