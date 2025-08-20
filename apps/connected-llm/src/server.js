const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8010;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'connected-llm',
    external_apis_enabled: !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY)
  });
});

// OpenAI-compatible chat completion endpoint (stub)
app.post('/v1/chat/completions', (req, res) => {
  const { messages } = req.body;
  
  // In real implementation, this would call external APIs
  // For now, return mock responses for allowlisted templates
  
  const lastMessage = messages[messages.length - 1]?.content || '';
  
  let response = "Mock external API response";
  let sources = [];
  
  // Mock responses for allowlisted templates
  if (lastMessage.includes('CFR') || lastMessage.includes('17 CFR')) {
    response = "17 CFR § 240.10b-5 addresses securities fraud and prohibits employment of manipulative or deceptive devices in connection with purchase or sale of securities.";
    sources = [
      { title: "17 CFR § 240.10b-5 - Code of Federal Regulations", url: "https://www.ecfr.gov/current/title-17/chapter-II/part-240/section-240.10b-5" }
    ];
  } else if (lastMessage.includes('CPLR')) {
    response = "The Civil Practice Law and Rules (CPLR) govern civil procedure in New York State courts, including rules for service of process, discovery, and motion practice.";
    sources = [
      { title: "New York CPLR - Civil Practice Law and Rules", url: "https://www.nysenate.gov/legislation/laws/CVP" }
    ];
  } else if (lastMessage.includes('UK') || lastMessage.includes('citation')) {
    response = "UK case citations follow the neutral citation format: [Year] Court Abbreviation Number, e.g., [2023] UKSC 15 for Supreme Court cases.";
    sources = [
      { title: "Guide to Legal Citation (UK)", url: "https://www.judiciary.uk/about-the-judiciary/the-justice-system/court-structure/" }
    ];
  }
  
  res.json({
    id: 'mock-' + Date.now(),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'connected-llm-proxy',
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: response
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: lastMessage.length / 4,
      completion_tokens: response.length / 4,
      total_tokens: (lastMessage.length + response.length) / 4
    },
    sources: sources
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'paralegal-ai-connected-llm',
    version: '0.1.0',
    status: 'operational',
    description: 'Connected LLM proxy for allowlisted external queries only',
    privacy: 'Only processes redacted, template-based queries'
  });
});

app.listen(PORT, () => {
  console.log(`[connected-llm] Server running on port ${PORT}`);
});