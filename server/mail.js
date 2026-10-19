// Sends email through the Resend HTTP API (works on hosts that block SMTP, like Railway).
// Without RESEND_API_KEY nothing is sent: the message is printed to the server log instead.
export const mailConfigured = () => !!process.env.RESEND_API_KEY

export async function sendMail({ to, subject, text, html }) {
  const from = process.env.MAIL_FROM || 'SoloTour CRM <onboarding@resend.dev>'
  if (!process.env.RESEND_API_KEY) {
    console.log(`[mail not configured] To: ${to}\nSubject: ${subject}\n${text}`)
    return false
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, text, html }),
  })
  if (!res.ok) {
    console.error('[mail] send failed', res.status, (await res.text()).slice(0, 300))
    return false
  }
  return true
}
