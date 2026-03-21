import React, { useState } from 'react';
import { 
    User, Bell, Shield, Globe, 
    CreditCard, Smartphone, LogOut
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { languages } from '../utils/translations';
import { useLocation } from 'react-router-dom';

const Settings = () => {
    const { currentLang, setCurrentLang, t } = useLanguage();
    const location = useLocation();
    const portalMode = location.pathname.startsWith('/customer') ? 'customer' : 'farmer';
    
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ 
        name: localStorage.getItem('userName') || 'Farmer', 
        phone: localStorage.getItem('userPhone') || '+91 00000 00000' 
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch(`http://localhost:5000/api/auth/profile/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData)
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('userName', data.user.name);
                localStorage.setItem('userPhone', data.user.phone);
                setIsEditing(false);
            } else {
                alert('Failed to save profile');
            }
        } catch (err) {
            console.error(err);
        }
        setIsSaving(false);
    };
    
    const user = {
        name: localStorage.getItem('userName') || 'Farmer',
        phone: localStorage.getItem('userPhone') || '+91 00000 00000',
        role: portalMode
    };

    return (
        <div className="settings-page">
            <header className="page-header">
            </header>

            <div className="settings-content">
                <section className="settings-section">
                    <h3>{t.accountProfile}</h3>
                    <div className="profile-edit-card">
                        <div className="p-icon-large">
                            <User size={40} color="var(--primary)" />
                        </div>
                        <div className="p-details">
                            <div className="detail-item">
                                <label>{t.fullName}</label>
                                {isEditing ? (
                                    <input 
                                        className="edit-input" 
                                        type="text" 
                                        value={editData.name} 
                                        onChange={(e) => setEditData({...editData, name: e.target.value})} 
                                    />
                                ) : (
                                    <p>{user.name}</p>
                                )}
                            </div>
                            <div className="detail-item">
                                <label>{t.phoneNumber}</label>
                                {isEditing ? (
                                    <input 
                                        className="edit-input" 
                                        type="tel" 
                                        value={editData.phone} 
                                        onChange={(e) => setEditData({...editData, phone: e.target.value})} 
                                    />
                                ) : (
                                    <p>{user.phone}</p>
                                )}
                            </div>
                            <div className="detail-item">
                                <label>Role</label>
                                <p style={{ textTransform: 'capitalize' }}>{user.role === 'farmer' ? t.farmer : t.customer}</p>
                            </div>
                        </div>
                        {isEditing ? (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="edit-btn-outline" onClick={() => { setIsEditing(false); setEditData({name: user.name, phone: user.phone}); }} style={{ borderColor: '#e53e3e', color: '#e53e3e' }}>Cancel</button>
                                <button className="edit-btn-outline" onClick={handleSave} style={{ background: 'var(--primary)', color: 'white' }}>{isSaving ? 'Saving...' : 'Save'}</button>
                            </div>
                        ) : (
                            <button className="edit-btn-outline" onClick={() => setIsEditing(true)}>{t.editProfile}</button>
                        )}
                    </div>
                </section>

                <div className="settings-grid">
                    <div className="setting-card" style={{ cursor: 'default' }}>
                        <div className="s-icon"><Globe size={24} /></div>
                        <div className="s-info">
                            <h4>Language</h4>
                            <p>Select your preferred language for the portal.</p>
                            <div className="lang-mini-grid">
                                {languages.slice(0, 5).map(lang => (
                                    <button 
                                        key={lang.code}
                                        className={`mini-lang-btn ${currentLang === lang.code ? 'active' : ''}`}
                                        onClick={() => setCurrentLang(lang.code)}
                                    >
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                {`
                .settings-page { display: flex; flex-direction: column; gap: 25px; }
                .page-header h1 { font-size: 2rem; color: var(--primary-dark); margin-bottom: 4px; }
                .page-header p { color: var(--text-muted); }

                .settings-section { margin-bottom: 30px; }
                .settings-section h3 { font-size: 1.25rem; margin-bottom: 20px; color: #2d3748; }
                
                .profile-edit-card {
                    background: white;
                    padding: 30px;
                    border-radius: 20px;
                    border: 1px solid #edf2f7;
                    display: flex;
                    align-items: center;
                    gap: 30px;
                }
                .p-icon-large {
                    width: 80px;
                    height: 80px;
                    background: var(--secondary);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .p-details { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                .detail-item label { display: block; font-size: 0.8rem; color: #a0aec0; font-weight: 700; margin-bottom: 4px; text-transform: uppercase; }
                .detail-item p { font-size: 1.1rem; font-weight: 600; color: #2d3748; }

                .edit-input {
                    background: #f7fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 8px 12px;
                    width: 100%;
                    font-size: 1rem;
                    font-family: inherit;
                    color: #2d3748;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .edit-input:focus { border-color: var(--primary); background: white; }

                .edit-btn-outline {
                    padding: 10px 24px;
                    border: 1.5px solid var(--primary);
                    background: transparent;
                    color: var(--primary);
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .edit-btn-outline:hover { background: var(--primary); color: white; }

                .settings-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 20px;
                }
                .setting-card {
                    background: white;
                    padding: 24px;
                    border-radius: 20px;
                    border: 1px solid #edf2f7;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .setting-card:hover { border-color: var(--primary); transform: translateY(-2px); }
                .s-icon {
                    width: 48px;
                    height: 48px;
                    background: #f7fafc;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #4a5568;
                }
                .setting-card:hover .s-icon { background: var(--secondary); color: var(--primary); }
                .s-info h4 { margin-bottom: 4px; color: #1a202c; }
                .s-info p { font-size: 0.85rem; color: #718096; margin-bottom: 8px; }
                .lang-mini-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
                .mini-lang-btn {
                    padding: 4px 10px;
                    border-radius: 6px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .mini-lang-btn:hover { border-color: var(--primary); color: var(--primary); }
                .mini-lang-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
                `}
            </style>
        </div>
    );
};

export default Settings;
