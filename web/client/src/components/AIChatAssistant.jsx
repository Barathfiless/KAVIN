import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Bot, Loader2, User, Sprout } from 'lucide-react';

const AIChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "I am the AgroBrain AI Oracle. I have full knowledge of crop mechanisms, local weather datasets, EB tariffs, and real-time market demand. Ask me anything.", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = { id: Date.now(), text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const res = await fetch('http://localhost:5000/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: inputValue })
            });
            const data = await res.json();
            
            setTimeout(() => {
                const botMessage = { id: Date.now() + 1, text: data.reply, sender: 'bot' };
                setMessages(prev => [...prev, botMessage]);
                setIsTyping(false);
            }, 600);
        } catch (error) {
            const errorMessage = { id: Date.now() + 1, text: "The network is a bit shaky, but I'm trying to re-connect. Try asking again!", sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
            setIsTyping(false);
        }
    };

    const formatMessage = (text) => {
        if (!text) return "";
        return text.split('\n').map((line, i) => {
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
                <React.Fragment key={i}>
                    {parts.map((part, j) => (j % 2 === 1 ? <strong key={j}>{part}</strong> : part))}
                    {i !== text.split('\n').length - 1 && <br />}
                </React.Fragment>
            );
        });
    };

    return (
        <div className="ai-assistant-wrapper">
            {/* Toggle Button */}
            <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`ai-toggle-btn ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <div className="pulse-container"><Sprout size={28} /><div className="notif-pulse"></div></div>}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="ai-chat-bubble"
                    >
                        <div className="chat-header">
                            <div className="chat-header-info">
                                <div className="bot-avatar"><Bot size={20} /></div>
                                <div>
                                    <h4>AgroBrain AI</h4>
                                    <span className="online-status">Online Advisor</span>
                                </div>
                            </div>
                            <Sparkles size={16} className="header-sparkle" />
                        </div>

                        <div className="chat-body">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`message-row ${msg.sender}`}>
                                    <div className="msg-avatar">
                                        {msg.sender === 'bot' ? <Bot size={14} /> : <User size={14} />}
                                    </div>
                                    <div className="msg-bubble">
                                        {formatMessage(msg.text)}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="message-row bot">
                                    <div className="msg-avatar"><Bot size={14} /></div>
                                    <div className="msg-bubble typing-bubble">
                                        <Loader2 size={16} className="spin-icon" />
                                        <span>Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <form className="chat-footer" onSubmit={handleSendMessage}>
                            <input 
                                type="text"
                                placeholder="Ask about pests, soil, crops..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <button type="submit" disabled={!inputValue.trim()}>
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .ai-assistant-wrapper { position: fixed; bottom: 30px; right: 30px; z-index: 10000; }
                .ai-toggle-btn { 
                    width: 60px; height: 60px; border-radius: 20px; 
                    background: linear-gradient(135deg, #10b981, #059669); color: white;
                    border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
                }
                .ai-toggle-btn.active { background: #1e293b; box-shadow: 0 10px 25px rgba(30, 41, 59, 0.3); }
                .pulse-container { position: relative; display: flex; align-items: center; justify-content: center; }
                .notif-pulse { position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; background: #fbbf24; border-radius: 50%; border: 2px solid white; animation: pulseS 2s infinite; }
                @keyframes pulseS { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }

                .ai-chat-bubble { 
                    position: absolute; bottom: 85px; right: 0; 
                    width: 380px; height: 550px; background: white; border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; overflow: hidden;
                    display: flex; flex-direction: column;
                }
                .chat-header { 
                    padding: 16px 20px; background: white; border-bottom: 1px solid #f1f5f9;
                    display: flex; justify-content: space-between; align-items: center; z-index: 10;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
                .chat-header-info { display: flex; align-items: center; gap: 12px; }
                .bot-avatar { width: 38px; height: 38px; border-radius: 12px; background: #dcfce7; color: #166534; display: flex; align-items: center; justify-content: center; }
                .chat-header h4 { margin: 0; font-size: 1rem; color: #0f172a; font-weight: 600; }
                .online-status { font-size: 0.75rem; color: #10b981; font-weight: 600; }
                .header-sparkle { color: #f59e0b; }

                .chat-body { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; background: #f8fafc; }
                .chat-body::-webkit-scrollbar { width: 6px; }
                .chat-body::-webkit-scrollbar-track { background: transparent; }
                .chat-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .chat-body::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

                .message-row { display: flex; gap: 12px; max-width: 85%; }
                .message-row.user { align-self: flex-end; flex-direction: row-reverse; }
                .msg-avatar { width: 28px; height: 28px; border-radius: 50%; background: white; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; color: #64748b; flex-shrink: 0; }
                .message-row.bot .msg-avatar { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
                .message-row.user .msg-avatar { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
                .msg-bubble { padding: 12px 16px; border-radius: 16px; font-size: 0.9rem; line-height: 1.5; color: #334155; background: white; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.02); word-wrap: break-word; }
                .message-row.user .msg-bubble { background: #10b981; color: white; border-color: #059669; border-top-right-radius: 4px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2); }
                .message-row.bot .msg-bubble { border-top-left-radius: 4px; }
                .typing-bubble { display: flex; align-items: center; gap: 8px; font-style: italic; color: #64748b; font-size: 0.85rem; }

                .chat-footer { padding: 16px; border-top: 1px solid #e2e8f0; background: white; display: flex; gap: 12px; z-index: 10; }
                .chat-footer input { flex: 1; border: 1px solid #cbd5e1; background: #f8fafc; padding: 12px 16px; border-radius: 12px; font-size: 0.95rem; outline: none; transition: all 0.2s; color: #1e293b; }
                .chat-footer input::placeholder { color: #94a3b8; }
                .chat-footer input:focus { border-color: #10b981; background: white; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
                .chat-footer button { width: 44px; height: 44px; border-radius: 12px; background: #10b981; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
                .chat-footer button:hover:not(:disabled) { background: #059669; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
                .chat-footer button:disabled { background: #cbd5e1; cursor: not-allowed; }

                .spin-icon { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AIChatAssistant;
