import nodemailer from 'nodemailer'
import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { participantName, participantEmail, betDetails } = body

  const config = useRuntimeConfig()
  const gmailUser = config.gmailUser
  const gmailAppPassword = config.gmailAppPassword
  const notificationEmail = config.notificationEmail

  if (!gmailUser || !gmailAppPassword || !notificationEmail) {
    throw createError({
      statusCode: 500,
      message: 'Configuration email manquante',
    })
  }

  try {
    // Créer le transporteur nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    })

    // Formater les détails du pari
    const { isMale, estimatedDate, weight, firstName } = betDetails
    const sexe = isMale ? 'Garçon' : 'Fille'
    const date = new Date(estimatedDate)
    const dateFormatted = date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })

    // Avatar pour l'email (emoji simple car les images locales ne fonctionnent pas dans les emails)
    // Note: Pour afficher l'avatar réel, il faudrait héberger les images sur un serveur public
    // ou convertir les SVG en base64 inline
    const avatarHTML = `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 80px; line-height: 1;">🐷</div>
      </div>
    `

    // Contenu de l'email
    const mailOptions = {
      from: `"Kermesse du Bébé" <${gmailUser}>`,
      to: notificationEmail,
      subject: `🎲 Nouveau pari de ${participantName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #4F46E5; border-radius: 10px;">
          <h1 style="color: #4F46E5; text-align: center;">🎉 Nouveau pari enregistré !</h1>
          
          ${avatarHTML}
          
          <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1F2937; margin-top: 0;">👤 Participant</h2>
            <p style="font-size: 16px; color: #374151;">
              <strong>${participantName}</strong><br>
              <span style="color: #6B7280;">${participantEmail}</span>
            </p>
          </div>

          <div style="background-color: #EEF2FF; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1F2937; margin-top: 0;">🎲 Détails du pari</h2>
            <ul style="list-style: none; padding: 0; font-size: 16px; color: #374151;">
              <li style="padding: 5px 0;"><strong>Sexe:</strong> ${sexe}</li>
              <li style="padding: 5px 0;"><strong>Date estimée:</strong> ${dateFormatted}</li>
              <li style="padding: 5px 0;"><strong>Poids:</strong> ${weight.toFixed(1)} kg</li>
              ${firstName ? `<li style="padding: 5px 0;"><strong>Prénom:</strong> ${firstName}</li>` : ''}
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; font-size: 14px;">
              Ce message a été envoyé automatiquement depuis la Kermesse du Bébé
            </p>
          </div>
        </div>
      `,
      text: `
Nouveau pari enregistré !

Participant: ${participantName} (${participantEmail})

Détails du pari:
- Sexe: ${sexe}
- Date estimée: ${dateFormatted}
- Poids: ${weight.toFixed(1)} kg
${firstName ? `- Prénom: ${firstName}` : ''}

---
Ce message a été envoyé automatiquement depuis la Kermesse du Bébé
      `.trim(),
    }

    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions)

    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error)
    throw createError({
      statusCode: 500,
      message: "Erreur lors de l'envoi de la notification",
    })
  }
})
