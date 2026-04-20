function BandProfileCard({
                             name,
                             description,
                             instagram,
                             facebook,
                             twitter,
                             youtube,
                             website,
                             onEdit
                         }) {
    const role = localStorage.getItem("role");
    const isLeader = role === "LEADER";

    const show = (value) => value && value.trim() !== "" ? value : "No configurado";

    return (
        <div className="container-fluid">

            <div className="card shadow-sm mb-4">
                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="fw-bold mb-0">{show(name)}</h5>
                            <small className="text-muted">Perfil de la banda</small>
                        </div>

                        {isLeader && (
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={onEdit}
                            >
                                Editar banda
                            </button>
                        )}
                    </div>

                    <hr />

                    <div className="row g-4">

                        <div className="col-md-6">
                            <small className="text-uppercase text-secondary">
                                Nombre de la banda
                            </small>
                            <p className="mb-0 fw-medium">{show(name)}</p>
                        </div>

                        <div className="col-12">
                            <small className="text-uppercase text-secondary">
                                Descripción / Biografía
                            </small>
                            {description && description.trim() !== "" ? (
                                <p className="mb-0 fw-medium">{description}</p>
                            ) : (
                                <p className="mb-0 text-muted fst-italic">
                                    Sin descripción
                                    {isLeader && (
                                        <span
                                            className="ms-2 text-primary"
                                            style={{ cursor: "pointer", fontSize: "0.85rem" }}
                                            onClick={onEdit}
                                        >
                                            + Agregar
                                        </span>
                                    )}
                                </p>
                            )}
                        </div>

                    </div>

                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body">

                    <h6 className="fw-bold">Redes sociales</h6>
                    <small className="text-muted">
                        Redes donde los fans pueden encontrar a la banda
                    </small>

                    <hr />

                    <div className="row g-4">

                        <div className="col-md-6">
                            <small className="text-uppercase text-secondary">
                                <i className="bi bi-instagram me-2 text-danger"></i>
                                Instagram
                            </small>
                            <p className="mb-0 fw-medium">{show(instagram)}</p>
                        </div>

                        <div className="col-md-6">
                            <small className="text-uppercase text-secondary">
                                <i className="bi bi-facebook me-2 text-primary"></i>
                                Facebook
                            </small>
                            <p className="mb-0 fw-medium">{show(facebook)}</p>
                        </div>

                        <div className="col-md-6">
                            <small className="text-uppercase text-secondary">
                                <i className="bi bi-twitter me-2 text-info"></i>
                                Twitter / X
                            </small>
                            <p className="mb-0 fw-medium">{show(twitter)}</p>
                        </div>

                        <div className="col-md-6">
                            <small className="text-uppercase text-secondary">
                                <i className="bi bi-youtube me-2 text-danger"></i>
                                YouTube
                            </small>
                            <p className="mb-0 fw-medium">{show(youtube)}</p>
                        </div>

                        <div className="col-12">
                            <small className="text-uppercase text-secondary">
                                <i className="bi bi-globe me-2 text-secondary"></i>
                                Sitio web
                            </small>
                            <p className="mb-0 fw-medium">{show(website)}</p>
                        </div>

                    </div>

                </div>
            </div>

        </div>
    );
}

export default BandProfileCard;