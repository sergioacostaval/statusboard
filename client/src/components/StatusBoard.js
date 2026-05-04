import { useState } from "react";
import MemberCard from "./MemberCard";

function StatusBoard({ socket, currentUser, members, events, messages }) {
    const [message, setMessage] = useState("");
    const onlineCount = members.filter((member) => member.status === "En ligne").length;
    const absentCount = members.filter((member) => member.status === "Absent").length;
    const busyCount = members.filter((member) => member.status === "Occupe").length;

    // Demande au serveur de changer le statut.
    function changeStatus(status) {
        if (!socket) return;
        socket.emit("status:change", { status });
    }

    // Envoie un message global a tous les membres.
    function sendMessage(event) {
        event.preventDefault();

        const cleanMessage = message.trim();

        if (!socket || !cleanMessage) {
            return;
        }

        socket.emit("message:send", { text: cleanMessage });
        setMessage("");
    }

    return (
        <section className="board">
            <div className="board-title">
                <div>
                    <p>Connecte comme</p>
                    <h2>{currentUser.name}</h2>
                </div>
                <span>{members.length} membre(s)</span>
            </div>

            <div className="board-grid">
                <div className="panel members-panel">
                    <h2>Membres connectes</h2>

                    <div className="status-summary">
                        <h3>Statuts</h3>

                        <p>
                            <span className="dot green"></span>
                            En ligne
                            <strong>{onlineCount}</strong>
                        </p>
                        <p>
                            <span className="dot yellow"></span>
                            Absent
                            <strong>{absentCount}</strong>
                        </p>
                        <p>
                            <span className="dot red"></span>
                            Occupe
                            <strong>{busyCount}</strong>
                        </p>
                    </div>

                    <div className="members-list">
                        {members.map((member) => (
                            <MemberCard
                                key={member.id}
                                member={member}
                                isCurrentUser={member.id === currentUser.id}
                                onChangeStatus={changeStatus}
                            />
                        ))}
                    </div>
                </div>

                <div className="panel">
                    <h2>Message global</h2>

                    <form className="message-form" onSubmit={sendMessage}>
                        <input
                            type="text"
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder="Ecrire un message..."
                        />
                        <button type="submit">Envoyer</button>
                    </form>

                    <div className="message-list">
                        {messages.map((item) => (
                            <p key={item.id}>
                                <strong>{item.name}</strong> ({item.time}) : {item.text}
                            </p>
                        ))}
                    </div>
                </div>

                <div className="panel">
                    <h2>Historique</h2>

                    <div className="event-list">
                        {events.map((event) => (
                            <p key={event.id}>
                                <span>{event.time}</span> {event.text}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default StatusBoard;

