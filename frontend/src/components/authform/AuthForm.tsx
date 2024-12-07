import { useState } from "react";
import { TextInput, PasswordInput, Paper, Title, Container, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import api from "../../api";
import { useNavigate } from "react-router-dom";
import * as jwtDecode from "jwt-decode";
import { useAuth } from "../../context/AuthContext";

interface AuthFormProps {
    route: string;
    method: 'login' | 'register';
}

function AuthForm({ route, method }: AuthFormProps) {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    
    const name = method === "login" ? "Login" : "Register";

    const form = useForm({
        initialValues: {
            username: '',
            password: '',
        },
        
        validate: {
            username: (value) => (value.length < 2 ? 'Username must have at least 2 characters' : null),
            password: (value) => (value.length < 2 ? 'Password must have at least 6 characters' : null),
        },
    });

    const handleSubmit = async (values: { username: string; password: string }) => {
        setLoading(true);
        
        try {
            const res = await api.post(route, values);
            if (method === "login") {
                const decoded = jwtDecode.jwtDecode(res.data.access);
                login(res.data.access, res.data.refresh, decoded.user_id);
                navigate("/");
            } else {
                navigate("/login");
            }
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size={420} my={40}>
            <Title align="center" order={2} mb={30}>
                {name}
            </Title>

            <Paper withBorder shadow="md" p={30} radius="md">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <TextInput
                        label="Username"
                        placeholder="Your username"
                        required
                        {...form.getInputProps('username')}
                    />

                    <PasswordInput
                        label="Password"
                        placeholder="Your password"
                        required
                        mt="md"
                        {...form.getInputProps('password')}
                    />

                    <Button
                        fullWidth
                        mt="xl"
                        color="var(--color-background-attention)"
                        type="submit"
                        loading={loading}
                    >
                        {name}
                    </Button>
                </form>
            </Paper>
        </Container>
    );
}

export default AuthForm;
