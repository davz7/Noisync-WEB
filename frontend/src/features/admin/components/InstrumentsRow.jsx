import { useState } from "react";
import { updateInstrument } from "../../../api/instrumentService";
import { toastSuccess, toastError } from "../../../api/alerts";

function InstrumentsRow({ instrument, isLeader, onDelete, onUpdated, onOpenModal }) {
    const [editing, setEditing] = useState(false);
    const [nombre, setNombre] = useState(instrument.nombre);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!nombre.trim()) return;
        setLoading(true);
        try {
            await updateInstrument(instrument.instrumentId, nombre.trim());
            toastSuccess("Instrumento actualizado");
            setEditing(false);
            if (onUpdated) onUpdated();
        } catch {
            toastError("No se pudo actualizar");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") {
            setNombre(instrument.nombre);
            setEditing(false);
        }
    };

    return (
        <tr
            onClick={() => onOpenModal(instrument)}
            style={{ cursor: "pointer" }}
            className="align-middle"
        >
            <td onClick={e => editing && e.stopPropagation()}>
                {editing ? (
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                ) : (
                    <div>
                        <span>{instrument.nombre}</span>
                        <small className="text-muted d-block">
                            {instrument.totalMusicos} músico{instrument.totalMusicos !== 1 ? "s" : ""}
                        </small>
                    </div>
                )}
            </td>

            {isLeader && (
                <td onClick={e => e.stopPropagation()}>
                    <div className="d-flex gap-2">
                        {editing ? (
                            <>
                                <button className="btn btn-sm btn-success" onClick={handleSave} disabled={loading} title="Guardar">
                                    <i className="bi bi-check-lg"></i>
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => {
                                        setNombre(instrument.nombre);
                                        setEditing(false);
                                    }}
                                    title="Cancelar"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="btn btn-sm btn-outline-dark" onClick={() => setEditing(true)} title="Editar">
                                    <i className="bi bi-pencil"></i>
                                </button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(instrument.instrumentId)} title="Eliminar">
                                    <i className="bi bi-trash"></i>
                                </button>
                            </>
                        )}
                    </div>
                </td>
            )}
        </tr>
    );
}

export default InstrumentsRow;