 //  app.js
// KnowledgeBase - Professional Documentation Platform
// Main Application Logic

class KnowledgeBase {
    constructor() {
        this.folders = [];
        this.documents = [];
        this.currentDocId = null;
        this.currentFolderId = null;
        this.currentMode = 'home';
        this.theme = 'light';
        this.pyodide = null;
        this.pyodideLoading = false;

        // GitHub Configuration
        this.githubConfig = {
            token: '',
            owner: 'Atharv-Chaudhari',
            repo: 'Artificial-Intelligence',
            branch: 'main',
            commitTemplate: 'Update documentation: {filename}',
            autoCommit: false,
            syncFolderStructure: true
        };

        // App Settings
        this.settings = {
            theme: 'dark',
            accentColor: '#6366f1',
            enableParticles: true,
            enableAnimations: true,
            editorFontSize: 14,
            autoSave: true,
            livePreview: true,
            pythonPreload: false
        };

        this.init();
    }

    async init() {
        this.loadData();
        this.loadGitHubConfig();
        this.loadSettings();
        this.setupEventListeners();
        this.setupMarkdown();
        this.loadTheme();
        this.updateStats();
        this.renderRecentDocs();
        this.renderFolderTree();
        this.switchMode('home');
        this.applySettings();
        this.initializeParticles();
        this.updateGitHubStatus();

        // Hide loading overlay
        setTimeout(() => {
            document.querySelector('.loading-overlay')?.classList.add('hidden');
        }, 1000);
    }

    // ===== DATA MANAGEMENT =====
    loadData() {
        try {
            const foldersData = localStorage.getItem('kb_folders');
            const docsData = localStorage.getItem('kb_documents');

            this.folders = foldersData ? JSON.parse(foldersData) : [];
            this.documents = docsData ? JSON.parse(docsData) : [];
        } catch (err) {
            console.error('Failed to load data:', err);
            this.folders = [];
            this.documents = [];
        }
    }

    saveData() {
        try {
            localStorage.setItem('kb_folders', JSON.stringify(this.folders));
            localStorage.setItem('kb_documents', JSON.stringify(this.documents));
        } catch (err) {
            console.error('Failed to save data:', err);
            this.showNotification('Failed to save data', 'error');
        }
    }

    // ===== MARKDOWN SETUP =====
    setupMarkdown() {
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                highlight: function(code, lang) {
                    if (window.hljs && lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (err) {}
                    }
                    return window.hljs ? hljs.highlightAuto(code).value : code;
                },
                breaks: true,
                gfm: true
            });
        }
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Mode switching
        document.querySelectorAll('.nav-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.switchMode(mode);
            });
        });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Home actions
        const createDocCard = document.getElementById('createDocCard');
        if (createDocCard) {
            createDocCard.addEventListener('click', () => {
                this.switchMode('edit');
                this.createNewDocument();
            });
        }

        const createFolderCard = document.getElementById('createFolderCard');
        if (createFolderCard) {
            createFolderCard.addEventListener('click', () => {
                this.openFolderModal();
            });
        }

        const viewDocsCard = document.getElementById('viewDocsCard');
        if (viewDocsCard) {
            viewDocsCard.addEventListener('click', () => {
                this.switchMode('view');
            });
        }

        const importDataCard = document.getElementById('importDataCard');
        if (importDataCard) {
            importDataCard.addEventListener('click', () => {
                this.openImportExportModal();
            });
        }

        // Folder management
        const newFolderBtn = document.getElementById('newFolderBtn');
        if (newFolderBtn) {
            newFolderBtn.addEventListener('click', () => {
                this.openFolderModal();
            });
        }

        const newDocInTreeBtn = document.getElementById('newDocInTreeBtn');
        if (newDocInTreeBtn) {
            newDocInTreeBtn.addEventListener('click', () => {
                this.createNewDocument();
            });
        }

        const createFolderBtn = document.getElementById('createFolderBtn');
        if (createFolderBtn) {
            createFolderBtn.addEventListener('click', () => {
                this.createFolder();
            });
        }

        const cancelFolderBtn = document.getElementById('cancelFolderBtn');
        if (cancelFolderBtn) {
            cancelFolderBtn.addEventListener('click', () => {
                this.closeFolderModal();
            });
        }

        // Icon picker
        document.querySelectorAll('.icon-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.icon-option').forEach(b => b.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                const selectedIcon = document.getElementById('selectedIcon');
                if (selectedIcon) selectedIcon.value = e.currentTarget.dataset.icon;
            });
        });

        // Editor
        const markdownEditor = document.getElementById('markdownEditor');
        if (markdownEditor) {
            markdownEditor.addEventListener('input', () => {
                this.updatePreview();
            });
        }

        const docTitle = document.getElementById('docTitle');
        if (docTitle) {
            docTitle.addEventListener('input', () => {
                if (this.currentDocId) {
                    const doc = this.getDocumentById(this.currentDocId);
                    if (doc) doc.title = docTitle.value || 'Untitled';
                }
            });
        }

        const saveDocBtn = document.getElementById('saveDocBtn');
        if (saveDocBtn) {
            saveDocBtn.addEventListener('click', () => {
                this.saveCurrentDocument();
            });
        }

        const deleteDocBtn = document.getElementById('deleteDocBtn');
        if (deleteDocBtn) {
            deleteDocBtn.addEventListener('click', () => {
                this.deleteCurrentDocument();
            });
        }

        // Toolbar
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                if (action) this.applyFormat(action);
            });
        });

        // Image upload
        const imageBtn = document.querySelector('.tool-btn[data-action="image"]');
        if (imageBtn) {
            imageBtn.addEventListener('click', () => {
                const imageUploadInput = document.getElementById('imageUploadInput');
                if (imageUploadInput) imageUploadInput.click();
            });
        }

        const imageUploadInput = document.getElementById('imageUploadInput');
        if (imageUploadInput) {
            imageUploadInput.addEventListener('change', (e) => {
                if (e.target.files[0]) this.handleImageUpload(e.target.files[0]);
            });
        }

        // Python execution
        const runPythonBtn = document.getElementById('runPythonBtn');
        if (runPythonBtn) {
            runPythonBtn.addEventListener('click', () => {
                this.runPythonCode();
            });
        }

        const clearOutputBtn = document.getElementById('clearOutputBtn');
        if (clearOutputBtn) {
            clearOutputBtn.addEventListener('click', () => {
                const pythonOutput = document.getElementById('pythonOutput');
                if (pythonOutput) pythonOutput.innerHTML = '<div class="output-info"><i class="fas fa-info-circle"></i> Output cleared.</div>';
            });
        }

        const closePythonBtn = document.getElementById('closePythonBtn');
        if (closePythonBtn) {
            closePythonBtn.addEventListener('click', () => {
                const pythonPanel = document.getElementById('pythonPanel');
                if (pythonPanel) pythonPanel.classList.remove('active');
            });
        }

        // Import/Export
        const exportAllBtn = document.getElementById('exportAllBtn');
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        const importFileBtn = document.getElementById('importFileBtn');
        if (importFileBtn) {
            importFileBtn.addEventListener('click', () => {
                const importFileInput = document.getElementById('importFileInput');
                if (importFileInput) importFileInput.click();
            });
        }

        const importFileInput = document.getElementById('importFileInput');
        if (importFileInput) {
            importFileInput.addEventListener('change', (e) => {
                if (e.target.files[0]) this.importData(e.target.files[0]);
            });
        }

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });

        // GitHub Settings - SAFE ACCESS
        const githubBtn = document.getElementById('githubBtn');
        if (githubBtn) {
            githubBtn.addEventListener('click', () => {
                const githubModal = document.getElementById('githubModal');
                if (githubModal) {
                    githubModal.classList.add('active');
                    this.loadGitHubSettings();
                }
            });
        }

        const saveGitHubBtn = document.getElementById('saveGitHubBtn');
        if (saveGitHubBtn) {
            saveGitHubBtn.addEventListener('click', () => {
                this.saveGitHubSettings();
            });
        }

        const testGitHubBtn = document.getElementById('testGitHubBtn');
        if (testGitHubBtn) {
            testGitHubBtn.addEventListener('click', () => {
                this.testGitHubConnection();
            });
        }

        const toggleTokenBtn = document.getElementById('toggleTokenBtn');
        if (toggleTokenBtn) {
            toggleTokenBtn.addEventListener('click', () => {
                const input = document.getElementById('githubToken');
                if (input) {
                    const icon = toggleTokenBtn.querySelector('i');
                    if (input.type === 'password') {
                        input.type = 'text';
                        if (icon) icon.className = 'fas fa-eye-slash';
                    } else {
                        input.type = 'password';
                        if (icon) icon.className = 'fas fa-eye';
                    }
                }
            });
        }

        // App Settings
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                const settingsModal = document.getElementById('settingsModal');
                if (settingsModal) {
                    settingsModal.classList.add('active');
                    this.loadAppSettings();
                }
            });
        }

        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveAppSettings();
            });
        }

        // View mode
        const editCurrentBtn = document.getElementById('editCurrentBtn');
        if (editCurrentBtn) {
            editCurrentBtn.addEventListener('click', () => {
                if (this.currentDocId) {
                    this.switchMode('edit');
                    this.loadDocumentInEditor(this.currentDocId);
                }
            });
        }

        // GitHub Sync Button
        const githubSyncBtn = document.getElementById('githubSyncBtn');
        if (githubSyncBtn) {
            githubSyncBtn.addEventListener('click', () => {
                this.manualGitHubSync();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 's') {
                    e.preventDefault();
                    if (this.currentMode === 'edit') this.saveCurrentDocument();
                } else if (e.key === 'b') {
                    e.preventDefault();
                    this.applyFormat('bold');
                } else if (e.key === 'i') {
                    e.preventDefault();
                    this.applyFormat('italic');
                } else if (e.key === 'Enter' && this.currentMode === 'edit') {
                    e.preventDefault();
                    const editor = document.getElementById('markdownEditor');
                    if (editor && editor.value.includes('```python')) {
                        this.runPythonCode();
                    }
                }
            }
        });
    }

    // ===== MODE MANAGEMENT =====
    switchMode(mode) {
        this.currentMode = mode;
        document.body.setAttribute('data-mode', mode);

        // Update nav buttons
        document.querySelectorAll('.nav-mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Show/hide views
        document.querySelectorAll('.view-container').forEach(view => {
            view.classList.remove('active');
        });

        const targetView = document.getElementById(mode + 'View');
        if (targetView) targetView.classList.add('active');

        if (mode === 'home') {
            this.updateStats();
            this.renderRecentDocs();
        } else if (mode === 'edit') {
            this.renderFolderTree();
        } else if (mode === 'view') {
            this.renderViewTree();
        }
    }

    // ===== FOLDER MANAGEMENT =====
    openFolderModal() {
        this.populateParentFolderSelect();
        const folderModal = document.getElementById('folderModal');
        if (folderModal) {
            folderModal.classList.add('active');
            const folderNameInput = document.getElementById('folderNameInput');
            if (folderNameInput) folderNameInput.focus();
        }
    }

    closeFolderModal() {
        const folderModal = document.getElementById('folderModal');
        if (folderModal) folderModal.classList.remove('active');
        
        const folderNameInput = document.getElementById('folderNameInput');
        if (folderNameInput) folderNameInput.value = '';
        
        const parentFolderSelect = document.getElementById('parentFolderSelect');
        if (parentFolderSelect) parentFolderSelect.value = '';
    }

    populateParentFolderSelect() {
        const select = document.getElementById('parentFolderSelect');
        if (!select) return;

        select.innerHTML = '<option value="">Root (No Parent)</option>';

        this.folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.id;
            option.textContent = folder.icon + ' ' + folder.name;
            select.appendChild(option);
        });
    }

    createFolder() {
        const nameInput = document.getElementById('folderNameInput');
        const parentSelect = document.getElementById('parentFolderSelect');
        const selectedIcon = document.getElementById('selectedIcon');
        
        if (!nameInput || !selectedIcon) return;

        const name = nameInput.value.trim();
        const parentId = parentSelect ? parentSelect.value || null : null;
        const icon = selectedIcon.value;

        if (!name) {
            this.showNotification('Please enter a folder name', 'error');
            return;
        }

        const folder = {
            id: Date.now(),
            name: name,
            icon: icon,
            parentId: parentId,
            createdAt: new Date().toISOString(),
            expanded: true
        };

        this.folders.push(folder);
        this.saveData();
        this.renderFolderTree();
        this.closeFolderModal();
        this.updateStats();
        this.showNotification('Folder created successfully', 'success');
    }

    getFolderPath(folderId) {
        const path = [];
        let currentId = folderId;

        while (currentId) {
            const folder = this.folders.find(f => f.id == currentId);
            if (folder) {
                path.unshift(folder);
                currentId = folder.parentId;
            } else {
                break;
            }
        }

        return path;
    }

    // ===== DOCUMENT MANAGEMENT =====
    createNewDocument() {
        const doc = {
            id: Date.now(),
            title: 'Untitled Document',
            content: '',
            category: 'general',
            folderId: this.currentFolderId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.documents.push(doc);
        this.saveData();
        this.loadDocumentInEditor(doc.id);
        this.renderFolderTree();
        this.updateStats();
    }

    loadDocumentInEditor(docId) {
        const doc = this.getDocumentById(docId);
        if (!doc) return;

        this.currentDocId = docId;
        this.currentFolderId = doc.folderId;

        const docTitle = document.getElementById('docTitle');
        const markdownEditor = document.getElementById('markdownEditor');
        const docCategory = document.getElementById('docCategory');

        if (docTitle) docTitle.value = doc.title;
        if (markdownEditor) markdownEditor.value = doc.content;
        if (docCategory) docCategory.value = doc.category;

        this.updateBreadcrumb();
        this.updatePreview();
        this.updateTreeSelection();
    }

    saveCurrentDocument() {
        if (!this.currentDocId) {
            this.showNotification('No document to save', 'error');
            return;
        }

        const doc = this.getDocumentById(this.currentDocId);
        if (!doc) return;

        const docTitle = document.getElementById('docTitle');
        const markdownEditor = document.getElementById('markdownEditor');
        const docCategory = document.getElementById('docCategory');

        if (docTitle) doc.title = docTitle.value || 'Untitled';
        if (markdownEditor) doc.content = markdownEditor.value;
        if (docCategory) doc.category = docCategory.value;
        
        doc.updatedAt = new Date().toISOString();

        this.saveData();
        this.renderFolderTree();
        this.showNotification('Document saved successfully', 'success');

        // Debug: Check if GitHub auto-commit conditions are met
        console.log('GitHub Auto-Commit Check:', {
            autoCommit: this.githubConfig.autoCommit,
            hasToken: !!this.githubConfig.token,
            docTitle: doc.title
        });

        // Auto-commit to GitHub if enabled
        if (this.githubConfig.autoCommit) {
            console.log('Attempting GitHub commit...');
            this.commitToGitHub(
                doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase(),
                doc.content,
                this.githubConfig.commitTemplate.replace('{filename}', doc.title)
            );
        }
    }

    deleteCurrentDocument() {
        if (!this.currentDocId) return;

        if (confirm('Are you sure you want to delete this document?')) {
            this.documents = this.documents.filter(d => d.id !== this.currentDocId);
            this.currentDocId = null;
            this.saveData();
            this.renderFolderTree();
            this.updateStats();

            const docTitle = document.getElementById('docTitle');
            const markdownEditor = document.getElementById('markdownEditor');
            
            if (docTitle) docTitle.value = '';
            if (markdownEditor) markdownEditor.value = '';
            
            this.updatePreview();

            this.showNotification('Document deleted', 'success');
        }
    }

    getDocumentById(id) {
        return this.documents.find(d => d.id == id);
    }

    getDocumentsByFolder(folderId) {
        return this.documents.filter(d => d.folderId == folderId);
    }

    // ===== RENDERING =====
    renderFolderTree() {
        const container = document.getElementById('folderTree');
        if (!container) return;

        container.innerHTML = '';

        // Root level folders
        const rootFolders = this.folders.filter(f => !f.parentId);
        const rootDocs = this.documents.filter(d => !d.folderId);

        rootFolders.forEach(folder => {
            container.appendChild(this.createFolderTreeItem(folder));
        });

        rootDocs.forEach(doc => {
            container.appendChild(this.createDocumentTreeItem(doc));
        });

        if (rootFolders.length === 0 && rootDocs.length === 0) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-3); font-size: 13px;">No documents yet. Click + to create.</div>';
        }
    }

    createFolderTreeItem(folder) {
        const item = document.createElement('div');
        item.className = 'tree-item folder';
        if (folder.expanded) item.classList.add('expanded');

        const childFolders = this.folders.filter(f => f.parentId == folder.id);
        const childDocs = this.documents.filter(d => d.folderId == folder.id);
        const hasChildren = childFolders.length > 0 || childDocs.length > 0;

        item.innerHTML = `
            ${hasChildren ? '<i class="fas fa-caret-right expand-icon"></i>' : '<span style="width: 14px; display: inline-block;"></span>'}
            <span class="icon">${folder.icon}</span>
            <span class="name">${this.escapeHtml(folder.name)}</span>
        `;

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            folder.expanded = !folder.expanded;
            item.classList.toggle('expanded');
            this.saveData();

            const children = item.nextElementSibling;
            if (children && children.classList.contains('tree-children')) {
                children.style.display = folder.expanded ? 'block' : 'none';
            }
        });

        const wrapper = document.createElement('div');
        wrapper.appendChild(item);

        if (hasChildren) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'tree-children';
            childrenContainer.style.display = folder.expanded ? 'block' : 'none';

            childFolders.forEach(child => {
                childrenContainer.appendChild(this.createFolderTreeItem(child));
            });

            childDocs.forEach(doc => {
                childrenContainer.appendChild(this.createDocumentTreeItem(doc));
            });

            wrapper.appendChild(childrenContainer);
        }

        return wrapper;
    }

    createDocumentTreeItem(doc) {
        const item = document.createElement('div');
        item.className = 'tree-item';
        if (doc.id == this.currentDocId) item.classList.add('active');

        const icons = {
            general: '📄',
            code: '💻',
            architecture: '🏗️',
            api: '🔌',
            tutorial: '🎓',
            notes: '📝',
            python: '🐍'
        };

        item.innerHTML = `
            <span style="width: 14px; display: inline-block;"></span>
            <span class="icon">${icons[doc.category] || '📄'}</span>
            <span class="name">${this.escapeHtml(doc.title)}</span>
        `;

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            this.loadDocumentInEditor(doc.id);
        });

        return item;
    }

    updateTreeSelection() {
        document.querySelectorAll('.tree-item').forEach(item => {
            item.classList.remove('active');
        });
        // Active state is set in renderFolderTree
        this.renderFolderTree();
    }

    updateBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumbPath');
        if (!breadcrumb) return;

        if (!this.currentDocId) {
            breadcrumb.innerHTML = '<i class="fas fa-home"></i> No document selected';
            return;
        }

        const doc = this.getDocumentById(this.currentDocId);
        if (!doc) return;

        const path = this.getFolderPath(doc.folderId);
        let html = '<i class="fas fa-home"></i>';

        path.forEach(folder => {
            html += ` <i class="fas fa-angle-right"></i> ${folder.icon} ${this.escapeHtml(folder.name)}`;
        });

        html += ` <i class="fas fa-angle-right"></i> ${this.escapeHtml(doc.title)}`;
        breadcrumb.innerHTML = html;
    }

    // ===== PREVIEW =====
    updatePreview() {
        const markdownEditor = document.getElementById('markdownEditor');
        const preview = document.getElementById('livePreview');
        
        if (!markdownEditor || !preview) return;

        const content = markdownEditor.value;

        // Convert markdown if marked is available
        let html = typeof marked !== 'undefined' ? marked.parse(content) : content;

        // Find Python executable blocks
        html = html.replace(/<pre><code class="language-python:run">([\s\S]*?)<\/code><\/pre>/g,
            (match, code) => {
                const decodedCode = this.decodeHtml(code);
                return `
                    <div class="python-executable">
                        <button class="code-run-btn" onclick="window.kb.runPythonBlock('${this.encodeForAttribute(decodedCode)}')">
                            <i class="fas fa-play"></i> Run
                        </button>
                        <pre><code class="language-python">${code}</code></pre>
                    </div>
                `;
            }
        );

        // Sanitize if DOMPurify is available
        if (typeof DOMPurify !== 'undefined') {
            html = DOMPurify.sanitize(html);
        }

        preview.innerHTML = html;

        // Re-highlight code blocks if hljs is available
        if (window.hljs) {
            preview.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    }

    // ===== TEXT FORMATTING =====
    applyFormat(action) {
        const editor = document.getElementById('markdownEditor');
        if (!editor) return;

        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        let replacement = '';

        switch(action) {
            case 'bold':
                replacement = `**${selectedText || 'bold text'}**`;
                break;
            case 'italic':
                replacement = `*${selectedText || 'italic text'}*`;
                break;
            case 'strikethrough':
                replacement = `~~${selectedText || 'strikethrough'}~~`;
                break;
            case 'h1':
                replacement = `\n# ${selectedText || 'Heading 1'}\n`;
                break;
            case 'h2':
                replacement = `\n## ${selectedText || 'Heading 2'}\n`;
                break;
            case 'h3':
                replacement = `\n### ${selectedText || 'Heading 3'}\n`;
                break;
            case 'code':
                replacement = `\`${selectedText || 'code'}\``;
                break;
            case 'codeblock':
                replacement = `\n\`\`\`javascript\n${selectedText || '// code here'}\n\`\`\`\n`;
                break;
            case 'python':
                replacement = `\n\`\`\`python:run\n${selectedText || '# Python code - Click Run to execute\nprint("Hello World")'}\n\`\`\`\n`;
                const pythonPanel = document.getElementById('pythonPanel');
                if (pythonPanel) pythonPanel.classList.add('active');
                break;
            case 'ul':
                replacement = `\n- ${selectedText || 'List item'}\n`;
                break;
            case 'ol':
                replacement = `\n1. ${selectedText || 'List item'}\n`;
                break;
            case 'checklist':
                replacement = `\n- [ ] ${selectedText || 'Task'}\n`;
                break;
            case 'link':
                replacement = `[${selectedText || 'link text'}](url)`;
                break;
            case 'quote':
                replacement = `\n> ${selectedText || 'Quote'}\n`;
                break;
            case 'table':
                replacement = `\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n`;
                break;
            case 'divider':
                replacement = `\n---\n`;
                break;
        }

        editor.value = editor.value.substring(0, start) + replacement + editor.value.substring(end);
        editor.focus();
        editor.selectionStart = start + replacement.length;
        editor.selectionEnd = start + replacement.length;

        this.updatePreview();
    }

    // ===== IMAGE UPLOAD =====
    handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            const editor = document.getElementById('markdownEditor');
            if (!editor) return;

            const position = editor.selectionStart;
            const imageMd = `\n![${file.name}](${imageData})\n`;

            editor.value = editor.value.substring(0, position) + imageMd + editor.value.substring(position);
            editor.focus();
            this.updatePreview();
            this.showNotification('Image added', 'success');
        };

        reader.readAsDataURL(file);
    }

    // ===== PYTHON EXECUTION =====
    async loadPyodide() {
        if (this.pyodide) return this.pyodide;
        if (this.pyodideLoading) {
            // Wait for loading to complete
            return new Promise((resolve) => {
                const check = setInterval(() => {
                    if (this.pyodide) {
                        clearInterval(check);
                        resolve(this.pyodide);
                    }
                }, 100);
            });
        }

        this.pyodideLoading = true;
        const output = document.getElementById('pythonOutput');
        if (output) {
            output.innerHTML = '<div class="output-info"><i class="fas fa-spinner fa-spin"></i> Loading Python environment...</div>';
        }

        try {
            // Check if loadPyodide is available
            if (typeof loadPyodide === 'undefined') {
                throw new Error('Pyodide not loaded. Please check if the script is included.');
            }

            this.pyodide = await loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
            });
            
            if (output) {
                output.innerHTML = '<div class="output-success"><i class="fas fa-check-circle"></i> Python ready!</div>';
            }
            this.pyodideLoading = false;
            return this.pyodide;
        } catch (err) {
            if (output) {
                output.innerHTML = `<div class="output-error"><i class="fas fa-exclamation-circle"></i> Failed to load Python: ${err.message}</div>`;
            }
            this.pyodideLoading = false;
            throw err;
        }
    }

    async runPythonCode() {
        const editor = document.getElementById('markdownEditor');
        if (!editor) return;

        const content = editor.value;

        // Extract Python code from markdown
        const pythonBlocks = [];
        const regex = /```python:run\n([\s\S]*?)```/g;
        let match;

        while ((match = regex.exec(content)) !== null) {
            pythonBlocks.push(match[1]);
        }

        if (pythonBlocks.length === 0) {
            this.showNotification('No executable Python code found. Use ```python:run ... ``` blocks.', 'error');
            return;
        }

        const output = document.getElementById('pythonOutput');
        const pythonPanel = document.getElementById('pythonPanel');
        
        if (pythonPanel) pythonPanel.classList.add('active');

        try {
            const pyodide = await this.loadPyodide();

            if (output) {
                output.innerHTML = '<div class="output-info"><i class="fas fa-play"></i> Executing Python code...</div>';
            }

            // Combine all Python blocks
            const code = pythonBlocks.join('\n\n');

            // Capture stdout
            pyodide.setStdout({ batched: (msg) => {
                if (output) {
                    const line = document.createElement('div');
                    line.className = 'output-line output-success';
                    line.textContent = msg;
                    output.appendChild(line);
                    output.scrollTop = output.scrollHeight;
                }
            }});

            // Execute
            const result = await pyodide.runPythonAsync(code);

            // Show result if there is one
            if (result !== undefined && result !== null && output) {
                const line = document.createElement('div');
                line.className = 'output-line output-success';
                line.textContent = `Result: ${result}`;
                output.appendChild(line);
            }

            if (output) {
                const success = document.createElement('div');
                success.className = 'output-success';
                success.innerHTML = '<i class="fas fa-check-circle"></i> Execution completed successfully';
                output.appendChild(success);
            }

        } catch (err) {
            if (output) {
                output.innerHTML = `<div class="output-error"><i class="fas fa-exclamation-triangle"></i> Error: ${err.message}</div>`;
            }
        }
    }

    async runPythonBlock(encodedCode) {
        const code = this.decodeFromAttribute(encodedCode);
        const pythonPanel = document.getElementById('pythonPanel');
        const output = document.getElementById('pythonOutput');
        
        if (pythonPanel) pythonPanel.classList.add('active');

        try {
            const pyodide = await this.loadPyodide();
            if (output) {
                output.innerHTML = '<div class="output-info"><i class="fas fa-play"></i> Executing...</div>';
            }

            pyodide.setStdout({ batched: (msg) => {
                if (output) {
                    const line = document.createElement('div');
                    line.className = 'output-line output-success';
                    line.textContent = msg;
                    output.appendChild(line);
                }
            }});

            const result = await pyodide.runPythonAsync(code);

            if (result !== undefined && result !== null && output) {
                const line = document.createElement('div');
                line.className = 'output-line output-success';
                line.textContent = `Result: ${result}`;
                output.appendChild(line);
            }

            if (output) {
                const success = document.createElement('div');
                success.className = 'output-success';
                success.innerHTML = '<i class="fas fa-check-circle"></i> Done';
                output.appendChild(success);
            }

        } catch (err) {
            if (output) {
                output.innerHTML = `<div class="output-error"><i class="fas fa-exclamation-triangle"></i> ${err.message}</div>`;
            }
        }
    }

    // ===== VIEW MODE =====
    renderViewTree() {
        const container = document.getElementById('viewFolderTree');
        if (!container) return;

        container.innerHTML = '';

        const rootFolders = this.folders.filter(f => !f.parentId);
        const rootDocs = this.documents.filter(d => !d.folderId);

        rootFolders.forEach(folder => {
            container.appendChild(this.createViewFolderItem(folder));
        });

        rootDocs.forEach(doc => {
            container.appendChild(this.createViewDocItem(doc));
        });

        if (rootFolders.length === 0 && rootDocs.length === 0) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-3);">No documents to view</div>';
        }
    }

    createViewFolderItem(folder) {
        const item = document.createElement('div');
        item.className = 'tree-item folder';
        if (folder.expanded) item.classList.add('expanded');

        const childFolders = this.folders.filter(f => f.parentId == folder.id);
        const childDocs = this.documents.filter(d => d.folderId == folder.id);
        const hasChildren = childFolders.length > 0 || childDocs.length > 0;

        item.innerHTML = `
            ${hasChildren ? '<i class="fas fa-caret-right expand-icon"></i>' : '<span style="width: 14px; display: inline-block;"></span>'}
            <span class="icon">${folder.icon}</span>
            <span class="name">${this.escapeHtml(folder.name)}</span>
        `;

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            folder.expanded = !folder.expanded;
            item.classList.toggle('expanded');

            const children = item.nextElementSibling;
            if (children && children.classList.contains('tree-children')) {
                children.style.display = folder.expanded ? 'block' : 'none';
            }
        });

        const wrapper = document.createElement('div');
        wrapper.appendChild(item);

        if (hasChildren) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'tree-children';
            childrenContainer.style.display = folder.expanded ? 'block' : 'none';

            childFolders.forEach(child => {
                childrenContainer.appendChild(this.createViewFolderItem(child));
            });

            childDocs.forEach(doc => {
                childrenContainer.appendChild(this.createViewDocItem(doc));
            });

            wrapper.appendChild(childrenContainer);
        }

        return wrapper;
    }

    createViewDocItem(doc) {
        const item = document.createElement('div');
        item.className = 'tree-item';

        const icons = {
            general: '📄', code: '💻', architecture: '🏗️',
            api: '🔌', tutorial: '🎓', notes: '📝', python: '🐍'
        };

        item.innerHTML = `
            <span style="width: 14px; display: inline-block;"></span>
            <span class="icon">${icons[doc.category] || '📄'}</span>
            <span class="name">${this.escapeHtml(doc.title)}</span>
        `;

        item.addEventListener('click', () => {
            this.viewDocument(doc.id);
        });

        return item;
    }

    viewDocument(docId) {
        const doc = this.getDocumentById(docId);
        if (!doc) return;

        this.currentDocId = docId;

        // Update breadcrumb
        const viewBreadcrumb = document.getElementById('viewBreadcrumb');
        if (viewBreadcrumb) {
            const path = this.getFolderPath(doc.folderId);
            let breadcrumb = '<i class="fas fa-home"></i>';
            path.forEach(folder => {
                breadcrumb += ` / ${folder.icon} ${this.escapeHtml(folder.name)}`;
            });
            breadcrumb += ` / ${this.escapeHtml(doc.title)}`;
            viewBreadcrumb.innerHTML = breadcrumb;
        }

        // Render content
        const content = document.getElementById('documentContent');
        if (content) {
            let html = typeof marked !== 'undefined' ? marked.parse(doc.content) : doc.content;
            if (typeof DOMPurify !== 'undefined') {
                html = DOMPurify.sanitize(html);
            }
            content.innerHTML = html;

            // Highlight code if hljs is available
            if (window.hljs) {
                content.querySelectorAll('pre code').forEach(block => {
                    hljs.highlightElement(block);
                });
            }
        }

        // Show footer
        const footer = document.getElementById('docFooter');
        if (footer) {
            footer.style.display = 'block';
            const date = new Date(doc.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            
            const docDate = document.getElementById('docDate');
            if (docDate) docDate.textContent = `Last updated: ${date}`;

            // Calculate read time
            const words = doc.content.split(/\s+/).length;
            const readTime = Math.ceil(words / 200);
            const docReadTime = document.getElementById('docReadTime');
            if (docReadTime) docReadTime.textContent = `${readTime} min read`;
        }
    }

    // ===== STATS & RECENT =====
    updateStats() {
        const totalDocs = document.getElementById('totalDocs');
        const totalFolders = document.getElementById('totalFolders');
        const totalCode = document.getElementById('totalCode');

        if (totalDocs) totalDocs.textContent = this.documents.length;
        if (totalFolders) totalFolders.textContent = this.folders.length;

        // Count code snippets
        let codeCount = 0;
        this.documents.forEach(doc => {
            const matches = doc.content.match(/```/g);
            if (matches) codeCount += matches.length / 2;
        });
        if (totalCode) totalCode.textContent = Math.floor(codeCount);
    }

    renderRecentDocs() {
        const container = document.getElementById('recentDocs');
        if (!container) return;

        const recent = this.documents
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 6);

        if (recent.length === 0) {
            container.innerHTML = '<p style="color: var(--text-3); text-align: center; padding: 20px;">No documents yet</p>';
            return;
        }

        container.innerHTML = '';
        recent.forEach(doc => {
            const card = document.createElement('div');
            card.className = 'recent-doc-card';

            const preview = doc.content.substring(0, 100).replace(/[#*`]/g, '') + '...';
            const date = new Date(doc.updatedAt).toLocaleDateString();

            card.innerHTML = `
                <h4>${this.escapeHtml(doc.title)}</h4>
                <p>${this.escapeHtml(preview)}</p>
                <div class="recent-doc-meta">
                    <span>${date}</span>
                    <span>${doc.category}</span>
                </div>
            `;

            card.addEventListener('click', () => {
                this.switchMode('edit');
                this.loadDocumentInEditor(doc.id);
            });

            container.appendChild(card);
        });
    }

    // ===== IMPORT/EXPORT =====
    openImportExportModal() {
        const modal = document.getElementById('importExportModal');
        if (modal) modal.classList.add('active');
    }

    exportData() {
        const data = {
            folders: this.folders,
            documents: this.documents,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `knowledgebase-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Data exported successfully', 'success');
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (!data.folders || !data.documents) {
                    throw new Error('Invalid file format');
                }

                if (confirm(`Import ${data.documents.length} documents and ${data.folders.length} folders? This will merge with existing data.`)) {
                    this.folders = [...this.folders, ...data.folders];
                    this.documents = [...this.documents, ...data.documents];
                    this.saveData();
                    this.renderFolderTree();
                    this.updateStats();
                    this.renderRecentDocs();
                    this.showNotification('Data imported successfully', 'success');
                    const modal = document.getElementById('importExportModal');
                    if (modal) modal.classList.remove('active');
                }
            } catch (err) {
                this.showNotification('Failed to import: Invalid file format', 'error');
            }
        };
        reader.readAsText(file);
    }

    // ===== THEME =====
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', this.theme);
        localStorage.setItem('kb_theme', this.theme);

        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    loadTheme() {
        const saved = localStorage.getItem('kb_theme');
        if (saved) {
            this.theme = saved;
            document.body.setAttribute('data-theme', this.theme);
            const icon = document.querySelector('#themeToggle i');
            if (icon) {
                icon.className = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
    }

    // ===== UTILITIES =====
    showNotification(message, type = 'success') {
        const container = document.querySelector('.toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <i class="${iconMap[type]}"></i>
            <div class="toast-message">${message}</div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ===== GITHUB SETTINGS UI =====
    loadGitHubSettings() {
        console.log('Loading GitHub settings...');
        
        // Safe element access
        const tokenInput = document.getElementById('githubToken');
        const ownerInput = document.getElementById('githubOwner');
        const repoInput = document.getElementById('githubRepo');
        const branchInput = document.getElementById('githubBranch');
        const commitTemplateInput = document.getElementById('commitTemplate');
        const autoCommitCheckbox = document.getElementById('autoCommit');
        const syncFolderCheckbox = document.getElementById('syncFolderStructure');

        // Only set values if elements exist
        if (tokenInput) tokenInput.value = this.githubConfig.token || '';
        if (ownerInput) ownerInput.value = this.githubConfig.owner || '';
        if (repoInput) repoInput.value = this.githubConfig.repo || '';
        if (branchInput) branchInput.value = this.githubConfig.branch || 'main';
        if (commitTemplateInput) commitTemplateInput.value = this.githubConfig.commitTemplate || 'Update documentation: {filename}';
        if (autoCommitCheckbox) autoCommitCheckbox.checked = this.githubConfig.autoCommit || false;
        if (syncFolderCheckbox) syncFolderCheckbox.checked = this.githubConfig.syncFolderStructure || false;
        
        console.log('GitHub settings loaded:', this.githubConfig);
    }

    saveGitHubSettings() {
        console.log('Saving GitHub settings...');
        
        // Safe element access
        const tokenInput = document.getElementById('githubToken');
        const ownerInput = document.getElementById('githubOwner');
        const repoInput = document.getElementById('githubRepo');
        const branchInput = document.getElementById('githubBranch');
        const commitTemplateInput = document.getElementById('commitTemplate');
        const autoCommitCheckbox = document.getElementById('autoCommit');
        const syncFolderCheckbox = document.getElementById('syncFolderStructure');

        // Only get values if elements exist
        if (tokenInput) this.githubConfig.token = tokenInput.value;
        if (ownerInput) this.githubConfig.owner = ownerInput.value;
        if (repoInput) this.githubConfig.repo = repoInput.value;
        if (branchInput) this.githubConfig.branch = branchInput.value;
        if (commitTemplateInput) this.githubConfig.commitTemplate = commitTemplateInput.value;
        if (autoCommitCheckbox) this.githubConfig.autoCommit = autoCommitCheckbox.checked;
        if (syncFolderCheckbox) this.githubConfig.syncFolderStructure = syncFolderCheckbox.checked;

        this.saveGitHubConfig();
        this.showNotification('GitHub settings saved successfully!', 'success');
        
        const modal = document.getElementById('githubModal');
        if (modal) modal.classList.remove('active');
        
        console.log('GitHub settings saved:', this.githubConfig);
    }


    // ===== APP SETTINGS UI =====
    loadAppSettings() {
        const elements = {
            themeSelect: document.getElementById('themeSelect'),
            accentColor: document.getElementById('accentColor'),
            enableParticles: document.getElementById('enableParticles'),
            enableAnimations: document.getElementById('enableAnimations'),
            editorFontSize: document.getElementById('editorFontSize'),
            autoSave: document.getElementById('autoSave'),
            livePreview: document.getElementById('livePreview'),
            pythonPreload: document.getElementById('pythonPreload')
        };

        if (elements.themeSelect) elements.themeSelect.value = this.settings.theme;
        if (elements.accentColor) elements.accentColor.value = this.settings.accentColor;
        if (elements.enableParticles) elements.enableParticles.checked = this.settings.enableParticles;
        if (elements.enableAnimations) elements.enableAnimations.checked = this.settings.enableAnimations;
        if (elements.editorFontSize) elements.editorFontSize.value = this.settings.editorFontSize;
        if (elements.autoSave) elements.autoSave.checked = this.settings.autoSave;
        if (elements.livePreview) elements.livePreview.checked = this.settings.livePreview;
        if (elements.pythonPreload) elements.pythonPreload.checked = this.settings.pythonPreload;
    }

    saveAppSettings() {
        const elements = {
            themeSelect: document.getElementById('themeSelect'),
            accentColor: document.getElementById('accentColor'),
            enableParticles: document.getElementById('enableParticles'),
            enableAnimations: document.getElementById('enableAnimations'),
            editorFontSize: document.getElementById('editorFontSize'),
            autoSave: document.getElementById('autoSave'),
            livePreview: document.getElementById('livePreview'),
            pythonPreload: document.getElementById('pythonPreload')
        };

        if (elements.themeSelect) this.settings.theme = elements.themeSelect.value;
        if (elements.accentColor) this.settings.accentColor = elements.accentColor.value;
        if (elements.enableParticles) this.settings.enableParticles = elements.enableParticles.checked;
        if (elements.enableAnimations) this.settings.enableAnimations = elements.enableAnimations.checked;
        if (elements.editorFontSize) this.settings.editorFontSize = parseInt(elements.editorFontSize.value);
        if (elements.autoSave) this.settings.autoSave = elements.autoSave.checked;
        if (elements.livePreview) this.settings.livePreview = elements.livePreview.checked;
        if (elements.pythonPreload) this.settings.pythonPreload = elements.pythonPreload.checked;

        this.saveSettings();
        this.showNotification('Settings saved successfully', 'success');
        const modal = document.getElementById('settingsModal');
        if (modal) modal.classList.remove('active');

        // Reinitialize particles if setting changed
        if (this.settings.enableParticles) {
            this.initializeParticles();
        } else if (window.pJSDom && window.pJSDom.length > 0) {
            window.pJSDom[0].pJS.fn.vendors.destroypJS();
            window.pJSDom = [];
        }
    }

    // ===== GITHUB INTEGRATION =====
    loadGitHubConfig() {
        const saved = localStorage.getItem('kb_github_config');
        if (saved) {
            this.githubConfig = JSON.parse(saved);
        }
    }

    saveGitHubConfig() {
        localStorage.setItem('kb_github_config', JSON.stringify(this.githubConfig));
        this.updateGitHubStatus();
    }

    updateGitHubStatus() {
        const statusDot = document.querySelector('#githubStatus');
        if (statusDot) {
            // Green if repo configured (token optional for public repos)
            statusDot.style.backgroundColor =
                (this.githubConfig.owner && this.githubConfig.repo) ? '#10b981' : '#ef4444';
        }
    }

    async testGitHubConnection() {
        if (!this.githubConfig.owner || !this.githubConfig.repo) {
            this.showNotification('Please fill in repository owner and name', 'error');
            return;
        }

        this.showNotification('Testing GitHub connection...', 'info');

        try {
            const url = `https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}`;
            console.log('Testing GitHub connection to:', url);
            
            const headers = {
                'Accept': 'application/vnd.github.v3+json'
            };
            
            // Add authorization only if token exists
            if (this.githubConfig.token) {
                headers['Authorization'] = `token ${this.githubConfig.token}`;
            }

            const response = await fetch(url, { headers });
            console.log('GitHub response status:', response.status);

            if (response.ok) {
                const repo = await response.json();
                const isPublic = !repo.private;
                
                if (isPublic) {
                    if (this.githubConfig.token) {
                        this.showNotification('✅ Connected! Public repository with token', 'success');
                    } else {
                        this.showNotification('✅ Connected! Public repository - manual issue creation will be used', 'success');
                    }
                } else if (this.githubConfig.token) {
                    this.showNotification('✅ Connected! Private repository - using token', 'success');
                } else {
                    this.showNotification('⚠️ Private repository detected - token required for auto-sync', 'warning');
                }
                
                // Update GitHub status indicator
                this.updateGitHubStatus();
                
            } else if (response.status === 404) {
                this.showNotification('❌ Repository not found. Check owner and repository name.', 'error');
            } else if (response.status === 401 || response.status === 403) {
                if (this.githubConfig.token) {
                    this.showNotification('❌ Token invalid. Manual issue creation will be used.', 'warning');
                } else {
                    this.showNotification('⚠️ No token provided. Manual issue creation will be used.', 'info');
                }
            } else {
                this.showNotification(`❌ Connection failed: ${response.status} ${response.statusText}`, 'error');
            }
        } catch (error) {
            console.error('GitHub connection error:', error);
            this.showNotification('❌ Connection error: ' + error.message, 'error');
        }
    }

    // Manual GitHub Issue Creation (No auth required)
    createManualGitHubIssue(filename, content) {
        const issueTitle = `[KB-SAVE] ${filename}`;
        
        // Create a URL that pre-fills the new issue form
        const issueUrl = `https://github.com/${this.githubConfig.owner}/${this.githubConfig.repo}/issues/new?` + 
            `title=${encodeURIComponent(issueTitle)}&` +
            `body=${encodeURIComponent(content)}&` +
            `labels=kb-save-doc,automated`;
        
        // Open in new tab - user manually submits
        window.open(issueUrl, '_blank');
        this.showNotification('📝 GitHub issue form opened. Please review and submit manually.', 'info');

        // Track manual commit
        const commits = JSON.parse(localStorage.getItem('kb_github_commits') || '[]');
        commits.unshift({
            filename,
            message: 'Manual issue creation',
            timestamp: new Date().toISOString(),
            status: 'manual_pending',
            issueUrl: issueUrl
        });
        localStorage.setItem('kb_github_commits', JSON.stringify(commits.slice(0, 50)));
    }

    async commitToGitHub(filename, content, message) {
        if (!this.githubConfig.owner || !this.githubConfig.repo) {
            this.showNotification('Please configure repository in GitHub settings', 'error');
            return;
        }

        try {
            const issueTitle = `[KB-SAVE] ${filename}`;
            
            console.log('Attempting GitHub issue creation:', {
                owner: this.githubConfig.owner,
                repo: this.githubConfig.repo,
                title: issueTitle,
                hasToken: !!this.githubConfig.token
            });

            // For public repos without token, use the manual method
            if (!this.githubConfig.token) {
                this.showNotification('Using manual GitHub sync (no token provided)', 'info');
                this.createManualGitHubIssue(filename, content);
                return;
            }

            const headers = {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Authorization': `token ${this.githubConfig.token}`
            };

            const response = await fetch(
                `https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/issues`,
                {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        title: issueTitle,
                        body: content,
                        labels: ['kb-save-doc', 'automated']
                    })
                }
            );

            console.log('GitHub API response:', response.status, response.statusText);

            if (response.ok) {
                const issue = await response.json();
                this.showNotification(`✅ Document saved to GitHub! Issue #${issue.number} created`, 'success');

                // Track the commit
                const commits = JSON.parse(localStorage.getItem('kb_github_commits') || '[]');
                commits.unshift({
                    filename,
                    message: message,
                    timestamp: new Date().toISOString(),
                    status: 'created',
                    issueNumber: issue.number
                });
                localStorage.setItem('kb_github_commits', JSON.stringify(commits.slice(0, 50)));

            } else {
                const errorData = await response.json();
                console.error('GitHub API error:', errorData);
                
                if (response.status === 401) {
                    this.showNotification('GitHub token invalid. Using manual method instead.', 'warning');
                    this.createManualGitHubIssue(filename, content);
                } else if (response.status === 403) {
                    this.showNotification('GitHub access forbidden. Using manual method.', 'warning');
                    this.createManualGitHubIssue(filename, content);
                } else {
                    this.showNotification(`GitHub error: ${errorData.message || response.statusText}`, 'error');
                }
            }
        } catch (error) {
            console.error('GitHub save error:', error);
            this.showNotification('Failed to save to GitHub, using manual method: ' + error.message, 'warning');
            this.createManualGitHubIssue(filename, content);
        }
    }


    // Manual GitHub Sync via Issue Form (No CORS issues)
    manualGitHubSync() {
        if (!this.currentDocId) {
            this.showNotification('No document selected to sync', 'error');
            return;
        }

        const doc = this.getDocumentById(this.currentDocId);
        if (!doc) return;

        const filename = doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        this.createManualGitHubIssue(filename, doc.content);
    }    

    // ===== SETTINGS MANAGEMENT =====
    loadSettings() {
        const saved = localStorage.getItem('kb_settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }

    saveSettings() {
        localStorage.setItem('kb_settings', JSON.stringify(this.settings));
        this.applySettings();
    }

    applySettings() {
        // Apply theme
        this.theme = this.settings.theme;
        document.body.setAttribute('data-theme', this.theme);

        // Apply accent color
        document.documentElement.style.setProperty('--primary', this.settings.accentColor);

        // Apply editor font size
        const editor = document.querySelector('#docContent');
        if (editor) {
            editor.style.fontSize = `${this.settings.editorFontSize}px`;
        }

        // Apply live preview
        if (this.settings.livePreview) {
            const docContent = document.querySelector('#docContent');
            if (docContent) {
                docContent.addEventListener('input', () => this.updatePreview());
            }
        }

        // Python preload
        if (this.settings.pythonPreload && !this.pyodide && !this.pyodideLoading) {
            this.loadPyodide();
        }
    }

    initializeParticles() {
        if (this.settings.enableParticles && typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                particles: {
                    number: { value: 80, density: { enable: true, value_area: 800 } },
                    color: { value: this.theme === 'dark' ? '#6366f1' : '#4f46e5' },
                    shape: { type: 'circle' },
                    opacity: { value: 0.5, random: false },
                    size: { value: 3, random: true },
                    line_linked: {
                        enable: true,
                        distance: 150,
                        color: this.theme === 'dark' ? '#6366f1' : '#4f46e5',
                        opacity: 0.4,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 2,
                        direction: 'none',
                        random: false,
                        straight: false,
                        out_mode: 'out',
                        bounce: false
                    }
                },
                interactivity: {
                    detect_on: 'canvas',
                    events: {
                        onhover: { enable: true, mode: 'repulse' },
                        onclick: { enable: true, mode: 'push' },
                        resize: true
                    }
                },
                retina_detect: true
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    decodeHtml(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }

    encodeForAttribute(str) {
        return btoa(encodeURIComponent(str));
    }

    decodeFromAttribute(str) {
        return decodeURIComponent(atob(str));
    }

    // Test method for GitHub issue creation
    testGitHubIssueCreation() {
        const testDoc = {
            title: 'Test Document',
            content: 'This is a test document content for GitHub issue creation.',
            category: 'general'
        };

            this.commitToGitHub(
                'test_document',
                testDoc.content,
                'Test: test_document'
            );
        }
    }

    // Initialize application
    document.addEventListener('DOMContentLoaded', () => {
        window.kb = new KnowledgeBase();
    });
