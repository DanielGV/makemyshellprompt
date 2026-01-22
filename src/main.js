import Sortable from 'sortablejs';

// --- Configuration Data ---
const COMPONENTS = [
    // Prompt Classics
    { id: 'user', label: 'Username', code: '\\u', example: 'dgv', category: 'Classics' },
    { id: 'host-short', label: 'Host (Short)', code: '\\h', example: 'macbook', category: 'Classics' },
    { id: 'host-full', label: 'Host (Full)', code: '\\H', example: 'macbook.local', category: 'Classics' },
    { id: 'path-full', label: 'Full Path', code: '\\w', example: '~/dev/shellprompt', category: 'Classics' },
    { id: 'path-base', label: 'Current Dir', code: '\\W', example: 'shellprompt', category: 'Classics' },
    { id: 'time-24', label: 'Time (24h)', code: '\\t', example: '21:45:00', category: 'Classics' },
    { id: 'time-12', label: 'Time (12h)', code: '\\@', example: '09:45 PM', category: 'Classics' },
    { id: 'date', label: 'Date', code: '\\d', example: 'Wed Jan 21', category: 'Classics' },
    { id: 'bash-version', label: 'Bash Version', code: '\\v', example: '5.2', category: 'Classics' },
    { id: 'history-num', label: 'History #', code: '\\!', example: '1024', category: 'Classics' },
    { id: 'command-num', label: 'Command #', code: '\\#', example: '42', category: 'Classics' },
    { id: 'jobs', label: 'Active Jobs', code: '\\j', example: '2', category: 'Classics' },
    { id: 'tty', label: 'TTY', code: '\\l', example: 'ttys001', category: 'Classics' },
    { id: 'shell-name', label: 'Shell Name', code: '\\s', example: 'bash', category: 'Classics' },
    { id: 'exit-code', label: 'Exit Code', code: '$?', example: '0', category: 'Classics' },

    // Separation Characters
    { id: 'space', label: 'Space', code: ' ', example: ' ', category: 'Symbols' },
    { id: 'at-symbol', label: '@', code: '@', example: '@', category: 'Symbols' },
    { id: 'colon', label: ':', code: ':', example: ':', category: 'Symbols' },
    { id: 'bracket-open', label: '[', code: '[', example: '[', category: 'Symbols' },
    { id: 'bracket-close', label: ']', code: ']', example: ']', category: 'Symbols' },
    { id: 'parenthesis-open', label: '(', code: '(', example: '(', category: 'Symbols' },
    { id: 'parenthesis-close', label: ')', code: ')', example: ')', category: 'Symbols' },
    { id: 'char-dollar', label: 'Symbol ($)', code: '\\$', example: '$', category: 'Symbols' },
    { id: 'char-arrow', label: 'Arrow (❯)', code: '❯', example: '❯', category: 'Symbols' },
    { id: 'newline', label: 'Newline', code: '\\n', example: '\n', category: 'Symbols' },
    { id: 'emoji-rocket', label: 'Rocket (🚀)', code: '🚀', example: '🚀', category: 'Symbols' },
    { id: 'emoji-lock', label: 'Lock (🔒)', code: '🔒', example: '🔒', category: 'Symbols' },

    // Plugin Integrations
    { id: 'git', label: 'Git Branch', code: '$(git branch 2>/dev/null | grep "^*" | colrm 1 2)', example: 'main', isCommand: true, category: 'Integrations' },
    { id: 'node-v', label: 'Node Version', code: '$(node -v 2>/dev/null)', example: 'v20.10.0', isCommand: true, category: 'Integrations' },
    { id: 'python-v', label: 'Python Version', code: '$(python3 --version 2>/dev/null | cut -d" " -f2)', example: '3.11.5', isCommand: true, category: 'Integrations' },
    { id: 'k8s', label: 'K8s Context', code: '$(kubectl config current-context 2>/dev/null)', example: 'minikube', isCommand: true, category: 'Integrations' },
];

const COLORS = [
    { name: 'Default', value: '' },
    { name: 'Red', value: '#ef4444', code: '31' },
    { name: 'Green', value: '#22c55e', code: '32' },
    { name: 'Yellow', value: '#eab308', code: '33' },
    { name: 'Blue', value: '#3b82f6', code: '34' },
    { name: 'Magenta', value: '#d946ef', code: '35' },
    { name: 'Cyan', value: '#06b6d4', code: '36' },
    { name: 'White', value: '#ffffff', code: '37' },
];

// --- State ---
let selectedItems = [];
let currentPreviewId = 0; // To track and interrupt animations
let lastFullPreview = '';

// --- DOM References ---
const pillsContainer = document.getElementById('pills-container');
const selectedListContainer = document.getElementById('selected-list');
const promptPreview = document.getElementById('prompt-preview');
const terminalBody = document.querySelector('.terminal-body');
const fontSelect = document.getElementById('preview-font-select');
const ps1Output = document.getElementById('ps1-output');
const copyBtn = document.getElementById('copy-btn');

// --- Initialization ---
function init() {
    // Seed default macOS prompt: user@host path %
    const defaultIds = ['user', 'at-symbol', 'host-short', 'space', 'path-base', 'space', 'char-dollar'];
    selectedItems = defaultIds.map((id, index) => {
        const component = COMPONENTS.find(c => c.id === id);
        return {
            ...component,
            instanceId: Date.now() + index + Math.random(),
            color: '',
            colorCode: '',
            isBold: id === 'user' || id === 'char-dollar',
            isDim: id === 'at-symbol' || id === 'colon',
            isItalic: false,
            isUnderline: false
        };
    });

    renderPills();
    initSortable();
    setupEventListeners();
    renderSelectedList();
    updatePreview();
}

function renderPills() {
    const categories = ['Classics', 'Symbols', 'Integrations'];

    pillsContainer.innerHTML = categories.map(cat => `
        <div class="pill-category">
            <h3 class="category-title">${cat}</h3>
            <div class="pills-row">
                ${COMPONENTS.filter(c => c.category === cat).map(comp => `
                    <div class="pill" data-id="${comp.id}">
                        ${comp.label}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    pillsContainer.addEventListener('click', (e) => {
        const pill = e.target.closest('.pill');
        if (pill) {
            addComponent(pill.dataset.id);
        }
    });
}

function initSortable() {
    Sortable.create(selectedListContainer, {
        animation: 150,
        // handle: '.item-handle', // Removing handle to make the whole item draggable
        onEnd: () => {
            syncStateFromDOM();
            updatePreview();
        }
    });
}

function setupEventListeners() {
    copyBtn.addEventListener('click', copyToClipboard);
    fontSelect.addEventListener('change', (e) => {
        terminalBody.style.fontFamily = e.target.value;
    });
}

// --- Logic ---
function addComponent(id) {
    const component = COMPONENTS.find(c => c.id === id);
    const newItem = {
        ...component,
        instanceId: Date.now() + Math.random(),
        color: '',
        colorCode: '',
        isBold: false,
        isDim: false,
        isItalic: false,
        isUnderline: false
    };
    selectedItems.push(newItem);
    renderSelectedList();
    updatePreview();
}

function renderSelectedList() {
    selectedListContainer.innerHTML = selectedItems.map(item => `
    <div class="selected-item" data-instance-id="${item.instanceId}" style="border-left: 4px solid ${item.color || 'transparent'}">
      <div class="item-handle">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="9" x2="16" y2="9"></line>
          <line x1="8" y1="15" x2="16" y2="15"></line>
        </svg>
      </div>
      <div class="item-label" style="
        color: ${item.color || 'inherit'}; 
        font-weight: ${item.isBold ? '700' : (item.isDim ? '300' : '400')};
        font-style: ${item.isItalic ? 'italic' : 'normal'};
        text-decoration: ${item.isUnderline ? 'underline' : 'none'};
        opacity: ${item.isDim ? '0.6' : '1'};
      ">${item.label}</div>
      <div class="item-actions">
        <div class="toggle-group">
            <button class="style-toggle bold ${item.isBold ? 'active' : ''}" data-style="isBold" title="Bold">B</button>
            <button class="style-toggle dim ${item.isDim ? 'active' : ''}" data-style="isDim" title="Dim">D</button>
            <button class="style-toggle italic ${item.isItalic ? 'active' : ''}" data-style="isItalic" title="Italic">I</button>
            <button class="style-toggle underline ${item.isUnderline ? 'active' : ''}" data-style="isUnderline" title="Underline">U</button>
        </div>
        <div class="color-options">
          ${COLORS.map(c => `
            <div class="color-btn ${item.colorCode === c.code && c.code !== '' ? 'active' : ''}" 
                 style="background-color: ${c.value || 'rgba(255,255,255,0.1)'}"
                 title="${c.name}"
                 data-color-code="${c.code}"
                 data-color-hex="${c.value}">
            </div>
          `).join('')}
          <div class="color-picker-wrapper ${item.colorCode === 'custom' ? 'active' : ''}">
            <div class="custom-btn-icon" style="background: ${item.colorCode === 'custom' ? item.color : 'var(--bg-card)'}"></div>
            <input type="color" class="custom-color-picker" title="Custom color" value="${item.color && item.color.startsWith('#') ? item.color : '#ffffff'}">
          </div>
        </div>
      </div>
      <button class="delete-btn" title="Remove">
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  `).join('');

    // Re-attach listeners for buttons in each row
    selectedListContainer.querySelectorAll('.selected-item').forEach(el => {
        const instanceId = parseFloat(el.dataset.instanceId);

        // Style toggles
        el.querySelectorAll('.style-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = selectedItems.find(i => i.instanceId === instanceId);
                if (item) {
                    const style = btn.dataset.style;
                    item[style] = !item[style];
                    renderSelectedList();
                    updatePreview();
                }
            });
        });

        // Color buttons
        el.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                updateItemColor(instanceId, btn.dataset.colorCode, btn.dataset.colorHex);
            });
        });

        // Custom color picker
        const picker = el.querySelector('.custom-color-picker');
        picker.addEventListener('input', (e) => {
            updateItemColor(instanceId, 'custom', e.target.value);
        });
        picker.addEventListener('change', (e) => {
            updateItemColor(instanceId, 'custom', e.target.value);
        });

        // Delete button
        el.querySelector('.delete-btn').addEventListener('click', () => {
            selectedItems = selectedItems.filter(i => i.instanceId !== instanceId);
            renderSelectedList();
            updatePreview();
        });
    });
}

function updateItemColor(instanceId, code, hex) {
    const item = selectedItems.find(i => i.instanceId === instanceId);
    if (item) {
        item.colorCode = code;
        item.color = hex;
        renderSelectedList();
        updatePreview();
    }
}

function syncStateFromDOM() {
    const newOrder = Array.from(selectedListContainer.children).map(el =>
        parseFloat(el.dataset.instanceId)
    );
    selectedItems = newOrder.map(id => selectedItems.find(i => i.instanceId === id));
}

// --- Preview & Animation Logic ---
function getComponentDisplay(item) {
    const now = new Date();
    switch (item.id) {
        case 'user': return 'user';
        case 'host-short': return 'host';
        case 'host-full': return 'hostname';
        case 'path-full': return '~/path/to/dir';
        case 'path-base': return 'dir';
        case 'char-dollar': return '$';
        case 'git': return 'main';
        case 'node-v': return 'v20.10.0';
        case 'python-v': return '3.11.5';
        case 'k8s': return 'minikube';
        case 'bash-version': return '5.2';
        case 'history-num': return '1024';
        case 'command-num': return '42';
        case 'tty': return 'ttys001';
        case 'shell-name': return 'bash';
        case 'jobs': return '1';
        case 'exit-code': return '0';
        case 'newline': return '\n';
        case 'time-24':
            return now.toLocaleTimeString('en-GB', { hour12: false });
        case 'time-12':
            return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        case 'date':
            return now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).replace(',', '');
        default:
            // For characters and others, use code but remove backslashes
            return item.code.replace(/\\(.)/g, '$1');
    }
}

async function updatePreview() {
    const previewId = ++currentPreviewId;
    const ps1String = generatePS1String();
    ps1Output.textContent = `PS1="${ps1String}"`;

    // Prepare segments for typing
    const segments = selectedItems.map(item => ({
        text: getComponentDisplay(item),
        color: item.color || '',
        isBold: item.isBold,
        isDim: item.isDim,
        isItalic: item.isItalic,
        isUnderline: item.isUnderline
    }));

    const previewStateKey = segments.map(s => s.text + (s.color || '') + s.isBold + s.isDim + s.isItalic + s.isUnderline).join('|');
    if (previewStateKey === lastFullPreview) return;
    lastFullPreview = previewStateKey;

    // Deleting phase: character by character (backwards)
    // We work on the text content to avoid breaking HTML tags mid-way
    while (promptPreview.innerText.length > 0) {
        if (previewId !== currentPreviewId) return; // Interrupted by newer update

        // We need to handle spans. Simplest way: re-render preview based on a truncated version of current text
        const currentText = promptPreview.innerText;
        const newText = currentText.slice(0, -1);
        renderStaticPreview(currentText, newText);

        await new Promise(r => setTimeout(r, 5));
    }

    promptPreview.innerHTML = '';

    // Typing phase
    for (const segment of segments) {
        const span = document.createElement('span');
        if (segment.color) span.style.color = segment.color;
        if (segment.isBold) span.style.fontWeight = '700';
        if (segment.isDim) {
            span.style.fontWeight = '300';
            span.style.opacity = '0.6';
        }
        if (segment.isItalic) span.style.fontStyle = 'italic';
        if (segment.isUnderline) span.style.textDecoration = 'underline';
        promptPreview.appendChild(span);

        for (const char of segment.text) {
            if (previewId !== currentPreviewId) return; // Interrupted
            span.textContent += char;
            await new Promise(r => setTimeout(r, 15));
        }
    }
}

// Helper to render a truncated version of the current colored preview
function renderStaticPreview(sourceText, targetText) {
    // This is a bit complex if we want to preserve colors during deletion perfectly.
    // For "very fast" deletion requested by user, we can just truncate the innerText.
    promptPreview.innerText = targetText;
    // Note: This loses colors while deleting, but makes it "very fast" and safe.
    // The typing phase brings back the colors.
}

function generatePreviewText() {
    return selectedItems.map(i => i.example).join('');
}

function generatePS1String() {
    let result = '';
    selectedItems.forEach(item => {
        let styles = [];
        if (item.isBold) styles.push('1');
        if (item.isDim) styles.push('2');
        if (item.isItalic) styles.push('3');
        if (item.isUnderline) styles.push('4');

        if (item.colorCode) {
            const code = item.colorCode === 'custom' ? '38;2;...' : item.colorCode;
            const fullStyles = styles.length > 0 ? styles.join(';') + ';' : '';
            result += `\\[\\e[${fullStyles}${code}m\\]${item.code}\\[\\e[0m\\]`;
        } else if (styles.length > 0) {
            result += `\\[\\e[${styles.join(';')}m\\]${item.code}\\[\\e[0m\\]`;
        } else {
            result += item.code;
        }
    });
    return result;
}

function copyToClipboard() {
    const text = ps1Output.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#22c55e';
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    });
}

init();
