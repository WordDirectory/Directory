# WordDirectory MCP Server

A Model Context Protocol server for WordDirectory that provides word definition lookups through a standardized interface.

## Features

- Look up word definitions using the `lookup_word` tool
- Get suggestions for similar words when exact match isn't found
- Integrates with WordDirectory's API endpoints

## Installation

```bash
npm install
```

## Configuration

The server requires the following environment variables:

- `NEXT_PUBLIC_APP_URL`: The URL of your WordDirectory web app (e.g., `http://localhost:3000` for local development)
- `PORT` (optional): The port to run the MCP server on (defaults to 3000)

## Usage

### Development

```bash
# Start in development mode (builds and runs)
npm run dev

# Or watch mode for development
npm run watch
```

### Production

```bash
# Build the server
npm run build

# Start the server
npm start
```

## Using with Claude Desktop

To use this MCP server with Claude Desktop, add the following to your Claude Desktop config file:

On Windows:

```json
// %APPDATA%/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "worddirectory-mcp": {
      "command": "path/to/worddirectory-mcp/dist/index.js"
    }
  }
}
```

On macOS:

```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "worddirectory-mcp": {
      "command": "path/to/worddirectory-mcp/dist/index.js"
    }
  }
}
```

## Available Tools

### lookup_word

Looks up the definition of a word.

Parameters:

- `word` (string): The word to look up

Example response:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Example: A thing or person that serves as a pattern to be imitated."
    }
  ]
}
```

If the word isn't found, it will suggest similar words:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Word \"exampl\" not found. Did you mean:\n- Example\n- Exemplar\n- Exemplary"
    }
  ]
}
```
