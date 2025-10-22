# Guide de démarrage rapide - Notifications Email

## 🚀 Configuration en 5 minutes

### Étape 1 : Activer la validation en 2 étapes sur Google

1. Allez sur https://myaccount.google.com/security
2. Activez "Validation en deux étapes" si ce n'est pas déjà fait

### Étape 2 : Créer un mot de passe d'application

1. Allez sur https://myaccount.google.com/apppasswords
2. Sélectionnez "Autre (nom personnalisé)"
3. Tapez "Kermesse Bébé"
4. Cliquez sur "Générer"
5. **Copiez le code de 16 caractères** (exemple: `abcd efgh ijkl mnop`)
6. **Retirez les espaces** pour obtenir : `abcdefghijklmnop`

### Étape 3 : Configurer le fichier .env

Ouvrez le fichier `.env` à la racine du projet et modifiez ces lignes :

```bash
# Remplacez par votre adresse Gmail
NUXT_GMAIL_USER=votre_email@gmail.com

# Collez le mot de passe d'application (16 caractères SANS espaces)
NUXT_GMAIL_APP_PASSWORD=abcdefghijklmnop

# L'email qui recevra les notifications (peut être le même)
NUXT_NOTIFICATION_EMAIL=votre_email@gmail.com
```

### Étape 4 : Tester la configuration

Avant de démarrer le serveur, testez votre configuration :

```bash
npm run test:email
```

Si tout est OK, vous verrez :

```
✅ Configuration valide !
📧 Les notifications par email sont prêtes
```

### Étape 5 : Redémarrer le serveur

Si votre serveur Nuxt est déjà en cours d'exécution, **redémarrez-le** :

1. Arrêtez le serveur (Ctrl+C)
2. Relancez : `npm run dev`

### Étape 6 : Tester l'envoi

1. Allez sur votre application
2. Soumettez un nouveau pari
3. Vérifiez votre boîte email 📧

---

## ❓ Problèmes courants

### "Invalid login" ou erreur d'authentification

❌ **Problème** : Le mot de passe d'application est incorrect

✅ **Solution** :

- Vérifiez que la validation en 2 étapes est activée
- Régénérez un nouveau mot de passe d'application
- Assurez-vous de retirer tous les espaces (16 caractères continus)

### "Configuration email manquante"

❌ **Problème** : Les variables d'environnement ne sont pas chargées

✅ **Solution** :

- Vérifiez que le fichier `.env` existe à la racine
- Vérifiez que les variables commencent bien par `NUXT_`
- Redémarrez le serveur Nuxt

### Je ne reçois pas d'email

❌ **Problème** : L'email est peut-être dans les spams

✅ **Solution** :

- Vérifiez votre dossier spam/courrier indésirable
- Consultez les logs du serveur pour voir les erreurs
- Testez avec `npm run test:email` d'abord

---

## 🎯 Exemple complet

Voici un exemple de fichier `.env` correctement configuré :

```bash
# Supabase (déjà configuré)
NUXT_PUBLIC_SUPABASE_URL=https://wyxmlrjafkmkvzrtxeiy.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUz...

# Gmail (à configurer)
NUXT_GMAIL_USER=jean.dupont@gmail.com
NUXT_GMAIL_APP_PASSWORD=abcdefghijklmnop
NUXT_NOTIFICATION_EMAIL=jean.dupont@gmail.com
```

---

## 📚 Documentation complète

- **Configuration détaillée** : `CONFIGURATION_EMAIL.md`
- **Résumé technique** : `NOTIFICATION_EMAIL_RESUME.md`

---

## ✅ Checklist

- [ ] Validation en 2 étapes activée sur Google
- [ ] Mot de passe d'application créé (16 caractères)
- [ ] Fichier `.env` configuré
- [ ] Test avec `npm run test:email` réussi
- [ ] Serveur Nuxt redémarré
- [ ] Premier email de test reçu

---

**Besoin d'aide ?** Consultez `CONFIGURATION_EMAIL.md` pour plus de détails !
