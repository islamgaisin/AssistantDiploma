import React, { useState, useEffect, useRef } from 'react';
import './PythonLanguageModel.css';
import { Parser } from "html-to-react";

const PythonLanguageModel = () => {
const [input, setInput] = useState('');
const [index, setIndex] = useState(0);
const [message, setMessage] = useState("");
const [responses, setResponses] = useState([]);
const ws = useRef(null);
const messagesEndRef = useRef(null);
const [reconnectAttempts, setReconnectAttempts] = useState(0);
const maxReconnectAttempts = 5;

const setupWebSocket = () => {
    ws.current = new WebSocket('ws://127.0.0.1:8000/ws/chat/');
    let ongoingStream = null;

    ws.current.onopen = () => {
        console.log("WebSocket connected!");
        setReconnectAttempts(0);
    };

    ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        let sender = data.name;

        if (data.event === 'on_parser_start') {
            ongoingStream = { id: data.run_id, content: '' };
            setResponses(prevResponses => [...prevResponses, { sender, message: '', id: data.run_id }]);
        } else if (data.event === 'on_parser_stream' && ongoingStream && data.run_id === ongoingStream.id) {
            setResponses(prevResponses => prevResponses.map(msg =>
                msg.id === data.run_id ? { ...msg, message: msg.message + data.data.chunk } : msg));
        }
    };

    ws.current.onerror = (event) => {
        console.error("WebSocket error observed:", event);
    };

    ws.current.onclose = (event) => {
        console.log(`WebSocket is closed now. Code: ${event.code}, Reason: ${event.reason}`);
        handleReconnect();
    };
};

const handleReconnect = () => {
    if (reconnectAttempts < maxReconnectAttempts) {
        let timeout = Math.pow(2, reconnectAttempts) * 1000;
        setTimeout(() => {
            setupWebSocket();
        }, timeout);
    } else {
        console.log("Max reconnect attempts reached, not attempting further reconnects.");
    }
};

useEffect(() => {
    setupWebSocket();

    return () => {
        if (ws.current.readyState === WebSocket.OPEN) {
            ws.current.close();
        }
    };
}, []);

useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [responses]);

const renderMessage = (response, index) => (
    <div key={index} className={`message ${response.sender}`}>
    <div className="border-container">
    <div className="border-right">
        <strong>{response.sender}</strong> <p>{new Parser().parse(message)}</p>

        </div>
        
        <div className="border-left">
        <strong>Model</strong> <p>{response.message}</p>

        </div>
     
     </div>
</div>

);

const handleInputChange = (e) => {
    setInput(e.target.value);
};

const handleSubmit = (e) => {
    e.preventDefault();
    if (input === ""){
        alert("Запрос не может быть пустым!");
        return;
    }
    const userMessage = { sender: "You", message: answers[index] };
    setMessage(() => "<pre>" + input + "</pre>");
    setIndex((prev) => prev + 1);
    setInput("");
    setResponses(prevResponses => [...prevResponses, userMessage]);
    ws.current.send(JSON.stringify({ message: input }));
    setInput('');
};

return (
    <div className="chat-container">
        <div className="messages-container">
            {responses.map((response, index) => renderMessage(response, index))}
            <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="input-form">
            <textarea
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="  Введите свой вопрос..."
            />
            <button type="submit">Отправить</button>
        </form>
    </div>
);
};

export default PythonLanguageModel;