import * as nodemailer from 'nodemailer';
export interface IMailContent {
    to: string;
    subject: string;
    html: string;
}

export class EmailUtils {
    private static readonly adminEmail: string = 'task_manager@163.com';
    // auth code
    private static readonly adminEmailPassword: string = 'TaskAu4';
    public static async sendEmail(content: IMailContent): Promise<void> {
        const transporter = nodemailer.createTransport(
            {
                host: 'smtp.163.com',
                secure: true,
                port: 465,
                auth: { user: this.adminEmail, pass: this.adminEmailPassword },
            });
        (content as any).from = this.adminEmail;
        await transporter.sendMail(content);
    }
}
