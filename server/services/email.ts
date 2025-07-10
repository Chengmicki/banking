export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  async sendEmail(options: EmailOptions): Promise<void> {
    // In a real implementation, you would use a service like SendGrid, AWS SES, or Nodemailer
    // For now, we'll just log the email content
    console.log('Email sent:', {
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }

  async sendTransactionNotification(userEmail: string, transaction: any): Promise<void> {
    const html = `
      <h2>Transaction Notification</h2>
      <p>A transaction has been processed on your account:</p>
      <ul>
        <li><strong>Type:</strong> ${transaction.type}</li>
        <li><strong>Amount:</strong> $${transaction.amount}</li>
        <li><strong>Description:</strong> ${transaction.description}</li>
        <li><strong>Status:</strong> ${transaction.status}</li>
      </ul>
      <p>If you have any questions, please contact our support team.</p>
    `;

    await this.sendEmail({
      to: userEmail,
      subject: 'Transaction Notification - Everstead Bank',
      html,
    });
  }

  async sendTransferNotification(userEmail: string, transfer: any): Promise<void> {
    const html = `
      <h2>Transfer Notification</h2>
      <p>A transfer has been processed:</p>
      <ul>
        <li><strong>Amount:</strong> $${transfer.amount}</li>
        <li><strong>Status:</strong> ${transfer.status}</li>
        <li><strong>Memo:</strong> ${transfer.memo || 'None'}</li>
      </ul>
      <p>Thank you for using Everstead Bank.</p>
    `;

    await this.sendEmail({
      to: userEmail,
      subject: 'Transfer Confirmation - Everstead Bank',
      html,
    });
  }
}

export const emailService = new EmailService();
