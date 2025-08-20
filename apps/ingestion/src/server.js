const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'ingestion' });
});

// Demo inbox with synthetic email fixtures
app.get('/demo/inbox.json', (req, res) => {
  const mockEmails = [
    {
      id: "email-001",
      from: "client@lawfirm.com",
      to: "paralegal@firm.com",
      subject: "Re: Contract Review - NDA with Acme Corp",
      date: "2024-01-15T14:30:00Z",
      plaintext: `Hi Sarah,

Please review the attached NDA with Acme Corporation. The contract includes the following key terms:

1. Confidentiality period extends for 5 years from signing
2. Non-disclosure applies to all technical documentation 
3. Return of materials required within 30 days of termination
4. Governing law is Delaware

The client deadline is January 20th, so we need to move quickly. Please flag any issues you find.

Let me know if you have questions.

Best,
John Smith
Senior Partner
Law Firm LLP
john.smith@lawfirm.com
(555) 123-4567`,
      html_anchors: {
        "confidentiality-period": { start: 156, end: 198 },
        "technical-documentation": { start: 234, end: 269 },
        "return-materials": { start: 285, end: 329 },
        "governing-law": { start: 344, end: 369 },
        "client-deadline": { start: 385, end: 425 }
      },
      priority: "high",
      hasAttachments: true
    },
    {
      id: "email-002", 
      from: "opposing@counsel.com",
      to: "paralegal@firm.com",
      subject: "Discovery Request - Merger Documentation",
      date: "2024-01-14T09:15:00Z",
      plaintext: `Dear Counsel,

This letter serves as our formal discovery request pursuant to Rule 34. We request production of the following documents:

1. All board resolutions related to the proposed merger
2. Financial statements from 2022-2024  
3. Due diligence reports prepared by third parties
4. Communications with regulatory bodies (SEC, FTC)

Please produce these documents within 30 days as required by local rules.

Sincerely,
Michael Johnson
Johnson & Associates
mjohnson@counsel.com`,
      html_anchors: {
        "board-resolutions": { start: 146, end: 188 },
        "financial-statements": { start: 204, end: 242 },
        "due-diligence": { start: 258, end: 304 },
        "regulatory-communications": { start: 320, end: 371 },
        "thirty-day-deadline": { start: 400, end: 440 }
      },
      priority: "medium",
      hasAttachments: false
    },
    {
      id: "email-003",
      from: "client@startup.com", 
      to: "paralegal@firm.com",
      subject: "Urgent: Employment Agreement Concerns",
      date: "2024-01-13T16:45:00Z",
      plaintext: `Hi there,

I just received the employment agreement draft and have some concerns:

1. The non-compete clause extends to 24 months - this seems excessive
2. Intellectual property assignment is very broad
3. No mention of stock options in the compensation section
4. Termination clause allows firing "for cause" without clear definition

Can we schedule a call to discuss? The start date is Monday so time is tight.

Thanks,
Alex Chen  
Founder, StartupCo
alex@startup.com
(555) 987-6543`,
      html_anchors: {
        "non-compete-24months": { start: 119, end: 178 },
        "ip-assignment-broad": { start: 194, end: 240 },
        "stock-options-missing": { start: 256, end: 312 },
        "termination-for-cause": { start: 328, end: 400 },
        "monday-start-date": { start: 465, end: 510 }
      },
      priority: "high",
      hasAttachments: true
    }
  ];

  res.json({
    emails: mockEmails,
    total: mockEmails.length,
    generated_at: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'paralegal-ai-ingestion',
    version: '0.1.0',
    status: 'operational',
    description: 'Email ingestion with synthetic fixtures for demo'
  });
});

app.listen(PORT, () => {
  console.log(`[ingestion] Server running on port ${PORT}`);
});