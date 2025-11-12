import React from "react";
import { useParams, Link } from "react-router-dom";

export default function TicketDetail() {
    const { id } = useParams();

    return (
        <div style={{ padding: 20 }}>
            <h2>Ticket detail: {id}</h2>
            <p>This is a placeholder. Replace with API-loaded ticket + replies UI.</p>
            <Link to="/support/tickets">Back to tickets</Link>
        </div>
    );
}
