import React, { useState } from "react";
import "./CreateTicket.css";

const CATEGORIES = ["Billing", "Technical", "Account", "Other"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export default function CreateTicket() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [priority, setPriority] = useState(PRIORITIES[1]);
    const [description, setDescription] = useState("");
    const [files, setFiles] = useState([]); // File objects
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [successTicket, setSuccessTicket] = useState(null);

    function validate() {
        const e = {};
        if (!name.trim()) e.name = "Vui lòng nhập tên.";
        if (!email.trim()) e.email = "Vui lòng nhập email.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email không hợp lệ.";
        if (!subject.trim()) e.subject = "Vui lòng nhập tiêu đề.";
        if (!description.trim()) e.description = "Vui lòng mô tả vấn đề.";
        // file size limit: 5MB each
        for (let f of files) {
            if (f.size > 5 * 1024 * 1024) {
                e.files = "Mỗi file tối đa 5MB.";
                break;
            }
        }
        return e;
    }

    const handleFiles = (fileList) => {
        // convert FileList to array, limit to 5 files
        const arr = Array.from(fileList).slice(0, 5);
        setFiles(arr);
    };

    const handleSubmit = (ev) => {
        ev.preventDefault();
        setErrors({});
        setSuccessTicket(null);

        const e = validate();
        if (Object.keys(e).length) {
            setErrors(e);
            return;
        }

        // demo submit: simulate upload + return ticket id
        setSubmitting(true);
        setTimeout(() => {
            const ticketId = "TKT-" + Math.floor(100000 + Math.random() * 900000);
            setSubmitting(false);
            setSuccessTicket(ticketId);

            // reset form (optional)
            setName("");
            setEmail("");
            setSubject("");
            setCategory(CATEGORIES[0]);
            setPriority(PRIORITIES[1]);
            setDescription("");
            setFiles([]);
            setErrors({});
            // In real app: send FormData to backend
        }, 900);
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="ticket-page">
            <div className="ticket-card" role="main" aria-labelledby="create-ticket-title">
                <h2 id="create-ticket-title" className="ticket-title">Create Support Ticket</h2>

                {successTicket && (
                    <div className="success-box" role="status">
                        <strong>Ticket created:</strong> <span>{successTicket}</span>
                    </div>
                )}

                <form className="ticket-form" onSubmit={handleSubmit} noValidate>
                    <div className="row">
                        <label htmlFor="name">Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                        />
                        {errors.name && <div className="error">{errors.name}</div>}
                    </div>

                    <div className="row">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                        {errors.email && <div className="error">{errors.email}</div>}
                    </div>

                    <div className="row">
                        <label htmlFor="subject">Subject</label>
                        <input
                            id="subject"
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Short summary (e.g., Payment failed)"
                        />
                        {errors.subject && <div className="error">{errors.subject}</div>}
                    </div>

                    <div className="row two-cols">
                        <div>
                            <label htmlFor="category">Category</label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="priority">Priority</label>
                            <select
                                id="priority"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                {PRIORITIES.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="row">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            rows="6"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the issue in detail..."
                        />
                        {errors.description && <div className="error">{errors.description}</div>}
                    </div>

                    <div className="row">
                        <label htmlFor="attachments">Attachments <small>(png/jpg/pdf, max 5MB each, up to 5 files)</small></label>
                        <input
                            id="attachments"
                            type="file"
                            onChange={(e) => handleFiles(e.target.files)}
                            multiple
                            accept=".png,.jpg,.jpeg,.pdf"
                        />
                        {errors.files && <div className="error">{errors.files}</div>}

                        {files.length > 0 && (
                            <div className="file-preview">
                                {files.map((f, idx) => (
                                    <div className="file-item" key={idx}>
                                        <div className="file-meta">
                                            <span className="file-name">{f.name}</span>
                                            <span className="file-size">({Math.round(f.size / 1024)} KB)</span>
                                        </div>
                                        <button type="button" className="remove-file" onClick={() => removeFile(idx)}>
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="row">
                        <button className="btn-submit" type="submit" disabled={submitting}>
                            {submitting ? "Submitting..." : "Create Ticket"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
