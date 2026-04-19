import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, Search, Users, PlusCircle, MessageSquare, 
    MoreVertical, Image as ImageIcon, X, ChevronLeft,
    User, Phone, Video, Mic, Smile, Plus, Megaphone,
    Heart, ThumbsUp, Laugh, PartyPopper, CheckCircle2, CheckCheck,
    FileText, Camera, Music, Contact, BarChart2, Calendar, Sticker,
    StopCircle, Trash2, Keyboard, Check, Clock, Archive, Pin,
    Paperclip, MapPin, File, Download, Play, Pause, Info, Copy
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
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null); // image, video, audio
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const [allBroadcastHubs, setAllBroadcastHubs] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [replyTo, setReplyTo] = useState(null);
    const [communityIdSearch, setCommunityIdSearch] = useState('');
    const [searchedCommunity, setSearchedCommunity] = useState(null);
    const [searchError, setSearchError] = useState('');
    const [createdCommunityId, setCreatedCommunityId] = useState(null);
    const [showCommunityIdModal, setShowCommunityIdModal] = useState(false);

    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const lastMessageCount = useRef(0);
    const typingTimeoutRef = useRef(null);

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

    const handleMediaSelect = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result);
                if (type === 'photo') {
                    setMediaType(file.type.startsWith('video') ? 'video' : 'image');
                } else {
                    setMediaType(type);
                }
                setShowAttachmentMenu(false);
            };
            reader.readAsDataURL(file);
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
            
            console.log(`Sending to ${endpoint}:`, { 
                sender: userId, 
                senderRole: role, 
                text: newMessage 
            });

            const res = await fetch(`http://localhost:5000/api/communities/${selectedHub._id}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: userId,
                    senderName: userName,
                    senderRole: portalMode === 'farmer' ? 'farmer' : role,
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
            } else {
                const errorData = await res.json();
                console.error('Server error:', errorData);
                alert(`Error: ${errorData.message || 'Failed to send message'}`);
            }
        } catch (err) {
            console.error('Send error:', err);
            alert('Connection error. Please try again.');
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

    const deleteHub = async (e, hubId) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this community? All messages will be permanently removed.')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/communities/${hubId}?userId=${userId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                if (selectedHub?._id === hubId) {
                    setSelectedHub(null);
                }
                fetchData();
            } else {
                const data = await res.json();
                alert(data.message || 'Error deleting community');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete community');
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
                setSearchedCommunity(null);
                setCommunityIdSearch('');
                setSearchError('');
                fetchData();
            }
        } catch (err) {
            console.error('Join error:', err);
        }
    };

    const searchCommunityById = async () => {
        if (!communityIdSearch.trim()) {
            setSearchError('Please enter a Community ID');
            return;
        }
        
        try {
            const res = await fetch(`http://localhost:5000/api/communities/search-by-id/${communityIdSearch.trim()}`);
            if (res.ok) {
                const community = await res.json();
                setSearchedCommunity(community);
                setSearchError('');
            } else {
                setSearchedCommunity(null);
                setSearchError('Community not found. Please check the ID.');
            }
        } catch (err) {
            console.error('Search error:', err);
            setSearchedCommunity(null);
            setSearchError('Failed to search. Please try again.');
        }
    };

    const getHubName = (hub) => {
        if (!hub) return '';
        if (hub.type === 'direct') {
            return hub.name.replace(userName, '').replace('&', '').replace('  ', ' ').trim() || hub.name;
        }
        return hub.name;
    };

    const getMessageStatus = (msg) => {
        if (msg.sender !== userId) return null;
        // Simulate read/delivered status
        const now = new Date();
        const msgTime = new Date(msg.createdAt);
        const diff = (now - msgTime) / 1000; // seconds
        
        if (diff > 60) return 'read'; // Read after 1 min
        if (diff > 10) return 'delivered'; // Delivered after 10 sec
        return 'sent'; // Just sent
    };

    const formatMessageTime = (date) => {
        const msgDate = new Date(date);
        const now = new Date();
        const diff = now - msgDate;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return msgDate.toLocaleDateString([], { weekday: 'short' });
        } else {
            return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const shouldShowDateDivider = (currentMsg, prevMsg) => {
        if (!prevMsg) return true;
        const current = new Date(currentMsg.createdAt).toDateString();
        const prev = new Date(prevMsg.createdAt).toDateString();
        return current !== prev;
    };

    const isCurrentUserAdmin = selectedHub?.admins?.some(adminId => String(adminId) === String(userId)) || portalMode === 'farmer';
    const canPost = selectedHub?.type === 'direct' || portalMode === 'farmer' || isCurrentUserAdmin;

    return (
        <div className="community-page-native">
            <div className="page-header">

                <div className="tab-pills">
                    {[
                        { id: 'Communities', label: portalMode === 'farmer' ? 'Farmer' : 'Customer' },
                        { id: 'Chats', label: 'Chats' },
                        { id: 'Discover', label: 'Discover' }
                    ].map(tab => (
                        <button 
                            key={tab.id} 
                            className={`pill-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => { setActiveTab(tab.id); setSelectedHub(null); }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                
                {role === 'customer' && (
                    <button className="search-id-btn" onClick={() => setShowCreateModal(true)}>
                        <Search size={18} /> Search by ID
                    </button>
                )}
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
                                    <div className={`hub-avatar broadcast ${hub.settings?.allowMemberMessages ? 'yellow-theme' : 'green-theme'}`}>
                                        <Megaphone size={18} />
                                    </div>
                                    <div className="hub-details">
                                        <div className="hub-name">{hub.name}</div>
                                        <div className="hub-desc">{hub.description}</div>
                                        {hub.communityId && (
                                            <div className="community-id-badge">ID: {hub.communityId}</div>
                                        )}
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
                                    <div className={`hub-avatar ${hub.type} ${hub.type === 'broadcast' ? (hub.settings?.allowMemberMessages ? 'yellow-theme' : 'green-theme') : ''}`}>
                                        {hub.type === 'broadcast' ? <Megaphone size={18} /> : (getHubName(hub).charAt(0))}
                                    </div>
                                    <div className="hub-details">
                                        <div className="item-header">
                                            <span className="hub-name">{getHubName(hub)}</span>
                                            <span className="hub-time">{new Date(hub.lastMessage?.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="hub-desc">{hub.lastMessage?.text}</div>
                                        <div className="item-footer">
                                            {hub.type === 'broadcast' && hub.communityId && (
                                                <div className="community-id-badge-small">ID: {hub.communityId}</div>
                                            )}
                                            {role === 'farmer' && (
                                                <button 
                                                    className="delete-item-btn" 
                                                    onClick={(e) => deleteHub(e, hub._id)}
                                                    title="Delete Community"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
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

                        {activeTab === 'Communities' && portalMode === 'farmer' && (
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
                                <div className="header-left">
                                    <button className="back-btn-mobile" onClick={() => setSelectedHub(null)}>
                                        <ChevronLeft size={24} />
                                    </button>
                                    <div className="header-ident">
                                        <div className={`hub-avatar-large ${selectedHub.type} ${selectedHub.type === 'broadcast' ? (selectedHub.settings?.allowMemberMessages ? 'yellow-theme' : 'green-theme') : ''}`}>
                                            {selectedHub.type === 'broadcast' ? (
                                                <Megaphone size={22} />
                                            ) : (
                                                getHubName(selectedHub).charAt(0)
                                            )}
                                            {selectedHub.type === 'direct' && onlineUsers.has(selectedHub._id) && (
                                                <div className="online-indicator"></div>
                                            )}
                                        </div>
                                        <div className="ident-text">
                                            <h3>{getHubName(selectedHub)}</h3>
                                            <span className="status-text">
                                                {selectedHub.type === 'broadcast' 
                                                    ? (
                                                        <>
                                                            {selectedHub.members?.length || 0} members
                                                            {selectedHub.communityId && (
                                                                <span 
                                                                    className="header-community-id" 
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(selectedHub.communityId);
                                                                        alert('Community ID copied to clipboard!');
                                                                    }}
                                                                    style={{ cursor: 'pointer' }}
                                                                    title="Click to copy community ID"
                                                                >
                                                                    | ID: {selectedHub.communityId} <Copy size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                                                                </span>
                                                            )}
                                                        </>
                                                    )
                                                    : onlineUsers.has(selectedHub._id) ? 'online' : 'last seen recently'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="header-actions">
                                    {selectedHub.type === 'direct' && (
                                        <>
                                            <button 
                                                className="h-action-btn" 
                                                onClick={() => alert('Starting video call... (Demo Mode)')}
                                            >
                                                <Video size={20} />
                                            </button>
                                            <button 
                                                className="h-action-btn" 
                                                onClick={() => alert('Starting voice call... (Demo Mode)')}
                                            >
                                                <Phone size={20} />
                                            </button>
                                        </>
                                    )}
                                    <button 
                                        className="h-action-btn"
                                        onClick={() => alert(`${getHubName(selectedHub)} info functionality coming soon!`)}
                                    >
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="messages-container" ref={scrollContainerRef}>
                                {messages.map((msg, idx) => {
                                    const isMe = selectedHub.type === 'broadcast' 
                                        ? (msg.sender === userId && portalMode === 'farmer')
                                        : msg.sender === userId;
                                    const prevMsg = idx > 0 ? messages[idx - 1] : null;
                                    const showDate = shouldShowDateDivider(msg, prevMsg);
                                    const status = getMessageStatus(msg);
                                    
                                    return (
                                        <React.Fragment key={msg._id}>
                                            {showDate && (
                                                <div className="date-divider">
                                                    <span>{formatMessageTime(msg.createdAt)}</span>
                                                </div>
                                            )}
                                            <div className={`msg-block ${isMe ? 'own' : 'other'}`}>
                                                {!isMe && selectedHub.type !== 'broadcast' && (
                                                    <div className="msg-avatar">
                                                        {msg.senderName?.charAt(0) || 'U'}
                                                    </div>
                                                )}
                                                <div className="msg-bubble shadow-sm">
                                                    {!isMe && selectedHub.type === 'broadcast' && (
                                                        <div className="msg-sender">{msg.senderName || 'Admin'}</div>
                                                    )}
                                                    
                                                    {replyTo && replyTo._id === msg._id && (
                                                        <div className="reply-preview">
                                                            <div className="reply-bar"></div>
                                                            <div className="reply-content">
                                                                <span className="reply-name">{msg.senderName}</span>
                                                                <span className="reply-text">{msg.text?.substring(0, 50)}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="msg-content-wrapper">
                                                        {msg.media && (
                                                            <div className="msg-attachment-container">
                                                                {msg.mediaType === 'video' ? (
                                                                    <div className="video-wrapper clickable" onClick={() => setSelectedMedia({ url: msg.media, type: 'video' })}>
                                                                        <video src={msg.media} className="msg-attachment" />
                                                                        <div className="play-overlay"><Play size={48} /></div>
                                                                    </div>
                                                                ) : msg.mediaType === 'audio' ? (
                                                                    <div className="audio-message">
                                                                        <button className="audio-play-btn"><Play size={20} /></button>
                                                                        <div className="audio-waveform">
                                                                            <div className="wave-bar" style={{height: '12px'}}></div>
                                                                            <div className="wave-bar" style={{height: '20px'}}></div>
                                                                            <div className="wave-bar" style={{height: '16px'}}></div>
                                                                            <div className="wave-bar" style={{height: '24px'}}></div>
                                                                            <div className="wave-bar" style={{height: '18px'}}></div>
                                                                            <div className="wave-bar" style={{height: '14px'}}></div>
                                                                            <div className="wave-bar" style={{height: '22px'}}></div>
                                                                            <div className="wave-bar" style={{height: '16px'}}></div>
                                                                        </div>
                                                                        <span className="audio-duration">0:15</span>
                                                                        <audio src={msg.media} style={{display: 'none'}} />
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <img 
                                                                            src={msg.media} 
                                                                            className="msg-attachment clickable" 
                                                                            alt="Content" 
                                                                            onClick={() => setSelectedMedia({ url: msg.media, type: 'image' })}
                                                                        />
                                                                        <div className="media-meta">
                                                                            <span className="msg-time-stamp">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}</span>
                                                                            {isMe && (
                                                                                <div className="check-icons">
                                                                                    {status === 'read' && <CheckCheck size={16} className="read" />}
                                                                                    {status === 'delivered' && <CheckCheck size={16} />}
                                                                                    {status === 'sent' && <Check size={16} />}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                        
                                                        {msg.text && <div className="text-content">{msg.text}</div>}
                                                        
                                                        {(!msg.media || msg.mediaType === 'audio') && (
                                                            <div className="msg-meta">
                                                                <span className="msg-time-stamp">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}</span>
                                                                {isMe && (
                                                                    <div className="check-icons">
                                                                        {status === 'read' && <CheckCheck size={16} className="read" />}
                                                                        {status === 'delivered' && <CheckCheck size={16} />}
                                                                        {status === 'sent' && <Check size={16} />}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
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
                                        </React.Fragment>
                                    );
                                })}
                                {isTyping && (
                                    <div className="typing-indicator">
                                        <div className="typing-bubble">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {canPost ? (
                                <div className="message-input-bar">
                                    {mediaPreview && (
                                        <div className="media-preview-bar">
                                            <div className="preview-content">
                                                {mediaType === 'video' ? (
                                                    <div className="preview-thumb video"><Video size={24} /></div>
                                                ) : mediaType === 'audio' ? (
                                                    <div className="preview-thumb audio"><Mic size={24} /></div>
                                                ) : (
                                                    <img src={mediaPreview} alt="Preview" className="preview-thumb" />
                                                )}
                                                <span className="preview-label">{mediaType || 'Media'}</span>
                                            </div>
                                            <button className="preview-close" onClick={() => { setMediaPreview(null); setMediaType(null); }}>
                                                <X size={18} />
                                            </button>
                                        </div>
                                    )}
                                    
                                    <div className="input-controls-wrapper">
                                        <div className="left-side-controls">
                                            <div className="emoji-picker-container">
                                                <button 
                                                    className={`icon-btn-native ${showEmojiPicker ? 'active' : ''}`} 
                                                    onClick={() => { 
                                                        setShowEmojiPicker(!showEmojiPicker); 
                                                        setShowAttachmentMenu(false); 
                                                    }}
                                                >
                                                    <Smile size={24} />
                                                </button>
                                                <AnimatePresence>
                                                    {showEmojiPicker && (
                                                        <motion.div 
                                                            className="emoji-drawer"
                                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                        >
                                                            <div className="emoji-header">
                                                                <span className="emoji-title">Emojis</span>
                                                            </div>
                                                            <div className="emoji-sections">
                                                                {['😊','😂','🥰','😘','😜','😎','🤔','🤨','🙄','😅','😤','😡','🤯','😱','😨','😴','🤤','😇','🤡','🤠'].map(e => <button key={e} className="e-btn" onClick={() => { setNewMessage(p => p + e); setShowEmojiPicker(false); }}>{e}</button>)}
                                                                {['👍','👎','👌','✌️','🤟','🤘','👋','👏','🙌','🙏','💪','🤳','🧠','👀','👅','👃','👂','👣'].map(e => <button key={e} className="e-btn" onClick={() => { setNewMessage(p => p + e); setShowEmojiPicker(false); }}>{e}</button>)}
                                                                {['❤️','🧡','💛','💚','💙','💜','🖤','💔','❣️','💕','💞','💓','💗','💖','💟','🌸','🌹','🌺','🌻','🌼'].map(e => <button key={e} className="e-btn" onClick={() => { setNewMessage(p => p + e); setShowEmojiPicker(false); }}>{e}</button>)}
                                                                {['🌵','🎄','🌲','🌳','🌾','🌿','☘️','🍀','🌱','🌴','🎋','🍃','🍂','🍁','🍄','🐚','🌾','💐','🌷','🌹'].map(e => <button key={e} className="e-btn" onClick={() => { setNewMessage(p => p + e); setShowEmojiPicker(false); }}>{e}</button>)}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            
                                            <div className="attachment-wrapper">
                                                <button 
                                                    className={`icon-btn-native ${showAttachmentMenu ? 'active' : ''}`} 
                                                    onClick={() => {
                                                        setShowAttachmentMenu(!showAttachmentMenu);
                                                        setShowEmojiPicker(false);
                                                    }}
                                                >
                                                    <Paperclip size={24} />
                                                </button>
                                                
                                                <AnimatePresence>
                                                    {showAttachmentMenu && (
                                                        <motion.div 
                                                            className="attachment-menu-whatsapp"
                                                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                                        >
                                                            <label className="attach-item document">
                                                                <div className="attach-icon"><FileText size={20} /></div>
                                                                <span>Document</span>
                                                                <input type="file" hidden onChange={(e) => handleMediaSelect(e, 'document')} />
                                                            </label>

                                                            <label className="attach-item photos">
                                                                <div className="attach-icon"><ImageIcon size={20} /></div>
                                                                <span>Gallery</span>
                                                                <input type="file" accept="image/*,video/*" hidden onChange={(e) => handleMediaSelect(e, 'photo')} />
                                                            </label>

                                                            <label className="attach-item camera">
                                                                <div className="attach-icon"><Camera size={20} /></div>
                                                                <span>Camera</span>
                                                            </label>

                                                            <div className="attach-item location">
                                                                <div className="attach-icon"><MapPin size={20} /></div>
                                                                <span>Location</span>
                                                            </div>

                                                            <div className="attach-item contact">
                                                                <div className="attach-icon"><User size={20} /></div>
                                                                <span>Contact</span>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                        
                                        {isRecording ? (
                                            <div className="voice-recording-bar">
                                                <button className="cancel-recording" onClick={() => { 
                                                    setIsRecording(false); 
                                                    mediaRecorderRef.current?.stop(); 
                                                    audioChunksRef.current = []; 
                                                }}>
                                                    <Trash2 size={20} />
                                                </button>
                                                <div className="recording-visual">
                                                    <div className="pulse-dot"></div>
                                                    <span className="recording-time">{formatTime(recordingTime)}</span>
                                                    <div className="waveform-live">
                                                        {[...Array(20)].map((_, i) => (
                                                            <div key={i} className="wave-bar-live" style={{
                                                                height: `${Math.random() * 100}%`,
                                                                animationDelay: `${i * 0.05}s`
                                                            }}></div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button className="send-recording" onClick={stopRecording}>
                                                    <Send size={20} />
                                                </button>
                                            </div>
                                        ) : (
                                            <form className="input-form-whatsapp" onSubmit={handleSendMessage}>
                                                <input 
                                                    type="text" 
                                                    placeholder="Type a message" 
                                                    value={newMessage}
                                                    onChange={(e) => {
                                                        setNewMessage(e.target.value);
                                                        // Simulate typing indicator
                                                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                                                        typingTimeoutRef.current = setTimeout(() => {
                                                            setIsTyping(false);
                                                        }, 1000);
                                                    }}
                                                />
                                                {newMessage.trim() || mediaPreview ? (
                                                    <button type="submit" className="send-btn-whatsapp">
                                                        <Send size={20} />
                                                    </button>
                                                ) : (
                                                    <button type="button" className="voice-btn-whatsapp" onClick={startRecording}>
                                                        <Mic size={22} />
                                                    </button>
                                                )}
                                            </form>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="read-only-banner">
                                    <Megaphone size={16} /> Only admins can post announcements
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
                                <h3>
                                    {role === 'customer' && activeTab !== 'Chats' 
                                        ? 'Search Community by ID' 
                                        : activeTab === 'Communities' 
                                        ? 'Create Community' 
                                        : 'Search People'}
                                </h3>
                                <button className="modal-close-btn" onClick={() => {
                                    setShowCreateModal(false);
                                    setSearchedCommunity(null);
                                    setCommunityIdSearch('');
                                    setSearchError('');
                                }}><X size={20} /></button>
                            </div>

                            <div className="modal-body">
                                {role === 'customer' && activeTab !== 'Chats' ? (
                                    <div className="community-id-search">
                                        <div className="search-instruction">
                                            <Megaphone size={24} className="instruction-icon" />
                                            <p>Enter the 8-character Community ID shared by the farmer to join their broadcast channel.</p>
                                        </div>
                                        
                                        <div className="id-search-input">
                                            <input 
                                                type="text" 
                                                placeholder="Enter Community ID (e.g., ABC12345)" 
                                                value={communityIdSearch}
                                                 onChange={(e) => {
                                                    setCommunityIdSearch(e.target.value.toUpperCase());
                                                    setSearchError('');
                                                    setSearchedCommunity(null);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') searchCommunityById();
                                                }}
                                                maxLength={8}
                                            />
                                            <button className="search-id-action-btn" onClick={searchCommunityById}>
                                                <Search size={20} /> Search
                                            </button>
                                        </div>

                                        {searchError && (
                                            <div className="search-error">
                                                <X size={16} /> {searchError}
                                            </div>
                                        )}

                                        {searchedCommunity && (
                                            <motion.div 
                                                className="found-community"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <div className="found-header">
                                                    <div className="found-avatar">
                                                        <Megaphone size={24} />
                                                    </div>
                                                    <div className="found-info">
                                                        <h4>{searchedCommunity.name}</h4>
                                                        <p>{searchedCommunity.description}</p>
                                                        <span className="found-id">ID: {searchedCommunity.communityId}</span>
                                                        <span className="found-members">{searchedCommunity.members?.length || 0} members</span>
                                                    </div>
                                                </div>
                                                <button 
                                                    className="join-found-btn" 
                                                    onClick={() => joinBroadcast(searchedCommunity._id)}
                                                    disabled={communities.some(c => c._id === searchedCommunity._id)}
                                                >
                                                    {communities.some(c => c._id === searchedCommunity._id) ? 'Already Joined' : 'Join Community'}
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>
                                ) : (activeTab === 'Communities' && portalMode === 'farmer') ? (
                                    <form className="native-form" onSubmit={async (e) => {
                                        e.preventDefault();
                                        const form = e.target;
                                        
                                        try {
                                            const res = await fetch(`http://localhost:5000/api/communities/create`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    name: form.name.value,
                                                    description: form.desc.value,
                                                    adminId: userId,
                                                    adminName: userName,
                                                    settings: {
                                                        allowMemberMessages: form.permission.value === 'anyone'
                                                    }
                                                })
                                            });
                                            
                                            if (res.ok) { 
                                                const newCommunity = await res.json();
                                                setCreatedCommunityId(newCommunity.communityId);
                                                setShowCommunityIdModal(true);
                                                fetchData(); 
                                                setShowCreateModal(false); 
                                            } else {
                                                const errorData = await res.json();
                                                console.error('Error creating community:', errorData);
                                                alert(`Failed to create community: ${errorData.message || 'Unknown error'}`);
                                            }
                                        } catch (err) {
                                            console.error('Network error:', err);
                                            alert('Failed to create community. Please check your connection.');
                                        }
                                    }}>
                                        <div className="field">
                                            <label>Community Name</label>
                                            <input type="text" name="name" placeholder="Enter community name" required />
                                        </div>
                                        <div className="field">
                                            <label>Description</label>
                                            <textarea name="desc" placeholder="What is this community about?" rows="3" />
                                        </div>
                                        <div className="field">
                                            <label>Message Permissions</label>
                                            <div className="permission-choices">
                                                <label className="permission-option">
                                                    <input type="radio" name="permission" value="admin" defaultChecked />
                                                    <div className="option-card">
                                                        <div className="option-header">
                                                            <CheckCircle2 size={16} className="check-icon" />
                                                            <span className="option-title">Admin Only</span>
                                                        </div>
                                                        <p className="option-desc">Only you can send messages and media. Best for announcements.</p>
                                                    </div>
                                                </label>
                                                <label className="permission-option">
                                                    <input type="radio" name="permission" value="anyone" />
                                                    <div className="option-card">
                                                        <div className="option-header">
                                                            <Users size={16} className="check-icon" />
                                                            <span className="option-title">Anyone can post</span>
                                                        </div>
                                                        <p className="option-desc">All members can participate and share. Best for discussions.</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="info-note">
                                            <Info size={16} />
                                            <span>A unique Community ID will be generated. Share it with customers to let them join.</span>
                                        </div>
                                        <button type="submit" className="action-submit-btn">Create Community</button>
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

            {/* Community ID Success Modal */}
            <AnimatePresence>
                {showCommunityIdModal && createdCommunityId && (
                    <div className="native-modal-overlay" onClick={() => setShowCommunityIdModal(false)}>
                        <motion.div 
                            className="community-id-modal" 
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className="success-icon">
                                <CheckCircle2 size={64} />
                            </div>
                            <h2>Community Created!</h2>
                            <p>Your community has been created successfully. Share this ID with customers:</p>
                            
                            <div className="community-id-display">
                                <span className="id-label">Community ID</span>
                                <div className="id-value">{createdCommunityId}</div>
                                <button 
                                    className="copy-id-btn" 
                                    onClick={() => {
                                        navigator.clipboard.writeText(createdCommunityId);
                                        alert('Community ID copied to clipboard!');
                                    }}
                                >
                                    <Copy size={18} /> Copy ID
                                </button>
                            </div>
                            
                            <div className="id-instructions">
                                <Info size={18} />
                                <span>Customers can search and join your community using this ID</span>
                            </div>
                            
                            <button className="close-success-btn" onClick={() => setShowCommunityIdModal(false)}>
                                Got it!
                            </button>
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
                    gap: 6px;
                    background: #f1f5f9;
                    padding: 5px;
                    border-radius: 14px;
                }
                .pill-btn {
                    padding: 8px 20px;
                    border-radius: 10px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-weight: 600;
                    font-size: 0.82rem;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .pill-btn.active {
                    background: #2d6a4f;
                    color: white;
                    box-shadow: 0 4px 12px rgba(45, 106, 79, 0.25);
                }
                .pill-btn:not(.active):hover {
                    background: #e2e8f0;
                    color: #334155;
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
                    width: 48px;
                    height: 48px;
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    margin-right: 14px;
                    color: white;
                    flex-shrink: 0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }
                .hub-avatar.broadcast { background: #54656f; }
                .hub-avatar.direct { background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); }

                .hub-avatar.green-theme, .hub-avatar-large.green-theme { background: linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%); }
                .hub-avatar.yellow-theme, .hub-avatar-large.yellow-theme { background: linear-gradient(135deg, #ffbc38 0%, #f39c12 100%); }

                .hub-details { flex: 1; min-width: 0; }
                .item-header { display: flex; justify-content: space-between; margin-bottom: 2px; }
                .hub-name { font-weight: 700; font-size: 0.9rem; color: #2d3436; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .hub-time { font-size: 0.7rem; color: #b2bec3; }
                .hub-desc { font-size: 0.82rem; color: #667781; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                
                .item-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 4px;
                }

                .delete-item-btn {
                    background: transparent;
                    border: none;
                    color: #b2bec3;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: 0.2s;
                }
                .delete-item-btn:hover {
                    background: #ffebee;
                    color: #e53935;
                }

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
                    padding: 12px 20px;
                    background: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(0,0,0,0.06);
                    z-index: 10;
                }
                .header-left { display: flex; align-items: center; gap: 15px; }
                .header-ident { display: flex; align-items: center; gap: 12px; }
                .back-btn-mobile { 
                    background: #f8fafc; 
                    border: 1px solid #edf2f7; 
                    color: #4a5568; 
                    width: 36px; 
                    height: 36px; 
                    border-radius: 10px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    cursor: pointer;
                    transition: 0.2s;
                }
                .back-btn-mobile:hover { background: #edf2f7; color: #1a202c; }

                .hub-avatar-large {
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 1.2rem;
                    position: relative;
                }
                .hub-avatar-large.broadcast { background: #54656f; }
                .hub-avatar-large.direct { background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); }

                .ident-text h3 { margin: 0; font-size: 1rem; font-weight: 700; color: #111b21; line-height: 1.2; }
                .ident-text .status-text { font-size: 0.8rem; color: #667781; display: flex; align-items: center; gap: 4px; margin-top: 2px; }
                
                .header-actions { 
                    display: flex; 
                    gap: 4px; 
                    align-items: center;
                }
                .h-action-btn { 
                    background: transparent; 
                    border: none; 
                    width: 38px; 
                    height: 38px; 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: #54656f; 
                    cursor: pointer; 
                    transition: all 0.2s; 
                }
                .h-action-btn:hover { 
                    background: rgba(0,0,0,0.06); 
                    color: #2d6a4f;
                }
                .h-action-btn:active {
                    background: rgba(0,0,0,0.12);
                    transform: scale(0.95);
                }

                .messages-container {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    background-color: #efeae2;
                    background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
                    background-repeat: repeat;
                    background-size: 400px;
                    background-blend-mode: overlay;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
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
                .check-icons { display: flex; color: #8696a0; }
                .check-icons .read { color: #53bdeb; }

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
                    padding: 10px 16px;
                    background: white;
                    display: flex;
                    align-items: center;
                    border-top: 1px solid rgba(0,0,0,0.06);
                    position: relative;
                }
                .media-preview-bar {
                    position: absolute;
                    bottom: 100%;
                    left: 0;
                    right: 0;
                    background: #f0f2f5;
                    padding: 10px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-top: 1px solid rgba(0,0,0,0.05);
                    z-index: 5;
                }
                .preview-content { display: flex; align-items: center; gap: 12px; }
                .preview-thumb { 
                    width: 48px; 
                    height: 48px; 
                    border-radius: 8px; 
                    object-fit: cover; 
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                .preview-thumb.video, .preview-thumb.audio { 
                    background: #2d6a4f; 
                    color: white; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                }
                .preview-label { font-size: 0.85rem; font-weight: 600; color: #54656f; }
                .preview-close { 
                    background: #e9edef; 
                    border: none; 
                    color: #54656f; 
                    cursor: pointer; 
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex; 
                    align-items: center;
                    justify-content: center;
                    transition: 0.2s;
                }
                .preview-close:hover { background: #d1d7db; color: #ff2e74; }
                .attachment-wrapper { position: relative; }
                .attachment-menu-whatsapp {
                    position: absolute;
                    bottom: 70px;
                    left: 10px;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 5px 30px rgba(0,0,0,0.12);
                    width: 280px;
                    padding: 20px;
                    z-index: 1000;
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .attach-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .attach-item:hover { transform: translateY(-3px); }
                .attach-icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    transition: 0.2s;
                }
                .attach-item.document .attach-icon { background: linear-gradient(135deg, #7f66ff, #512da8); }
                .attach-item.photos .attach-icon { background: linear-gradient(135deg, #ec407a, #c2185b); }
                .attach-item.camera .attach-icon { background: linear-gradient(135deg, #ff7043, #e64a19); }
                .attach-item.location .attach-icon { background: linear-gradient(135deg, #66bb6a, #388e3c); }
                .attach-item.contact .attach-icon { background: linear-gradient(135deg, #26c6da, #0097a7); }
                
                .attach-item span {
                    font-size: 0.75rem;
                    color: #54656f;
                    font-weight: 500;
                }
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
                    bottom: 55px;
                    left: 0;
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
                    color: #54656f;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: 0.2s;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    padding: 0;
                }
                .icon-btn-native:hover { background: rgba(0,0,0,0.05); color: #2d6a4f; }
                .icon-btn-native.active { color: #2d6a4f; background: rgba(45, 106, 79, 0.1); }

                .input-controls-wrapper {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    gap: 12px;
                }
                .left-side-controls {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .input-form-whatsapp {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    background: #f0f2f5;
                    border-radius: 12px;
                    padding: 5px 12px;
                    gap: 10px;
                }
                .input-form-whatsapp input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    padding: 10px 0;
                    outline: none;
                    font-size: 0.95rem;
                    color: #111b21;
                }
                .send-btn-whatsapp, .voice-btn-whatsapp {
                    background: transparent;
                    border: none;
                    color: #54656f;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    transition: 0.2s;
                    border-radius: 50%;
                }
                .send-btn-whatsapp { color: #2d6a4f; }
                .send-btn-whatsapp:hover, .voice-btn-whatsapp:hover {
                    background: rgba(0,0,0,0.05);
                }

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
                .voice-recording-bar {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    background: white;
                    padding: 5px 0;
                }
                .recording-visual {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .read-only-banner { 
                    background: rgba(240, 242, 245, 0.9); 
                    padding: 16px; 
                    text-align: center; 
                    color: #54656f; 
                    font-size: 0.85rem; 
                    font-weight: 500; 
                    border-top: 1px solid rgba(0,0,0,0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

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
                .field input, .field textarea { width: 100%; padding: 12px; border: 1px solid #f1f2f6; border-radius: 10px; margin-bottom: 15px; font-size: 0.9rem; }
                .field textarea { resize: none; }

                .permission-choices {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                .permission-option {
                    cursor: pointer;
                    position: relative;
                }
                .permission-option input {
                    position: absolute;
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .option-card {
                    padding: 15px;
                    border: 2px solid #f1f2f6;
                    border-radius: 12px;
                    height: 100%;
                    transition: 0.2s;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .permission-option input:checked + .option-card {
                    border-color: #2d6a4f;
                    background: #e8f5e9;
                }
                .option-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .option-title {
                    font-weight: 700;
                    font-size: 0.85rem;
                    color: #2d3436;
                }
                .check-icon { color: #b2bec3; transition: 0.2s; }
                .permission-option input:checked + .option-card .check-icon { color: #2d6a4f; }
                .option-desc {
                    margin: 0;
                    font-size: 0.72rem;
                    color: #636e72;
                    line-height: 1.4;
                }

                .u-item { display: flex; align-items: center; padding: 12px; border-radius: 12px; cursor: pointer; transition: 0.2s; }
                .u-item:hover { background: #f1f2f6; }
                .u-avatar { width: 36px; height: 36px; background: #eee; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-weight: 700; }
                .u-info { flex: 1; display: flex; flex-direction: column; }
                .u-info .n { font-weight: 700; font-size: 0.9rem; }
                .u-info .r { font-size: 0.7rem; color: #b2bec3; text-transform: uppercase; }

                /* ========== Community ID Features ========== */
                .search-id-btn {
                    padding: 8px 18px;
                    background: #25d366;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: 0.2s;
                    box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3);
                }
                .search-id-btn:hover {
                    background: #20bd5f;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
                }

                .community-id-badge {
                    display: inline-block;
                    background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
                    color: white;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    margin-top: 6px;
                    letter-spacing: 0.5px;
                }

                .community-id-badge-small {
                    display: inline-block;
                    background: rgba(37, 211, 102, 0.1);
                    color: #128c7e;
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-size: 0.65rem;
                    font-weight: 700;
                    margin-top: 4px;
                    letter-spacing: 0.5px;
                }

                .community-id-search {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .search-instruction {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 16px;
                    background: #e7f9f0;
                    border-radius: 12px;
                    border-left: 4px solid #25d366;
                }
                .instruction-icon {
                    color: #25d366;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                .search-instruction p {
                    margin: 0;
                    color: #2d6a4f;
                    font-size: 0.9rem;
                    line-height: 1.5;
                }

                .id-search-input {
                    display: flex;
                    gap: 10px;
                }
                .id-search-input input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 2px solid #e9edef;
                    border-radius: 12px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    outline: none;
                    transition: 0.2s;
                }
                .id-search-input input:focus {
                    border-color: #25d366;
                    box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
                }
                .search-id-action-btn {
                    padding: 12px 24px;
                    background: #25d366;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: 0.2s;
                }
                .search-id-action-btn:hover {
                    background: #20bd5f;
                    transform: translateY(-2px);
                }

                .search-error {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    background: #ffebee;
                    border-radius: 10px;
                    color: #c62828;
                    font-size: 0.9rem;
                    border-left: 4px solid #c62828;
                }

                .found-community {
                    padding: 20px;
                    background: white;
                    border: 2px solid #25d366;
                    border-radius: 16px;
                    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.15);
                }
                .found-header {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 16px;
                }
                .found-avatar {
                    width: 64px;
                    height: 64px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }
                .found-info {
                    flex: 1;
                }
                .found-info h4 {
                    margin: 0 0 6px 0;
                    font-size: 1.1rem;
                    color: #111b21;
                }
                .found-info p {
                    margin: 0 0 10px 0;
                    color: #667781;
                    font-size: 0.9rem;
                }
                .found-id {
                    display: inline-block;
                    background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 1px;
                    margin-right: 10px;
                }
                .found-members {
                    color: #667781;
                    font-size: 0.8rem;
                }
                .join-found-btn {
                    width: 100%;
                    padding: 12px;
                    background: #25d366;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .join-found-btn:hover:not(:disabled) {
                    background: #20bd5f;
                    transform: translateY(-2px);
                }
                .join-found-btn:disabled {
                    background: #b2bec3;
                    cursor: not-allowed;
                }

                .info-note {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 12px;
                    background: #e3f2fd;
                    border-radius: 10px;
                    color: #1976d2;
                    font-size: 0.85rem;
                    line-height: 1.5;
                }

                .community-id-modal {
                    background: white;
                    border-radius: 24px;
                    padding: 40px;
                    max-width: 480px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                .success-icon {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 20px;
                    background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    animation: successPop 0.5s ease-out;
                }
                @keyframes successPop {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                .community-id-modal h2 {
                    margin: 0 0 12px 0;
                    color: #111b21;
                    font-size: 1.8rem;
                }
                .community-id-modal p {
                    margin: 0 0 24px 0;
                    color: #667781;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }
                .community-id-display {
                    background: linear-gradient(135deg, #e7f9f0 0%, #d4f4e3 100%);
                    padding: 24px;
                    border-radius: 16px;
                    margin-bottom: 20px;
                    border: 2px dashed #25d366;
                }
                .id-label {
                    display: block;
                    font-size: 0.8rem;
                    color: #128c7e;
                    font-weight: 600;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .id-value {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #128c7e;
                    letter-spacing: 4px;
                    margin-bottom: 16px;
                    font-family: 'Courier New', monospace;
                }
                .copy-id-btn {
                    padding: 10px 20px;
                    background: #25d366;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: 0.2s;
                }
                .copy-id-btn:hover {
                    background: #20bd5f;
                    transform: translateY(-2px);
                }
                .id-instructions {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px;
                    background: #fff3e0;
                    border-radius: 10px;
                    color: #e65100;
                    font-size: 0.85rem;
                    margin-bottom: 20px;
                }
                .close-success-btn {
                    width: 100%;
                    padding: 14px;
                    background: #111b21;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .close-success-btn:hover {
                    background: #2d3436;
                    transform: translateY(-2px);
                }

                .header-community-id {
                    color: #25d366 !important;
                    font-weight: 600 !important;
                }

                /* Media Viewer Styles */
                .clickable { cursor: pointer; transition: 0.2s; }
                .clickable:hover { filter: brightness(0.9); }

                .full-media-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.9);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 5000;
                    padding: 20px;
                }
                .full-media-content {
                    position: relative;
                    max-width: 90vw;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                }
                .full-viewer-media {
                    max-width: 100%;
                    max-height: 80vh;
                    border-radius: 12px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                    object-fit: contain;
                }
                .close-viewer {
                    position: absolute;
                    top: -50px;
                    right: 0;
                    background: transparent;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: 0.2s;
                }
                @media (min-width: 768px) {
                    .close-viewer { right: -60px; top: 0; }
                }
                .close-viewer:hover { transform: rotate(90deg); color: #ff2e74; }
                
                .download-viewer-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 24px;
                    background: #25d366;
                    color: white;
                    text-decoration: none;
                    border-radius: 12px;
                    font-weight: 700;
                    transition: 0.2s;
                    box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
                }
                .download-viewer-btn:hover { background: #20bd5f; transform: translateY(-2px); }

            `}</style>
            
            <AnimatePresence>
                {selectedMedia && (
                    <motion.div 
                        className="full-media-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedMedia(null)}
                    >
                        <motion.div 
                            className="full-media-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="close-viewer" onClick={() => setSelectedMedia(null)}>
                                <X size={32} />
                            </button>
                            
                            {selectedMedia.type === 'video' ? (
                                <video src={selectedMedia.url} controls autoPlay className="full-viewer-media" />
                            ) : (
                                <img src={selectedMedia.url} alt="Full View" className="full-viewer-media" />
                            )}

                            <a href={selectedMedia.url} download className="download-viewer-btn">
                                <Download size={20} />
                                Download Message Media
                            </a>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Community;
