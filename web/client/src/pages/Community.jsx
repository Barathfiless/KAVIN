import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, Search, Users, PlusCircle, MessageSquare, 
    MoreVertical, Image as ImageIcon, X, ChevronLeft,
    User, Phone, Video, Mic, Smile, Plus, Megaphone,
    Heart, ThumbsUp, Laugh, PartyPopper, CheckCircle2, CheckCheck,
    FileText, Camera, Music, Contact, BarChart2, Calendar, Sticker,
    StopCircle, Trash2, Keyboard
} from 'lucide-react';

const Community = () => {
    const location = useLocation();
    const portalMode = location.pathname.startsWith('/customer') ? 'customer' : 'farmer';
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName') || 'User';
    const role = localStorage.getItem('role') || portalMode;

    const [activeTab, setActiveTab] = useState('Communities'); // Communities, Chats, Discover
    const [communities, setCommunities] = useState([]);
    const [selectedHub, setSelectedHub] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [userSearchResults, setUserSearchResults] = useState([]);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null); // image, video, audio
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const [allBroadcastHubs, setAllBroadcastHubs] = useState([]);

    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const lastMessageCount = useRef(0);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    useEffect(() => {
        if (selectedHub) {
            fetchMessages(selectedHub._id);
            const interval = setInterval(() => fetchMessages(selectedHub._id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedHub]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
        if (isNearBottom || lastMessageCount.current === 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
        lastMessageCount.current = messages.length;
    }, [messages]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'Communities' || activeTab === 'Discover') {
                const res = await fetch(`http://localhost:5000/api/communities/broadcast/all`);
                const all = await res.json();
                setAllBroadcastHubs(all);
                
                const myRes = await fetch(`http://localhost:5000/api/communities/joined/${userId}`);
                const myData = await myRes.json();
                setCommunities(myData);
            } else {
                const res = await fetch(`http://localhost:5000/api/communities/my/${userId}`);
                const data = await res.json();
                setCommunities(data);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (hubId) => {
        try {
            const endpoint = (activeTab === 'Communities' || selectedHub?.type === 'broadcast') ? 'announcements' : 'messages';
            const res = await fetch(`http://localhost:5000/api/communities/${hubId}/${endpoint}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (err) {
            console.error('Fetch messages error:', err);
        }
    };

    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
        } else {
            setRecordingTime(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    setMediaPreview(reader.result);
                    setMediaType('audio');
                };
                reader.readAsDataURL(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Recording error:', err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !mediaPreview) || !selectedHub) return;
        setShowAttachmentMenu(false);

        try {
            const endpoint = selectedHub.type === 'broadcast' ? 'announce' : 'send';
            const res = await fetch(`http://localhost:5000/api/communities/${selectedHub._id}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: userId,
                    senderName: userName,
                    senderRole: role,
                    text: newMessage,
                    media: mediaPreview,
                    mediaType: mediaType
                })
            });

            if (res.ok) {
                setNewMessage('');
                setMediaPreview(null);
                setMediaType(null);
                fetchMessages(selectedHub._id);
            }
        } catch (err) {
            console.error('Send error:', err);
        }
    };

    const handleReact = async (msgId, emoji) => {
        try {
            const res = await fetch(`http://localhost:5000/api/communities/${msgId}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, emoji })
            });
            if (res.ok) fetchMessages(selectedHub._id);
        } catch (err) {
            console.error('React error:', err);
        }
    };

    const searchUsers = async (q) => {
        setUserSearchQuery(q);
        if (q.length < 2) {
            setUserSearchResults([]);
            return;
        }
        try {
            const res = await fetch(`http://localhost:5000/api/communities/users/search?q=${q}&currentUserId=${userId}`);
            const data = await res.json();
            setUserSearchResults(data);
        } catch (err) {
            console.error('Search error:', err);
        }
    };

    const startDirectChat = async (target) => {
        try {
            const res = await fetch(`http://localhost:5000/api/communities/direct`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    targetUserId: target._id,
                    userName,
                    targetUserName: target.name
                })
            });
            const chat = await res.json();
            setCommunities(prev => [chat, ...prev.filter(c => c._id !== chat._id)]);
            setSelectedHub(chat);
            setShowCreateModal(false);
            setActiveTab('Chats');
        } catch (err) {
            console.error('Direct chat error:', err);
        }
    };

    const joinBroadcast = async (hubId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/communities/${hubId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            if (res.ok) {
                setActiveTab('Communities');
                fetchData();
            }
        } catch (err) {
            console.error('Join error:', err);
        }
    };

    const getHubName = (hub) => {
        if (!hub) return '';
        if (hub.type === 'direct') {
            return hub.name.replace(userName, '').replace('&', '').replace('  ', ' ').trim() || hub.name;
        }
        return hub.name;
    };

    const canPost = selectedHub?.type === 'direct' || (selectedHub?.admins?.includes(userId));

    return (
        <div className="community-page-native">
            <div className="page-header">

                <div className="tab-pills">
                    {['Communities', 'Chats', 'Discover'].map(tab => (
                        <button 
                            key={tab} 
                            className={`pill-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => { setActiveTab(tab); setSelectedHub(null); }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="main-interaction-card">
                <div className="card-sidebar">
                    <div className="sidebar-search">
                        <Search size={18} className="icon" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="items-scroll">
                        {activeTab === 'Discover' ? (
                            allBroadcastHubs.filter(h => !communities.some(my => my._id === h._id)).map(hub => (
                                <div key={hub._id} className="hub-item">
                                    <div className="hub-avatar broadcast"><Megaphone size={18} /></div>
                                    <div className="hub-details">
                                        <div className="hub-name">{hub.name}</div>
                                        <div className="hub-desc">{hub.description}</div>
                                    </div>
                                    <button className="join-tiny-btn" onClick={() => joinBroadcast(hub._id)}>Join</button>
                                </div>
                            ))
                        ) : (
                            communities.map(hub => (
                                <div 
                                    key={hub._id} 
                                    className={`hub-item ${selectedHub?._id === hub._id ? 'active' : ''}`}
                                    onClick={() => setSelectedHub(hub)}
                                >
                                    <div className={`hub-avatar ${hub.type}`}>
                                        {hub.type === 'broadcast' ? <Megaphone size={18} /> : (getHubName(hub).charAt(0))}
                                    </div>
                                    <div className="hub-details">
                                        <div className="item-header">
                                            <span className="hub-name">{getHubName(hub)}</span>
                                            <span className="hub-time">{new Date(hub.lastMessage?.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="hub-desc">{hub.lastMessage?.text}</div>
                                    </div>
                                </div>
                            ))
                        )}

                        {activeTab === 'Chats' && communities.length === 0 && (
                            <div className="empty-prompt">
                                <MessageSquare size={32} />
                                <p>No active chats</p>
                                <button className="create-prompt-btn" onClick={() => setShowCreateModal(true)}>Find Users</button>
                            </div>
                        )}

                        {activeTab === 'Communities' && role === 'farmer' && (
                            <button className="create-channel-btn" onClick={() => setShowCreateModal(true)}>
                                <Plus size={18} /> Create New Channel
                            </button>
                        )}
                    </div>
                </div>

                <div className="card-main-chat">
                    {selectedHub ? (
                        <>
                            <div className="chat-area-header">
                                <div className="header-ident">
                                    <div className={`hub-avatar ${selectedHub.type}`}>
                                        {selectedHub.type === 'broadcast' ? <Megaphone size={18} /> : (getHubName(selectedHub).charAt(0))}
                                    </div>
                                    <div className="ident-text">
                                        <h3>{getHubName(selectedHub)}</h3>
                                        <span>{selectedHub.type === 'broadcast' ? 'Broadcast Channel' : 'Active Conversation'}</span>
                                    </div>
                                </div>
                                <div className="header-actions">
                                    <button className="h-action-btn"><Video size={18} /></button>
                                    <button className="h-action-btn"><Phone size={18} /></button>
                                    <button className="h-action-btn"><MoreVertical size={18} /></button>
                                </div>
                            </div>

                            <div className="messages-container" ref={scrollContainerRef}>
                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender === userId;
                                    return (
                                        <div key={msg._id} className={`msg-block ${isMe ? 'own' : 'other'}`}>
                                            <div className="msg-bubble shadow-sm">
                                                {!isMe && selectedHub.type === 'broadcast' && <div className="msg-sender">Admin</div>}
                                                
                                                <div className="msg-content-wrapper">
                                                    {msg.media && (
                                                        <div className="msg-attachment-container">
                                                            {msg.mediaType === 'video' ? (
                                                                <video src={msg.media} controls className="msg-attachment" />
                                                            ) : msg.mediaType === 'audio' ? (
                                                                <audio src={msg.media} controls className="msg-audio" />
                                                            ) : (
                                                                <>
                                                                    <img src={msg.media} className="msg-attachment" alt="Content" />
                                                                    <div className="media-meta">
                                                                        <span className="msg-time-stamp">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}</span>
                                                                        {isMe && <div className="check-icons"><CheckCheck size={14} /></div>}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    {msg.text && <div className="text-content">{msg.text}</div>}
                                                    
                                                    {!msg.media || msg.mediaType !== 'image' ? (
                                                        <div className="msg-meta">
                                                            <span className="msg-time-stamp">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}</span>
                                                            {isMe && <div className="check-icons"><CheckCheck size={14} /></div>}
                                                        </div>
                                                    ) : null}
                                                </div>
                                                
                                                {selectedHub.type === 'broadcast' && !isMe && (
                                                    <div className="quick-reactions">
                                                        {['❤️', '👍', '🙏', '🔥'].map(e => (
                                                            <button key={e} onClick={() => handleReact(msg._id, e)}>{e}</button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {canPost ? (
                                <div className="message-input-bar">
                                    <div className="input-attachments">
                                        <div className="attachment-wrapper">
                                            <button className={`icon-btn-native ${showAttachmentMenu ? 'active' : ''}`} onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}>
                                                <Plus size={24} />
                                            </button>
                                            
                                            <AnimatePresence>
                                                {showAttachmentMenu && (
                                                    <motion.div 
                                                        className="attachment-menu"
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    >
                                                        <label className="menu-item">
                                                            <span className="icon photo"><ImageIcon size={20} /></span> Photos & videos
                                                            <input type="file" hidden onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => {
                                                                        setMediaPreview(reader.result);
                                                                        setMediaType('image');
                                                                        setShowAttachmentMenu(false);
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }} />
                                                        </label>
                                                        <div className="menu-item"><span className="icon camera"><Camera size={20} /></span> Camera</div>
                                                        <div className="menu-item"><span className="icon audio"><Music size={20} /></span> Audio</div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <div className="emoji-picker-container">
                                            <button className={`icon-btn-native ${showEmojiPicker ? 'active' : ''}`} onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowAttachmentMenu(false); }}>
                                                <Smile size={24} />
                                            </button>
                                            <AnimatePresence>
                                                {showEmojiPicker && (
                                                    <motion.div 
                                                        className="emoji-drawer"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                    >
                                                        <div className="emoji-sections">
                                                            {/* Smileys */}
                                                            {['😊','😍','🥰','😘','😜','😎','🤔','🤨','🙄','😏','😤','😡','🤯','😱','😨','😴','🤤','😇','🤡','🤠'].map(e => <button key={e} className="e-btn" onClick={() => { setNewMessage(p => p + e); setShowEmojiPicker(false); }}>{e}</button>)}
                                                            {/* Hands/People */}
                                                            {['👍','👎','👌','✌️','🤞','🤙','👋','👏','🙌','🙏','💪','🤳','🧠','👀','👅','👄','👃','👣'].map(e => <button key={e} className="e-btn" onClick={() => { setNewMessage(p => p + e); setShowEmojiPicker(false); }}>{e}</button>)}
                                                            {/* Heart/Flowers */}
                                                            {['❤️','🧡','💛','💚','💙','💜','🖤','💔','❣️','💕','💞','💓','💗','💖','💮','🌸','💐','🌹','🌺','🌻'].map(e => <button key={e} className="e-btn" onClick={() => { setNewMessage(p => p + e); setShowEmojiPicker(false); }}>{e}</button>)}
                                                            {/* Nature/Misc */}
                                                            {['🌵','🎄','🍂','🍁','🌾','🌿','☘️','🍀','🌱','🍇','🍈','🍉','🍊','🍋','🍌','🍍','🍎','🍏','🍐','🍑'].map(e => <button key={e} className="e-btn" onClick={() => { setNewMessage(p => p + e); setShowEmojiPicker(false); }}>{e}</button>)}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                    
                                    {isRecording ? (
                                        <div className="voice-recording-overlay">
                                            <div className="recording-status">
                                                <div className="pulse-dot"></div>
                                                <span className="time">{formatTime(recordingTime)}</span>
                                            </div>
                                            <span className="live-label">Recording...</span>
                                            <div className="recording-actions">
                                                <button className="trash-btn" onClick={() => { setIsRecording(false); mediaRecorderRef.current?.stop(); audioChunksRef.current = []; }}><Trash2 size={20} /></button>
                                                <button className="stop-btn" onClick={stopRecording}><StopCircle size={28} /></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <form className="input-form" onSubmit={handleSendMessage}>
                                            <input 
                                                type="text" 
                                                placeholder="Type your message..." 
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                            />
                                            {newMessage.trim() || mediaPreview ? (
                                                <button type="submit" className="send-circle-btn">
                                                    <Send size={18} />
                                                </button>
                                            ) : (
                                                <button type="button" className="voice-btn" onClick={startRecording}>
                                                    <Mic size={22} />
                                                </button>
                                            )}
                                        </form>
                                    )}
                                    {mediaPreview && (
                                        <div className="floating-preview">
                                            {mediaType === 'video' ? (
                                                <div className="p-icon"><Video size={40} /></div>
                                            ) : mediaType === 'audio' ? (
                                                <div className="p-icon"><Mic size={40} /></div>
                                            ) : (
                                                <img src={mediaPreview} alt="Preview" />
                                            )}
                                            <button className="close-preview" onClick={() => { setMediaPreview(null); setMediaType(null); }}><X size={12} /></button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="read-only-banner">
                                    <Megaphone size={16} /> Only admins can post here. Feel free to react to existing posts!
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="chat-empty-state">
                            <div className="empty-content">
                                <MessageSquare size={80} className="empty-icon" />
                                <h2>Select a discussion</h2>
                                <p>Choose a channel or private chat from the sidebar to begin interacting.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Native Styled Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="native-modal-overlay" onClick={() => setShowCreateModal(false)}>
                        <motion.div 
                            className="native-modal-content" 
                            onClick={e => e.stopPropagation()}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                        >
                            <div className="modal-header">
                                <h3>{activeTab === 'Communities' ? 'Create Hub' : 'Search People'}</h3>
                                <button className="modal-close-btn" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
                            </div>

                            <div className="modal-body">
                                {activeTab === 'Communities' ? (
                                    <form className="native-form" onSubmit={async (e) => {
                                        e.preventDefault();
                                        const form = e.target;
                                        const res = await fetch(`http://localhost:5000/api/communities/create`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                name: form.name.value,
                                                description: form.desc.value,
                                                adminId: userId,
                                                adminName: userName
                                            })
                                        });
                                        if (res.ok) { fetchData(); setShowCreateModal(false); }
                                    }}>
                                        <div className="field">
                                            <label>Name</label>
                                            <input type="text" name="name" placeholder="Channel name" required />
                                        </div>
                                        <div className="field">
                                            <label>About</label>
                                            <textarea name="desc" placeholder="What is this channel about?" />
                                        </div>
                                        <button type="submit" className="action-submit-btn">Create Channel</button>
                                    </form>
                                ) : (
                                    <div className="native-search-results">
                                        <div className="m-search-input">
                                            <Search size={18} />
                                            <input 
                                                type="text" 
                                                placeholder="Enter name or phone..." 
                                                value={userSearchQuery}
                                                onChange={(e) => searchUsers(e.target.value)}
                                            />
                                        </div>
                                        <div className="results-list">
                                            {userSearchResults.map(u => (
                                                <div key={u._id} className="u-item" onClick={() => startDirectChat(u)}>
                                                    <div className="u-avatar">{u.name.charAt(0)}</div>
                                                    <div className="u-info">
                                                        <span className="n">{u.name}</span>
                                                        <span className="r">{u.role}</span>
                                                    </div>
                                                    <PlusCircle size={18} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .community-page-native {
                    padding: 0;
                    margin: 0;
                    height: calc(100vh - 100px);
                    display: flex;
                    flex-direction: column;
                    background: transparent;
                }
                
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 25px;
                }


                .tab-pills {
                    display: flex;
                    gap: 10px;
                    background: #dfe6e9;
                    padding: 4px;
                    border-radius: 12px;
                }
                .pill-btn {
                    padding: 8px 18px;
                    border-radius: 9px;
                    border: none;
                    background: transparent;
                    color: #636e72;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .pill-btn.active {
                    background: #2d6a4f;
                    color: white;
                    box-shadow: 0 4px 10px rgba(45, 106, 79, 0.2);
                }

                .main-interaction-card {
                    flex: 1;
                    background: white;
                    border-radius: 24px;
                    display: flex;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    border: 1px solid rgba(0,0,0,0.05);
                }

                .card-sidebar {
                    width: 320px;
                    border-right: 1px solid #f1f2f6;
                    display: flex;
                    flex-direction: column;
                    background: #fbfbfc;
                }
                .sidebar-search {
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: white;
                    border-bottom: 1px solid #f1f2f6;
                }
                .sidebar-search input {
                    border: none;
                    outline: none;
                    font-size: 0.9rem;
                    background: transparent;
                    width: 100%;
                }
                .sidebar-search .icon { color: #b2bec3; }

                .items-scroll { flex: 1; overflow-y: auto; padding: 10px; }
                .hub-item {
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    border-radius: 14px;
                    cursor: pointer;
                    margin-bottom: 5px;
                    transition: 0.2s;
                }
                .hub-item:hover { background: #f1f2f6; }
                .hub-item.active { background: #e8f5e9; border: 1px solid #c8e6c9; }
                
                .hub-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    margin-right: 12px;
                    color: white;
                    flex-shrink: 0;
                }
                .hub-avatar.broadcast { background: #2d6a4f; }
                .hub-avatar.direct { background: #3498db; }

                .hub-details { flex: 1; min-width: 0; }
                .item-header { display: flex; justify-content: space-between; margin-bottom: 2px; }
                .hub-name { font-weight: 700; font-size: 0.9rem; color: #2d3436; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .hub-time { font-size: 0.7rem; color: #b2bec3; }
                .hub-desc { font-size: 0.8rem; color: #636e72; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

                .join-tiny-btn { 
                    padding: 5px 10px; 
                    background: #2d6a4f; 
                    color: white; 
                    border: none; 
                    border-radius: 8px; 
                    font-size: 0.7rem; 
                    font-weight: 700; 
                    cursor: pointer; 
                }

                .card-main-chat { 
                    flex: 1; 
                    display: flex; 
                    flex-direction: column; 
                    background: white; 
                    position: relative;
                }

                .chat-area-header {
                    padding: 15px 25px;
                    background: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #f1f2f6;
                }
                .header-ident { display: flex; align-items: center; gap: 12px; }
                .ident-text h3 { margin: 0; font-size: 1.05rem; color: #2d3436; }
                .ident-text span { font-size: 0.8rem; color: #2d6a4f; font-weight: 600; }
                .header-actions { display: flex; gap: 5px; }
                .h-action-btn { background: #f1f2f6; border: none; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #636e72; cursor: pointer; transition: 0.2s; }
                .h-action-btn:hover { background: #dfe6e9; color: #2d3436; }

                .messages-container {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    background-color: #e5ddd5;
                    background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
                    background-repeat: repeat;
                    background-size: 400px;
                    background-blend-mode: overlay;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .msg-block { 
                    display: flex; 
                    flex-direction: column; 
                    max-width: 75%; 
                    width: fit-content;
                    position: relative; 
                    margin-bottom: 2px;
                }
                .msg-block.own { align-self: flex-end; margin-left: auto; }
                .msg-block.other { align-self: flex-start; margin-right: auto; }
                
                .msg-bubble {
                    background: white;
                    border-radius: 8px;
                    border: none;
                    position: relative;
                    box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
                    padding: 6px 7px 8px 9px;
                    min-width: 60px;
                    word-wrap: break-word;
                }
                .own .msg-bubble { background: #dcf8c6; }
                
                /* Bubble Tails */
                .msg-bubble::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    width: 0;
                    height: 0;
                    border: 8px solid transparent;
                    z-index: 1;
                }
                .other .msg-bubble::before {
                    left: -8px;
                    border-top-color: white;
                    border-right-color: white;
                }
                .own .msg-bubble::before {
                    right: -8px;
                    border-top-color: #dcf8c6;
                    border-left-color: #dcf8c6;
                }

                .msg-sender { font-size: 0.75rem; font-weight: 700; color: #2d6a4f; margin-bottom: 3px; }
                
                .msg-content-wrapper {
                    display: block;
                    position: relative;
                }
                .text-content {
                    font-size: 0.9rem;
                    color: #111b21;
                    line-height: 19px;
                    display: inline;
                }
                
                .msg-meta {
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    margin-left: 8px;
                    margin-top: 4px;
                    float: right;
                    position: relative;
                    bottom: -4px;
                    vertical-align: bottom;
                }
                .msg-time-stamp { font-size: 0.65rem; color: #8696a0; }
                .check-icons { display: flex; color: #53bdeb; }

                /* Media Layout */
                .msg-attachment-container {
                    position: relative;
                    margin: -3px -5px 4px -5px; /* 3px border gap on top/sides */
                    border-radius: 6px;
                    overflow: hidden;
                    max-height: 350px;
                    width: 320px;
                    max-width: 100%;
                    background: rgba(0,0,0,0.05);
                }
                .msg-attachment {
                    width: 100%;
                    height: 100%;
                    max-height: 350px;
                    object-fit: cover;
                    display: block;
                }
                .media-meta {
                    position: absolute;
                    bottom: 5px;
                    right: 8px;
                    background: rgba(0,0,0,0.3);
                    padding: 2px 6px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: white;
                    backdrop-filter: blur(2px);
                }
                .media-meta .msg-time-stamp { color: white; }
                .media-meta .check-icons { color: #53bdeb; }

                .quick-reactions {
                    display: flex;
                    gap: 5px;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid #f1f2f6;
                }
                .quick-reactions button { background: #f8fafc; border: 1px solid #f1f2f6; border-radius: 8px; padding: 4px 8px; cursor: pointer; font-size: 1rem; transition: 0.2s; }
                .quick-reactions button:hover { transform: scale(1.1); background: #fff; }

                .message-input-bar {
                    padding: 15px 25px;
                    background: white;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    border-top: 1px solid #f1f2f6;
                    position: relative;
                }
                .attachment-wrapper { position: relative; }
                .attachment-menu {
                    position: absolute;
                    bottom: 60px;
                    left: 0;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    width: 200px;
                    padding: 8px;
                    z-index: 1000;
                    overflow: hidden;
                    border: 1px solid #f1f2f6;
                }
                .menu-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    font-size: 0.9rem;
                    color: #54656f;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: 0.2s;
                }
                .menu-item:hover { background: #f1f2f6; }
                .menu-item .icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                .menu-item .icon.doc { background: #7f66ff; }
                .menu-item .icon.photo { background: #007bfc; }
                .menu-item .icon.camera { background: #ff2e74; }
                .menu-item .icon.audio { background: #ff7f12; }
                .menu-item .icon.contact { background: #0693ed; }
                .menu-item .icon.poll { background: #ffbc38; }
                .menu-item .icon.event { background: #00c292; }
                .menu-item .icon.sticker { background: #02c5c5; }

                .emoji-picker-container { position: relative; }
                .emoji-drawer {
                    position: absolute;
                    bottom: 60px;
                    left: -50px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    z-index: 1000;
                    width: 280px;
                    max-height: 350px;
                    overflow-y: auto;
                    border: 1px solid #f1f2f6;
                    padding: 8px;
                }
                .emoji-sections {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 5px;
                }
                .e-btn { 
                    border: none; 
                    background: transparent; 
                    outline: none;
                    font-size: 1.5rem; 
                    cursor: pointer; 
                    border-radius: 8px; 
                    padding: 8px;
                    transition: 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .e-btn:hover { background: #f1f2f6; transform: scale(1.1); }

                .icon-btn-native {
                    background: transparent;
                    border: none;
                    outline: none;
                    color: #b2bec3;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: 0.2s;
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    padding: 0;
                }
                .icon-btn-native:hover { background: rgba(0,0,0,0.05); color: #2d6a4f; }
                .icon-btn-native.active { color: #2d6a4f; transform: rotate(45deg); background: rgba(45, 106, 79, 0.1); }

                .voice-recording-overlay {
                    flex: 1;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 10px;
                    height: 44px;
                    border-radius: 12px;
                }
                .recording-status { display: flex; align-items: center; gap: 10px; }
                .pulse-dot { width: 10px; height: 10px; background: #ff2e74; border-radius: 50%; animation: pulse 1s infinite; }
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
                .recording-status .time { font-family: monospace; font-weight: 700; color: #2d3436; }
                .live-label { color: #636e72; font-size: 0.85rem; font-weight: 600; }
                .recording-actions { display: flex; align-items: center; gap: 15px; }
                .trash-btn { color: #b2bec3; border: none; background: none; cursor: pointer; }
                .trash-btn:hover { color: #ff2e74; }
                .stop-btn { color: #ff2e74; border: none; background: none; cursor: pointer; transition: 0.2s; }
                .stop-btn:hover { transform: scale(1.1); }
                .voice-btn { color: #54656f; border: none; background: none; cursor: pointer; transition: 0.2s; }
                .voice-btn:hover { color: #2d6a4f; transform: scale(1.1); }
                .input-attachments { display: flex; gap: 15px; color: #b2bec3; }
                .icon-link { cursor: pointer; transition: 0.2s; }
                .icon-link:hover { color: #2d3436; }
                .input-form { flex: 1; display: flex; align-items: center; gap: 15px; }
                .input-form input { flex: 1; border: none; background: #f1f2f6; padding: 12px 20px; border-radius: 14px; outline: none; font-size: 0.95rem; }
                .send-circle-btn { background: #2d6a4f; color: white; border: none; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; }
                .send-circle-btn:hover { transform: rotate(-15deg) scale(1.1); box-shadow: 0 4px 15px rgba(45, 106, 79, 0.3); }

                .read-only-banner { background: #f1f2f6; padding: 20px; text-align: center; color: #636e72; font-size: 0.9rem; font-weight: 600; }

                .chat-empty-state { flex: 1; display: flex; align-items: center; justify-content: center; }
                .empty-content { text-align: center; color: #b2bec3; }
                .empty-content h2 { color: #2d3436; margin: 20px 0 10px; }

                .create-channel-btn { width: 100%; padding: 12px; background: white; border: 2px dashed #b2bec3; color: #636e72; border-radius: 14px; margin-top: 15px; cursor: pointer; font-weight: 700; transition: 0.2s; }
                .create-channel-btn:hover { border-color: #2d6a4f; color: #2d6a4f; background: #e8f5e9; }

                .native-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 3000; }
                .native-modal-content { background: white; width: 450px; border-radius: 24px; padding: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.1); }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
                .action-submit-btn { width: 100%; padding: 14px; background: #2d6a4f; color: white; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; }
                .field label { display: block; margin-bottom: 8px; font-weight: 700; font-size: 0.85rem; color: #2d3436; }
                .field input, .field textarea { width: 100%; padding: 12px; border: 1px solid #f1f2f6; border-radius: 10px; margin-bottom: 15px; }

                .u-item { display: flex; align-items: center; padding: 12px; border-radius: 12px; cursor: pointer; transition: 0.2s; }
                .u-item:hover { background: #f1f2f6; }
                .u-avatar { width: 36px; height: 36px; background: #eee; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-weight: 700; }
                .u-info { flex: 1; display: flex; flex-direction: column; }
                .u-info .n { font-weight: 700; font-size: 0.9rem; }
                .u-info .r { font-size: 0.7rem; color: #b2bec3; text-transform: uppercase; }

            `}</style>
        </div>
    );
};

export default Community;
