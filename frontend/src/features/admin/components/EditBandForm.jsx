import { useState } from "react";
import { api } from "../../../api/api.js";
import { toastSuccess, toastError, confirmDelete } from "../../../api/alerts.js";
import { useNavigate, Link } from "react-router-dom";



function EditBandForm({ bandData, onBack }) {

    const [band, setBand] = useState({
        name: bandData?.name || "",
        description: bandData?.description || "",
        instagram: bandData?.instagram || "",
        facebook: bandData?.facebook || "",
        twitter: bandData?.twitter || "",
        youtube: bandData?.youtube || "",
        website: bandData?.website || ""
    });
    const handleChange = (e) => {
        setBand({
            ...band,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            //console.log("Band state antes de enviar:", band);
            await api.put("/api/band", {
                nombre: band.name,
                descripcion: band.description.trim() === "" ? null : band.description.trim()
            });

            const socials = [
                { plataforma: "instagram", url: band.instagram },
                { plataforma: "facebook", url: band.facebook },
                { plataforma: "twitter", url: band.twitter },
                { plataforma: "youtube", url: band.youtube },
                { plataforma: "website", url: band.website }
            ].filter(s => s.url && s.url.trim() !== "");

            //console.log("Socials enviadas:", socials);

            await api.put("/api/band/socials", socials);

            toastSuccess("Perfil de banda actualizado correctamente");
            onBack();

        } catch (err) {
            console.error("Error actualizando banda", err);
            toastError("Error actualizando banda");
        }
    };

    const navigate = useNavigate();

    const handleDelete = async () => {
        const result = await confirmDelete("Esta acción eliminará permanentemente la banda, músicos, canciones e instrumentos.");
        if (!result.isConfirmed) return;
        try {
            await api.delete("/api/band");
            toastSuccess("Banda eliminada correctamente");
            navigate("/login");
        } catch (e) {
            console.error(e);
            toastError("No se pudo eliminar la banda");
        }
    };

    return (
        <div className="container-fluid">
            <div className="mb-3">
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={onBack}
                >
                    ← Volver
                </button>
            </div>
            <form onSubmit={handleSubmit}>


                <div className="card shadow-sm mb-4">

                    <div className="card-body">

                        <h5 className="fw-bold mb-3">
                            Información de la banda
                        </h5>


                        <div className="mb-3">

                            <label className="form-label fw-medium">
                                Nombre de la banda *
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nombre de la banda"
                                name="name"
                                value={band.name}
                                onChange={handleChange}
                                required
                            />

                        </div>



                        <div className="mb-3">

                            <label className="form-label fw-medium">
                                Descripción / Biografía
                            </label>

                            <textarea
                                className="form-control"
                                rows="4"
                                name="description"
                                value={band.description}
                                onChange={handleChange}
                                maxLength={500}
                                placeholder="Explica la bada"
                            />
                            <div className="form-text text-end">
                                {band.description.length}/500 caracteres
                            </div>

                        </div>


                    </div>

                </div>



                <div className="card shadow-sm mb-4">

                    <div className="card-body">

                        <h5 className="fw-bold">
                            Redes sociales
                        </h5>

                        <small className="text-muted">
                            Conecta tus redes sociales para que tus fans puedan encontrarte fácilmente
                        </small>

                        <hr />


                        <div className="mb-3">

                            <label className="form-label">
                                <i className="bi bi-instagram me-2 text-danger"></i>
                                Instagram
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="@usuario"
                                name="instagram"
                                value={band.instagram}
                                onChange={handleChange}
                            />

                        </div>



                        <div className="mb-3">

                            <label className="form-label">
                                <i className="bi bi-facebook me-2 text-primary"></i>
                                Facebook
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nombre de página"
                                name="facebook"
                                value={band.facebook}
                                onChange={handleChange}
                            />

                        </div>



                        <div className="mb-3">

                            <label className="form-label">
                                <i className="bi bi-twitter me-2 text-info"></i>
                                Twitter / X
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="@usuario"
                                name="twitter"
                                value={band.twitter}
                                onChange={handleChange}
                            />

                        </div>



                        <div className="mb-3">

                            <label className="form-label">
                                <i className="bi bi-youtube me-2 text-danger"></i>
                                YouTube
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nombre de canal"
                                name="youtube"
                                value={band.youtube}
                                onChange={handleChange}
                            />

                        </div>



                        <div className="mb-3">

                            <label className="form-label">
                                <i className="bi bi-globe me-2 text-secondary"></i>
                                Sitio web
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="www.ejemplo.com"
                                name="website"
                                value={band.website}
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                </div>



                <div className="d-flex justify-content-end">

                    <button
                        type="submit"
                        className="btn btn-primary mb-4"
                    >
                        Guardar cambios
                    </button>

                </div>

            </form>

            {/* ZONA DE RIESGO */}
            <div className="card border-danger bg-danger-subtle">

                <div className="card-body">

                    <h5 className="text-danger fw-bold">
                        Zona de riesgo
                    </h5>

                    <p className="text-muted">
                        Las acciones en esta sección son irreversibles. Procede con precaución.
                    </p>

                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 border rounded p-3 bg-white">

                        <div>

                            <h6 className="fw-bold">
                                Eliminar banda
                            </h6>

                            <small className="text-muted">
                                Esta acción eliminará permanentemente:
                            </small>

                            <ul className="mb-0 text-muted small">
                                <li>Todas las canciones asociadas</li>
                                <li>Todos los músicos</li>
                                <li>Todos los instrumentos</li>
                                <li>Toda la configuración de la banda</li>
                            </ul>

                        </div>

                        <Link
                            to="#"
                            className="btn btn-danger flex-shrink-0"
                            onClick={(e) => { e.preventDefault(); handleDelete(); }}
                        >
                            Eliminar banda
                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default EditBandForm;