(function() {
  'use strict';

  // Get config from window
  var config = window.ChatWidgetConfig || {};

  // Default configuration
  var defaultConfig = {
    ai: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      systemPrompt: '',
      businessContext: '',
      restrictToBusinessTopics: true
    },
    contextSources: [],
    branding: {
      logo: '',
      name: 'Chat',
      welcomeText: 'Hi there 👋',
      responseTimeText: 'We typically reply in a few minutes'
    },
    style: {
      primaryColor: '#059669',
      secondaryColor: '#047857',
      position: 'right',
      backgroundColor: '#ffffff',
      fontColor: '#333333',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    behavior: {
      isOpenByDefault: false,
      popupMessage: '👋 Can I help you with something?',
      autoOpenDelay: 5,
      animation: 'fade',
      soundEnabled: true,
      showInitialMessage: true,
      initialMessage: 'Hello! How can I help you today?'
    },
    faq: []
  };

  // Merge configs
  function mergeConfig(defaults, custom) {
    var result = {};
    for (var key in defaults) {
      if (typeof defaults[key] === 'object' && defaults[key] !== null && !Array.isArray(defaults[key])) {
        result[key] = mergeConfig(defaults[key], custom[key] || {});
      } else {
        result[key] = custom[key] !== undefined ? custom[key] : defaults[key];
      }
    }
    return result;
  }

  var finalConfig = mergeConfig(defaultConfig, config);

  // Generate unique session ID
  function generateSessionId() {
    var stored = localStorage.getItem('chat_session_id');
    if (stored) return stored;
    var id = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('chat_session_id', id);
    return id;
  }

  var sessionId = generateSessionId();

  // Create container
  var container = document.createElement('div');
  container.id = 'chat-widget-container';
  document.body.appendChild(container);

  // Create shadow root for style isolation
  var shadow = container.attachShadow({ mode: 'open' });

  // Widget state
  var isOpen = finalConfig.behavior.isOpenByDefault;
  var messages = [];
  var conversationHistory = [];
  var isLoading = false;

  // Add initial message if enabled
  if (finalConfig.behavior.showInitialMessage && finalConfig.behavior.initialMessage) {
    messages.push({
      role: 'assistant',
      content: finalConfig.behavior.initialMessage,
      timestamp: new Date().toISOString()
    });
  }

  // CSS Styles
  var styles = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .widget-button {
      position: fixed;
      bottom: 20px;
      ${finalConfig.style.position}: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${finalConfig.style.primaryColor};
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 9998;
    }

    .widget-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .widget-button svg {
      width: 28px;
      height: 28px;
      fill: white;
    }

    .popup-message {
      position: fixed;
      bottom: 90px;
      ${finalConfig.style.position}: 20px;
      background: white;
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: ${finalConfig.style.fontFamily};
      font-size: 14px;
      color: ${finalConfig.style.fontColor};
      max-width: 250px;
      animation: fadeIn 0.3s ease;
      z-index: 9997;
    }

    .popup-message::after {
      content: '';
      position: absolute;
      bottom: -8px;
      ${finalConfig.style.position}: 24px;
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid white;
    }

    .chat-window {
      position: fixed;
      bottom: 20px;
      ${finalConfig.style.position}: 20px;
      width: 380px;
      height: 600px;
      max-height: calc(100vh - 40px);
      background: ${finalConfig.style.backgroundColor};
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: ${finalConfig.style.fontFamily};
      z-index: 9999;
      animation: ${finalConfig.behavior.animation}In 0.3s ease;
    }

    @media (max-width: 420px) {
      .chat-window {
        width: calc(100vw - 20px);
        height: calc(100vh - 20px);
        bottom: 10px;
        ${finalConfig.style.position}: 10px;
        border-radius: 12px;
      }
    }

    .chat-header {
      background: ${finalConfig.style.primaryColor};
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .chat-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .chat-logo {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: ${finalConfig.style.secondaryColor};
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .chat-logo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .chat-logo svg {
      width: 20px;
      height: 20px;
      fill: white;
    }

    .chat-title {
      color: white;
      font-size: 16px;
      font-weight: 600;
    }

    .chat-subtitle {
      color: rgba(255, 255, 255, 0.8);
      font-size: 12px;
    }

    .close-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .close-button:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .close-button svg {
      width: 20px;
      height: 20px;
      fill: white;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .welcome-section {
      text-align: center;
      padding: 20px 0;
    }

    .welcome-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: ${finalConfig.style.primaryColor};
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
    }

    .welcome-avatar svg {
      width: 24px;
      height: 24px;
      fill: white;
    }

    .welcome-text {
      font-size: 18px;
      font-weight: 600;
      color: ${finalConfig.style.fontColor};
      margin-bottom: 4px;
    }

    .response-time {
      font-size: 13px;
      color: #6b7280;
    }

    .message {
      display: flex;
      gap: 8px;
      max-width: 85%;
    }

    .message.user {
      margin-left: auto;
      flex-direction: row-reverse;
    }

    .message-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: ${finalConfig.style.primaryColor};
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .message-avatar svg {
      width: 14px;
      height: 14px;
      fill: white;
    }

    .message.user .message-avatar {
      background: #e5e7eb;
    }

    .message.user .message-avatar svg {
      fill: #6b7280;
    }

    .message-content {
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
      color: ${finalConfig.style.fontColor};
    }

    .message.assistant .message-content {
      background: #f3f4f6;
      border-bottom-left-radius: 4px;
    }

    .message.user .message-content {
      background: ${finalConfig.style.primaryColor};
      color: white;
      border-bottom-right-radius: 4px;
    }

    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 10px 14px;
      background: #f3f4f6;
      border-radius: 16px;
      border-bottom-left-radius: 4px;
      width: fit-content;
    }

    .typing-dot {
      width: 6px;
      height: 6px;
      background: #9ca3af;
      border-radius: 50%;
      animation: typing 1.4s infinite;
    }

    .typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    .faq-section {
      padding: 0 16px 16px;
    }

    .faq-title {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .faq-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .faq-button {
      background: #f3f4f6;
      border: none;
      padding: 8px 12px;
      border-radius: 16px;
      font-size: 13px;
      color: ${finalConfig.style.fontColor};
      cursor: pointer;
      transition: background 0.2s;
      font-family: inherit;
    }

    .faq-button:hover {
      background: #e5e7eb;
    }

    .chat-input-area {
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      background: ${finalConfig.style.backgroundColor};
    }

    .chat-input-wrapper {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .chat-input {
      flex: 1;
      border: 1px solid #e5e7eb;
      border-radius: 24px;
      padding: 12px 16px;
      font-size: 14px;
      font-family: inherit;
      color: ${finalConfig.style.fontColor};
      outline: none;
      transition: border-color 0.2s;
    }

    .chat-input:focus {
      border-color: ${finalConfig.style.primaryColor};
    }

    .chat-input::placeholder {
      color: #9ca3af;
    }

    .send-button {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: ${finalConfig.style.primaryColor};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, transform 0.2s;
    }

    .send-button:hover {
      background: ${finalConfig.style.secondaryColor};
      transform: scale(1.05);
    }

    .send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .send-button svg {
      width: 20px;
      height: 20px;
      fill: white;
    }

    .powered-by {
      text-align: center;
      padding: 8px;
      font-size: 11px;
      color: #9ca3af;
    }

    .powered-by a {
      color: #6b7280;
      text-decoration: none;
    }

    .powered-by a:hover {
      text-decoration: underline;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-4px); }
    }
  `;

  // SVG Icons
  var icons = {
    chat: '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h10v2H7zm0-3h10v2H7z"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
    user: '<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
  };

  // Render function
  function render() {
    var html = `<style>${styles}</style>`;

    if (isOpen) {
      html += `
        <div class="chat-window">
          <div class="chat-header">
            <div class="chat-header-info">
              <div class="chat-logo">
                ${finalConfig.branding.logo
                  ? `<img src="${finalConfig.branding.logo}" alt="Logo">`
                  : icons.chat}
              </div>
              <div>
                <div class="chat-title">${finalConfig.branding.name || 'Chat'}</div>
                <div class="chat-subtitle">Online</div>
              </div>
            </div>
            <button class="close-button" onclick="window.__chatWidget.close()">
              ${icons.close}
            </button>
          </div>

          <div class="chat-messages" id="chat-messages">
            <div class="welcome-section">
              <div class="welcome-avatar">${icons.chat}</div>
              <div class="welcome-text">${finalConfig.branding.welcomeText}</div>
              <div class="response-time">${finalConfig.branding.responseTimeText}</div>
            </div>

            ${messages.map(function(msg) {
              return `
                <div class="message ${msg.role}">
                  <div class="message-avatar">
                    ${msg.role === 'user' ? icons.user : icons.chat}
                  </div>
                  <div class="message-content">${escapeHtml(msg.content)}</div>
                </div>
              `;
            }).join('')}

            ${isLoading ? `
              <div class="message assistant">
                <div class="message-avatar">${icons.chat}</div>
                <div class="typing-indicator">
                  <div class="typing-dot"></div>
                  <div class="typing-dot"></div>
                  <div class="typing-dot"></div>
                </div>
              </div>
            ` : ''}
          </div>

          ${finalConfig.faq && finalConfig.faq.length > 0 && messages.length <= 1 ? `
            <div class="faq-section">
              <div class="faq-title">Quick questions</div>
              <div class="faq-buttons">
                ${finalConfig.faq.map(function(item, index) {
                  return `<button class="faq-button" onclick="window.__chatWidget.sendFaq(${index})">${escapeHtml(item.question)}</button>`;
                }).join('')}
              </div>
            </div>
          ` : ''}

          <div class="chat-input-area">
            <div class="chat-input-wrapper">
              <input
                type="text"
                class="chat-input"
                placeholder="Type a message..."
                id="chat-input"
                onkeypress="if(event.key === 'Enter') window.__chatWidget.send()"
                ${isLoading ? 'disabled' : ''}
              >
              <button class="send-button" onclick="window.__chatWidget.send()" ${isLoading ? 'disabled' : ''}>
                ${icons.send}
              </button>
            </div>
          </div>

          <div class="powered-by">
            Powered by <a href="#">BOTiZ</a>
          </div>
        </div>
      `;
    } else {
      html += `
        <button class="widget-button" onclick="window.__chatWidget.open()">
          ${icons.chat}
        </button>
      `;
    }

    shadow.innerHTML = html;

    // Scroll to bottom
    if (isOpen) {
      var messagesContainer = shadow.getElementById('chat-messages');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }

  // Escape HTML
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Send message to API
  async function sendMessage(content) {
    isLoading = true;
    render();

    try {
      // Build the payload for the new API
      var payload = {
        widgetId: finalConfig.widgetId || 'unknown',
        message: content,
        sessionId: sessionId,
        config: {
          provider: finalConfig.ai.provider,
          model: finalConfig.ai.model,
          systemPrompt: finalConfig.ai.systemPrompt,
          businessContext: finalConfig.ai.businessContext,
          restrictToBusinessTopics: finalConfig.ai.restrictToBusinessTopics,
          contextSources: (finalConfig.contextSources || []).map(function(source) {
            return {
              type: source.type,
              name: source.name,
              content: source.content
            };
          }),
          brandingName: finalConfig.branding.name
        },
        conversationHistory: conversationHistory
      };

      // Use API proxy
      var baseUrl = finalConfig.baseUrl || window.location.origin;
      var apiUrl = baseUrl + '/api/chat';

      var response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      var data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'HTTP ' + response.status);
      }

      var botResponse = data.response || 'No response received';

      // Add to conversation history for context
      conversationHistory.push({ role: 'user', content: content });
      conversationHistory.push({ role: 'assistant', content: botResponse });

      // Limit history to last 10 exchanges to avoid token limits
      if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20);
      }

      messages.push({
        role: 'assistant',
        content: botResponse,
        timestamp: new Date().toISOString()
      });

      // Play sound if enabled
      if (finalConfig.behavior.soundEnabled) {
        playNotificationSound();
      }
    } catch (error) {
      console.error('Chat widget error:', error);
      messages.push({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date().toISOString()
      });
    }

    isLoading = false;
    render();
  }

  // Play notification sound
  function playNotificationSound() {
    try {
      var audioContext = new (window.AudioContext || window.webkitAudioContext)();
      var oscillator = audioContext.createOscillator();
      var gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;

      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Audio not supported
    }
  }

  // Public API
  window.__chatWidget = {
    open: function() {
      isOpen = true;
      render();
    },
    close: function() {
      isOpen = false;
      render();
    },
    toggle: function() {
      isOpen = !isOpen;
      render();
    },
    send: function() {
      var input = shadow.getElementById('chat-input');
      if (!input || !input.value.trim()) return;

      var content = input.value.trim();
      messages.push({
        role: 'user',
        content: content,
        timestamp: new Date().toISOString()
      });

      input.value = '';
      render();
      sendMessage(content);
    },
    sendFaq: function(index) {
      var faq = finalConfig.faq[index];
      if (!faq) return;

      messages.push({
        role: 'user',
        content: faq.question,
        timestamp: new Date().toISOString()
      });

      // If FAQ has a predefined answer, use it
      if (faq.answer) {
        messages.push({
          role: 'assistant',
          content: faq.answer,
          timestamp: new Date().toISOString()
        });
        render();
      } else {
        render();
        sendMessage(faq.question);
      }
    }
  };

  // Initial render
  render();

  // Auto-open after delay if configured
  if (finalConfig.behavior.autoOpenDelay > 0 && !finalConfig.behavior.isOpenByDefault) {
    setTimeout(function() {
      if (!isOpen) {
        window.__chatWidget.open();
      }
    }, finalConfig.behavior.autoOpenDelay * 1000);
  }
})();
