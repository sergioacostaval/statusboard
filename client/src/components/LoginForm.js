import { useState } from "react";

function LoginForm({ onJoin, serverError }) {
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    // Verifie le nom avant d'envoyer au serveur.
    function handleSubmit(event) {
        event.preventDefault();

        const cleanName = name.trim();

        if (!cleanName) {
            setError("Le nom est obligatoire");
            return;
        }

        setError("");
        onJoin(cleanName);
    }

    return (
        <form className="login-box" onSubmit={handleSubmit}>
            <label htmlFor="name">Nom du membre</label>
            <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex. Sergio"
            />

            {error && <p className="error">{error}</p>}
            {serverError && <p className="error">{serverError}</p>}

            <button type="submit">Rejoindre</button>
        </form>
    );
}

export default LoginForm;

