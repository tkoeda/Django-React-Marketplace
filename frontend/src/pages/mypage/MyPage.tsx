import { Button, Container, Group, Paper, Stack, Title } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LISTING_STATUSES = {
    PUBLISHED: 'published',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed'
};

const MyPage = () => {
    const navigate = useNavigate();

    return (
        <Container size="xs">
            <Paper shadow="xs" p="md">
                <Stack>
                    <Group justify="space-between">
                        <Title order={2}>My Page</Title>
                        <Button
                            variant="light"
                            leftSection={<IconLock size={16} />}
                            onClick={() => navigate("/mypage/password")}
                        >
                            Change Password
                        </Button>
                    </Group>

                    <Stack>
                        <Title order={3}>My Listings</Title>
                        <Stack>
                            <Button
                                variant="filled"
                                onClick={() => navigate(`/mypage/listings/${LISTING_STATUSES.PUBLISHED}`)}
                                fullWidth
                            >
                                Published Listings
                            </Button>
                            <Button
                                variant="filled"
                                onClick={() => navigate(`/mypage/listings/${LISTING_STATUSES.IN_PROGRESS}`)}
                                fullWidth
                            >
                                In Progress Listings
                            </Button>
                            <Button
                                variant="filled"
                                onClick={() => navigate(`/mypage/listings/${LISTING_STATUSES.COMPLETED}`)}
                                fullWidth
                            >
                                Completed Listings
                            </Button>
                        </Stack>
                    </Stack>

                    <Stack>
                        <Title order={3}>Other</Title>
                        <Stack>
                            <Button
                                variant="light"
                                onClick={() => navigate("/mypage/liked")}
                                fullWidth
                            >
                                Liked Items
                            </Button>
                            <Button
                                variant="light"
                                onClick={() => navigate("/mypage/purchases")}
                                fullWidth
                            >
                                My Purchases
                            </Button>
                        </Stack>
                    </Stack>
                </Stack>
            </Paper>
        </Container>
    );
};
export default MyPage;
