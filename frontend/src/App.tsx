import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginRegister } from "./pages/LoginRegister.tsx";
import { NavBar } from "./components/NavBar.tsx";
import { AuthProvider } from "./context/AuthProvider.tsx";
import { useAuth } from "./hooks/useAuth.ts";
import Recipes from "./pages/Recipes.tsx";
import Recipe from "./pages/Recipe.tsx";
import { Ingredients } from "./pages/Ingredients.tsx";
import { DarkThemeToggle } from "flowbite-react";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import { ProfilePage } from "./pages/ProfilePage.tsx";

function AppContent() {
    const {isAuthenticated, user} = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
            {isAuthenticated && <NavBar name={user?.fullName ?? "User"} email={user?.username ?? ""}/>}
            <DarkThemeToggle />

            <Routes>
                <Route path="/login" element={<LoginRegister isLoginMode={true}/>}/>
                <Route path="/register" element={<LoginRegister isLoginMode={false}/>}/>
                <Route path="/recipes" element={<ProtectedRoute><Recipes/></ProtectedRoute>}/>
                <Route path="/recipes/:id" element={<ProtectedRoute><Recipe/></ProtectedRoute>}/>
                <Route path="/inventory" element={<ProtectedRoute><Ingredients/></ProtectedRoute>}/>
                <Route path="/profile" element={<ProtectedRoute><ProfilePage/></ProtectedRoute>}/>

                <Route path="/" element={isAuthenticated ? <Navigate to="/recipes" replace/> : <Navigate to="/login" replace/>}/>
                <Route path="*" element={isAuthenticated ? <Navigate to="/recipes" replace/> : <Navigate to="/login" replace/>}/>
            </Routes>
            <ToastContainer/>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent/>
            </Router>
        </AuthProvider>
    );
}

export default App;