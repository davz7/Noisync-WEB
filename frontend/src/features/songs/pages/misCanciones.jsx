import { useBandSongs } from "../../hooks/useBandSongs";
import Pagination from "../../shared/components/Pagination";
import SongCard from "../components/SongCard";
import { Link } from "react-router-dom";
import { deleteSong, toggleVisibility } from "../../../api/songService"
import { confirmDelete, toastSuccess, toastError } from "../../../api/alerts";
import Filters from "../../shared/components/Filters";


function MisCanciones() {
    const role = localStorage.getItem("role");
    const isLeader = role === "LEADER";

    const {
        canciones, totalPaginas, paginaActual, setPaginaActual,
        busqueda, setBusqueda, filtro, setFiltro, loading, reload
    } = useBandSongs();

    const handleDelete = async (songId) => {
        const result = await confirmDelete("Esta acción ocultará la canción de tu repertorio.");
        if (!result.isConfirmed) return;
        try {
            await deleteSong(songId);
            toastSuccess("Canción eliminada correctamente");
            reload();
        } catch (e) {
            console.error(e);
            toastError("No se pudo eliminar la canción");
        }
    };

    const handleToggleVisibility = async (songId, visibilidad) => {
        console.log("Toggle visibility:", songId, visibilidad);
        try {
            await toggleVisibility(songId);
            toastSuccess("Visibilidad actualizada");
            reload();
        } catch (e) {
            console.error("Error:", e);
            toastError("No se pudo cambiar la visibilidad");
        }
    };

    return (
        <>
            <h3 className="mb-0">Mis Canciones</h3>
            <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
                <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-3 w-100 w-lg-auto">
                    <div style={{ minWidth: "220px" }} className="flex-grow-1">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <i className="bi bi-search text-muted"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Buscar canción..."
                                value={busqueda}
                                onChange={e => { setBusqueda(e.target.value); setPaginaActual(0); }}
                            />
                        </div>
                    </div>
                    <Filters
                        filtro={filtro}
                        setFiltro={(value) => {
                            setFiltro(value);
                            setPaginaActual(0);
                        }}
                    />
                </div>
                {isLeader && (
                    <Link to="/record-song" className="btn btn-dark px-4 py-2 align-self-start align-self-lg-auto" style={{ whiteSpace: "nowrap" }}>
                        + Registrar canción
                    </Link>
                )}
            </div>

            {loading ? (
                <div className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm me-2"></div>
                    Cargando canciones...
                </div>
            ) : canciones.length === 0 ? (
                <div className="text-center py-5 text-muted">No hay canciones registradas.</div>
            ) : (
                <div className="row">
                    {canciones.map(c => (
                        <SongCard
                            key={c.songId}
                            id={c.songId}
                            cover={c.coverUrl}
                            titulo={c.titulo}
                            artista={c.artistaAutor}
                            estado={c.visibilidad === "PUBLIC" ? "Pública" : "Privada"}
                            isLeader={isLeader}
                            onDelete={handleDelete}
                            onToggleVisibility={handleToggleVisibility}
                            visibilidad={c.visibilidad}
                            nombreBanda={c.nombreBanda}
                            fechaCreacion={c.fechaCreacion}
                            totalSecciones={c.totalSecciones}
                        />
                    ))}
                </div>
            )}

            <Pagination
                totalPaginas={totalPaginas}
                paginaActual={paginaActual + 1}
                setPaginaActual={(p) => setPaginaActual(p - 1)}
            />
        </>
    );
}

export default MisCanciones;