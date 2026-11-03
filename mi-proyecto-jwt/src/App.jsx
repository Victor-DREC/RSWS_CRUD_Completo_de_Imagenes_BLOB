import "./index.css";

import { AuthProvaider } from "./context/AuthContext";

import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Registrar from "./pages/Registrar";
import Perfil from "./pages/Perfil";

function App() {

    return (

        <AuthProvaider>

            <BrowserRouter>

                <Routes>

                    {/* Página de inicio de sesión */}
                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    {/* Página de registro */}
                    <Route
                        path="/registrar"
                        element={<Registrar />}
                    />

                    {/* Páginas protegidas */}
                    <Route element={<ProtectedRoute />}>

                        <Route
                            path="/perfil"
                            element={<Perfil />}
                        />

                    </Route>

                    {/* Ruta predeterminada */}
                    <Route
                        path="*"
                        element={<Navigate to="/login" replace />}
                    />

                </Routes>

            </BrowserRouter>

        </AuthProvaider>

    );

}

export default App;