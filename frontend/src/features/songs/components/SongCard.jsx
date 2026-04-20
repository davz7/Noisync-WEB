import "../styles/songcard.css";
import SongAvatar from "./songAvatar";
import { useNavigate } from "react-router-dom";


function SongCard({ id, cover, titulo, artista, nombreBanda, fechaCreacion, estado, isLeader, onDelete, visibilidad, onToggleVisibility, totalSecciones }) {

    const formatFecha = (fecha) => {
        if (!fecha) return "";
        return new Date(fecha).toLocaleDateString("es-MX", {
            day: "2-digit", month: "short", year: "numeric"
        });
    };

    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("accessToken");

    const getRoute = () => {
        if (token && role === "LEADER") return `/vista-cancion-leader/${id}`;
        if (token && role === "MUSICIAN") return `/vista-cancion-user/${id}`;
        return `/vista-cancion-publica/${id}`;
    };

    return (
        <div className="col-md-3 mb-4">
            <div className="card shadow-sm h-100 d-flex flex-column">
                <div
                    className="d-flex align-items-center justify-content-center bg-light"
                    style={{ height: "180px" }}
                >
                    <SongAvatar nombre={titulo} imagen={cover} />
                </div>

                <div className="card-body d-flex flex-column">
                    <h6 className="fw-bold mb-1">{titulo}</h6>
                    <small className="text-muted d-block">Autor: {artista}</small>
                    <small className="text-muted d-block">by {nombreBanda}</small>

                    <div className="d-flex justify-content-between align-items-center mt-2">
                        <span className={`badge ${visibilidad === "PUBLIC" ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"}`}>
                            {estado}
                        </span>
                    </div>

                    <small className="text-muted d-block mt-1">
                        <i className="bi bi-calendar3 me-1"></i>
                        {formatFecha(fechaCreacion)}
                    </small>

                        <small className="text-muted d-block mt-1">
                            {totalSecciones} {totalSecciones === 1 ? "sección" : "secciones"}
                        </small>

                    <div className="d-flex gap-2 mt-auto pt-2">
                        <button
                            className="btn btn-outline-secondary btn-sm flex-grow-1"
                            onClick={() => navigate(getRoute())}
                        >
                            Abrir
                        </button>

                        {isLeader && (
                            <>
                                <button
                                    className="btn btn-outline-dark btn-sm"
                                    title="Editar"
                                    onClick={() => navigate(`/edit-song/${id}`)}
                                >
                                    <i className="bi bi-pencil"></i>
                                </button>

                                <button
                                    className="btn btn-outline-warning btn-sm"
                                    title={visibilidad === "PUBLIC" ? "Hacer privada" : "Hacer pública"}
                                    onClick={() => onToggleVisibility && onToggleVisibility(id, visibilidad)}

                                >
                                    <i className={`bi ${visibilidad === "PUBLIC" ? "bi-eye-slash" : "bi-eye"}`}></i>
                                </button>



                                <button
                                    className="btn btn-outline-danger btn-sm"
                                    title="Eliminar"
                                    onClick={() => onDelete && onDelete(id)}
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SongCard;
