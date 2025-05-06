#!/usr/bin/env node
import express from 'express';
import { randomUUID } from 'node:crypto';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import fetch from 'node-fetch';

// Create Express app
const app = express();
app.use(express.json());

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// API Types
interface WordDetails {
  definition: string;
}

interface Word {
  id: string;
  word: string;
  details: WordDetails;
}

interface SearchResult {
  word: string;
}

// Create MCP server instance
function createServer() {
  const server = new McpServer({
    name: "worddirectory-mcp",
    version: "0.1.0"
  });

  // Add a tool to look up word definitions
  server.tool(
    "lookup_word",
    {
      word: z.string().describe("The word to look up")
    },
    async ({ word }) => {
      try {
        // First try to get the specific word
        const wordResponse = await fetch(`https://worddirectory.app/api/words/${encodeURIComponent(word)}`);
        
        if (wordResponse.ok) {
          const data = (await wordResponse.json()) as Word; 
          return {
            content: [{
              type: "text",
              text: `${data.word}: ${data.details.definition}`
            }]
          };
        }

        // If word not found, try searching
        const searchResponse = await fetch(`https://worddirectory.app/api/words/search?q=${encodeURIComponent(word)}&limit=5`);
        
        if (searchResponse.ok) {
          const searchResults = (await searchResponse.json()) as SearchResult[];
          if (searchResults.length > 0) {
            return {
              content: [{
                type: "text",
                text: `Word "${word}" not found. Did you mean:\n${searchResults.map(r => `- ${r.word}`).join('\n')}`
              }]
            };
          }
        }

        return {
          content: [{
            type: "text",
            text: `Definition not found for word: ${word}`
          }]
        };
      } catch (error) {
        console.error('Error looking up word:', error);
        return {
          content: [{
            type: "text",
            text: `Error looking up word: ${word}. Please try again later.`
          }]
        };
      }
    }
  );

  return server;
}

// Handle POST requests for client-to-server communication
app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId) => {
        transports[sessionId] = transport;
      }
    });

    transport.onclose = () => {
      if (transport.sessionId) {
        delete transports[transport.sessionId];
      }
    };

    const server = createServer();
    await server.connect(transport);
  } else {
    res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Bad Request: No valid session ID provided',
      },
      id: null,
    });
    return;
  }

  await transport.handleRequest(req, res, req.body);
});

// Handle GET requests for server-to-client notifications
app.get('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }
  
  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
});

// Handle DELETE requests for session termination
app.delete('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }
  
  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP Server listening on port ${PORT}`);
}); 