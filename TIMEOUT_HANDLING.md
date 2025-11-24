# MCP Timeout Handling - Implementation Guide

## Overview
This document explains the timeout handling implementation for the MCP migration tools server to prevent timeout errors during long-running AI operations.

## Changes Made

### 1. ✅ MCP Configuration Timeout (.roo/mcp.json)

**Added:**
- `timeout: 300000` (5 minutes) - Client-side timeout
- `MCP_TIMEOUT: "300000"` - Environment variable for server-side timeout

```json
{
  "mcpServers": {
    "migration-tools": {
      "command": "node",
      "args": ["mcp-server.js"],
      "timeout": 300000,  // 5 minutes client timeout
      "env": {
        "WATSONX_URL": "https://us-south.ml.cloud.ibm.com",
        "WATSONX_VERSION": "2024-05-31",
        "MCP_TIMEOUT": "300000"  // 5 minutes server timeout
      }
    }
  }
}
```

**Benefits:**
- Allows up to 5 minutes for complex migrations
- Configurable via environment variable
- Prevents premature timeout errors

---

### 2. ✅ MCP Server Timeout Handling (mcp-server.js)

**Added:**
- Promise.race() pattern for timeout enforcement
- Configurable timeout from environment variable
- Better error messages with timeout detection
- Logging for debugging

```javascript
// Handle tool calls with timeout
this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Get timeout from environment or use default (5 minutes)
    const timeoutMs = parseInt(process.env.MCP_TIMEOUT || '300000', 10);
    
    console.error(`[MCP] Executing tool: ${name} with timeout: ${timeoutMs}ms`);

    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms...`));
      }, timeoutMs);
    });

    // Create tool instance
    const config = args?.modelId ? { modelId: args.modelId } : {};
    const tool = createTool(name, config);

    // Execute with timeout
    const executionPromise = tool.execute(args?.params || args || {});
    const result = await Promise.race([executionPromise, timeoutPromise]);

    console.error(`[MCP] Tool ${name} completed successfully`);

    return {
      content: [{
        type: "text",
        text: JSON.stringify(result, null, 2),
      }],
    };
  } catch (error) {
    console.error(`[MCP] Tool ${name} failed:`, error.message);
    
    const isTimeout = error.message.includes('timed out');
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: false,
          error: error.message,
          tool: name,
          isTimeout,
          suggestion: isTimeout 
            ? 'Try using direct Node.js execution for long operations'
            : 'Check the error message for details',
        }, null, 2),
      }],
      isError: true,
    };
  }
});
```

**Features:**
- ✅ Configurable timeout via `MCP_TIMEOUT` env var
- ✅ Graceful timeout handling with helpful error messages
- ✅ Logging for debugging
- ✅ Timeout detection in error responses
- ✅ Suggestions for alternative approaches

---

### 3. ✅ AI Recommender Timeout (tools/migration/ai-recommender.js)

**Added:**
- 2-minute timeout for AI model calls
- Automatic fallback to rule-based recommendations
- Duration tracking
- Better error handling

```javascript
async generateRecommendations(analysis, legacyCode, modernCode) {
  const prompt = this.buildPrompt(analysis, legacyCode, modernCode);
  
  try {
    console.log('[AI Recommender] Generating recommendations...');
    const startTime = Date.now();
    
    // Create timeout promise (2 minutes for AI call)
    const timeoutMs = 120000;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`AI model timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });
    
    // Race between AI call and timeout
    const response = await Promise.race([
      this.model.invoke(prompt),
      timeoutPromise
    ]);
    
    const duration = Date.now() - startTime;
    console.log(`[AI Recommender] Completed in ${duration}ms`);
    
    const recommendations = this.parseAIResponse(response.content);
    
    return {
      success: true,
      recommendations,
      confidence: this.calculateConfidence(recommendations),
      timestamp: new Date().toISOString(),
      duration
    };
  } catch (error) {
    console.error('[AI Recommender] Failed:', error.message);
    
    // If timeout or AI fails, use fallback
    const fallback = this.generateFallbackRecommendations(analysis);
    
    return {
      success: false,
      error: error.message,
      usingFallback: true,
      recommendations: fallback,
      confidence: 0.6,
      timestamp: new Date().toISOString()
    };
  }
}
```

**Features:**
- ✅ 2-minute timeout for AI calls
- ✅ Automatic fallback to rule-based recommendations
- ✅ Duration tracking for performance monitoring
- ✅ Graceful degradation (still provides recommendations)
- ✅ Clear indication when fallback is used

---

## Timeout Configuration

### Recommended Timeouts

| Operation | Timeout | Rationale |
|-----------|---------|-----------|
| MCP Client | 5 minutes (300000ms) | Allows for full migration workflow |
| MCP Server | 5 minutes (300000ms) | Matches client timeout |
| AI Model Call | 2 minutes (120000ms) | Reasonable for AI response |
| Scan Operation | 30 seconds | Fast, rule-based analysis |
| Migration Apply | 1 minute | File operations are quick |

### Adjusting Timeouts

#### For Faster Operations:
```bash
# Set shorter timeout (1 minute)
export MCP_TIMEOUT=60000
```

#### For Very Long Operations:
```bash
# Set longer timeout (10 minutes)
export MCP_TIMEOUT=600000
```

#### In .roo/mcp.json:
```json
{
  "mcpServers": {
    "migration-tools": {
      "timeout": 600000,  // 10 minutes
      "env": {
        "MCP_TIMEOUT": "600000"
      }
    }
  }
}
```

---

## Error Handling Flow

```
User Request
    ↓
MCP Client (5 min timeout)
    ↓
MCP Server (5 min timeout)
    ↓
Migration Tool
    ↓
AI Recommender (2 min timeout)
    ↓
    ├─ Success → Return AI recommendations
    └─ Timeout/Error → Return fallback recommendations
```

### Fallback Strategy

1. **AI Timeout**: Use rule-based recommendations
2. **Server Timeout**: Return helpful error with suggestions
3. **Client Timeout**: Suggest direct Node.js execution

---

## Testing the Timeout Handling

### Test 1: Normal Operation (Should Complete)
```bash
# Should complete within 5 minutes
node test-mcp-server.js
```

### Test 2: Verify Timeout Configuration
```bash
# Check if timeout is set
node -e "console.log('MCP_TIMEOUT:', process.env.MCP_TIMEOUT || '300000 (default)')"
```

### Test 3: Direct Execution (Bypass MCP)
```bash
# For very long operations
node -e "
import('./tools/migration/index.js').then(async ({ MigrationTool }) => {
  const tool = new MigrationTool();
  await tool.initialize();
  const result = await tool.execute({
    action: 'full',
    legacyFile: './legacy-code/user-service.js',
    modernFile: './ibm-modern-code/user-service.js',
    dryRun: false,
    autoApply: true
  });
  console.log(JSON.stringify(result, null, 2));
});
"
```

---

## Monitoring and Debugging

### Enable Debug Logging

The server now logs:
- Tool execution start with timeout value
- Tool completion
- Tool failures with error details

**Example Output:**
```
[MCP] Executing tool: migration with timeout: 300000ms
[AI Recommender] Generating recommendations...
[AI Recommender] Completed in 45230ms
[MCP] Tool migration completed successfully
```

### Check Logs

```bash
# Run with verbose logging
NODE_ENV=development node mcp-server.js
```

---

## Best Practices

### 1. ✅ Use Appropriate Actions

- **scan**: Fast (< 5 seconds) - No AI involved
- **recommend**: Slow (30-120 seconds) - AI-powered
- **migrate**: Medium (10-30 seconds) - Applies changes
- **full**: Slowest (60-180 seconds) - Complete workflow

### 2. ✅ Progressive Enhancement

```javascript
// Start with scan (fast)
const scanResult = await tool.execute({ action: 'scan', ... });

// Then get recommendations (slower)
const recommendResult = await tool.execute({ action: 'recommend', ... });

// Finally migrate (medium)
const migrateResult = await tool.execute({ action: 'migrate', ... });
```

### 3. ✅ Handle Timeouts Gracefully

```javascript
try {
  const result = await mcpTool.execute({ action: 'full', ... });
} catch (error) {
  if (error.message.includes('timeout')) {
    console.log('Operation timed out. Using direct execution...');
    // Fallback to direct execution
  }
}
```

### 4. ✅ Monitor Performance

Track operation durations to optimize:
- AI model selection (faster models for simple tasks)
- Prompt optimization (shorter prompts = faster responses)
- Caching (cache analysis results)

---

## Troubleshooting

### Issue: Still Getting Timeouts

**Solutions:**
1. Increase timeout in `.roo/mcp.json`
2. Use faster AI model (e.g., `llama-3-8b-instruct`)
3. Use direct Node.js execution
4. Split operation into smaller steps

### Issue: Fallback Recommendations Not Helpful

**Solutions:**
1. Improve rule-based recommendations in `generateFallbackRecommendations()`
2. Use a faster AI model instead of timeout
3. Cache AI recommendations for similar code patterns

### Issue: MCP Server Not Respecting Timeout

**Solutions:**
1. Restart the MCP server
2. Check environment variable: `echo $MCP_TIMEOUT`
3. Verify `.roo/mcp.json` configuration
4. Check server logs for timeout messages

---

## Summary

### ✅ What Was Fixed

1. **Client Timeout**: Increased to 5 minutes in `.roo/mcp.json`
2. **Server Timeout**: Added Promise.race() pattern with configurable timeout
3. **AI Timeout**: Added 2-minute timeout with automatic fallback
4. **Error Handling**: Better error messages and suggestions
5. **Logging**: Added debug logging for monitoring

### 🎯 Expected Behavior

- **Normal operations**: Complete within 1-2 minutes
- **Complex migrations**: Complete within 5 minutes
- **AI timeouts**: Automatically use fallback recommendations
- **Server timeouts**: Return helpful error with suggestions

### 📊 Performance Targets

| Operation | Target Time | Max Time |
|-----------|-------------|----------|
| Scan | < 5 seconds | 30 seconds |
| Recommend | < 60 seconds | 120 seconds |
| Migrate | < 30 seconds | 60 seconds |
| Full Workflow | < 120 seconds | 300 seconds |

---

## Next Steps

1. ✅ Restart Roo Coder to load new MCP configuration
2. ✅ Test migration with MCP tool
3. ✅ Monitor logs for timeout issues
4. ✅ Adjust timeouts if needed based on your use case

---

*Last Updated: November 24, 2025*  
*Version: 2.0.0*