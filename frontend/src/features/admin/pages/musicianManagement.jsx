import { useEffect, useState } from "react";
import InviteMusicianCard from "../components/inviteMusicianCard";
import MusiciansTable from "../components/MusiciansTable";
import EditMusicianCard from "../components/editMusicianCard";
import { getMusicians, removeMusician, resetMusicianPassword } from "../../../api/musicianService";
import { toastSuccess, toastError, confirmDelete, confirmAction } from "../../../api/alerts.js";

function MusicianManagement() {
    const [editingMusician, setEditingMusician] = useState(null);
    const [showInvite, setShowInvite] = useState(false);
    const [musicians, setMusicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    const role = localStorage.getItem("role");
    const isLeader = role === "LEADER";

    const load = async (q = "") => {
        try {
            setLoading(true);
            const data = await getMusicians(q);
            setMusicians(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Error cargando músicos:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    useEffect(() => {
        const timer = setTimeout(() => load(query), 400);
        return () => clearTimeout(timer);
    }, [query]);

    const handleEdit = (musician) => setEditingMusician(musician);

    const handleDelete = async (userId) => {
        const result = await confirmDelete("Se revocará el acceso del músico inmediatamente.");
        if (!result.isConfirmed) return;
        try {
            await removeMusician(userId);
            toastSuccess("Músico eliminado y acceso revocado");
            load(query);
        } catch (e) {
            console.error(e);
            toastError("No se pudo eliminar el músico");
        }
    };

    const handleResetPassword = async (musician) => {
        const result = await confirmAction(
            "¿Restablecer contraseña?",
            `Se enviará una nueva contraseña al correo de ${musician.nombreCompleto}`,
            "Sí, restablecer"
        );
        if (!result.isConfirmed) return;
        try {
            await resetMusicianPassword(musician.userId);
            toastSuccess("Contraseña restablecida y enviada al músico");
            load(query);
        } catch (e) {
            console.error(e);
            toastError("No se pudo restablecer la contraseña. Intenta más tarde.");
        }
    };

    const handleSaveEdit = async () => {
        setEditingMusician(null);
        load(query);
    };

    if (editingMusician) {
        return (
            <EditMusicianCard
                musician={editingMusician}
                onBack={() => setEditingMusician(null)}
                onSave={handleSaveEdit}
            />
        );
    }

    if (showInvite) {
        return <InviteMusicianCard onBack={() => { setShowInvite(false); load(); }} />;
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold">Gestión de Integrantes</h4>
                {isLeader && (
                    <button className="btn btn-dark" onClick={() => setShowInvite(true)}>
                        <i className="bi bi-person-plus me-2"></i>Invitar músico
                    </button>
                )}
            </div>

            <div className="mb-3">
                <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search text-muted"></i>
                    </span>
                    <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Buscar por nombre o username..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => setQuery("")}
                            title="Limpiar búsqueda"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    )}
                </div>
                {query && !loading && (
                    <small className="text-muted ms-1">
                        {musicians.length === 0
                            ? "Sin resultados para esta búsqueda"
                            : `${musicians.length} resultado${musicians.length !== 1 ? "s" : ""} encontrado${musicians.length !== 1 ? "s" : ""}`
                        }
                    </small>
                )}
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="p-5 text-center text-muted">
                            <div className="spinner-border spinner-border-sm me-2"></div>
                            Cargando músicos...
                        </div>
                    ) : (
                        <MusiciansTable
                            musicians={musicians}
                            isLeader={isLeader}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onResetPassword={handleResetPassword}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default MusicianManagement;