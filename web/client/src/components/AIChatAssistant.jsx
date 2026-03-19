import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Bot, Loader2, User } from 'lucide-react';

const AIChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Welcome to Harvest Hub AI! How can I help your farm flourish today?", sender: 'bot' }
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

    return (
        <div className="ai-assistant-wrapper">
            {/* Toggle Button */}
            <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`ai-toggle-btn ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <div className="pulse-container"><MessageSquare size={24} /><div className="notif-pulse"></div></div>}
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
                                        {msg.text}
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
                    background: linear-gradient(135deg, #2d6a4f, #40916c); color: white;
                    border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 10px 25px rgba(45,106,79,0.3);
                }
                .ai-toggle-btn.active { background: #1a202c; }
                .pulse-container { position: relative; }
                .notif-pulse { position: absolute; -5px; -5px; width: 12px; height: 12px; background: #ffb703; border-radius: 50%; border: 2px solid white; animation: pulseS 2s infinite; }
                @keyframes pulseS { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }

                .ai-chat-bubble { 
                    position: absolute; bottom: 75px; right: 0; 
                    width: 350px; height: 480px; background: white; border-radius: 24px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.15); border: 1px solid #edf2f7; overflow: hidden;
                    display: flex; flex-direction: column;
                }
                .chat-header { 
                    padding: 16px 20px; background: #f8fafc; border-bottom: 1px solid #edf2f7;
                    display: flex; justify-content: space-between; align-items: center;
                }
                .chat-header-info { display: flex; align-items: center; gap: 12px; }
                .bot-avatar { width: 36px; height: 36px; border-radius: 10px; background: #e6fffa; color: #2d6a4f; display: flex; align-items: center; justify-content: center; }
                .chat-header h4 { margin: 0; font-size: 0.95rem; color: #1a202c; }
                .online-status { font-size: 0.7rem; color: #48bb78; font-weight: 700; }
                .header-sparkle { color: #ffb703; }

                .chat-body { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
                .message-row { display: flex; gap: 10px; max-width: 85%; }
                .message-row.user { align-self: flex-end; flex-direction: row-reverse; }
                .msg-avatar { width: 24px; height: 24px; border-radius: 6px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #64748b; flex-shrink: 0; }
                .message-row.user .msg-avatar { background: #e6fffa; color: #2d6a4f; }
                .msg-bubble { padding: 10px 14px; border-radius: 12px; font-size: 0.88rem; line-height: 1.5; color: #4a5568; background: #f8fafc; }
                .message-row.user .msg-bubble { background: #2d6a4f; color: white; border-top-right-radius: 2px; }
                .message-row.bot .msg-bubble { border-top-left-radius: 2px; border: 1px solid #edf2f7; }
                .typing-bubble { display: flex; align-items: center; gap: 8px; font-style: italic; color: #718096; }

                .chat-footer { padding: 16px; border-top: 1px solid #edf2f7; display: flex; gap: 10px; }
                .chat-footer input { flex: 1; border: 1.5px solid #edf2f7; padding: 10px 14px; border-radius: 12px; font-size: 0.9rem; outline: none; }
                .chat-footer input:focus { border-color: #2d6a4f; }
                .chat-footer button { width: 42px; height: 42px; border-radius: 12px; background: #2d6a4f; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .chat-footer button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(45,106,79,0.3); }
                .chat-footer button:disabled { background: #cbd5e0; cursor: not-allowed; }

                .spin-icon { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AIChatAssistant;
