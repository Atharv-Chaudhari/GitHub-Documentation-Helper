# 👥 User Guide - Complete UI Walkthrough

## 🎯 Everything You Can Do From the UI

### 📝 **Creating & Managing Documents**

#### **1. Create a New Document:**
1. Click **"Create Document"** card on Home page
2. OR click **"+ New Document"** in Edit view
3. Enter document title (e.g., "Neural Networks Basics")
4. Select category from dropdown (Tutorial, Research, Code, etc.)
5. Write content in Markdown editor
6. Click **"Save Document"** (or press `Ctrl+S`)
7. ✅ **Automatically saved to localStorage + GitHub repo!**

#### **2. Edit Existing Document:**
1. Go to Edit or View mode
2. Click on document name in folder tree
3. Document loads in editor
4. Make changes
5. Click **"Save Document"**
6. ✅ **Changes saved automatically!**

#### **3. Delete Document:**
1. Load document in Edit mode
2. Click **"🗑️ Delete"** button
3. Confirm deletion
4. ✅ **Removed from UI and won't be saved to repo**

### 📁 **Creating & Managing Folders**

#### **1. Create Root Folder:**
1. Click **"Create Folder"** card on Home page
2. OR click **"+ New Folder"** button in Edit view
3. Enter folder name (e.g., "Artificial Intelligence")
4. Choose an icon from 20+ options
5. Leave "Parent Folder" as "Root"
6. Click **"Create Folder"**
7. ✅ **Folder appears in tree immediately!**

#### **2. Create Nested Folder:**
1. Click **"+ New Folder"** button
2. Enter folder name (e.g., "Machine Learning")
3. Choose icon
4. Select parent folder from dropdown (e.g., "Artificial Intelligence")
5. Click **"Create Folder"**
6. ✅ **Nested folder structure created!**

**Example Structure You Can Build:**
```
📚 Artificial Intelligence
  ├── 🤖 Machine Learning
  │   ├── 🧠 Neural Networks
  │   │   ├── 📄 Introduction to NNs.md
  │   │   └── 📄 Backpropagation.md
  │   ├── 🌳 Decision Trees
  │   └── 📊 Linear Regression
  ├── 💬 Natural Language Processing
  │   ├── 📝 Tokenization.md
  │   └── 🎯 Word Embeddings.md
  └── 👁️ Computer Vision
      ├── 🖼️ CNNs.md
      └── 🎨 Image Processing.md
```

#### **3. Organize Documents in Folders:**
1. Create/edit a document
2. In Edit mode, use breadcrumb navigation
3. Click on folder name to set document's location
4. Save document
5. ✅ **Document organized automatically!**

#### **4. Expand/Collapse Folders:**
- Click the **▶️ / ▼** arrow next to folder name
- ✅ **Tree expands/collapses visually**

### 🎨 **Formatting & Editing**

#### **Toolbar Buttons (All Point & Click!):**

| Button | Function | Shortcut |
|--------|----------|----------|
| **B** | Bold text | `Ctrl+B` |
| **I** | Italic text | `Ctrl+I` |
| **S** | Strikethrough | - |
| **H1-H6** | Headings | - |
| **•** | Bullet list | - |
| **1.** | Numbered list | - |
| **🔗** | Insert link | `Ctrl+K` |
| **🖼️** | Upload image | - |
| **</>** | Code block | - |
| **`** | Inline code | - |
| **"** | Blockquote | - |
| **━** | Horizontal rule | - |
| **⊞** | Table | - |

#### **Live Preview:**
- Type in left panel → See rendered output in right panel
- Updates in real-time!
- ✅ **WYSIWYG experience**

#### **Image Upload:**
1. Click **🖼️** image button
2. Select image file (JPG, PNG, GIF, SVG)
3. ✅ **Image embedded as base64 - no separate upload needed!**
4. Shows in preview immediately

### 🐍 **Python Code Execution**

#### **Execute Python in Browser:**
1. Write code in Markdown editor:
````markdown
```python:run
import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

result = sigmoid(0.5)
print(f"Result: {result}")
```
````

2. Click **"▶️ Run Python"** button in toolbar
3. Python panel opens at bottom
4. Code executes in browser (Pyodide)
5. ✅ **Output shown immediately!**

**Perfect for:**
- AI/ML code examples
- Algorithm demonstrations
- Data science tutorials
- Interactive learning

### 💾 **Data Management**

#### **Export All Data:**
1. Click **"Import/Export"** card on Home page
2. Click **"📤 Export All Data"**
3. ✅ **JSON file downloads with all folders + documents**
4. Save as backup!

#### **Import Data:**
1. Click **"Import/Export"** card
2. Click **"📥 Import from File"**
3. Select previously exported JSON file
4. ✅ **All data restored!**

### 🔄 **GitHub Auto-Save**

#### **Enable Auto-Save:**
1. Click **🔗 GitHub** button (top-right)
2. Repository is pre-configured: `Atharv-Chaudhari/Artificial-Intelligence`
3. Check ✅ **"Auto-commit on save"**
4. Click **"Save Settings"**
5. ✅ **Every save now goes to GitHub automatically!**

#### **What Happens When You Save:**
```
You click "Save Document"
    ↓
✅ Saved to browser (instant)
    ↓
✅ GitHub Issue created (2 seconds)
    ↓
✅ GitHub Actions processes (30 seconds)
    ↓
✅ File appears in repo: docs/your_file.md
    ↓
✅ Issue auto-closes with success message
```

#### **Check Your Files on GitHub:**
Go to: https://github.com/Atharv-Chaudhari/Artificial-Intelligence/tree/main/docs

You'll see all your saved documents!

### 🎨 **Customization**

#### **Change Theme:**
- Click **🌙 / ☀️** icon (top-right)
- Toggles Dark/Light mode
- ✅ **Preference saved automatically**

#### **Advanced Settings:**
1. Click **⚙️ Settings** icon
2. Customize:
   - Theme (Light/Dark)
   - Accent color
   - Particle effects (on/off)
   - Animations (on/off)
   - Editor font size
   - Auto-save interval
   - Live preview (on/off)
   - Python preload
3. Click **"Save Settings"**
4. ✅ **All preferences saved!**

### 🔍 **Finding Documents**

#### **Browse by Folder:**
- Navigate folder tree in Edit/View mode
- Click folder to see its documents
- ✅ **Visual organization**

#### **View Recent Documents:**
- Home page shows last 6 documents
- Click to open directly
- ✅ **Quick access**

#### **View All Documents:**
- Click **"View Documents"** card on Home
- See all documents in View mode
- ✅ **Complete list**

### 📊 **Track Your Progress**

#### **Dashboard Stats:**
Home page shows:
- 📁 **Total Folders**: How many folders you've created
- 📄 **Documents**: Total number of documents
- 🏷️ **Categories**: Categories you're using
- 🔄 **GitHub Commits**: Files saved to repo

#### **Commit History:**
- See last 50 commits
- Track what was saved when
- ✅ **Full history in GitHub repo**

## 🎯 **Common Workflows**

### **Workflow 1: Create AI Study Notes**
1. Create folder "Machine Learning"
2. Create document "Neural Networks Intro"
3. Write notes in Markdown
4. Add Python code examples
5. Upload diagram images
6. Save (auto-commits to GitHub)
7. ✅ **Done! Notes saved and backed up**

### **Workflow 2: Organize Research Papers**
1. Create folder "Research Papers"
2. Create nested folders by topic
3. Create documents with paper summaries
4. Link to original papers
5. Tag with "Research" category
6. ✅ **Organized library!**

### **Workflow 3: Code Tutorials**
1. Create folder "Tutorials"
2. Create document "Getting Started with TensorFlow"
3. Write step-by-step guide
4. Add Python code blocks with `python:run`
5. Execute code to verify it works
6. Save
7. ✅ **Interactive tutorial ready!**

## ✅ **Everything is Visual - No Git/Terminal Needed!**

### **You NEVER need to:**
- ❌ Use Git commands
- ❌ Open terminal
- ❌ Edit files manually
- ❌ Configure anything
- ❌ Install software

### **You ONLY need to:**
- ✅ Open the web app
- ✅ Click buttons
- ✅ Type content
- ✅ Save documents

**That's it!** Everything else happens automatically! 🎉

## 🚀 **Getting Started (First Time)**

1. Open: https://atharv-chaudhari.github.io/Artificial-Intelligence/
2. Click **"Create Document"**
3. Write: `# My First AI Note`
4. Click **"Save Document"**
5. ✅ **You're done! It's saved to GitHub automatically!**

Check: https://github.com/Atharv-Chaudhari/Artificial-Intelligence/tree/main/docs

Your document is there! 🎊

---

**Questions?** Everything works from the UI - just explore and click around! The interface is designed to be intuitive and self-explanatory. 😊
