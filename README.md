# makemyshellprompt 🛠️

An interactive, user-friendly tool to customize terminal prompts (PS1) with live preview and animations.

## 🚀 Tech Stack

- **Vite (Vanilla JS)**: For a modern, fast development experience.
- **Vanilla CSS**: Premium styling with glassmorphism and CSS variables.
- **SortableJS**: Mobile-friendly drag-and-drop reordering.
- **JavaScript**: Custom animation logic for typing/deleting effects.

## 📁 Project Structure

```text
├── index.html        # Main HTML structure
├── src/
│   ├── index.css     # Styling, themes, and animations
│   └── main.js       # Core logic, component data, and SortableJS integration
├── package.json      # Dependencies and scripts
└── public/           # Static assets (favicon, etc.)
```

## 🛠️ Setup and Running

To run the project locally, follow these steps:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Access the App**:
   Open [http://localhost:5173/](http://localhost:5173/) in your browser.

## ✨ Features

- **20+ Components**: Username, hostname, path, git branch, exit codes, and more.
- **Draggable Order**: Rearrange your prompt structure naturally.
- **Color Customization**: Pick from standard ANSI colors or use the custom hex picker.
- **Interactive Preview**: See exactly how your prompt will look in a terminal window.
- **Copy PS1**: Get the raw string ready for your `.bashrc` or `.zshrc`.
