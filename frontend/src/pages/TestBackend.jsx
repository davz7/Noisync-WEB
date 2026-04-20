import { useState } from "react";
import { api } from "../api/api";
import { getSession } from "../api/authService";

export default function TestBackend() {
    const [log, setLog] = useState("Pulsa un botón para ejecutar un diagnóstico.");

    const { accessToken, role } = getSession();
    const isLeader = role === "LEADER";

    const formatOk  = (label, data) =>
        `${label}\n${JSON.stringify(data, null, 2)}`;

    const formatErr = (label, e) => {
        const status = e?.response?.status;
        const body   = e?.response?.data;

        if (status === 401)
            return `${label} → 401 No autenticado\nInicia sesión primero.`;

        if (status === 403)
            return `${label} → 403 Acceso denegado\nEste endpoint solo está disponible para líderes autenticados.\n\nRol actual: ${role ?? "ninguno"}`;

        return `${label} error\n${body ? JSON.stringify(body, null, 2) : e.message}`;
    };

    const health = async () => {
        try {
            const res = await api.get("/api/health");
            setLog(formatOk("/api/health", res.data));
        } catch (e) {
            setLog(formatErr("/api/health", e));
        }
    };

    const dbTest = async () => {
        if (!accessToken) {
            setLog("/api/db-test → Sin sesión activa.\nEste endpoint requiere iniciar sesión como líder.");
            return;
        }
        if (!isLeader) {
            setLog("/api/db-test → Tu rol es '" + role + "'.\nSolo los líderes pueden ejecutar el diagnóstico de base de datos.");
            return;
        }
        try {
            const res = await api.get("/api/db-test");
            setLog(formatOk("/api/db-test", res.data));
        } catch (e) {
            setLog(formatErr("/api/db-test", e));
        }
    };

    const me = async () => {
        try {
            const res = await api.get("/api/me");
            setLog(formatOk("/api/me", res.data));
        } catch (e) {
            setLog(formatErr("/api/me", e));
        }
    };

    const songs = async () => {
        try {
            const res = await api.get("/api/songs");
            setLog(formatOk("/api/songs", res.data));
        } catch (e) {
            setLog(formatErr("/api/songs", e));
        }
    };

    return (
        <div style={{ padding: 24, fontFamily: "Arial", maxWidth: 800 }}>
            <h2>Diagnóstico del backend</h2>

            <div style={{ background: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: 8, padding: 12, marginBottom: 16 }}>
                <strong>Sesión activa:</strong>{" "}
                {accessToken
                    ? `Sí — rol: ${role}`
                    : "No — inicia sesión en /login para probar endpoints protegidos"}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                <button onClick={health}
                    style={{ padding: "8px 14px", cursor: "pointer" }}>
                    GET /api/health <small>(público)</small>
                </button>

                <button onClick={dbTest}
                    style={{ padding: "8px 14px", cursor: "pointer", opacity: isLeader ? 1 : 0.6 }}>
                    GET /api/db-test <small>(solo LEADER)</small>
                </button>

                <button onClick={me}
                    style={{ padding: "8px 14px", cursor: "pointer" }}>
                    GET /api/me <small>(autenticado)</small>
                </button>

                <button onClick={songs}
                    style={{ padding: "8px 14px", cursor: "pointer" }}>
                    GET /api/songs <small>(autenticado)</small>
                </button>
            </div>

            <pre style={{
                background: "#111", color: "#0f0", padding: 16,
                borderRadius: 8, whiteSpace: "pre-wrap", wordBreak: "break-word",
                minHeight: 120, fontSize: 13
            }}>
                {log}
            </pre>
        </div>
    );
}