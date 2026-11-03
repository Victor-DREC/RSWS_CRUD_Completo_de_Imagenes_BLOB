import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvaider(props) {

    const { children } = props;

    const [token, setToken] = useState(
        localStorage.getItem("token") || null
    );

    const login = (nuevoToken) => {

        localStorage.setItem("token", nuevoToken);

        setToken(nuevoToken);

    };

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("rol");

        setToken(null);

    };

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}