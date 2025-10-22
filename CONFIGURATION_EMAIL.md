# Configuration de la notification par email

Ce guide explique comment configurer l'envoi d'emails via Gmail pour être notifié lorsqu'un nouveau pari est soumis.

## Prérequis

1. Un compte Gmail
2. L'authentification à deux facteurs (2FA) activée sur votre compte Google

## Étapes de configuration

### 1. Activer la validation en deux étapes

Si ce n'est pas déjà fait :

1. Allez sur https://myaccount.google.com/security
2. Cliquez sur "Validation en deux étapes"
3. Suivez les instructions pour l'activer

### 2. Créer un mot de passe d'application

⚠️ **Important** : N'utilisez JAMAIS votre mot de passe Gmail normal dans le code !

1. Allez sur https://myaccount.google.com/apppasswords
2. Dans "Sélectionner une application", choisissez "Autre (nom personnalisé)"
3. Donnez-lui un nom comme "Kermesse Bébé"
4. Cliquez sur "Générer"
5. Google vous donnera un mot de passe de 16 caractères (format : xxxx xxxx xxxx xxxx)
6. Copiez ce mot de passe (sans les espaces)

### 3. Configurer les variables d'environnement

Modifiez le fichier `.env` à la racine du projet :

```bash
# L'adresse Gmail qui enverra les emails
NUXT_GMAIL_USER=votre_email@gmail.com

# Le mot de passe d'application (16 caractères sans espaces)
NUXT_GMAIL_APP_PASSWORD=abcdabcdabcdabcd

# L'adresse qui recevra les notifications
NUXT_NOTIFICATION_EMAIL=votre_email@example.com
```

**Note** : `NUXT_GMAIL_USER` et `NUXT_NOTIFICATION_EMAIL` peuvent être la même adresse.

## Test de la configuration

1. Redémarrez votre serveur de développement Nuxt
2. Soumettez un nouveau pari via l'interface
3. Vous devriez recevoir un email de notification

## Dépannage

### Erreur "Invalid login"

- Vérifiez que la validation en deux étapes est bien activée
- Régénérez un nouveau mot de passe d'application
- Assurez-vous qu'il n'y a pas d'espaces dans le mot de passe d'application

### Erreur "Configuration email manquante"

- Vérifiez que toutes les variables d'environnement sont bien définies dans `.env`
- Redémarrez votre serveur de développement

### Pas d'email reçu

- Vérifiez vos spams
- Consultez les logs du serveur pour voir s'il y a des erreurs

## Déploiement en production

Pour déployer sur Vercel ou une autre plateforme :

1. N'incluez JAMAIS le fichier `.env` dans Git
2. Configurez les variables d'environnement directement dans l'interface de votre plateforme :
   - `NUXT_GMAIL_USER`
   - `NUXT_GMAIL_APP_PASSWORD`
   - `NUXT_NOTIFICATION_EMAIL`

## Sécurité

✅ **Bonnes pratiques appliquées** :

- Les credentials Gmail sont côté serveur uniquement (jamais exposés au client)
- Utilisation d'un mot de passe d'application (pas le mot de passe principal)
- Variables d'environnement pour stocker les secrets
- `.env` dans `.gitignore`

⚠️ **À NE JAMAIS FAIRE** :

- Commiter le fichier `.env` dans Git
- Utiliser votre mot de passe Gmail principal
- Exposer les credentials côté client
