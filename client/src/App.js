import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import LoginForm from "./components/LoginForm";
import StatusBoard from "./components/StatusBoard";
import "./App.css";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

function App() {
    const [socket, setSocket] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [members, setMembers] = useState([]);
    const [events, setEvents] = useState([]);
    const [messages, setMessages] = useState([]);

    // Cree la connexion Socket.IO une seule fois.
    useEffect(() => {
        const newSocket = io(SERVER_URL);
        setSocket(newSocket);

        newSocket.on("current:user", (user) => {
            setCurrentUser(user);
        });

        newSocket.on("members:update", (newMembers) => {
            setMembers(newMembers);
        });

        newSocket.on("history:update", (newEvents) => {
            setEvents(newEvents);
        });

        newSocket.on("messages:update", (newMessages) => {
            setMessages(newMessages);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Envoie le nom au serveur pour rejoindre le tableau.
    function handleJoin(name) {
        if (!socket) return;
        socket.emit("user:join", { name });
    }

    return (
        <main className="app">
            <section className="app-header">
                <p>Examen final TT4</p>
                <h1>StatusBoard</h1>
            </section>

            {!currentUser ? (
                <LoginForm onJoin={handleJoin} />
            ) : (
                <StatusBoard
                    socket={socket}
                    currentUser={currentUser}
                    members={members}
                    events={events}
                    messages={messages}
                />
            )}
        </main>
    );
}

export default App;
