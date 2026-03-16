import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Lock, Leaf, ArrowRight, Sprout } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { translations, languages } from '../utils/translations';
import { Globe } from 'lucide-react';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        role: 'farmer'
    });
    const [message, setMessage] = useState('');
    const [currentLang, setCurrentLang] = useState('en');
    const navigate = useNavigate();

    const t = translations[currentLang];

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setMessage('');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (role) => {
        setFormData({ ...formData, role });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/signup';
            const res = await axios.post(url, formData);
            setMessage(isLogin ? `Welcome back, ${res.data.user.name}!` : 'Signup successful! Please login.');
            if (isLogin) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('role', res.data.user.role);
                navigate('/dashboard');
            } else {
                setIsLogin(true);
            }
        } catch (err) {
            setMessage(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-overlay"></div>
            
            <div className="language-selector">
                <Globe size={18} />
                <select 
                    value={currentLang} 
                    onChange={(e) => setCurrentLang(e.target.value)}
                >
                    {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                </select>
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-card auth-card"
            >
                <div className="card-header">
                    <div className="logo-circle">
                        <Leaf size={32} color="#fff" />
                    </div>
                    <h2>{isLogin ? t.welcomeBack : t.joinOurFarm}</h2>
                    
                    <div className="role-selector">
                        <button 
                            type="button"
                            className={`role-btn ${formData.role === 'farmer' ? 'active' : ''}`}
                            onClick={() => handleRoleChange('farmer')}
                        >
                            {t.farmer}
                        </button>
                        <button 
                            type="button"
                            className={`role-btn ${formData.role === 'customer' ? 'active' : ''}`}
                            onClick={() => handleRoleChange('customer')}
                        >
                            {t.customer}
                        </button>
                    </div>

                    <p>{isLogin ? `${t.loggingInAs} ${formData.role === 'farmer' ? t.farmer : t.customer}` : `${t.signUpAs} ${formData.role === 'farmer' ? t.farmer : t.customer}`}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                        {!isLogin && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="input-group"
                            >
                                <label>{t.fullName}</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    placeholder={t.namePlaceholder}
                                    onChange={handleChange}
                                    required={!isLogin}
                                />
                                <User className="input-icon" size={20} />
                            </motion.div>
                        )}
                    </AnimatePresence>
 
                    <div className="input-group">
                        <label>{t.phoneNumber}</label>
                        <input 
                            type="tel" 
                            name="phone" 
                            placeholder={t.phonePlaceholder}
                            onChange={handleChange}
                            required
                        />
                        <Phone className="input-icon" size={20} />
                    </div>

                    <div className="input-group">
                        <label>{t.password}</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder={t.passwordPlaceholder} 
                            onChange={handleChange}
                            required
                        />
                        <Lock className="input-icon" size={20} />
                    </div>

                    <button type="submit" className="btn-primary w-full">
                        {isLogin ? t.login : t.signUp}
                        <ArrowRight size={20} />
                    </button>
                </form>

                {message && (
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`status-message ${message.includes('Error') || message.includes('wrong') || message.includes('exists') || message.includes('Invalid') || message.includes('Phone') ? 'error' : 'success'}`}
                    >
                        {message}
                    </motion.p>
                )}

                <div className="toggle-mode">
                    {isLogin ? t.dontHaveAccount : t.alreadyHaveAccount}{' '}
                    <button onClick={toggleMode}>
                        {isLogin ? t.createOne : t.loginInstead}
                    </button>
                </div>

                <div className="footer-decoration">
                    <Sprout size={48} className="floating-icon" />
                </div>
            </motion.div>

            <style>
                {`
                .auth-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f0f2f0; /* Solid light grey/green background */
                    position: relative;
                    padding: 20px;
                }
                .auth-overlay {
                    position: absolute;
                    inset: 0;
                    background: #1b4332; /* Primary dark solid color */
                    clip-path: polygon(0 0, 100% 0, 100% 70%, 0 100%);
                    z-index: 0;
                }
                .auth-card {
                    width: 100%;
                    max-width: 450px;
                    padding: 40px;
                    position: relative;
                    z-index: 10;
                }
                .card-header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo-circle {
                    width: 64px;
                    height: 64px;
                    background: var(--primary);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .card-header h2 {
                    font-size: 2rem;
                    color: var(--primary-dark);
                    margin-bottom: 8px;
                }
                .card-header p {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                }
                .w-full { width: 100%; }
                .status-message {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 0.9rem;
                    font-weight: 500;
                    padding: 10px;
                    border-radius: 8px;
                }
                .status-message.success {
                    background: rgba(64, 145, 108, 0.1);
                    color: #2d6a4f;
                }
                .status-message.error {
                    background: rgba(230, 57, 70, 0.1);
                    color: #e63946;
                }
                .toggle-mode {
                    margin-top: 25px;
                    text-align: center;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }
                .toggle-mode button {
                    background: none;
                    border: none;
                    color: var(--primary);
                    font-weight: 700;
                    cursor: pointer;
                    text-decoration: underline;
                }
                .role-selector {
                    display: flex;
                    background: #f1f3f1;
                    padding: 4px;
                    border-radius: 12px;
                    margin: 15px auto;
                    width: fit-content;
                    border: 1px solid #e0e0e0;
                }
                .role-btn {
                    padding: 8px 20px;
                    border: none;
                    background: transparent;
                    border-radius: 9px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                    color: var(--text-muted);
                    transition: all 0.3s ease;
                }
                .role-btn.active {
                    background: white;
                    color: var(--primary);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                }
                .language-selector {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 8px 12px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    z-index: 100;
                    border: 1px solid #e0e0e0;
                }
                .language-selector select {
                    border: none;
                    background: none;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    color: var(--text-main);
                    outline: none;
                }
                .footer-decoration {
                    position: absolute;
                    bottom: -20px;
                    right: -20px;
                    opacity: 0.15;
                }
                .floating-icon {
                    color: var(--primary-dark);
                }
                `}
            </style>
        </div>
    );
};

export default AuthPage;
