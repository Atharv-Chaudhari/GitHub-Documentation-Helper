# 📚 KnowledgeBase - AI Documentation Platform

A modern, feature-rich documentation platform for Artificial Intelligence notes and resources. Built with vanilla HTML, CSS, and JavaScript - perfect for GitHub Pages deployment with **NO TOKEN REQUIRED**!

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-orange)

🔗 **Live Demo**: [https://atharv-chaudhari.github.io/Artificial-Intelligence/](https://atharv-chaudhari.github.io/Artificial-Intelligence/)

## ✨ Features

### 🎨 **Premium UI/UX**
- **Glassmorphism Design** - Frosted glass effects with backdrop blur
- **Animated Particles Background** - Interactive particle system (80 particles)
- **Smooth Animations** - Entrance animations, hover effects, transitions
- **Dark/Light Theme** - Fully themed with custom accent colors
- **Responsive Design** - Works on desktop, tablet, and mobile

### 📝 **Documentation Management**
- **Three View Modes**
  - **Home** - Dashboard with actions, stats, and recent docs
  - **Edit** - Full-featured Markdown editor with live preview
  - **View** - Clean document reader mode

- **Folder Organization**
  - Unlimited nested folder structure (e.g., "Artificial Intelligence" → "Machine Learning" → "Neural Networks")
  - Icons for each folder (20+ icon options)
  - Expand/collapse tree view

- **Rich Markdown Editor**
  - Live side-by-side preview
  - 20+ formatting tools (bold, italic, headings, lists, code, tables, etc.)
  - Image upload with base64 embedding
  - Code syntax highlighting (100+ languages)
  - Custom category tags

### 🐍 **Python Code Execution**
- Execute Python code blocks directly in browser
- Powered by Pyodide (WebAssembly Python)
- Special syntax: \`\`\`python:run
- Capture and display output
- Perfect for AI/ML code examples!

### 🔄 **GitHub Integration - NO TOKEN NEEDED!**
- **Auto-Commit on Save** - Uses GitHub Issues (no token for public repos!)
- **GitHub Actions Workflow** - Automatically processes saves
- **Zero Authentication** - Works completely token-free for public repositories
- **Secure** - No tokens stored in browser
- **Commit History** - Track last 50 commits

### 💾 **Data Management**
- LocalStorage persistence
- JSON import/export
- Backup and restore functionality
- Stats tracking (documents, folders, categories, commits)

## 🚀 Quick Start (3 Minutes!)

### 1️⃣ **Deploy to GitHub Pages**

This repo is already configured! Just:

1. **Push to GitHub** (if not already done):
   ```bash
   cd "C:\Users\atharv.chaudhari\OneDrive - Infosys Limited\BITS\Project\AssessNex AI\Beta"
   git add .
   git commit -m "Deploy KnowledgeBase"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to: https://github.com/Atharv-Chaudhari/Artificial-Intelligence/settings/pages
   - Source: Deploy from branch `main`
   - Folder: `/ (root)`
   - Click **Save**
   - Wait 1-2 minutes for deployment

3. **Enable GitHub Issues** (for auto-save):
   - Go to: https://github.com/Atharv-Chaudhari/Artificial-Intelligence/settings
   - Scroll to "Features"
   - Check ✅ **Issues**

4. **Enable GitHub Actions**:
   - Go to: https://github.com/Atharv-Chaudhari/Artificial-Intelligence/actions
   - Click **"I understand my workflows, go ahead and enable them"**

### 2️⃣ **Start Using!**

1. Open: https://atharv-chaudhari.github.io/Artificial-Intelligence/
2. Click **Create Document** on the home page
3. Write your AI notes using Markdown
4. Click **Save Document** (Ctrl+S)
5. ✨ **Automatically saved to GitHub!** (check the `docs/` folder)

**That's it!** No configuration needed! 🎉

## 📖 How It Works

### Architecture (Token-Free!)

```
┌─────────────────────────────────────────────────────────────┐
│                Browser (GitHub Pages)                        │
│                                                              │
│  User saves document → JavaScript creates GitHub Issue      │
│  (NO authentication needed for public repos!)               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼ Public API (no token!)
┌────────────────────────┴────────────────────────────────────┐
│                  GitHub Issues API                           │
│                                                              │
│  Issue created with label 'kb-save-doc'                     │
│  Title: [KB-SAVE] filename                                  │
│  Body: document content                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼ Triggers workflow
┌────────────────────────┴────────────────────────────────────┐
│              GitHub Actions Workflow                         │
│              (.github/workflows/save-document.yml)           │
│                                                              │
│  1. Parse issue title → extract filename                    │
│  2. Parse issue body → extract content                      │
│  3. Create file in docs/ folder                             │
│  4. Git commit and push                                     │
│  5. Close issue automatically                               │
│  6. Comment with success message                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────┴────────────────────────────────────┐
│        Your Repository (docs/ folder)                        │
│        All documentation saved as .md files                  │
└──────────────────────────────────────────────────────────────┘
```

### Why This Approach is Perfect:

- ✅ **100% Token-Free** - No authentication needed for public repos
- ✅ **Completely Free** - GitHub Actions (2,000 minutes/month free)
- ✅ **No Backend Server** - Pure static site
- ✅ **Secure** - No credentials stored in browser
- ✅ **Real Git History** - All commits tracked properly
- ✅ **GitHub Pages Compatible** - Works from same repo

## 🎯 Usage Guide

### Creating Folders

1. Click **Create Folder** card or the + icon in editor
2. Choose name and icon
3. Select parent folder (optional for nested structure)
4. Example: "Artificial Intelligence" → "Deep Learning" → "CNNs"

### Markdown Syntax

```markdown
# Heading 1
## Heading 2

**Bold** *Italic* ~~Strikethrough~~

- Bullet list
1. Numbered list

[Link](https://example.com)
![Image](image-url)

`inline code`

\`\`\`python
# Code block
def neural_network():
    pass
\`\`\`
```

### Python Code Execution

Perfect for AI/ML examples:

````markdown
\`\`\`python:run
import numpy as np

# Simple neural network activation
def sigmoid(x):
    return 1 / (1 + np.exp(-x))

result = sigmoid(0.5)
print(f"Sigmoid(0.5) = {result:.4f}")
\`\`\`
````

Click **Run Python** button to execute!

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Save document |
| `Ctrl + B` | Bold text |
| `Ctrl + I` | Italic text |
| `Ctrl + K` | Insert link |

## ⚙️ Advanced Configuration (Optional)

The app works out-of-the-box, but you can customize:

### GitHub Settings (Optional - for private repos only)

If you make the repo private, you'll need a token:

1. Click the **GitHub button** (top-right)
2. Enter Personal Access Token (get from: https://github.com/settings/tokens)
3. Repository is pre-configured: `Atharv-Chaudhari/Artificial-Intelligence`

### App Settings

Click the **settings icon** to customize:
- Theme (Light/Dark)
- Accent Color
- Particle Effects
- Editor Font Size
- Auto-save options

## 📁 Project Structure

```
.
├── .github/
│   └── workflows/
│       └── save-document.yml        # Auto-commit workflow
├── docs/                            # Your saved documents appear here
├── index.html                       # Main application
├── styles.css                       # All styles
├── app.js                           # Application logic
└── README.md                        # This file
```

## 🔒 Security & Privacy

- ✅ **No Token Storage** - Nothing stored in browser for public repos
- ✅ **No Backend** - Pure client-side application
- ✅ **XSS Protected** - DOMPurify sanitization
- ✅ **Data Privacy** - Everything stored locally or in your GitHub repo
- ✅ **Open Source** - Audit the code yourself

## 🐛 Troubleshooting

### Documents Not Saving to GitHub?

1. **Check Issues are enabled**:
   - Go to: https://github.com/Atharv-Chaudhari/Artificial-Intelligence/settings
   - Ensure "Issues" is checked

2. **Check Actions are enabled**:
   - Go to: https://github.com/Atharv-Chaudhari/Artificial-Intelligence/actions
   - Should show "Save Document via Issue" workflow

3. **Verify workflow file exists**:
   - Check: `.github/workflows/save-document.yml` is in the repo

4. **Check workflow run**:
   - Save a document
   - Go to Actions tab
   - You should see a workflow run
   - Click to view logs if there are errors

### Python Code Not Running?

- First execution takes ~10 seconds (loads Pyodide)
- Check browser console for errors (F12)
- Enable "Python Preload" in settings for faster startup

### Data Lost?

- Export regularly (Import/Export card)
- Data stored in browser localStorage
- Private/Incognito mode doesn't persist data

## 📝 Tips for AI Documentation

- Create folder structure: "AI" → "ML" → "DL" → "NLP"
- Use categories: Research, Tutorial, Code, Theory, Papers
- Embed diagrams as images
- Use Python code blocks for algorithms
- Link related documents

## 🎨 Customization

### Change Theme Colors

Edit `styles.css`:

```css
:root {
    --primary: #6366f1;        /* Change accent color */
}
```

### Add Custom Icons

Edit icon options in `index.html` (search for "icon-option").

## 📦 Technologies Used

- **HTML5, CSS3, JavaScript ES6+**
- **Marked.js** - Markdown parsing
- **Highlight.js** - Code syntax highlighting
- **Pyodide** - Python in browser
- **Particles.js** - Animated background
- **Font Awesome** - Icons
- **DOMPurify** - XSS protection

## 📝 License

MIT License - Free for personal and commercial use

---

**Made with ❤️ for AI Enthusiasts**

**⭐ Star this repo:** https://github.com/Atharv-Chaudhari/Artificial-Intelligence

## ✨ Features

### 🎨 **Premium UI/UX**
- **Glassmorphism Design** - Frosted glass effects with backdrop blur
- **Animated Particles Background** - Interactive particle system (80 particles)
- **Smooth Animations** - Entrance animations, hover effects, transitions
- **Dark/Light Theme** - Fully themed with custom accent colors
- **Responsive Design** - Works on desktop, tablet, and mobile

### 📝 **Documentation Management**
- **Three View Modes**
  - **Home** - Dashboard with actions, stats, and recent docs
  - **Edit** - Full-featured Markdown editor with live preview
  - **View** - Clean document reader mode

- **Folder Organization**
  - Unlimited nested folder structure
  - Icons for each folder (20+ icon options)
  - Expand/collapse tree view
  - Drag-and-drop document organization

- **Rich Markdown Editor**
  - Live side-by-side preview
  - 20+ formatting tools (bold, italic, headings, lists, code, tables, etc.)
  - Image upload with base64 embedding
  - Code syntax highlighting (100+ languages)
  - Custom category tags

### 🐍 **Python Code Execution**
- Execute Python code blocks directly in browser
- Powered by Pyodide (WebAssembly Python)
- Special syntax: \`\`\`python:run
- Capture and display output
- Error handling with detailed messages

### 🔄 **GitHub Integration**
- **Auto-Commit on Save** - Automatically commit docs to GitHub
- **GitHub Actions Workflow** - Uses repository_dispatch for commits
- **Commit History** - Track last 50 commits
- **Status Indicator** - Live connection status badge
- **Customizable Templates** - Configure commit messages

### 💾 **Data Management**
- LocalStorage persistence
- JSON import/export
- Backup and restore functionality
- Stats tracking (documents, folders, categories, commits)

## 🚀 Quick Start

### 1️⃣ **Deploy to GitHub Pages**

1. **Fork or clone this repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Enable GitHub Pages**
   - Go to repository **Settings** → **Pages**
   - Source: Deploy from branch `main`
   - Folder: `/ (root)`
   - Click **Save**
   - Your app will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

### 2️⃣ **Configure GitHub Auto-Commit**

1. **Create Personal Access Token**
   - Go to GitHub **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
   - Click **Generate new token (classic)**
   - Name: `KnowledgeBase Auto-Commit`
   - Scopes: ✅ `repo` (all permissions)
   - Click **Generate token**
   - **⚠️ Copy the token immediately** (you won't see it again)

2. **Configure in the App**
   - Open your deployed app
   - Click the **GitHub button** (top-right, next to theme toggle)
   - Fill in:
     - **Personal Access Token**: Paste your token
     - **Repository Owner**: Your GitHub username
     - **Repository Name**: Your repository name
     - **Branch**: `main` (or your default branch)
     - **Commit Template**: `Update documentation: {filename}`
   - ✅ Enable **Auto-commit on save**
   - Click **Test Connection** to verify
   - Click **Save Settings**

3. **Verify Workflow File Exists**
   - Check that `.github/workflows/auto-commit-docs.yml` exists in your repo
   - This workflow handles automatic commits

### 3️⃣ **Start Documenting!**

1. Click **Create Document** on the home page
2. Write your documentation using Markdown
3. Click **Save Document** (Ctrl+S)
4. If auto-commit is enabled, it will automatically commit to GitHub! 🎉

## 📖 How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (GitHub Pages)                    │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   index.html │───→│   app.js     │───→│ LocalStorage │ │
│  │              │    │              │    │              │ │
│  │  - 3 Views   │    │ - State Mgmt │    │ - Folders    │ │
│  │  - Modals    │    │ - Markdown   │    │ - Documents  │ │
│  │  - Forms     │    │ - Python     │    │ - Settings   │ │
│  └──────────────┘    └──────┬───────┘    └──────────────┘ │
│                              │                               │
│                              ▼                               │
│                    ┌──────────────────┐                     │
│                    │  GitHub API      │                     │
│                    │  (POST /dispatch)│                     │
│                    └────────┬─────────┘                     │
└─────────────────────────────┼─────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  GitHub Actions  │
                    │  Workflow        │
                    │                  │
                    │ 1. Receives event│
                    │ 2. Creates file  │
                    │ 3. Commits       │
                    │ 4. Pushes        │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Your Repository │
                    │  docs/ folder    │
                    └──────────────────┘
```

### Auto-Commit Flow

1. **User saves document** in the browser app
2. **App triggers** GitHub repository_dispatch event via API
3. **GitHub Actions workflow** receives the event
4. **Workflow creates/updates** file in `docs/` folder
5. **Workflow commits** changes to the repository
6. **All happens automatically** - no server needed!

### Why This Approach?

- ✅ **Completely static** - No backend server required
- ✅ **Free GitHub Actions** - 2,000 minutes/month on free plan
- ✅ **Secure** - Token stored in browser localStorage
- ✅ **Real version control** - All commits tracked in Git history
- ✅ **GitHub Pages compatible** - Deploys from same repo

## 🔒 Security

- **XSS Protection**: All user input sanitized with DOMPurify
- **Token Security**: GitHub token stored in localStorage (browser-only)
- **No Backend**: Static files only, no server vulnerabilities

⚠️ **Important**: Never commit your Personal Access Token to the repository!

## 📁 Project Structure

```
.
├── .github/
│   └── workflows/
│       └── auto-commit-docs.yml    # GitHub Actions workflow
├── index.html                       # Main application file
├── styles.css                       # All CSS styles
├── app.js                           # Application logic
└── README.md                        # This file
```

## 🐛 Troubleshooting

### GitHub Auto-Commit Not Working

1. **Check Token Permissions** - Token needs `repo` scope
2. **Verify Workflow File** - Ensure `.github/workflows/auto-commit-docs.yml` exists
3. **Test Connection** - Click "Test Connection" in GitHub settings
4. **Check Actions Tab** - Go to repository → Actions → Check workflow logs

### Python Code Not Running

1. **Wait for Pyodide** - First run takes ~10 seconds to load
2. **Enable Python Preload** - In settings for faster startup

### Data Not Persisting

1. **Check LocalStorage** - DevTools → Application → LocalStorage
2. **Avoid Private Mode** - Use normal browser mode
3. **Export Backup** - Regularly export data as JSON

## 📝 License

MIT License - Feel free to use for personal or commercial projects

---

**⭐ Star this repo if you find it useful!**
