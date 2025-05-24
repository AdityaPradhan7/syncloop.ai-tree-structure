# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# Syncloop.ai Diagram

A React application that visualizes a hierarchical JSON structure using React Flow.

## Features

- Hierarchical visualization with five levels: Application → Teams → Agents → Tools → APIs
- Customizable nodes and edges
- Slide-out panel for displaying node details
- Responsive layout that adapts to container size

## Embedding the Flow Diagram

The flow diagram can be embedded in other applications in multiple ways:

### Using the EmbeddableFlow Component

```jsx
import { EmbeddableFlow } from 'path/to/components/EmbeddableFlow';

function YourApp() {
  return (
    <div>
      {/* Other content */}
      <div style={{ height: '600px', width: '100%', maxWidth: '1200px' }}>
        <EmbeddableFlow />
      </div>
    </div>
  );
}
```

### Direct CSS Control

You can also control the flow container size by styling the parent element:

```jsx
import App from 'path/to/App';
import 'path/to/components/FlowContainer.css';

function YourApp() {
  return (
    <div className="custom-container" style={{ height: '600px', width: '100%' }}>
      <App />
    </div>
  );
}
```

```css
.custom-container {
  position: relative;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}
```

## Important Notes for Embedding

- Always set a fixed or relative height on the container div
- Minimum recommended height is 400px for proper visualization
- The flow diagram will automatically scale to fit within its container
- For best performance, use a container with at least 600px height
- The slide-out panel is positioned absolutely within the container

## Customizing the Appearance

You can customize the appearance of the flow diagram by modifying these CSS files:

- `FlowContainer.css`: Controls the layout of the flow container
- `FlowStyles.css`: Controls the appearance of nodes and edges
- `NodeDetailsPanel.css`: Controls the appearance of the details panel
