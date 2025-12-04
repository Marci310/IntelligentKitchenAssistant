import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginRegister } from "./pages/LoginRegister.tsx";
import { NavBar } from "./components/NavBar.tsx";
import { AuthProvider, useAuth } from "./context/AuthProvider.tsx";
import Recipes from "./pages/Recipes.tsx";
import Recipe from "./pages/Recipe.tsx";
import { Ingredients } from "./pages/Ingredients.tsx";

function AppContent() {
    const {isAuthenticated, user} = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            {isAuthenticated && <NavBar name={user?.fullName ?? "User"} email={user?.username ?? ""}/>}

            <Routes>
                <Route path="/login" element={<LoginRegister isLoginMode={true}/>}/>
                <Route path="/register" element={<LoginRegister isLoginMode={false}/>}/>
                <Route path="/recipes" element={<Recipes/>}/>
                <Route path="/recipes/:id" element={<Recipe/>}/>
                <Route path="/ingredients" element={<Ingredients/>}/>

                <Route path="/" element={<Navigate to="/login" replace/>}/>
                <Route path="*" element={<Navigate to="/login" replace/>}/>
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