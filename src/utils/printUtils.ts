export function handlePrintInvoice(elementId: string = 'digital-receipt-printable') {
  const elem = document.getElementById(elementId);
  
  if (!elem) {
    window.print();
    return;
  }

  // Create temporary print iframe for 100% reliable printing without modal/iframe CSS clipping
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.style.width = '1000px';
  iframe.style.height = '1000px';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    window.print();
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>Invoice Print - Abedoni</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body {
            font-family: 'Hind Siliguri', 'Plus Jakarta Sans', sans-serif;
            margin: 0;
            padding: 20px;
            background: #ffffff;
            color: #0f172a;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          .no-print { display: none !important; }
        </style>
      </head>
      <body>
        <div style="max-width: 800px; margin: 0 auto;">
          ${elem.outerHTML}
        </div>
      </body>
    </html>
  `;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  // Allow styles and fonts to render before launching print dialog
  setTimeout(() => {
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } else {
        window.print();
      }
    } catch {
      window.print();
    } finally {
      setTimeout(() => {
        try {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        } catch {}
      }, 2000);
    }
  }, 400);
}
