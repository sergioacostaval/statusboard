import express from "express";
import http from "node:http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "*";

const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(express.json());

const members = new Map();
const events = [];
const messages = [];
const MAX_HISTORY = 30;

app.get("/", (req, res) => {
    res.json({ message: "StatusBoard API" });
});

// Retourne l'heure simple pour l'historique.
function getTime() {
    return new Date().toLocaleTimeString("fr-CA", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Ajoute un evenement et garde seulement les derniers.
function addEvent(text) {
    const event = {
        id: Date.now() + Math.random(),
        text,
        time: getTime(),
    };

    events.unshift(event);

    if (events.length > MAX_HISTORY) {
        events.pop();
    }
}

// Envoie les donnees a tous les clients connectes.
function sendBoard() {
    io.emit("members:update", [...members.values()]);
    io.emit("history:update", events);
    io.emit("messages:update", messages);
}

io.on("connection", (socket) => {
    console.log("Connecte:", socket.id);

    // Ajoute l'utilisateur quand il rejoint le tableau.
    socket.on("user:join", ({ name }) => {
        const cleanName = (name || "").trim();

        if (!cleanName) {
            socket.emit("join:error", "Le nom est obligatoire");
            return;
        }

        const member = {
            id: socket.id,
            name: cleanName,
            status: "En ligne",
        };

        members.set(socket.id, member);
        socket.data.name = cleanName;
        addEvent(`${cleanName} a rejoint le tableau`);

        socket.emit("current:user", member);
        sendBoard();
    });

    // Change le statut de l'utilisateur courant.
    socket.on("status:change", ({ status }) => {
        const member = members.get(socket.id);
        const validStatuses = ["En ligne", "Absent", "Occupé"];

        if (!member || !validStatuses.includes(status)) {
            return;
        }

        member.status = status;
        members.set(socket.id, member);
        addEvent(`${member.name} a change son statut vers ${status}`);

        sendBoard();
    });

    // Envoie un message global visible par tout le monde.
    socket.on("message:send", ({ text }) => {
        const member = members.get(socket.id);
        const cleanText = (text || "").trim();

        if (!member || !cleanText) {
            return;
        }

        const message = {
            id: Date.now() + Math.random(),
            name: member.name,
            text: cleanText,
            time: getTime(),
        };

        messages.unshift(message);

        if (messages.length > MAX_HISTORY) {
            messages.pop();
        }

        addEvent(`${member.name} a envoye un message global`);
        sendBoard();
    });

    // Retire l'utilisateur quand il ferme la page.
    socket.on("disconnect", () => {
        const member = members.get(socket.id);

        if (member) {
            members.delete(socket.id);
            addEvent(`${member.name} a quitte le tableau`);
            sendBoard();
        }

        console.log("Deconnecte:", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
