import nodemailer from 'nodemailer'
import { defineEventHandler, readBody, createError } from 'h3'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { testMode, babyName, sex } = body

  const config = useRuntimeConfig()
  const gmailUser = config.gmailUser
  const gmailAppPassword = config.gmailAppPassword

  if (!gmailUser || !gmailAppPassword) {
    throw createError({
      statusCode: 500,
      message: 'Configuration email manquante',
    })
  }

  // Créer le client Supabase côté serveur
  const supabaseUrl = config.public.supabaseUrl as string
  const supabaseKey = config.public.supabaseAnonKey as string

  if (!supabaseUrl || !supabaseKey) {
    throw createError({
      statusCode: 500,
      message: 'Configuration Supabase manquante',
    })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Récupérer les emails des participants
    let recipientEmails: string[] = []

    if (testMode) {
      // Mode test : seulement 2 adresses
      recipientEmails = ['caro.sacre@gmail.com', 'hallais.elliot@gmail.com']
    } else {
      // Mode production : tous les emails uniques des parieurs
      const { data: bets, error: fetchError } = await supabase
        .from('bets')
        .select('email')
        .not('email', 'is', null)

      if (fetchError) throw fetchError

      // Extraire les emails uniques
      const uniqueEmails = new Set<string>()
      for (const bet of bets || []) {
        if (bet.email && typeof bet.email === 'string' && bet.email.trim()) {
          uniqueEmails.add(bet.email.trim().toLowerCase())
        }
      }
      recipientEmails = Array.from(uniqueEmails)
    }

    if (recipientEmails.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Aucun destinataire trouvé',
      })
    }

    // Créer le transporteur nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    })

    // Formater les informations
    const sexeLabel = sex === 'M' ? 'garçon' : 'fille'

    // Couleurs selon le sexe
    const primaryColor = sex === 'M' ? '#3B82F6' : '#EC4899'
    const lightColor = sex === 'M' ? '#DBEAFE' : '#FCE7F3'

    // Image du cochon selon le sexe (hébergée sur le site)
    const pigImageUrl =
      sex === 'M'
        ? 'https://kermesse.hallais.bzh/png/Gar%C3%A7on.png'
        : 'https://kermesse.hallais.bzh/png/Fille.png'

    const pigAvatarHTML = `
      <div style="text-align: center; margin: 15px 0;">
        <img src="${pigImageUrl}" alt="Cochon festif" style="width: 180px; height: auto;" />
      </div>
    `

    // Contenu de l'email
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #F9FAFB; font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, ${lightColor} 0%, white 100%); border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Header festif -->
            <div style="background: linear-gradient(135deg, ${primaryColor} 0%, ${
              sex === 'M' ? '#1D4ED8' : '#DB2777'
            } 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
                🎉 Le petit cochon est né !
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">
                La grande nouvelle tant attendue...
              </p>
            </div>

            <!-- Contenu principal -->
            <div style="padding: 30px;">
              
              ${pigAvatarHTML}

              <!-- Annonce -->
              <div style="text-align: center; margin-bottom: 30px;">
                <p style="font-size: 18px; color: #374151; line-height: 1.6; margin-bottom: 5px;">
                  Nous avons la joie de vous annoncer la naissance de
                </p>
                <h2 style="font-size: 40px; color: ${primaryColor}; margin: 5px 0 20px 0; font-weight: 700;">
                  ${babyName || 'Notre bébé'}
                </h2>
              </div>

              <!-- Invitation à voir le classement -->
              <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-radius: 15px; padding: 25px; margin: 20px 0; text-align: center;">
                <h3 style="color: #92400E; margin: 0 0 15px; font-size: 18px;">
                  🏆 Et les résultats du concours ?
                </h3>
                <p style="color: #78350F; margin: 0 0 20px; font-size: 14px; line-height: 1.6;">
                  Vous avez participé à la Kermesse du Bébé !<br>
                  Découvrez votre place au classement et les gagnants des lots.
                </p>
                <a href="https://kermesse.hallais.bzh/welcome" 
                   style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 10px rgba(217, 119, 6, 0.3);">
                  🎯 Voir le classement
                </a>
              </div>

              <!-- Message de remerciement -->
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid ${lightColor};">
                <p style="color: #6B7280; font-size: 14px; margin: 0 0 10px;">
                  Merci d'avoir participé à notre Kermesse du Bébé !
                </p>
                <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                  Caroline & Elliot
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 20px; color: #9CA3AF; font-size: 12px;">
            Ce message a été envoyé automatiquement depuis la Kermesse du Bébé
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
🎉 ${babyName || 'Bébé'} est arrivé${sex === 'F' ? 'e' : ''} ! 🎉

Nous avons la joie de vous annoncer la naissance de ${babyName || 'notre bébé'}.
C'est un${sex === 'F' ? 'e' : ''} magnifique ${sexeLabel} !

🏆 Et les résultats du concours ?

Vous avez participé à la Kermesse du Bébé !
Découvrez votre place au classement et les gagnants des lots.

👉 Voir le classement : https://kermesse.hallais.bzh/welcome

Merci d'avoir participé à notre Kermesse du Bébé !
Caroline & Elliot

---
Ce message a été envoyé automatiquement depuis la Kermesse du Bébé
    `.trim()

    // Envoyer l'email à chaque destinataire (en BCC pour la confidentialité)
    const mailOptions = {
      from: `"Kermesse du Bébé" <${gmailUser}>`,
      bcc: recipientEmails.join(', '), // BCC pour ne pas exposer les emails des autres
      subject: `Le petit cochon est arrivé ! Découvrez les résultats de la Kermesse !`,
      html: htmlContent,
      text: textContent,
    }

    const info = await transporter.sendMail(mailOptions)

    return {
      success: true,
      messageId: info.messageId,
      recipientCount: recipientEmails.length,
      testMode,
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email d'annonce:", error)
    throw createError({
      statusCode: 500,
      message: "Erreur lors de l'envoi de l'annonce de naissance",
    })
  }
})
