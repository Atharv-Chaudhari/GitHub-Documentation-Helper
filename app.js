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
        marked.setOptions({
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (err) {}
                }
                return hljs.highlightAuto(code).value;
            },
            breaks: true,
            gfm: true
        });
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
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Home actions
        document.getElementById('createDocCard').addEventListener('click', () => {
            this.switchMode('edit');
            this.createNewDocument();
        });

        document.getElementById('createFolderCard').addEventListener('click', () => {
            this.openFolderModal();
        });

        document.getElementById('viewDocsCard').addEventListener('click', () => {
            this.switchMode('view');
        });

        document.getElementById('importDataCard').addEventListener('click', () => {
            this.openImportExportModal();
        });

        // Folder management
        document.getElementById('newFolderBtn').addEventListener('click', () => {
            this.openFolderModal();
        });

        document.getElementById('newDocInTreeBtn').addEventListener('click', () => {
            this.createNewDocument();
        });

        document.getElementById('createFolderBtn').addEventListener('click', () => {
            this.createFolder();
        });

        document.getElementById('cancelFolderBtn').addEventListener('click', () => {
            this.closeFolderModal();
        });

        // Icon picker
        document.querySelectorAll('.icon-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.icon-option').forEach(b => b.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                document.getElementById('selectedIcon').value = e.currentTarget.dataset.icon;
            });
        });

        // Editor
        document.getElementById('markdownEditor').addEventListener('input', () => {
            this.updatePreview();
        });

        document.getElementById('docTitle').addEventListener('input', () => {
            if (this.currentDocId) {
                const doc = this.getDocumentById(this.currentDocId);
                if (doc) doc.title = document.getElementById('docTitle').value || 'Untitled';
            }
        });

        document.getElementById('saveDocBtn').addEventListener('click', () => {
            this.saveCurrentDocument();
        });

        document.getElementById('deleteDocBtn').addEventListener('click', () => {
            this.deleteCurrentDocument();
        });

        // Toolbar
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                if (action) this.applyFormat(action);
            });
        });

        // Image upload
        document.querySelector('.tool-btn[data-action="image"]').addEventListener('click', () => {
            document.getElementById('imageUploadInput').click();
        });

        document.getElementById('imageUploadInput').addEventListener('change', (e) => {
            if (e.target.files[0]) this.handleImageUpload(e.target.files[0]);
        });

        // Python execution
        document.getElementById('runPythonBtn').addEventListener('click', () => {
            this.runPythonCode();
        });

        document.getElementById('clearOutputBtn').addEventListener('click', () => {
            document.getElementById('pythonOutput').innerHTML = '<div class="output-info"><i class="fas fa-info-circle"></i> Output cleared.</div>';
        });

        document.getElementById('closePythonBtn').addEventListener('click', () => {
            document.getElementById('pythonPanel').classList.remove('active');
        });

        // Import/Export
        document.getElementById('exportAllBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importFileBtn').addEventListener('click', () => {
            document.getElementById('importFileInput').click();
        });

        document.getElementById('importFileInput').addEventListener('change', (e) => {
            if (e.target.files[0]) this.importData(e.target.files[0]);
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });

        // GitHub Settings
        document.getElementById('githubBtn')?.addEventListener('click', () => {
            document.getElementById('githubModal').classList.add('active');
            this.loadGitHubSettings();
        });

        document.getElementById('saveGitHubBtn')?.addEventListener('click', () => {
            this.saveGitHubSettings();
        });

        document.getElementById('testGitHubBtn')?.addEventListener('click', () => {
            this.testGitHubConnection();
        });

        document.getElementById('toggleTokenBtn')?.addEventListener('click', () => {
            const input = document.getElementById('githubToken');
            const icon = document.getElementById('toggleTokenBtn').querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });

        // App Settings
        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            document.getElementById('settingsModal').classList.add('active');
            this.loadAppSettings();
        });

        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
            this.saveAppSettings();
        });

        // View mode
        document.getElementById('editCurrentBtn').addEventListener('click', () => {
            if (this.currentDocId) {
                this.switchMode('edit');
                this.loadDocumentInEditor(this.currentDocId);
            }
        });

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
                    if (editor.value.includes('```python')) {
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

        document.getElementById(mode + 'View').classList.add('active');

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
        document.getElementById('folderModal').classList.add('active');
        document.getElementById('folderNameInput').focus();
    }

    closeFolderModal() {
        document.getElementById('folderModal').classList.remove('active');
        document.getElementById('folderNameInput').value = '';
        document.getElementById('parentFolderSelect').value = '';
    }

    populateParentFolderSelect() {
        const select = document.getElementById('parentFolderSelect');
        select.innerHTML = '<option value="">Root (No Parent)</option>';

        this.folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.id;
            option.textContent = folder.icon + ' ' + folder.name;
            select.appendChild(option);
        });
    }

    createFolder() {
        const name = document.getElementById('folderNameInput').value.trim();
        const parentId = document.getElementById('parentFolderSelect').value || null;
        const icon = document.getElementById('selectedIcon').value;

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

        document.getElementById('docTitle').value = doc.title;
        document.getElementById('markdownEditor').value = doc.content;
        document.getElementById('docCategory').value = doc.category;

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

        doc.title = document.getElementById('docTitle').value || 'Untitled';
        doc.content = document.getElementById('markdownEditor').value;
        doc.category = document.getElementById('docCategory').value;
        doc.updatedAt = new Date().toISOString();

        this.saveData();
        this.renderFolderTree();
        this.showNotification('Document saved successfully', 'success');

        // Auto-commit to GitHub if enabled
        if (this.githubConfig.autoCommit && this.githubConfig.token) {
            this.commitToGitHub(
                doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase(),
                doc.content,
                this.githubConfig.commitTemplate
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

            document.getElementById('docTitle').value = '';
            document.getElementById('markdownEditor').value = '';
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
        const content = document.getElementById('markdownEditor').value;
        const preview = document.getElementById('livePreview');

        // Convert markdown
        let html = marked.parse(content);

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

        // Sanitize
        preview.innerHTML = DOMPurify.sanitize(html);

        // Re-highlight code blocks
        preview.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }

    // ===== TEXT FORMATTING =====
    applyFormat(action) {
        const editor = document.getElementById('markdownEditor');
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
                document.getElementById('pythonPanel').classList.add('active');
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
        output.innerHTML = '<div class="output-info"><i class="fas fa-spinner fa-spin"></i> Loading Python environment...</div>';

        try {
            this.pyodide = await loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
            });
            output.innerHTML = '<div class="output-success"><i class="fas fa-check-circle"></i> Python ready!</div>';
            this.pyodideLoading = false;
            return this.pyodide;
        } catch (err) {
            output.innerHTML = `<div class="output-error"><i class="fas fa-exclamation-circle"></i> Failed to load Python: ${err.message}</div>`;
            this.pyodideLoading = false;
            throw err;
        }
    }

    async runPythonCode() {
        const editor = document.getElementById('markdownEditor');
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
        document.getElementById('pythonPanel').classList.add('active');

        try {
            const pyodide = await this.loadPyodide();

            output.innerHTML = '<div class="output-info"><i class="fas fa-play"></i> Executing Python code...</div>';

            // Combine all Python blocks
            const code = pythonBlocks.join('\n\n');

            // Capture stdout
            pyodide.setStdout({ batched: (msg) => {
                const line = document.createElement('div');
                line.className = 'output-line output-success';
                line.textContent = msg;
                output.appendChild(line);
                output.scrollTop = output.scrollHeight;
            }});

            // Execute
            const result = await pyodide.runPythonAsync(code);

            // Show result if there is one
            if (result !== undefined && result !== null) {
                const line = document.createElement('div');
                line.className = 'output-line output-success';
                line.textContent = `Result: ${result}`;
                output.appendChild(line);
            }

            const success = document.createElement('div');
            success.className = 'output-success';
            success.innerHTML = '<i class="fas fa-check-circle"></i> Execution completed successfully';
            output.appendChild(success);

        } catch (err) {
            output.innerHTML = `<div class="output-error"><i class="fas fa-exclamation-triangle"></i> Error: ${err.message}</div>`;
        }
    }

    async runPythonBlock(encodedCode) {
        const code = this.decodeFromAttribute(encodedCode);
        document.getElementById('pythonPanel').classList.add('active');
        const output = document.getElementById('pythonOutput');

        try {
            const pyodide = await this.loadPyodide();
            output.innerHTML = '<div class="output-info"><i class="fas fa-play"></i> Executing...</div>';

            pyodide.setStdout({ batched: (msg) => {
                const line = document.createElement('div');
                line.className = 'output-line output-success';
                line.textContent = msg;
                output.appendChild(line);
            }});

            const result = await pyodide.runPythonAsync(code);

            if (result !== undefined && result !== null) {
                const line = document.createElement('div');
                line.className = 'output-line output-success';
                line.textContent = `Result: ${result}`;
                output.appendChild(line);
            }

            const success = document.createElement('div');
            success.className = 'output-success';
            success.innerHTML = '<i class="fas fa-check-circle"></i> Done';
            output.appendChild(success);

        } catch (err) {
            output.innerHTML = `<div class="output-error"><i class="fas fa-exclamation-triangle"></i> ${err.message}</div>`;
        }
    }

    // ===== VIEW MODE =====
    renderViewTree() {
        const container = document.getElementById('viewFolderTree');
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
        const path = this.getFolderPath(doc.folderId);
        let breadcrumb = '<i class="fas fa-home"></i>';
        path.forEach(folder => {
            breadcrumb += ` / ${folder.icon} ${this.escapeHtml(folder.name)}`;
        });
        breadcrumb += ` / ${this.escapeHtml(doc.title)}`;
        document.getElementById('viewBreadcrumb').innerHTML = breadcrumb;

        // Render content
        const content = document.getElementById('documentContent');
        let html = marked.parse(doc.content);
        html = DOMPurify.sanitize(html);
        content.innerHTML = html;

        // Highlight code
        content.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });

        // Show footer
        const footer = document.getElementById('docFooter');
        footer.style.display = 'block';
        const date = new Date(doc.updatedAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        document.getElementById('docDate').textContent = `Last updated: ${date}`;

        // Calculate read time
        const words = doc.content.split(/\s+/).length;
        const readTime = Math.ceil(words / 200);
        document.getElementById('docReadTime').textContent = `${readTime} min read`;
    }

    // ===== STATS & RECENT =====
    updateStats() {
        document.getElementById('totalDocs').textContent = this.documents.length;
        document.getElementById('totalFolders').textContent = this.folders.length;

        // Count code snippets
        let codeCount = 0;
        this.documents.forEach(doc => {
            const matches = doc.content.match(/```/g);
            if (matches) codeCount += matches.length / 2;
        });
        document.getElementById('totalCode').textContent = Math.floor(codeCount);
    }

    renderRecentDocs() {
        const container = document.getElementById('recentDocs');
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
        document.getElementById('importExportModal').classList.add('active');
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
                    document.getElementById('importExportModal').classList.remove('active');
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
        icon.className = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    loadTheme() {
        const saved = localStorage.getItem('kb_theme');
        if (saved) {
            this.theme = saved;
            document.body.setAttribute('data-theme', this.theme);
            const icon = document.querySelector('#themeToggle i');
            icon.className = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    // ===== UTILITIES =====
    showNotification(message, type = 'success') {
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

        const container = document.querySelector('.toast-container');
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ===== GITHUB SETTINGS UI =====
    loadGitHubSettings() {
        document.getElementById('githubToken').value = this.githubConfig.token;
        document.getElementById('githubOwner').value = this.githubConfig.owner;
        document.getElementById('githubRepo').value = this.githubConfig.repo;
        document.getElementById('githubBranch').value = this.githubConfig.branch;
        document.getElementById('commitTemplate').value = this.githubConfig.commitTemplate;
        document.getElementById('autoCommit').checked = this.githubConfig.autoCommit;
        document.getElementById('syncFolderStructure').checked = this.githubConfig.syncFolderStructure;
    }

    saveGitHubSettings() {
        this.githubConfig.token = document.getElementById('githubToken').value;
        this.githubConfig.owner = document.getElementById('githubOwner').value;
        this.githubConfig.repo = document.getElementById('githubRepo').value;
        this.githubConfig.branch = document.getElementById('githubBranch').value;
        this.githubConfig.commitTemplate = document.getElementById('commitTemplate').value;
        this.githubConfig.autoCommit = document.getElementById('autoCommit').checked;
        this.githubConfig.syncFolderStructure = document.getElementById('syncFolderStructure').checked;

        this.saveGitHubConfig();
        this.showNotification('GitHub settings saved', 'success');
        document.getElementById('githubModal').classList.remove('active');
    }

    // ===== APP SETTINGS UI =====
    loadAppSettings() {
        document.getElementById('themeSelect').value = this.settings.theme;
        document.getElementById('accentColor').value = this.settings.accentColor;
        document.getElementById('enableParticles').checked = this.settings.enableParticles;
        document.getElementById('enableAnimations').checked = this.settings.enableAnimations;
        document.getElementById('editorFontSize').value = this.settings.editorFontSize;
        document.getElementById('autoSave').checked = this.settings.autoSave;
        document.getElementById('livePreview').checked = this.settings.livePreview;
        document.getElementById('pythonPreload').checked = this.settings.pythonPreload;
    }

    saveAppSettings() {
        this.settings.theme = document.getElementById('themeSelect').value;
        this.settings.accentColor = document.getElementById('accentColor').value;
        this.settings.enableParticles = document.getElementById('enableParticles').checked;
        this.settings.enableAnimations = document.getElementById('enableAnimations').checked;
        this.settings.editorFontSize = parseInt(document.getElementById('editorFontSize').value);
        this.settings.autoSave = document.getElementById('autoSave').checked;
        this.settings.livePreview = document.getElementById('livePreview').checked;
        this.settings.pythonPreload = document.getElementById('pythonPreload').checked;

        this.saveSettings();
        this.showNotification('Settings saved successfully', 'success');
        document.getElementById('settingsModal').classList.remove('active');

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

        try {
            // Test if repository exists and is accessible
            const response = await fetch(
                `https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}`,
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        ...(this.githubConfig.token && {
                            'Authorization': `token ${this.githubConfig.token}`
                        })
                    }
                }
            );

            if (response.ok) {
                const repo = await response.json();
                const isPublic = !repo.private;

                if (isPublic) {
                    this.showNotification(`✅ Connected! Public repo - no token needed`, 'success');
                } else if (this.githubConfig.token) {
                    this.showNotification(`✅ Connected! Private repo - using token`, 'success');
                } else {
                    this.showNotification(`⚠️ Private repo detected - token recommended`, 'info');
                }
                this.updateGitHubStatus();
            } else {
                this.showNotification('Repository not found or not accessible: ' + response.statusText, 'error');
            }
        } catch (error) {
            this.showNotification('Connection error: ' + error.message, 'error');
        }
    }

    async commitToGitHub(filename, content, message) {
        if (!this.githubConfig.owner || !this.githubConfig.repo) {
            this.showNotification('Please configure repository in settings', 'error');
            return;
        }

        try {
            // METHOD 1: Create GitHub Issue (NO TOKEN NEEDED if repo is public!)
            // This triggers the save-document.yml workflow
            const issueTitle = `[KB-SAVE] ${filename}`;
            const issueBody = content;

            const response = await fetch(
                `https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/issues`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json',
                        // Token only needed for private repos or to associate with user
                        ...(this.githubConfig.token && {
                            'Authorization': `token ${this.githubConfig.token}`
                        })
                    },
                    body: JSON.stringify({
                        title: issueTitle,
                        body: issueBody,
                        labels: ['kb-save-doc', 'automated']
                    })
                }
            );

            if (response.ok) {
                const issue = await response.json();
                this.showNotification(`📤 Document queued! Issue #${issue.number} created`, 'success');

                // Track commit
                const commits = JSON.parse(localStorage.getItem('kb_github_commits') || '[]');
                commits.unshift({
                    filename,
                    message: message.replace('{filename}', filename),
                    timestamp: new Date().toISOString(),
                    status: 'queued',
                    issueNumber: issue.number
                });
                localStorage.setItem('kb_github_commits', JSON.stringify(commits.slice(0, 50)));

            } else {
                const errorText = await response.text();
                this.showNotification('GitHub save failed: ' + errorText, 'error');
            }
        } catch (error) {
            this.showNotification('GitHub save error: ' + error.message, 'error');
        }
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
            document.querySelector('#docContent')?.addEventListener('input', () => this.updatePreview());
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
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    window.kb = new KnowledgeBase();
});
