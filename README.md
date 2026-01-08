# swazzers

A basic webapp workspace built with npm.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

```bash
npm install
```

### Development

Build the project and start the development server:

```bash
npm run dev
```

This will build the project and start a local server at http://localhost:8080

### Build

To build the project for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Start

To start the server without rebuilding:

```bash
npm start
```

## Project Structure

```
swazzers/
├── src/              # Source files
│   ├── index.js      # Main JavaScript file
│   └── styles.css    # Main CSS file
├── public/           # Static assets
│   └── index.html    # HTML entry point
├── dist/             # Build output (generated)
└── package.json      # npm configuration
```

## Available Scripts

- `npm run build` - Build the project
- `npm run dev` - Build and start development server
- `npm start` - Start the server (requires build first)
- `npm run clean` - Clean the dist directory