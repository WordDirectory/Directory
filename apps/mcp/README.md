# WordDirectory MCP Server

A Model Context Protocol server for WordDirectory that provides word definition lookups through a standardized interface.

## Features

- Look up word definitions using the `lookup_word` tool
- Get suggestions for similar words when exact match isn't found
- Integrates with WordDirectory's API endpoints
- Standardized error handling with error codes
- Session management with unique IDs

## Installation

### NPM Package

```bash
npm install worddirectory-mcp
```

### Docker

```bash
# Build the image
npm run docker:build

# Run the container
npm run docker:run
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

## MCP Integration

### Claude Desktop

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "worddirectory-mcp": {
      "command": "worddirectory-mcp"
    }
  }
}
```

### Cursor

Add to your Cursor settings:

```json
{
  "mcpServers": {
    "worddirectory-mcp": {
      "command": "worddirectory-mcp"
    }
  }
}
```

## Available Tools

### lookup_word

Looks up the definition of a word.

#### Parameters

- `word` (string): The word to look up

#### Returns

Success response:

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

Not found response with suggestions:

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

Error response:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error message for user"
    }
  ],
  "error": {
    "code": "ERROR_CODE",
    "message": "Detailed error message"
  }
}
```

#### Error Codes

- `INVALID_INPUT`: The provided word is empty or invalid
- `API_ERROR`: Error communicating with WordDirectory API

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details
