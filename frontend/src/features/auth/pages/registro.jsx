import { Link, useNavigate } from "react-router-dom";
import AuthHeader from "../components/AuthHeader";
import FormInput from "../components/FormInput";
import "../components/styles/registro.css";
import useForm from "../../hooks/useForm";
import { registerRequest, saveSession } from "../../../api/authService.js";
import { toastError } from "../../../api/alerts.js";
import { useState } from "react";

function Registro() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const PASSWORD_RULE_TEXT =
        "La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número";

    const initialValues = {
        nombre: "",
        nombreUsuario: "",
        email: "",
        password: "",
        confirmarPassword: "",
        nombreBanda: "",
    };

    const validar = (values) => {
        const e = {};
        const { nombre, nombreUsuario, email, password, confirmarPassword, nombreBanda } = values;

        if (!nombre.trim()) e.nombre = "El nombre completo es obligatorio";

        if (!nombreUsuario.trim()) e.nombreUsuario = "El nombre de usuario es obligatorio";

        const emailValue = email.trim();
        if (!emailValue) {
            e.email = "El correo es obligatorio";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailValue)) e.email = "Correo inválido";
        }

        if (!password.trim()) {
            e.password = "La contraseña es obligatoria";
        } else {
            const passRegex = /^(?=.[A-Z])(?=.\d).{8,}$/;
            if (!passRegex.test(password)) {
                e.password = PASSWORD_RULE_TEXT;
            }
        }

        if (!confirmarPassword.trim()) {
            e.confirmarPassword = "Confirma tu contraseña";
        } else if (confirmarPassword !== password) {
            e.confirmarPassword = "Las contraseñas no coinciden";
        }

        if (!nombreBanda.trim()) e.nombreBanda = "El nombre de la banda es obligatorio";

        return e;
    };

    const {
        values,
        errors,
        submitIntentado,
        handleChange,
        handleSubmit,
    } = useForm(initialValues, validar);

    const onValidSubmit = async (vals) => {
        setIsLoading(true);
        try {
            const body = {
                nombreCompleto: vals.nombre,
                username: vals.nombreUsuario,
                correo: vals.email,
                password: vals.password,
                confirmPassword: vals.confirmarPassword,
                nombreBanda: vals.nombreBanda
            };

            const data = await registerRequest(body);
            saveSession(data);
            navigate("/home-leader");
        } catch (err) {
            console.error(err);
            toastError(err?.response?.data?.message || "Error al registrar");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="registro-page">
            <AuthHeader />
            <div className="registro-card">
                <h2 className="fw-bold text-center mb-2">Registro</h2>
                <p className="text-muted text-center mb-4">Crea tu cuenta de Noisync</p>

                <form onSubmit={handleSubmit(onValidSubmit)} noValidate>
                    <FormInput
                        label="Nombre Completo"
                        name="nombre"
                        placeholder="Ingresa tu nombre completo"
                        value={values.nombre}
                        onChange={handleChange}
                        required
                        error={errors.nombre}
                        forceValidate={submitIntentado}
                    />

                    <FormInput
                        label="Nombre de usuario"
                        name="nombreUsuario"
                        placeholder="Ingresa tu usuario"
                        value={values.nombreUsuario}
                        onChange={handleChange}
                        required
                        error={errors.nombreUsuario}
                        forceValidate={submitIntentado}
                    />

                    <FormInput
                        label="Correo Electrónico"
                        name="email"
                        type="text"
                        placeholder="tu@email.com"
                        value={values.email}
                        onChange={handleChange}
                        required
                        error={errors.email}
                        forceValidate={submitIntentado}
                    />

                    <FormInput
                        label="Contraseña"
                        name="password"
                        type="password"
                        placeholder="Ingresa tu contraseña"
                        value={values.password}
                        onChange={handleChange}
                        required
                        error={errors.password}
                        forceValidate={submitIntentado}
                    />

                    <p className="text-muted small mb-3">{PASSWORD_RULE_TEXT}</p>

                    <FormInput
                        label="Confirmar Contraseña"
                        name="confirmarPassword"
                        type="password"
                        placeholder="Repite tu contraseña"
                        value={values.confirmarPassword}
                        onChange={handleChange}
                        required
                        error={errors.confirmarPassword}
                        forceValidate={submitIntentado}
                    />

                    <FormInput
                        label="Nombre de la banda"
                        name="nombreBanda"
                        placeholder="Ingresa el nombre de la banda"
                        value={values.nombreBanda}
                        onChange={handleChange}
                        required
                        error={errors.nombreBanda}
                        forceValidate={submitIntentado}
                    />

                    <p className="text-muted text-center mb-4">
                        Se creará la banda automáticamente y quedarás como Líder
                    </p>

                    <button
                        type="submit"
                        className="btn btn-dark w-100 custom-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                Creando cuenta...
                            </>
                        ) : (
                            "Crear Cuenta"
                        )}
                    </button>
                </form>

                <div className="text-center mt-4 small">
                    ¿Ya tienes cuenta?{" "}
                    <Link to="/login" className="link-text">
                        Iniciar sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Registro;