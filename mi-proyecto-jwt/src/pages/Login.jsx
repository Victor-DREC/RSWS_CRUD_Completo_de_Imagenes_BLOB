
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/apiConfig";

function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [mensaje, setMensaje] = useState("");
    const [cargando, setCargando] = useState(false);

    const iniciarSesion = async (e) => {

        e.preventDefault();

        setMensaje("");
        setCargando(true);

        try {

            const respuesta = await fetch(
                `${API_BASE_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );

            const datos = await respuesta.json();

            if (respuesta.ok) {

                login(datos.token);

                if (datos.username) {
                    localStorage.setItem("username", datos.username);
                }

                if (datos.rol) {
                    localStorage.setItem("rol", datos.rol);
                }

                navigate("/perfil");

            } else {

                setMensaje(
                    typeof datos === "string"
                        ? datos
                        : datos.mensaje || "Usuario o contraseña incorrectos"
                );

            }

        } catch (error) {

            console.error("Error al iniciar sesión:", error);
            setMensaje("No se pudo conectar con el servidor");

        } finally {

            setCargando(false);

        }

    };

    return (

        <div className="auth-page">

            {/* Panel izquierdo */}
            <section className="auth-brand-panel">

                <div className="brand-content">

                    <span className="brand-label">
                        AUTOMOTIVE CULTURE
                    </span>

                    <h1 className="brand-title">
                        DRIFT<span> GARAGE</span>
                    </h1>

                    <div className="brand-line"></div>

                    <h2 className="brand-slogan">
                        BUILT TO SLIDE.
                        <br />
                        BORN TO DRIVE.
                    </h2>

                    <p className="brand-description">
                        Un espacio dedicado a los automóviles modificados,
                        la potencia, la personalización y la cultura del drift.
                    </p>

                    <div className="brand-car-image"></div>

                    <span className="brand-footer">
                        POWER · STYLE · PERFORMANCE
                    </span>

                </div>

            </section>

            {/* Panel derecho */}
            <section className="auth-form-panel">

                <div className="auth-form-card">

                    <div className="auth-form-heading">

                        <span className="form-overline">
                            BIENVENIDO DE NUEVO
                        </span>

                        <h2>Iniciar sesión</h2>

                        <p>
                            Ingresa tus datos para acceder al sistema.
                        </p>

                    </div>

                    <form onSubmit={iniciarSesion}>

                        <div className="form-group">

                            <label>Usuario</label>

                            <input
                                type="text"
                                placeholder="Ingresa tu usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>Contraseña</label>

                            <input
                                type="password"
                                placeholder="Ingresa tu contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                        </div>

                        {mensaje && (
                            <p className="mensaje-error">
                                {mensaje}
                            </p>
                        )}

                        <button
                            className="auth-submit-button"
                            type="submit"
                            disabled={cargando}
                        >
                            {cargando ? "Ingresando..." : "INICIAR SESIÓN"}
                        </button>

                    </form>

                    <div className="auth-form-footer">

                        <p>¿No tienes una cuenta?</p>

                        <Link to="/registrar">
                            Regístrate aquí
                        </Link>

                    </div>

                    <div className="auth-copyright">
                        DRIFT GARAGE © 2026
                    </div>

                </div>

            </section>

        </div>

    );

}

export default Login;
