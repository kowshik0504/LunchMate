import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Bot, Send, UserCheck, X, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { chatWithGroqAI } from '../services/groqService';

export const AIChatDrawer = ({ isOpen, onClose }) => {
  const { escalateChatToAdmin, activeRole } = useAppState();

  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [isEscalated, setIsEscalated] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Track if user has interacted enough to show the "Talk to human" button
  const [showHumanButton, setShowHumanButton] = useState(false);

  const messagesEndRef = useRef(null);

  const badWords = ['stupid', 'idiot', 'dumb', 'fool', 'badword'];

  // Initialize chat based on role when drawer opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      if (activeRole === 'driver') {
        setMessages([{
          sender: 'ai',
          text: 'Hello Partner! I am LunchMate AI. Do you need help with your active delivery route, payouts, or something else?',
          options: ['Route / Delivery Issue', 'Payout / Financial Issue', 'Other']
        }]);
      } else {
        setMessages([{
          sender: 'ai',
          text: 'Hello! I am LunchMate AI. Are you looking for help with a previous order, refunds, or something else?',
          options: ['Previous Order Issue', 'Refund / Financial Issue', 'Other']
        }]);
      }
    }
  }, [isOpen, activeRole, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, showHumanButton]);

  if (!isOpen) return null;

  const handleSend = async (forcedText = null) => {
    const userText = forcedText || inputMsg.trim();
    if (!userText) return;
    
    // Profanity / Irrelevance Filter
    const lower = userText.toLowerCase();
    const containsBadWord = badWords.some(word => lower.includes(word));
    
    if (containsBadWord) {
      setInputMsg('');
      setMessages(prev => [...prev, { sender: 'user', text: userText }, { 
        sender: 'ai', 
        text: 'I am a polite assistant. I humbly cannot respond to irrelevant or inappropriate topics. Please keep the conversation related to LunchMate.' 
      }]);
      setShowHumanButton(true);
      return;
    }

    const newMsgs = [...messages, { sender: 'user', text: userText }];
    setMessages(newMsgs);
    setInputMsg('');
    setShowHumanButton(true); // User sent a message, they can now escalate if they don't like the AI's answer

    if (isEscalated) return;

    // Direct Escalate Triggers
    if (lower.includes('refund') || lower.includes('financial') || lower.includes('payout') || lower.includes('human') || lower.includes('admin')) {
      triggerManualEscalation(newMsgs, `System Auto-Escalation: User requested ${userText}`);
      return;
    }

    setIsTyping(true);

    const apiMessages = newMsgs.map(m => ({
      role: m.sender === 'ai' || m.sender === 'system' || m.sender === 'admin' ? 'assistant' : 'user',
      content: m.text
    }));
    
    const responseText = await chatWithGroqAI(apiMessages);
    setMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
    setIsTyping(false);
  };

  const triggerManualEscalation = (currentMsgs, reason = "Manual user request for Admin support") => {
    setIsTyping(false);
    setIsEscalated(true);
    const escalatedMsgs = [
      ...currentMsgs,
      {
        sender: 'system',
        text: '⚠️ Smart Escalation Triggered: Connecting to Live Admin. An Administrator will review your full chat history and reply directly.'
      }
    ];
    setMessages(escalatedMsgs);
    escalateChatToAdmin({
      name: activeRole === 'driver' ? "Driver Partner" : "Parent / Customer",
      phone: activeRole === 'driver' ? "+91 88888 77777" : "+91 98765 12345",
      role: activeRole === 'driver' ? "Driver" : "Parent",
      reason: reason,
      messages: escalatedMsgs
    });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', justifyContent: 'flex-end'
    }}>
      <div style={{
        width: '100%', maxWidth: '440px', height: '100%',
        background: '#0F172A', borderLeft: '1px solid rgba(255, 94, 54, 0.3)',
        display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: isEscalated ? '#FF5E36' : '#2EC4B6', padding: '10px', borderRadius: '12px', color: 'white' }}>
              {isEscalated ? <UserCheck size={22} /> : <Bot size={22} />}
            </div>
            <div>
              <h3 style={{ color: 'white', fontSize: '1.1rem' }}>
                {isEscalated ? 'Human Admin Support' : 'AI Support'}
              </h3>
              <p style={{ color: isEscalated ? '#FF9F1C' : '#2EC4B6', fontSize: '0.78rem' }}>
                {isEscalated ? '⚠️ Live Admin Escalated Queue' : '🟢 AI Online (Instant Auto-Reply)'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
            <X size={24} />
          </button>
        </div>

        {/* Messages Body */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {messages.map((msg, index) => (
            <div key={index} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div 
                style={{
                  background: msg.sender === 'user' 
                    ? 'linear-gradient(135deg, #FF5E36, #FF8A00)' 
                    : msg.sender === 'system'
                    ? 'rgba(255, 159, 28, 0.15)'
                    : msg.sender === 'admin'
                    ? 'rgba(46, 196, 182, 0.2)'
                    : 'rgba(30, 41, 59, 0.9)',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  fontSize: '0.9rem',
                  border: msg.sender === 'system' ? '1px dashed #FF9F1C' : msg.sender === 'admin' ? '1px solid #2EC4B6' : '1px solid rgba(255,255,255,0.08)',
                  lineHeight: '1.4'
                }}
              >
                {msg.sender === 'system' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FF9F1C', fontWeight: 600, marginBottom: '4px', fontSize: '0.8rem' }}>
                    <AlertTriangle size={14} /> Escalation Notification
                  </div>
                )}
                {msg.sender === 'admin' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2EC4B6', fontWeight: 600, marginBottom: '4px', fontSize: '0.8rem' }}>
                    <ShieldCheck size={14} /> Official Admin Support
                  </div>
                )}
                {msg.text}
              </div>

              {/* Quick Options */}
              {msg.options && !isEscalated && index === messages.length - 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  {msg.options.map(opt => (
                    <button 
                      key={opt}
                      onClick={() => handleSend(opt)}
                      style={{
                        background: 'transparent', border: '1px solid #2EC4B6', color: '#2EC4B6',
                        padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer',
                        textAlign: 'left', transition: 'all 0.2s ease', hover: { background: 'rgba(46,196,182,0.1)' }
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(46,196,182,0.1)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div style={{ alignSelf: 'flex-start', background: 'rgba(30, 41, 59, 0.9)', padding: '10px 16px', borderRadius: '18px', color: '#94A3B8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={14} className="animate-spin-slow" /> AI is formulating answer...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer Actions */}
        {!isEscalated && showHumanButton && (
          <div style={{ padding: '10px 20px', background: 'rgba(30, 41, 59, 0.5)', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <span style={{ color: '#94A3B8', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>
              Not satisfied with the AI's answer?
            </span>
            <button 
              onClick={() => triggerManualEscalation(messages)}
              style={{
                background: 'transparent', border: '1px solid rgba(255, 159, 28, 0.8)',
                color: '#FF9F1C', padding: '8px 16px', borderRadius: '20px',
                fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,159,28,0.1)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              <UserCheck size={16} /> Talk to Human Admin Support
            </button>
          </div>
        )}

        {/* Input Box */}
        <div style={{ padding: '16px 20px', background: '#1E293B', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder={isEscalated ? "Type message to Admin..." : "Ask a question..."}
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1, background: '#0F172A', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '20px', padding: '10px 16px', color: 'white',
              fontSize: '0.9rem', outline: 'none'
            }}
          />
          <button 
            onClick={() => handleSend()}
            style={{
              background: 'linear-gradient(135deg, #FF5E36, #FF8A00)', border: 'none',
              borderRadius: '50%', width: '42px', height: '42px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 94, 54, 0.4)'
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
