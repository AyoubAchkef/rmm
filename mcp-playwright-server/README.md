# RMM MCP Playwright Server

Test Automation Server for executing automated tests on external applications (CRM Ariane, etc.).

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install
```

### 3. Configure Environment

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

Edit `.env`:
```env
BASE_URL=https://your-crm-url.com
DEFAULT_BROWSER=chromium
HEADLESS=true
```

### 4. Start Server

```bash
npm start
```

## 📡 Endpoints

### Health Check
```bash
GET /health
```

### Execute Test
```bash
POST /api/playwright/execute
Content-Type: application/json

{
  "url": "https://your-app.com",
  "actions": [
    {
      "type": "click",
      "selector": "button#login"
    },
    {
      "type": "fill",
      "selector": "input#email",
      "value": "test@example.com"
    },
    {
      "type": "screenshot"
    }
  ],
  "browser": "chromium",
  "timeout": 30000
}
```

### Get Available Browsers
```bash
GET /api/playwright/browsers
```

### Get Configuration
```bash
GET /api/playwright/config
```

## 🎭 Action Types

| Type | Description | Parameters |
|------|-------------|------------|
| `click` | Click on element | `selector` |
| `fill` | Fill input field | `selector`, `value` |
| `type` | Type text | `selector`, `value` |
| `wait` | Wait for element | `selector` |
| `screenshot` | Take screenshot | - |
| `assertText` | Assert text content | `selector`, `text` |

## 🧪 Example Test

```javascript
{
  "url": "https://crm-ariane.com/login",
  "actions": [
    {
      "type": "fill",
      "selector": "#username",
      "value": "testuser"
    },
    {
      "type": "fill",
      "selector": "#password",
      "value": "testpass"
    },
    {
      "type": "click",
      "selector": "button[type='submit']"
    },
    {
      "type": "wait",
      "selector": ".dashboard"
    },
    {
      "type": "screenshot"
    },
    {
      "type": "assertText",
      "selector": "h1",
      "text": "Dashboard"
    }
  ]
}
```

## 📚 Documentation

See [AI_INTEGRATION.md](../AI_INTEGRATION.md) for complete documentation.

## 🔧 Development

```bash
# Run in watch mode
npm run dev

# Run tests with UI
npm run test:headed

# Debug tests
npm run test:debug
```
