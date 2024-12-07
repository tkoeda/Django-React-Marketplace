import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";

import "@mantine/dropzone/styles.css";

import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Home from "./pages/home/Home";
import NotFound from "./pages/notfound/NotFound";
import ProtectedRoute from "./components/protectedroute/ProtectedRoute";
import MyPage from "./pages/mypage/MyPage";
import ListingForm from "./components/listingform/ListingForm";
import Sell from "./pages/sell/Sell";
import TabBar from "./components/tabbar/TabBar";
import ListingDetailPage from "./pages/listing/ListingDetailPage";
import DraftListings from "./pages/draftlistings/DraftListings";
import Header from "./components/header/Header";
import ListingsPage from "./components/listingspage/ListingsPage";
import Navbar from "./components/navbar/Navbar";
import "./styles/base/global.css";

function Logout() {
    localStorage.clear();
    return <Navigate to="/login" />;
}

function RegisterAndLogout() {
    localStorage.clear();
    return <Register />;
}

function ConditionalTabBar() {
    const location = useLocation();
    const showTabBarPaths = ["/", "/mypage", "/sell"];

    return showTabBarPaths.some((path) =>
        location.pathname.startsWith(path)
    ) ? (
        <TabBar />
    ) : null;
}

function App() {
    return (
        <MantineProvider defaultColorScheme="dark">
            <BrowserRouter>
                <AuthProvider>
                    <Navbar>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route
                                path="/register"
                                element={<RegisterAndLogout />}
                            />
                            <Route path="/logout" element={<Logout />} />
                            <Route path="*" element={<NotFound />} />
                            <Route
                                path="/listings/:listing_id"
                                element={<ListingDetailPage />}
                            />
                            {/* Protected Routes */}
                            <Route
                                path="/mypage"
                                element={
                                    <ProtectedRoute>
                                        <MyPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/mypage/listings/:status"
                                element={
                                    <ProtectedRoute>
                                        <ListingsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/sell" element={<Sell />} />
                            <Route
                                path="/sell/create"
                                element={
                                    <ProtectedRoute>
                                        <ListingForm />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/sell/drafts"
                                element={
                                    <ProtectedRoute>
                                        <DraftListings />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/sell/edit/:listing_id"
                                element={
                                    <ProtectedRoute>
                                        <ListingForm />
                                    </ProtectedRoute>
                                }
                            />
                            # Listing
                            <Route
                                path="/mylistings/:listing_id"
                                element={
                                    <ProtectedRoute>
                                        <ListingDetailPage />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </Navbar>
                </AuthProvider>
            </BrowserRouter>
        </MantineProvider>
    );
}

export default App;
