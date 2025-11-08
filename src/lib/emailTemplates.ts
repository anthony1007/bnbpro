export function resetPasswordEmail(url: string, p0: any) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Reset Password - BNBFund</title>
  </head>
  <body style="margin:0; padding:0; background-color:#0D0D0D; font-family:Arial, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0D0D0D; padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" border="0" cellspacing="0" cellpadding="20" style="background:#1A1A1A; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.3); color:#FFFFFF;">
            <tr>
              <td align="center" style="font-size:28px; font-weight:bold; color:#E0B90B;">
                BNBFund
              </td>
            </tr>
            <tr>
              <td style="font-size:16px; line-height:1.6; color:#CCCCCC;">
                <p>Hello,</p>
                <p>We received a request to reset your BNBFund account password. Click the button below to reset it:</p>
                <p style="text-align:center; margin:30px 0;">
                  <a href="${url}" target="_blank" 
                     style="background:#E0B90B; color:#000; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">
                    Reset Password
                  </a>
                </p>
                <p>If you didn’t request this, you can safely ignore this email.</p>
                <p style="color:#777;">This link will expire in 15 minutes.</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size:12px; color:#555;">
                &copy; ${new Date().getFullYear()} BNBFund. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

export function resetSuccessEmail(userName?: string) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #E0B90B; text-align: center;">BNBFund - Password Changed</h2>
      <p>Hello ${userName || "User"},</p>
      <p>Your password has been successfully changed. If you didn’t perform this action, please contact our support immediately.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
      <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
    </div>
  `;
}
