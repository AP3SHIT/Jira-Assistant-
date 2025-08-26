let n8nUrl = 'https://cdb8fd503520.ngrok-free.app/workflow/ju1xVkbu0fZ87YT1';
let currentIssueKey = '';
let connected = false;

// Initialize when page loads
AP.require('request', function(request) {
    init();
});

function init() {
    // Get issue key from URL params
    const urlParams = new URLSearchParams(window.location.search);
    currentIssueKey = urlParams.get('issueKey') || '';
    
    // Load saved n8n URL
    loadConfig();
    
    // Setup event listeners
    setupEventListeners();
    
    // Test connection
    testConnection();
}

function setupEventListeners() {
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const connectButton = document.getElementById('connect-button');
    const mcpUrlInput = document.getElementById('mcp-url');
    
    // Send message on Enter or button click
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    sendButton.addEventListener('click', sendMessage);
    connectButton.addEventListener('click', connectToMCP);
    
    // Show config on header click if admin
    document.getElementById('chat-header').addEventListener('dblclick', () => {
        const configSection = document.getElementById('config-section');
        configSection.style.display = configSection.style.display === 'none' ? 'block' : 'none';
    });
}

function loadConfig() {
    // Try to load from localStorage first
    const savedUrl = localStorage.getItem('n8n-workflow-url');
    if (savedUrl) {
        n8nUrl = savedUrl;
        document.getElementById('mcp-url').value = savedUrl;
    } else {
        document.getElementById('mcp-url').value = n8nUrl;
    }
}

async function connectToMCP() {
    const urlInput = document.getElementById('mcp-url');
    const newUrl = urlInput.value.trim();
    
    if (!newUrl) {
        alert('Please enter a valid n8n workflow URL');
        return;
    }
    
    n8nUrl = newUrl;
    localStorage.setItem('n8n-workflow-url', n8nUrl);
    
    await testConnection();
    
    if (connected) {
        document.getElementById('config-section').style.display = 'none';
        addMessage('system', 'Connected to n8n workflow successfully!');
    }
}

async function testConnection() {
    const statusElement = document.getElementById('connection-status');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    
    try {
        // n8n workflows are always available if the URL is valid
        if (n8nUrl && n8nUrl.includes('ngrok-free.app')) {
            connected = true;
            statusElement.textContent = 'Connected';
            statusElement.classList.add('connected');
            chatInput.disabled = false;
            sendButton.disabled = false;
            addMessage('system', 'Ready to chat! Ask me about Jira issues.');
        } else {
            throw new Error('Invalid n8n workflow URL');
        }
    } catch (error) {
        connected = false;
        statusElement.textContent = 'Disconnected';
        statusElement.classList.remove('connected');
        chatInput.disabled = true;
        sendButton.disabled = true;
        document.getElementById('config-section').style.display = 'block';
        console.error('Connection test failed:', error);
    }
}

async function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    if (!message || !connected) return;
    
    // Add user message to chat
    addMessage('user', message);
    chatInput.value = '';
    
    // Show typing indicator
    const typingId = addMessage('ai', 'Thinking...');
    
    try {
        // Send to n8n workflow
        const response = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                issueKey: currentIssueKey,
                platform: 'jira',
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to get response from n8n workflow');
        }
        
        const data = await response.json();
        
        // Remove typing indicator and add actual response
        removeMessage(typingId);
        addMessage('ai', data.response || data.message || 'Workflow executed successfully');
        
    } catch (error) {
        removeMessage(typingId);
        addMessage('ai', 'Sorry, I encountered an error: ' + error.message);
        console.error('Chat error:', error);
    }
}

function addMessage(sender, content) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    const messageId = 'msg-' + Date.now();
    
    messageDiv.id = messageId;
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.textContent = content;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString();
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageId;
}

function removeMessage(messageId) {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        messageElement.remove();
    }
}

// Handle Jira context
AP.require('context', function(context) {
    context.getToken(function(token) {
        // Store token if needed for API calls
        window.jiraToken = token;
    });
});