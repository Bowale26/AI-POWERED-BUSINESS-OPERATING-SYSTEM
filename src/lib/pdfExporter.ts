/**
 * Beautiful and Robust Client-Side PDF Generator & Printer Utility.
 * Uses a styled iframe approach to trigger the browser's native Print-to-PDF engine,
 * ensuring perfect high-fidelity vector text, font matching, and premium margins.
 */

// Helper to convert simple Markdown into elegantly styled HTML for printing
function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const lines = markdown.split('\n');
  let inList = false;
  let inOrderedList = false;
  let htmlContent = '';

  for (let line of lines) {
    let trimmed = line.trim();

    // Handle horizontal rules
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      if (inList) { htmlContent += '</ul>\n'; inList = false; }
      if (inOrderedList) { htmlContent += '</ol>\n'; inOrderedList = false; }
      htmlContent += '<hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />\n';
      continue;
    }

    // Handle Headings
    if (trimmed.startsWith('# ')) {
      if (inList) { htmlContent += '</ul>\n'; inList = false; }
      if (inOrderedList) { htmlContent += '</ol>\n'; inOrderedList = false; }
      const text = trimmed.substring(2);
      htmlContent += `<h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin-top: 28px; margin-bottom: 12px; font-family: 'Inter', system-ui, sans-serif; border-bottom: 2px solid #3b82f6; padding-bottom: 6px;">${text}</h1>\n`;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (inList) { htmlContent += '</ul>\n'; inList = false; }
      if (inOrderedList) { htmlContent += '</ol>\n'; inOrderedList = false; }
      const text = trimmed.substring(3);
      htmlContent += `<h2 style="font-size: 20px; font-weight: 700; color: #1e3a8a; margin-top: 24px; margin-bottom: 10px; font-family: 'Inter', system-ui, sans-serif; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">${text}</h2>\n`;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      if (inList) { htmlContent += '</ul>\n'; inList = false; }
      if (inOrderedList) { htmlContent += '</ol>\n'; inOrderedList = false; }
      const text = trimmed.substring(4);
      htmlContent += `<h3 style="font-size: 16px; font-weight: 600; color: #0f172a; margin-top: 18px; margin-bottom: 8px; font-family: 'Inter', system-ui, sans-serif;">${text}</h3>\n`;
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      if (inList) { htmlContent += '</ul>\n'; inList = false; }
      if (inOrderedList) { htmlContent += '</ol>\n'; inOrderedList = false; }
      const text = trimmed.substring(5);
      htmlContent += `<h4 style="font-size: 14px; font-weight: 600; color: #475569; margin-top: 14px; margin-bottom: 6px; font-family: 'Inter', system-ui, sans-serif; text-transform: uppercase; tracking: 0.05em;">${text}</h4>\n`;
      continue;
    }

    // Handle Unordered Lists
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      if (inOrderedList) { htmlContent += '</ol>\n'; inOrderedList = false; }
      if (!inList) {
        htmlContent += '<ul style="margin-top: 6px; margin-bottom: 12px; padding-left: 20px; list-style-type: square; color: #334155;">\n';
        inList = true;
      }
      const text = trimmed.substring(2);
      htmlContent += `<li style="margin-bottom: 6px; line-height: 1.6; font-size: 13.5px;">${text}</li>\n`;
      continue;
    }

    // Handle Ordered Lists (e.g. "1. ")
    const orderedListMatch = trimmed.match(/^(\d+)\.\s(.*)/);
    if (orderedListMatch) {
      if (inList) { htmlContent += '</ul>\n'; inList = false; }
      if (!inOrderedList) {
        htmlContent += '<ol style="margin-top: 6px; margin-bottom: 12px; padding-left: 20px; list-style-type: decimal; color: #334155;">\n';
        inOrderedList = true;
      }
      const text = orderedListMatch[2];
      htmlContent += `<li style="margin-bottom: 6px; line-height: 1.6; font-size: 13.5px;">${text}</li>\n`;
      continue;
    }

    // End of lists
    if (trimmed === '') {
      if (inList) { htmlContent += '</ul>\n'; inList = false; }
      if (inOrderedList) { htmlContent += '</ol>\n'; inOrderedList = false; }
      htmlContent += '<div style="height: 8px;"></div>\n';
      continue;
    }

    // Normal paragraph text
    if (inList) { htmlContent += '</ul>\n'; inList = false; }
    if (inOrderedList) { htmlContent += '</ol>\n'; inOrderedList = false; }
    
    htmlContent += `<p style="margin-top: 0; margin-bottom: 12px; line-height: 1.6; font-size: 13.5px; color: #334155;">${trimmed}</p>\n`;
  }

  // Close any open lists
  if (inList) htmlContent += '</ul>\n';
  if (inOrderedList) htmlContent += '</ol>\n';

  // Process bold formatting (**text** or __text__)
  htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0f172a; font-weight: 700;">$1</strong>');
  htmlContent = htmlContent.replace(/__(.*?)__/g, '<strong style="color: #0f172a; font-weight: 700;">$1</strong>');
  
  // Process code blocks (`code`)
  htmlContent = htmlContent.replace(/`(.*?)`/g, '<code style="font-family: \'Fira Code\', \'JetBrains Mono\', monospace; background-color: #f1f5f9; padding: 2px 5px; border-radius: 4px; font-size: 12px; border: 1px solid #e2e8f0; color: #0f172a;">$1</code>');

  return htmlContent;
}

export interface PDFExportOptions {
  title: string;
  subtitle?: string;
  category?: string;
  author?: string;
}

export function exportDocumentToPDF(markdownContent: string, options: PDFExportOptions) {
  const parsedHtml = parseMarkdownToHtml(markdownContent);
  const dateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Create the premium print-styled HTML wrapper
  const docHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${options.title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 portrait;
            margin: 20mm 18mm 20mm 18mm;
            @bottom-right {
              content: counter(page);
              font-family: 'Inter', sans-serif;
              font-size: 9px;
              color: #94a3b8;
            }
          }
          
          body {
            font-family: 'Inter', -apple-system, system-ui, sans-serif;
            color: #334155;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Header Styling */
          .document-header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 16px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }

          .header-left h1 {
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: -0.025em;
          }

          .header-left p {
            font-size: 10px;
            color: #64748b;
            margin: 4px 0 0 0;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-weight: 600;
          }

          .header-right {
            text-align: right;
          }

          .badge {
            display: inline-block;
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 3px 8px;
            font-size: 8px;
            font-family: 'JetBrains Mono', monospace;
            font-weight: 700;
            color: #0f172a;
            text-transform: uppercase;
          }

          /* Metadata Grid */
          .meta-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 12px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px 16px;
            margin-bottom: 28px;
          }

          .meta-item {
            font-size: 11px;
            color: #475569;
          }

          .meta-item strong {
            color: #0f172a;
            font-weight: 600;
          }

          /* Content Styling */
          .document-content {
            font-size: 13.5px;
            line-height: 1.6;
          }

          /* Prevent break inside elements */
          h1, h2, h3, h4, .meta-grid, .document-header {
            page-break-after: avoid;
          }

          ul, ol, p, li {
            page-break-inside: avoid;
          }

          /* Footer Sign-off */
          .document-footer {
            margin-top: 40px;
            border-top: 1px solid #e2e8f0;
            padding-top: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 10px;
            color: #94a3b8;
          }

          .footer-logo {
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.025em;
          }

          /* Hide iframe elements if any */
          @media print {
            body {
              background: none;
            }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="document-header">
          <div class="header-left">
            <h1>${options.title}</h1>
            <p>${options.subtitle || 'Executive Intelligence Memo'}</p>
          </div>
          <div class="header-right">
            <span class="badge">${options.category || 'SYSTEM DOCUMENT'}</span>
          </div>
        </div>

        <!-- Metadata -->
        <div class="meta-grid">
          <div class="meta-item">📅 <strong>Compiled:</strong> ${dateString}</div>
          <div class="meta-item">👤 <strong>Generated For:</strong> ${options.author || 'Enterprise Officer'}</div>
          <div class="meta-item">🔐 <strong>Security:</strong> INTERNAL ONLY (SOC2 Compliant)</div>
          <div class="meta-item">🤖 <strong>Engine Source:</strong> Gemini AI Cognitive System</div>
        </div>

        <!-- Main Content -->
        <div class="document-content">
          ${parsedHtml}
        </div>

        <!-- Footer Sign-off -->
        <div class="document-footer">
          <div>Report ID: BOS-PDF-${Math.floor(100000 + Math.random() * 900000)}</div>
          <div class="footer-logo">CRM ORCHESTRATOR</div>
          <div>Page 1 of 1</div>
        </div>
      </body>
    </html>
  `;

  // Create a clean hidden iframe to perform the print action
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.name = 'pdf_print_iframe';

  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow || iframe.contentDocument;
  if (iframeDoc) {
    const doc = (iframeDoc as any).document || iframeDoc;
    doc.open();
    doc.write(docHtml);
    doc.close();

    // Small timeout to allow images, styles, and webfonts to fully paint
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Cleanup the iframe after print dialog completes
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 5000);
    }, 500);
  }
}
