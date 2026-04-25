const db = require('../models/db');
const nodemailer = require('nodemailer');

// We will initialize the transporter once we generate the test account
let transporter;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('Using real SMTP provider for emails:', process.env.SMTP_USER);
    transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
} else {
    console.log('No SMTP credentials found. Falling back to Ethereal Email (Testing Mode).');
    nodemailer.createTestAccount((err, account) => {
        if (err) {
            console.error('Failed to create a testing account. ' + err.message);
            return process.exit(1);
        }
        console.log('Ethereal Email account created:', account.user);
        transporter = nodemailer.createTransport({
            host: account.smtp.host,
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: {
                user: account.user,
                pass: account.pass
            }
        });
    });
}

const sendAlertEmail = async (alert, userEmail) => {
    if (!transporter) return;
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"CloudStock Alerts" <alerts@cloudstock.local>',
            to: userEmail || 'admin@cloudstock.local',
            subject: 'Low Stock Alert Notification',
            text: `Alert ID: ${alert.id}\nProduct ID: ${alert.product_id}\nMessage: ${alert.message}\nStatus: ${alert.status}`,
        });
        console.log('--- Email Sent successfully ---');
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        console.log('-------------------------------');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const getAlerts = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM alerts ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const resolveAlert = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "UPDATE alerts SET status = 'resolved' WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Listen for new alerts via PostgreSQL NOTIFY
const listenForAlerts = async () => {
    const { Pool } = require('pg');
    const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    const client = await pool.connect();
    client.query('LISTEN new_alert');
    client.on('notification', async (msg) => {
        console.log('Received notification of new alert:', msg.payload);
        try {
            // Atomic update to prevent duplicate emails
            const res = await db.query(
                "UPDATE alerts SET email_sent = true WHERE status = 'active' AND email_sent = false RETURNING *"
            );
            
            for (const alert of res.rows) {
                // Fetch the user's actual email
                let userEmail = 'admin@cloudstock.local';
                if (alert.user_id) {
                    const userRes = await db.query('SELECT email FROM users WHERE id = $1', [alert.user_id]);
                    if (userRes.rows.length > 0) {
                        userEmail = userRes.rows[0].email;
                    }
                }
                await sendAlertEmail(alert, userEmail);
            }
        } catch (err) {
            console.error('Error handling notification:', err);
        }
    });
    console.log('Listening for new_alert notifications...');
};

module.exports = {
  getAlerts,
  resolveAlert,
  listenForAlerts,
  sendAlertEmail
};
