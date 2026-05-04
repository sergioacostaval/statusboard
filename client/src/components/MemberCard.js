const statuses = ["En ligne", "Absent", "Occupe"];

function MemberCard({ member, isCurrentUser, onChangeStatus }) {
    const statusClass = member.status
        .toLowerCase()
        .replace(" ", "-");

    // Change seulement le statut du membre courant.
    function handleClick(status) {
        if (!isCurrentUser) return;
        onChangeStatus(status);
    }

    return (
        <article className="member-card">
            <div className="member-top">
                <h3>{member.name}</h3>
                <span className={`status ${statusClass}`}>{member.status}</span>
            </div>

            {isCurrentUser && (
                <div className="status-buttons">
                    {statuses.map((status) => (
                        <button
                            key={status}
                            type="button"
                            className={member.status === status ? "active" : ""}
                            onClick={() => handleClick(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            )}
        </article>
    );
}

export default MemberCard;
