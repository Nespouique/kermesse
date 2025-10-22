#!/usr/bin/env node

/**
 * Script de test pour vérifier la configuration des emails
 * Usage: node scripts/test-email.js
 */

import 'dotenv/config'

// Vérifier les variables d'environnement
console.log('🔍 Vérification de la configuration...\n')

const config = {
  gmailUser: process.env.NUXT_GMAIL_USER,
  gmailAppPassword: process.env.NUXT_GMAIL_APP_PASSWORD,
  notificationEmail: process.env.NUXT_NOTIFICATION_EMAIL,
}

let hasErrors = false

// Vérifier GMAIL_USER
if (!config.gmailUser) {
  console.error("❌ NUXT_GMAIL_USER n'est pas défini")
  hasErrors = true
} else if (!config.gmailUser.includes('@gmail.com')) {
  console.warn('⚠️  NUXT_GMAIL_USER ne semble pas être une adresse Gmail')
} else {
  console.log('✅ NUXT_GMAIL_USER:', config.gmailUser)
}

// Vérifier GMAIL_APP_PASSWORD
if (!config.gmailAppPassword) {
  console.error("❌ NUXT_GMAIL_APP_PASSWORD n'est pas défini")
  hasErrors = true
} else if (config.gmailAppPassword === 'votre_mot_de_passe_application') {
  console.error("❌ NUXT_GMAIL_APP_PASSWORD n'a pas été configuré (valeur par défaut)")
  hasErrors = true
} else if (config.gmailAppPassword.length !== 16) {
  console.warn(
    "⚠️  NUXT_GMAIL_APP_PASSWORD devrait faire 16 caractères (mot de passe d'application Google)"
  )
  console.log('   Longueur actuelle:', config.gmailAppPassword.length)
} else {
  console.log('✅ NUXT_GMAIL_APP_PASSWORD: **************** (masqué)')
}

// Vérifier NOTIFICATION_EMAIL
if (!config.notificationEmail) {
  console.error("❌ NUXT_NOTIFICATION_EMAIL n'est pas défini")
  hasErrors = true
} else if (config.notificationEmail === 'votre_email_notification@example.com') {
  console.error("❌ NUXT_NOTIFICATION_EMAIL n'a pas été configuré (valeur par défaut)")
  hasErrors = true
} else if (!config.notificationEmail.includes('@')) {
  console.error('❌ NUXT_NOTIFICATION_EMAIL ne semble pas être une adresse email valide')
  hasErrors = true
} else {
  console.log('✅ NUXT_NOTIFICATION_EMAIL:', config.notificationEmail)
}

console.log('\n' + '='.repeat(60))

if (hasErrors) {
  console.log('\n❌ Configuration incomplète ou incorrecte')
  console.log("\n📖 Consultez CONFIGURATION_EMAIL.md pour plus d'informations")
  console.log('   ou éditez le fichier .env à la racine du projet\n')
  process.exit(1)
} else {
  console.log('\n✅ Configuration valide !')
  console.log('\n📧 Les notifications par email sont prêtes à être envoyées')
  console.log("   Redémarrez votre serveur Nuxt si ce n'est pas déjà fait\n")
  process.exit(0)
}
