/**
 * Email layout template with CSMS branding
 */
export const getEmailLayout = (content: string): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSMS Notification</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f1f5f9;
      line-height: 1.6;
      color: #334155;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 100%);
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      margin-top: 8px;
    }
    .content {
      padding: 30px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      color: #64748b;
      font-size: 12px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 100%);
      color: #ffffff;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 8px;
      margin-top: 20px;
      font-weight: 500;
    }
    .details-box {
      background-color: #f8fafc;
      border-left: 4px solid #0ea5e9;
      padding: 15px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    .details-box p {
      margin: 5px 0;
    }
    .status-approved {
      color: #10b981;
      font-weight: 600;
    }
    .status-rejected {
      color: #ef4444;
      font-weight: 600;
    }
    .status-pending {
      color: #f59e0b;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CSMS</h1>
      <p>Civil Service Management System</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>This is an automated notification from CSMS.</p>
      <p>Please do not reply to this email.</p>
      <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} Civil Service Commission of Zanzibar. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
};
