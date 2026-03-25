import { Resend } from 'resend'
import { Competition, CompetitionBooking, ShootEnquiry, BrandEnquiry, ContactMessage, PACKAGE_LABELS, PACKAGE_PRICES } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.FROM_EMAIL || 'noreply@laithstphotography.com'
const TO = process.env.NOTIFICATION_EMAIL || 'laith@laithstphotography.com'

const baseStyle = `
  font-family: Georgia, serif;
  max-width: 600px;
  margin: 0 auto;
  background: #0f0f0e;
  color: #f0ead8;
  padding: 40px;
`
const goldStyle = 'color: #c9a96e;'
const mutedStyle = 'color: #8a8a7a; font-size: 14px;'
const dividerStyle = 'border: none; border-top: 1px solid rgba(201,169,110,0.2); margin: 24px 0;'

// ─── COMPETITION BOOKING ────────────────────────────────────────
export async function sendBookingEmails(booking: CompetitionBooking, competition: Competition) {
  const pkg = PACKAGE_LABELS[booking.package]
  const price = PACKAGE_PRICES[booking.package]

  // Notification to Laith
  await resend.emails.send({
    from: FROM,
    to: TO,
    subject: `New Booking Request — ${competition.name}`,
    html: `
      <div style="${baseStyle}">
        <p style="${goldStyle}; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">New Booking Request</p>
        <h1 style="font-size: 28px; font-weight: 400; margin: 8px 0 24px;">${competition.name}</h1>
        <hr style="${dividerStyle}" />
        <table style="width: 100%; font-size: 14px; color: #8a8a7a;">
          <tr><td style="padding: 6px 0;">Client</td><td style="color: #f0ead8;">${booking.first_name} ${booking.last_name}</td></tr>
          <tr><td style="padding: 6px 0;">Email</td><td style="color: ${goldStyle.replace('color: ','')}"><a href="mailto:${booking.email}" style="color: #c9a96e;">${booking.email}</a></td></tr>
          <tr><td style="padding: 6px 0;">Horse</td><td style="color: #f0ead8;">${booking.horse_name}</td></tr>
          <tr><td style="padding: 6px 0;">Class/Round</td><td style="color: #f0ead8;">${booking.class_round || '—'}</td></tr>
          <tr><td style="padding: 6px 0;">Package</td><td style="color: #f0ead8;">${pkg}</td></tr>
          <tr><td style="padding: 6px 0;">Price</td><td style="color: #c9a96e; font-size: 18px;">AED ${price}</td></tr>
          <tr><td style="padding: 6px 0;">Event Date</td><td style="color: #f0ead8;">${competition.event_date}</td></tr>
          <tr><td style="padding: 6px 0;">Location</td><td style="color: #f0ead8;">${competition.location}, ${competition.country}</td></tr>
        </table>
        <hr style="${dividerStyle}" />
        <p style="${mutedStyle}">Manage this booking in your <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/bookings" style="color: #c9a96e;">admin panel</a>.</p>
      </div>
    `,
  })

  // Confirmation to client
  await resend.emails.send({
    from: FROM,
    to: booking.email,
    subject: `Booking Request Received — ${competition.name}`,
    html: `
      <div style="${baseStyle}">
        <p style="${goldStyle}; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">LaithST Photography</p>
        <h1 style="font-size: 28px; font-weight: 400; margin: 8px 0 24px;">Your booking request has been received.</h1>
        <hr style="${dividerStyle}" />
        <p style="font-size: 15px; line-height: 1.8; color: #8a8a7a;">Hi ${booking.first_name}, thank you for your booking request. Laith will review it and get back to you within 24 hours with a confirmation and payment link.</p>
        <hr style="${dividerStyle}" />
        <table style="width: 100%; font-size: 14px; color: #8a8a7a;">
          <tr><td style="padding: 6px 0;">Event</td><td style="color: #f0ead8;">${competition.name}</td></tr>
          <tr><td style="padding: 6px 0;">Date</td><td style="color: #f0ead8;">${competition.event_date}</td></tr>
          <tr><td style="padding: 6px 0;">Location</td><td style="color: #f0ead8;">${competition.location}, ${competition.country}</td></tr>
          <tr><td style="padding: 6px 0;">Horse</td><td style="color: #f0ead8;">${booking.horse_name}</td></tr>
          <tr><td style="padding: 6px 0;">Package</td><td style="color: #f0ead8;">${pkg}</td></tr>
          <tr><td style="padding: 6px 0;">Price</td><td style="color: #c9a96e; font-size: 18px;">AED ${price}</td></tr>
        </table>
        <hr style="${dividerStyle}" />
        <p style="${mutedStyle}">Questions? Reply to this email or WhatsApp +971 50 000 0000.</p>
      </div>
    `,
  })
}

// ─── SHOOT ENQUIRY ──────────────────────────────────────────────
export async function sendShootEmails(enquiry: ShootEnquiry) {
  await resend.emails.send({
    from: FROM,
    to: TO,
    subject: `New Private Shoot Enquiry — ${enquiry.first_name} ${enquiry.last_name}`,
    html: `
      <div style="${baseStyle}">
        <p style="${goldStyle}; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">Private Shoot Enquiry</p>
        <h1 style="font-size: 28px; font-weight: 400; margin: 8px 0 24px;">${enquiry.first_name} ${enquiry.last_name}</h1>
        <hr style="${dividerStyle}" />
        <table style="width: 100%; font-size: 14px; color: #8a8a7a;">
          <tr><td style="padding: 6px 0;">Email</td><td><a href="mailto:${enquiry.email}" style="color: #c9a96e;">${enquiry.email}</a></td></tr>
          <tr><td style="padding: 6px 0;">Looking for</td><td style="color: #f0ead8;">${enquiry.shoot_type}</td></tr>
          <tr><td style="padding: 6px 0;">Preferred date</td><td style="color: #f0ead8;">${enquiry.preferred_date || '—'}</td></tr>
          <tr><td style="padding: 6px 0;">Location</td><td style="color: #f0ead8;">${enquiry.location || '—'}</td></tr>
        </table>
        ${enquiry.vision ? `<hr style="${dividerStyle}" /><p style="font-size: 14px; color: #8a8a7a; font-style: italic;">"${enquiry.vision}"</p>` : ''}
        <hr style="${dividerStyle}" />
        <p style="${mutedStyle}">Manage in your <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/enquiries" style="color: #c9a96e;">admin panel</a>.</p>
      </div>
    `,
  })

  await resend.emails.send({
    from: FROM,
    to: enquiry.email,
    subject: 'Shoot Enquiry Received — LaithST Photography',
    html: `
      <div style="${baseStyle}">
        <p style="${goldStyle}; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">LaithST Photography</p>
        <h1 style="font-size: 28px; font-weight: 400; margin: 8px 0 24px;">Your enquiry has been received.</h1>
        <p style="font-size: 15px; line-height: 1.8; color: #8a8a7a;">Hi ${enquiry.first_name}, thank you for reaching out. Laith will review your vision and come back to you within 48 hours with ideas, availability and a custom quote.</p>
        <hr style="${dividerStyle}" />
        <p style="${mutedStyle}">Questions? Reply to this email or WhatsApp +971 50 000 0000.</p>
      </div>
    `,
  })
}

// ─── BRAND ENQUIRY ──────────────────────────────────────────────
export async function sendBrandEmails(enquiry: BrandEnquiry) {
  await resend.emails.send({
    from: FROM,
    to: TO,
    subject: `New Brand Enquiry — ${enquiry.brand_name}`,
    html: `
      <div style="${baseStyle}">
        <p style="${goldStyle}; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">Brand Enquiry</p>
        <h1 style="font-size: 28px; font-weight: 400; margin: 8px 0 24px;">${enquiry.brand_name}</h1>
        <hr style="${dividerStyle}" />
        <table style="width: 100%; font-size: 14px; color: #8a8a7a;">
          <tr><td style="padding: 6px 0;">Contact</td><td style="color: #f0ead8;">${enquiry.first_name} ${enquiry.last_name}</td></tr>
          <tr><td style="padding: 6px 0;">Email</td><td><a href="mailto:${enquiry.email}" style="color: #c9a96e;">${enquiry.email}</a></td></tr>
          <tr><td style="padding: 6px 0;">Instagram</td><td style="color: #f0ead8;">${enquiry.instagram_handle || '—'}</td></tr>
          <tr><td style="padding: 6px 0;">Service</td><td style="color: #f0ead8;">${enquiry.service_interest}</td></tr>
        </table>
        ${enquiry.message ? `<hr style="${dividerStyle}" /><p style="font-size: 14px; color: #8a8a7a; font-style: italic;">"${enquiry.message}"</p>` : ''}
        <hr style="${dividerStyle}" />
        <p style="${mutedStyle}">Manage in your <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/enquiries" style="color: #c9a96e;">admin panel</a>.</p>
      </div>
    `,
  })

  await resend.emails.send({
    from: FROM,
    to: enquiry.email,
    subject: 'Brand Inquiry Received — LaithST Photography',
    html: `
      <div style="${baseStyle}">
        <p style="${goldStyle}; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">LaithST Photography</p>
        <h1 style="font-size: 28px; font-weight: 400; margin: 8px 0 24px;">Your inquiry has been received.</h1>
        <p style="font-size: 15px; line-height: 1.8; color: #8a8a7a;">Hi ${enquiry.first_name}, thank you for reaching out about ${enquiry.brand_name}. Laith will review your inquiry and be in touch within 48 hours.</p>
        <hr style="${dividerStyle}" />
        <p style="${mutedStyle}">Questions? Reply to this email.</p>
      </div>
    `,
  })
}

// ─── CONTACT MESSAGE ────────────────────────────────────────────
export async function sendContactEmails(message: ContactMessage) {
  await resend.emails.send({
    from: FROM,
    to: TO,
    subject: `New Message — ${message.subject}`,
    html: `
      <div style="${baseStyle}">
        <p style="${goldStyle}; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">New Contact Message</p>
        <h1 style="font-size: 28px; font-weight: 400; margin: 8px 0 24px;">${message.subject}</h1>
        <hr style="${dividerStyle}" />
        <table style="width: 100%; font-size: 14px; color: #8a8a7a;">
          <tr><td style="padding: 6px 0;">From</td><td style="color: #f0ead8;">${message.first_name} ${message.last_name}</td></tr>
          <tr><td style="padding: 6px 0;">Email</td><td><a href="mailto:${message.email}" style="color: #c9a96e;">${message.email}</a></td></tr>
          <tr><td style="padding: 6px 0;">Source</td><td style="color: #f0ead8;">${message.source || '—'}</td></tr>
        </table>
        <hr style="${dividerStyle}" />
        <p style="font-size: 15px; line-height: 1.8; color: #8a8a7a; font-style: italic;">"${message.message}"</p>
        <hr style="${dividerStyle}" />
        <p style="${mutedStyle}">Manage in your <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/enquiries" style="color: #c9a96e;">admin panel</a>.</p>
      </div>
    `,
  })

  await resend.emails.send({
    from: FROM,
    to: message.email,
    subject: 'Message Received — LaithST Photography',
    html: `
      <div style="${baseStyle}">
        <p style="${goldStyle}; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">LaithST Photography</p>
        <h1 style="font-size: 28px; font-weight: 400; margin: 8px 0 24px;">Message received.</h1>
        <p style="font-size: 15px; line-height: 1.8; color: #8a8a7a;">Hi ${message.first_name}, thank you for reaching out. Laith will read your message personally and get back to you within 48 hours.</p>
        <hr style="${dividerStyle}" />
        <p style="${mutedStyle}">Questions? Reply to this email or Instagram @laithstphotography.</p>
      </div>
    `,
  })
}
