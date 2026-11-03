
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/apiConfig";

const URL_API = `${API_BASE_URL}/auth/autos-modificados`;

// Componente para cargar fotografías con autenticación JWT
function ImagenAuto({ auto, token, className, onClick }) {

    const [imagen, setImagen] = useState(null);

    useEffect(() => {

        let urlTemporal;

        const cargarImagen = async () => {

            try {

                const respuesta = await fetch(
                    `${URL_API}/${auto.id}/foto`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!respuesta.ok) {
                    throw new Error("No se pudo cargar la fotografía");
                }

                const blob = await respuesta.blob();
                urlTemporal = URL.createObjectURL(blob);
                setImagen(urlTemporal);

            } catch (error) {

                console.error(error);

            }

        };

        cargarImagen();

        return () => {

            if (urlTemporal) {
                URL.revokeObjectURL(urlTemporal);
            }

        };

    }, [auto.id, token]);

    return (

        <img
            src={
                imagen ||
                "https://placehold.co/600x400?text=Sin+fotografia"
            }
            alt={`${auto.marca} ${auto.modelo}`}
            className={className}
            onClick={onClick}
        />

    );

}

function Perfil() {

    const { token, logout } = useAuth();

    const [autos, setAutos] = useState([]);
    const [autoSeleccionado, setAutoSeleccionado] = useState(null);

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);

    const [marca, setMarca] = useState("");
    const [modelo, setModelo] = useState("");
    const [anio, setAnio] = useState("");
    const [file, setFile] = useState(null);

    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    // Consultar automóviles registrados
    const cargarAutos = async () => {

        try {

            const respuesta = await fetch(URL_API, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (respuesta.status === 401) {
                logout();
                return;
            }

            if (!respuesta.ok) {
                throw new Error("No se pudieron consultar los automóviles");
            }

            const datos = await respuesta.json();
            setAutos(datos);

        } catch (err) {

            setError(err.message);

        }

    };

    useEffect(() => {

        if (token) {
            cargarAutos();
        }

    }, [token]);

    // Limpiar formulario
    const limpiarFormulario = () => {

        setMarca("");
        setModelo("");
        setAnio("");
        setFile(null);
        setError("");
        setMensaje("");

    };

    // Abrir formulario para registrar
    const abrirRegistro = () => {

        limpiarFormulario();
        setAutoSeleccionado(null);
        setModoEdicion(false);
        setMostrarFormulario(true);

    };

    // Abrir formulario para editar
    const abrirEdicion = (auto) => {

        limpiarFormulario();

        setMarca(auto.marca);
        setModelo(auto.modelo);
        setAnio(auto.anio.toString());

        setAutoSeleccionado(auto);
        setModoEdicion(true);
        setMostrarFormulario(true);

    };

    // Cerrar formulario
    const cerrarFormulario = () => {

        setMostrarFormulario(false);
        setModoEdicion(false);
        limpiarFormulario();

    };

    // Registrar o actualizar automóvil
    const guardarAuto = async (e) => {

        e.preventDefault();

        setError("");
        setMensaje("");

        if (!marca.trim() || !modelo.trim() || !anio) {

            setError("Completa todos los campos obligatorios");
            return;

        }

        const anioNumero = Number(anio);

        if (!Number.isInteger(anioNumero) || anioNumero <= 0) {

            setError("Ingresa un año válido");
            return;

        }

        const formData = new FormData();

        formData.append("marca", marca.trim());
        formData.append("modelo", modelo.trim());
        formData.append("anio", anioNumero);

        if (file) {
            formData.append("file", file);
        }

        try {

            setCargando(true);

            const url = modoEdicion
                ? `${URL_API}/${autoSeleccionado.id}`
                : `${URL_API}/registrar`;

            const metodo = modoEdicion ? "PUT" : "POST";

            const respuesta = await fetch(url, {
                method: metodo,
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const contenido = await respuesta.text();

            let datos;

            try {
                datos = JSON.parse(contenido);
            } catch {
                datos = contenido;
            }

            if (!respuesta.ok) {

                const mensajeError =
                    typeof datos === "object" && datos !== null
                        ? datos.mensaje || datos.error
                        : datos;

                throw new Error(
                    mensajeError || "No se pudo guardar el automóvil"
                );

            }

            await cargarAutos();

            cerrarFormulario();

            setMensaje(
                modoEdicion
                    ? "Automóvil actualizado correctamente"
                    : "Automóvil registrado correctamente"
            );

        } catch (err) {

            setError(err.message);

        } finally {

            setCargando(false);

        }

    };

    // Eliminar automóvil
    const eliminarAuto = async () => {

        if (!autoSeleccionado) return;

        const confirmar = window.confirm(
            "¿Estás seguro de que deseas eliminar este automóvil?"
        );

        if (!confirmar) return;

        try {

            const respuesta = await fetch(
                `${URL_API}/${autoSeleccionado.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!respuesta.ok) {
                throw new Error("No se pudo eliminar el automóvil");
            }

            setAutoSeleccionado(null);
            setMensaje("Automóvil eliminado correctamente");

            await cargarAutos();

        } catch (err) {

            setError(err.message);

        }

    };

    return (

        <div className="perfil-container">

            {/* Encabezado */}
            <header className="perfil-header">

                <div className="perfil-brand">

                    <span className="perfil-brand-label">
                        AUTOMOTIVE CULTURE
                    </span>

                    <h1>
                        DRIFT<span> GARAGE</span>
                    </h1>

                    <p>Mi colección de automóviles</p>

                </div>

                <div className="perfil-header-botones">

                    <button
                        className="btn-registrar"
                        onClick={abrirRegistro}
                    >
                        <span>+</span> Registrar automóvil
                    </button>

                    <button
                        className="btn-cerrar-sesion"
                        onClick={logout}
                    >
                        Cerrar sesión
                    </button>

                </div>

            </header>

            {/* Mensajes */}
            {mensaje && (
                <p className="mensaje-exito perfil-mensaje">
                    {mensaje}
                </p>
            )}

            {error && !mostrarFormulario && (
                <p className="mensaje-error perfil-mensaje">
                    {error}
                </p>
            )}

            {/* Galería de automóviles */}
            <main className="perfil-main">

                <div className="galeria-heading">

                    <div>
                        <span className="section-overline">
                            MY GARAGE
                        </span>

                        <h2>Mis automóviles</h2>
                    </div>

                    <span className="autos-contador">
                        {autos.length} vehículos
                    </span>

                </div>

                <div className="autos-grid">

                    {autos.length === 0 ? (

                        <div className="sin-autos">

                            <h3>Tu garaje está vacío</h3>

                            <p>
                                Registra tu primer automóvil para comenzar.
                            </p>

                            <button
                                className="btn-registrar"
                                onClick={abrirRegistro}
                            >
                                + Registrar automóvil
                            </button>

                        </div>

                    ) : (

                        autos.map((auto) => (

                            <div
                                className="auto-card"
                                key={auto.id}
                                onClick={() => setAutoSeleccionado(auto)}
                            >

                                <div className="auto-imagen-container">

                                    <ImagenAuto
                                        auto={auto}
                                        token={token}
                                        className="auto-imagen"
                                    />

                                    <span className="auto-card-indicador">
                                        VER VEHÍCULO
                                    </span>

                                </div>

                                <div className="auto-info">

                                    <span className="auto-card-subtitulo">
                                        MODIFIED VEHICLE
                                    </span>

                                    <h2>
                                        {auto.marca} {auto.modelo}
                                    </h2>

                                </div>

                            </div>

                        ))

                    )}

                </div>

            </main>

            {/* Modal para registrar o editar */}
            {mostrarFormulario && (

                <div className="modal-fondo">

                    <div className="modal-contenido">

                        <button
                            className="modal-cerrar"
                            onClick={cerrarFormulario}
                        >
                            ×
                        </button>

                        <div className="modal-heading">

                            <span className="section-overline">
                                DRIFT GARAGE
                            </span>

                            <h2>
                                {modoEdicion
                                    ? "Editar automóvil"
                                    : "Registrar automóvil"}
                            </h2>

                            <p>
                                {modoEdicion
                                    ? "Actualiza la información de tu vehículo."
                                    : "Agrega un nuevo vehículo a tu colección."}
                            </p>

                        </div>

                        {error && (
                            <p className="mensaje-error">{error}</p>
                        )}

                        <form onSubmit={guardarAuto}>

                            <label>Marca</label>

                            <input
                                type="text"
                                value={marca}
                                onChange={(e) => setMarca(e.target.value)}
                                placeholder="Ej. BMW"
                                required
                            />

                            <label>Modelo</label>

                            <input
                                type="text"
                                value={modelo}
                                onChange={(e) => setModelo(e.target.value)}
                                placeholder="Ej. M3"
                                required
                            />

                            <label>Año</label>

                            <input
                                type="number"
                                value={anio}
                                onChange={(e) => setAnio(e.target.value)}
                                placeholder="Ej. 2022"
                                required
                            />

                            <label>
                                Fotografía
                                {modoEdicion ? " (opcional)" : ""}
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setFile(e.target.files[0] || null)
                                }
                                required={!modoEdicion}
                            />

                            <div className="modal-botones">

                                <button
                                    type="submit"
                                    className="btn-guardar"
                                    disabled={cargando}
                                >
                                    {cargando
                                        ? "Guardando..."
                                        : modoEdicion
                                            ? "Guardar cambios"
                                            : "Registrar automóvil"}
                                </button>

                                <button
                                    type="button"
                                    className="btn-cancelar"
                                    onClick={cerrarFormulario}
                                >
                                    Cancelar
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* Modal de detalles */}
            {autoSeleccionado && !mostrarFormulario && (

                <div
                    className="modal-fondo"
                    onClick={() => setAutoSeleccionado(null)}
                >

                    <div
                        className="modal-contenido modal-detalles"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <button
                            className="modal-cerrar"
                            onClick={() => setAutoSeleccionado(null)}
                        >
                            ×
                        </button>

                        <span className="section-overline">
                            VEHICLE DETAILS
                        </span>

                        <h2>
                            {autoSeleccionado.marca}{" "}
                            {autoSeleccionado.modelo}
                        </h2>

                        <ImagenAuto
                            auto={autoSeleccionado}
                            token={token}
                            className="detalle-imagen"
                        />

                        <div className="detalle-datos">

                            <p>
                                <strong>Marca</strong>
                                <span>{autoSeleccionado.marca}</span>
                            </p>

                            <p>
                                <strong>Modelo</strong>
                                <span>{autoSeleccionado.modelo}</span>
                            </p>

                            <p>
                                <strong>Año</strong>
                                <span>{autoSeleccionado.anio}</span>
                            </p>

                        </div>

                        <div className="detalle-acciones">

                            <button
                                className="btn-editar"
                                onClick={() =>
                                    abrirEdicion(autoSeleccionado)
                                }
                            >
                                Editar información
                            </button>

                            <button
                                className="btn-eliminar"
                                onClick={eliminarAuto}
                            >
                                Eliminar automóvil
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

export default Perfil;
