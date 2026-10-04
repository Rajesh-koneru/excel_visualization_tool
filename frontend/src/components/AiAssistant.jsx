import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, X, Minimize2, Maximize2, Trash2, Loader2, HelpCircle } from 'lucide-react';
import { aiService } from '../services/api';

export const AiAssistant = ({ dataset, rawRows = [], fileName = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  // Generate dynamic suggested questions based on actual dataset columns
  const getDynamicSuggestions = () => {
    const columns = dataset?.columns || [];
    const numCols = columns.filter((c) => c.type === 'numeric');
    const catCols = columns.filter((c) => c.type === 'categorical');

    const suggestions = [];

    if (numCols.length > 0) {
      const topNum = numCols[0].name;
      suggestions.push(`What is the highest ${topNum}?`);
      suggestions.push(`What is the average ${topNum}?`);

      if (catCols.length > 0) {
        suggestions.push(`Which ${catCols[0].name} has the highest ${topNum}?`);
      }
    }

    if (catCols.length > 0) {
      suggestions.push(`What are the top categories in ${catCols[0].name}?`);
    }

    suggestions.push('Give me an overall report of this data.');
    suggestions.push('Are there any unusual values or missing data?');

    return suggestions.slice(0, 4);
  };

  const handleSendMessage = async (textToSend) => {
    const questionText = (textToSend || inputQuestion).trim();
    if (!questionText || isLoading) return;

    setInputQuestion('');
    setErrorMessage('');

    // Append user message
    const userMsg = { id: Date.now(), sender: 'user', text: questionText, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Prepare compact context (first 15 sample rows max)
      const sample = Array.isArray(rawRows) ? rawRows.slice(0, 15) : [];

      const res = await aiService.query({
        question: questionText,
        datasetId: dataset?.id,
        fileName: fileName || dataset?.fileName,
        datasetContext: {
          fileName: fileName || dataset?.fileName || 'Uploaded Spreadsheet',
          rowCount: rawRows.length || dataset?.rowCount || 0,
          columnCount: dataset?.columnCount || (dataset?.columns || []).length,
          columns: dataset?.columns || [],
          quality: dataset?.quality || {},
          insights: dataset?.insights || [],
        },
        sampleRows: sample,
        chatHistory: messages.slice(-4),
      });

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res.answer || 'I could not find an answer for that query.',
        source: res.source,
        intent: res.intent,
        time: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    } catch (err) {
      console.error('AI Query failed:', err);
      setIsLoading(false);
      setErrorMessage(err.message || 'Unable to generate an AI response right now. Please try again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setErrorMessage('');
  };

  const suggestions = getDynamicSuggestions();

  // Floating trigger button when closed
  if (!isOpen) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999,
        }}
      >
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '30px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.45)',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
        >
          <Bot size={20} />
          <span>Ask AI Assistant</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.2)',
              fontSize: '11px',
              fontWeight: '800',
            }}
          >
            PRO
          </span>
        </button>
      </div>
    );
  }

  // Minimized state pill
  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999,
        }}
      >
        <div
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 18px',
            borderRadius: '24px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Bot size={18} color="#818cf8" />
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#f3f4f6' }}>AI Assistant</span>
          <button
            onClick={() => setIsMinimized(false)}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '2px' }}
            title="Expand"
          >
            <Maximize2 size={15} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '2px' }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '380px',
        maxWidth: 'calc(100vw - 32px)',
        height: '520px',
        maxHeight: 'calc(100vh - 48px)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
      className="glass-panel"
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>AI Data Assistant</div>
            <div style={{ fontSize: '11px', color: '#a5b4fc', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>
              {fileName || dataset?.fileName || 'Active Dataset'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
              title="Clear Chat"
            >
              <Trash2 size={15} />
            </button>
          )}
          <button
            onClick={() => setIsMinimized(true)}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
            title="Minimize"
          >
            <Minimize2 size={15} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
            title="Close"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* Message History Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: 'rgba(11, 15, 25, 0.75)',
        }}
      >
        {/* Welcome Intro message */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            fontSize: '13px',
            color: '#c7d2fe',
            lineHeight: '1.5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', marginBottom: '4px' }}>
            <Sparkles size={14} color="#818cf8" />
            <span>Ready to query your data</span>
          </div>
          Ask questions about totals, highest/lowest values, rankings, or overall summaries.
        </div>

        {/* Suggested Question Chips (Shown when messages are empty) */}
        {messages.length === 0 && suggestions.length > 0 && (
          <div style={{ marginTop: '4px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HelpCircle size={12} />
              <span>Suggested Queries</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#e5e7eb',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#818cf8';
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  }}
                >
                  💡 {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation Bubbles */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '13px',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                background:
                  msg.sender === 'user'
                    ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                    : 'rgba(31, 41, 55, 0.8)',
                color: '#ffffff',
                border: msg.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                borderBottomLeftRadius: msg.sender === 'ai' ? '2px' : '12px',
              }}
            >
              {msg.text}
              {msg.source && (
                <div
                  style={{
                    fontSize: '10px',
                    color: '#9ca3af',
                    marginTop: '6px',
                    textAlign: 'right',
                    fontStyle: 'italic',
                  }}
                >
                  {msg.source === 'deterministic' ? '⚡ Exact Calculation' : '🤖 AI Generated'}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '12px', padding: '6px 8px' }}>
            <Loader2 size={16} className="animate-spin" color="#818cf8" />
            <span>Analyzing dataset & calculating response...</span>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fca5a5',
              fontSize: '12px',
            }}
          >
            {errorMessage}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div
        style={{
          padding: '12px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottomLeftRadius: '16px',
          borderBottomRightRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <input
          type="text"
          placeholder="Ask a question about this Excel data..."
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '10px 12px',
            background: 'rgba(31, 41, 55, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            color: '#ffffff',
            fontSize: '13px',
            outline: 'none',
          }}
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputQuestion.trim() || isLoading}
          style={{
            padding: '10px 14px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            border: 'none',
            borderRadius: '10px',
            color: '#ffffff',
            cursor: !inputQuestion.trim() || isLoading ? 'not-allowed' : 'pointer',
            opacity: !inputQuestion.trim() || isLoading ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};

export default AiAssistant;
