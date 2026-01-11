/**
 * Script de migration des données Supabase vers PostgreSQL local
 *
 * Usage:
 *   1. Démarrer la base PostgreSQL locale: docker compose up db -d
 *   2. Récupérer l'URL de connexion Supabase (format: postgres://postgres:[password]@db.[project-ref].supabase.co:5432/postgres)
 *   3. Exécuter: npx tsx scripts/migrate-from-supabase.ts
 *
 * Variables d'environnement requises:
 *   - SUPABASE_DB_URL: URL de connexion à la base Supabase
 *   - LOCAL_DB_URL: URL de connexion locale (défaut: postgres://kermesse:password@localhost:5432/kermesse)
 */

import postgres from 'postgres'
import dns from 'dns'

// Forcer IPv4 pour éviter les problèmes de connexion IPv6
dns.setDefaultResultOrder('ipv4first')

let supabaseUrl = process.env.SUPABASE_DB_URL
const localUrl = process.env.LOCAL_DB_URL || 'postgres://kermesse:password@localhost:5432/kermesse'

if (!supabaseUrl) {
  console.error('❌ Variable SUPABASE_DB_URL manquante')
  console.log('')
  console.log('Pour trouver l\'URL de connexion Supabase:')
  console.log('1. Va sur https://supabase.com/dashboard')
  console.log('2. Sélectionne ton projet')
  console.log('3. Settings → Database → Connection string → URI')
  console.log('4. Remplace [YOUR-PASSWORD] par le mot de passe de la base')
  console.log('')
  console.log('Exemple:')
  console.log('  SUPABASE_DB_URL="postgres://postgres:password@db.xxxx.supabase.co:5432/postgres" npx tsx scripts/migrate-from-supabase.ts')
  process.exit(1)
}

async function migrate() {
  console.log('🚀 Démarrage de la migration Supabase → PostgreSQL local')
  console.log('')

  const source = postgres(supabaseUrl as string, { ssl: 'require' })
  const target = postgres(localUrl)

  try {
    // Test des connexions
    console.log('📡 Test de connexion à Supabase...')
    await source`SELECT 1`
    console.log('✅ Connexion Supabase OK')

    console.log('📡 Test de connexion locale...')
    await target`SELECT 1`
    console.log('✅ Connexion locale OK')
    console.log('')

    // 1. Migrer participants
    console.log('👥 Migration des participants...')
    const participants = await source`SELECT * FROM participants`
    for (const p of participants) {
      await target`
        INSERT INTO participants (id, email, first_name, last_name, created_at)
        VALUES (${p.id}, ${p.email}, ${p.first_name}, ${p.last_name}, ${p.created_at})
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name
      `
    }
    console.log(`   ✅ ${participants.length} participants migrés`)

    // 2. Migrer bets
    console.log('🎲 Migration des paris...')
    const bets = await source`SELECT * FROM bets`
    for (const b of bets) {
      await target`
        INSERT INTO bets (id, participant_id, is_male, estimated_date, weight_kg,
          baby_first_name, created_at, score, rang_date, rang_poids, rang_sexe)
        VALUES (${b.id}, ${b.participant_id}, ${b.is_male}, ${b.estimated_date},
          ${b.weight_kg}, ${b.baby_first_name}, ${b.created_at}, ${b.score},
          ${b.rang_date}, ${b.rang_poids}, ${b.rang_sexe})
        ON CONFLICT (id) DO UPDATE SET
          is_male = EXCLUDED.is_male,
          estimated_date = EXCLUDED.estimated_date,
          weight_kg = EXCLUDED.weight_kg,
          baby_first_name = EXCLUDED.baby_first_name,
          score = EXCLUDED.score,
          rang_date = EXCLUDED.rang_date,
          rang_poids = EXCLUDED.rang_poids,
          rang_sexe = EXCLUDED.rang_sexe
      `
    }
    console.log(`   ✅ ${bets.length} paris migrés`)

    // 3. Migrer avatars
    console.log('🐷 Migration des avatars...')
    const avatars = await source`SELECT * FROM avatars`
    for (const a of avatars) {
      await target`
        INSERT INTO avatars (id, bet_id, top_layer, middle_layer, bottom_layer, created_at)
        VALUES (${a.id}, ${a.bet_id}, ${a.top_layer}, ${a.middle_layer}, ${a.bottom_layer}, ${a.created_at})
        ON CONFLICT (id) DO UPDATE SET
          top_layer = EXCLUDED.top_layer,
          middle_layer = EXCLUDED.middle_layer,
          bottom_layer = EXCLUDED.bottom_layer
      `
    }
    console.log(`   ✅ ${avatars.length} avatars migrés`)

    // 4. Migrer app_config
    console.log('⚙️  Migration de la configuration...')
    const configs = await source`SELECT * FROM app_config WHERE id = 1`
    if (configs.length > 0) {
      const config = configs[0]
      await target`
        UPDATE app_config SET
          is_born = ${config.is_born},
          baby_name = ${config.baby_name},
          birth_date = ${config.birth_date},
          weight_kg = ${config.weight_kg},
          height_cm = ${config.height_cm},
          sex = ${config.sex}
        WHERE id = 1
      `
      console.log('   ✅ Configuration migrée')
    } else {
      console.log('   ⚠️  Aucune configuration trouvée')
    }

    console.log('')
    console.log('🎉 Migration terminée avec succès!')
    console.log('')
    console.log('Résumé:')
    console.log(`   - ${participants.length} participants`)
    console.log(`   - ${bets.length} paris`)
    console.log(`   - ${avatars.length} avatars`)
    console.log('   - 1 configuration')

  } catch (error) {
    console.error('')
    console.error('❌ Erreur lors de la migration:', error)
    process.exit(1)
  } finally {
    await source.end()
    await target.end()
  }
}

migrate()
