
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/apiConfig";

function Registrar() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const [cargando, setCargando] = useState(false);

    const registrarUsuario = async (e) => {

        e.preventDefault();

        setMensaje("");
        setError("");

        if (username.trim() === "" || password.trim() === "") {

            setError("Todos los campos son obligatorios");
            return;

        }

        setCargando(true);

        try {

            const respuesta = await fetch(
                `${API_BASE_URL}/auth/registrar`,
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

            const datos = await respuesta.text();

            if (respuesta.ok) {

                setMensaje(datos.mensaje || "Usuario registrado correctamente");
                setUsername("");
                setPassword("");

                setTimeout(() => navigate("/login"), 1500);

            } else {

                setError(datos || "No se pudo registrar el usuario");

            }

        } catch (error) {

            console.error("Error al registrar:", error);
            setError("No se pudo conectar con el servidor");

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
                        BUILD YOUR STYLE.
                        <br />
                        OWN THE ROAD.
                    </h2>

                    <p className="brand-description">
                        Forma parte de una comunidad dedicada a la
                        personalización, el rendimiento y la pasión
                        por los automóviles modificados.
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
                            ÚNETE A NUESTRA COMUNIDAD
                        </span>

                        <h2>Crear cuenta</h2>

                        <p>
                            Regístrate para acceder al sistema.
                        </p>

                    </div>

                    <form onSubmit={registrarUsuario}>

                        <div className="form-group">

                            <label>Nombre de usuario</label>

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
                            <p className="mensaje-exito">
                                {mensaje}
                            </p>
                        )}

                        {error && (
                            <p className="mensaje-error">
                                {error}
                            </p>
                        )}

                        <button
                            className="auth-submit-button"
                            type="submit"
                            disabled={cargando}
                        >
                            {cargando ? "Registrando..." : "CREAR CUENTA"}
                        </button>

                    </form>

                    <div className="auth-form-footer">

                        <p>¿Ya tienes una cuenta?</p>

                        <Link to="/login">
                            Inicia sesión aquí
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

export default Registrar;
