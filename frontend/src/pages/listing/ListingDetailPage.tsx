import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { notifications } from '@mantine/notifications';
import {
    Container,
    Paper,
    Title,
    Text,
    Group,
    Stack,
    Button,
    Badge,
    Loader,
    Center,
    Card,
    Grid,
} from "@mantine/core";
import { Carousel } from '@mantine/carousel';
import { IconEdit, IconEyeOff } from "@tabler/icons-react";
import api from "../../api";
import PurchaseButton from "../../components/purchasebutton/PurchaseButton";

function ListingDetailPage() {
    const [listing, setListing] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const navigate = useNavigate();
    const { listing_id } = useParams();

    useEffect(() => {
        const storedUserId = localStorage.getItem("user_id");
        setCurrentUserId(storedUserId);
        fetchListing();
    }, [listing_id]);

    const fetchListing = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/api/listings/${listing_id}/`);
            setListing(response.data);
        } catch (error) {
            console.error("Error fetching listing:", error);
            notifications.show({
                title: 'Error',
                message: 'Failed to load listing details',
                color: 'red',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (action) => {
        try {
            if (action === "edit") {
                navigate(`/sell/edit/${listing_id}`);
            } else if (action === "unpublish") {
                await api.patch(`/api/listings/${listing_id}/`, {
                    status: "draft",
                });
                navigate(`/mypage/listings/published`);
                notifications.show({
                    title: 'Success',
                    message: 'Listing unpublished successfully',
                    color: 'green',
                });
            }
        } catch (error) {
            console.error(`Error ${action === "edit" ? "editing" : "unpublishing"} listing:`, error);
            notifications.show({
                title: 'Error',
                message: `Error ${action === "edit" ? "editing" : "unpublishing"} listing. Please try again.`,
                color: 'red',
            });
        }
    };

    const handlePurchaseSuccess = () => {
        navigate("/");
    };

    if (isLoading) {
        return (
            <Center h={400}>
                <Loader size="lg" />
            </Center>
        );
    }

    const isOwner = currentUserId === listing.seller?.id?.toString();

    return (
        <Container size="xl" py="xl">
            <Card shadow="sm" padding="xl" radius="md" withBorder>
                <Grid gutter="xl">
                    {/* Left side - Images */}
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Paper withBorder radius="md" p="xs">
                            <Carousel
                                withIndicators
                                height={500}
                                slideSize="100%"
                                slideGap="md"
                                loop
                                align="start"
                                styles={{
                                    indicator: {
                                        width: 12,
                                        height: 4,
                                        transition: 'width 250ms ease',
                                        '&[data-active]': {
                                            width: 40,
                                        },
                                    },
                                }}
                            >
                                {listing.images?.map((image, index) => (
                                    <Carousel.Slide key={index}>
                                        <img
                                            src={image.image_url}
                                            alt={`${listing.title} - Image ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                backgroundColor: '#f8f9fa',
                                            }}
                                        />
                                    </Carousel.Slide>
                                ))}
                            </Carousel>
                        </Paper>
                    </Grid.Col>

                    {/* Right side - Information */}
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Stack>
                            <Group justify="space-between" align="flex-start">
                                <Stack>
                                    <Title order={2}>{listing.title}</Title>
                                    <Badge size="lg">
                                        {listing.condition_display}
                                    </Badge>
                                </Stack>
                                <Text size="xl" fw={700} style={{ fontSize: '2rem' }}>
                                    ${listing.price}
                                </Text>
                            </Group>

                            <Stack>
                                <Title order={3}>Description</Title>
                                <Text size="md" style={{ whiteSpace: 'pre-line' }}>
                                    {listing.description}
                                </Text>
                            </Stack>

                            {/* Action Buttons */}
                            <Group mt="auto">
                                {isOwner ? (
                                    <>
                                        <Button
                                            leftSection={<IconEdit size={16} />}
                                            onClick={() => handleSubmit("edit")}
                                            variant="filled"
                                            color="blue"
                                            size="lg"
                                            fullWidth
                                        >
                                            Edit Listing
                                        </Button>
                                        <Button
                                            leftSection={<IconEyeOff size={16} />}
                                            onClick={() => handleSubmit("unpublish")}
                                            variant="light"
                                            color="red"
                                            size="lg"
                                            fullWidth
                                        >
                                            Unpublish
                                        </Button>
                                    </>
                                ) : (
                                    <PurchaseButton
                                        listingId={listing.id}
                                        onPurchaseSuccess={handlePurchaseSuccess}
                                    />
                                )}
                            </Group>
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Card>
        </Container>
    );
}

export default ListingDetailPage;
