import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceInput = ({ onResult, placeholder = "Listening...", lang = 'en-IN' }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setIsSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = lang;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (onResult) onResult(transcript);
        };
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    }, [lang, onResult]);

    const toggleListening = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isSupported) return;

        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            try {
                recognitionRef.current?.start();
            } catch (err) {
                console.error("Failed to start voice recognition:", err);
            }
        }
    };

    if (!isSupported) return null;

    return (
        <div className="voice-input-container" style={{ display: 'flex', alignItems: 'center' }}>
            <button
                onClick={toggleListening}
                className={`voice-mic-btn ${isListening ? 'listening' : ''}`}
                title={isListening ? 'Stop Listening' : 'Speak to Input'}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isListening ? '#ef4444' : '#64748b',
                    position: 'relative',
                    transition: 'all 0.2s'
                }}
            >
                <AnimatePresence mode="wait">
                    {isListening ? (
                        <motion.div
                            key="mic-on"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                        >
                            <Mic size={20} />
                            <motion.div
                                className="mic-pulse"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.3, 0.1, 0.3],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: '#fee2e2',
                                    borderRadius: '50%',
                                    zIndex: -1
                                }}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="mic-off"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                        >
                            <Mic size={20} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>
            {isListening && (
                <motion.span 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', whiteSpace: 'nowrap' }}
                >
                    {placeholder}
                </motion.span>
            )}
        </div>
    );
};

export default VoiceInput;
