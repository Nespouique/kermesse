<template>
  <UContainer>
    <div class="py-10">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold mb-8 text-center">🔧 Administration</h1>

        <div v-if="!isAuthenticated">
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold">🔒 Accès sécurisé</h2>
            </template>
            <form class="space-y-4" @submit.prevent="login">
              <div>
                <label class="block text-sm font-medium mb-2">Mot de passe</label>
                <UInput
                  v-model="password"
                  type="password"
                  placeholder="Mot de passe administrateur"
                />
              </div>
              <div v-if="loginError" class="text-red-500 text-sm">{{ loginError }}</div>
              <UButton type="submit" color="primary" block :loading="loggingIn">
                Se connecter
              </UButton>
            </form>
          </UCard>
        </div>

        <div v-else class="space-y-8">
          <!-- Section Configuration Bébé -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold">👶 Configuration de la naissance</h2>
                <UBadge :color="babyConfig.is_born ? 'green' : 'orange'">
                  {{ babyConfig.is_born ? 'Né(e)' : 'En attente' }}
                </UBadge>
              </div>
            </template>

            <div class="space-y-6">
              <div
                class="flex items-center justify-between p-4 bg-[var(--ui-bg-elevated)] rounded-lg border border-[var(--ui-border)]"
              >
                <div>
                  <h3 class="font-medium">Le bébé est-il né ?</h3>
                  <p class="text-sm text-[var(--ui-text-dimmed)]">
                    Active la redirection vers la page de bienvenue.
                  </p>
                </div>
                <USwitch v-model="babyConfig.is_born" size="lg" color="primary" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Prénom</label>
                  <UInput v-model="babyConfig.baby_name" placeholder="Prénom du bébé" />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Sexe</label>
                  <USelect v-model="babyConfig.sex" :items="sexOptions" class="w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Date de naissance</label>
                  <UInput v-model="babyConfig.birth_date" type="date" />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Heure de naissance</label>
                  <UInput v-model="babyConfig.birth_time" type="time" />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Poids (kg)</label>
                  <UInput v-model.number="babyConfig.weight_kg" type="number" step="0.01" />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Taille (cm)</label>
                  <UInput v-model.number="babyConfig.height_cm" type="number" step="0.1" />
                </div>
              </div>

              <div class="pt-4 border-t border-[var(--ui-border)] space-y-3">
                <UButton color="primary" block :loading="saving" @click="saveConfig">
                  Enregistrer les informations
                </UButton>
                <UButton
                  v-if="
                    babyConfig.is_born &&
                    babyConfig.birth_date &&
                    babyConfig.weight_kg &&
                    babyConfig.sex
                  "
                  color="neutral"
                  variant="outline"
                  block
                  :loading="recalculating"
                  @click="recalculateScores"
                >
                  <template #leading>
                    <UIcon name="i-lucide-calculator" />
                  </template>
                  Recalculer les scores
                </UButton>
              </div>
            </div>
          </UCard>

          <!-- Section Annonce de Naissance -->
          <UCard v-if="babyConfig.is_born">
            <template #header>
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center"
                >
                  <UIcon name="i-lucide-baby" class="text-white text-lg" />
                </div>
                <div>
                  <h2 class="text-xl font-semibold">🎉 Annonce de naissance</h2>
                  <p class="text-sm text-[var(--ui-text-dimmed)]">
                    Informez les participants de l'arrivée du bébé
                  </p>
                </div>
              </div>
            </template>

            <div class="space-y-4">
              <UAlert
                color="primary"
                variant="soft"
                title="Information"
                description="Cette fonctionnalité envoie un email à tous les participants pour leur annoncer la naissance et les inviter à consulter le classement."
                icon="i-lucide-info"
              />

              <!-- Aperçu des infos qui seront envoyées -->
              <div
                class="bg-[var(--ui-bg-elevated)] rounded-lg p-4 border border-[var(--ui-border)]"
              >
                <h4 class="font-medium mb-3">📋 Informations incluses dans l'email :</h4>
                <ul class="text-sm text-[var(--ui-text-dimmed)] space-y-1">
                  <li>
                    <strong>Prénom :</strong>
                    {{ babyConfig.baby_name || 'Non renseigné' }}
                  </li>
                  <li>
                    <strong>Sexe :</strong>
                    {{ babyConfig.sex === 'M' ? 'Garçon 👦' : 'Fille 👧' }}
                  </li>
                  <li>
                    <strong>Date :</strong>
                    {{ formatBirthDate }}
                  </li>
                  <li>
                    <strong>Heure :</strong>
                    {{ babyConfig.birth_time || 'Non renseignée' }}
                  </li>
                  <li>
                    <strong>Poids :</strong>
                    {{
                      babyConfig.weight_kg
                        ? babyConfig.weight_kg.toFixed(2) + ' kg'
                        : 'Non renseigné'
                    }}
                  </li>
                </ul>
              </div>

              <div class="pt-4 border-t border-[var(--ui-border)] space-y-3">
                <!-- Bouton Test -->
                <UButton
                  color="neutral"
                  variant="outline"
                  block
                  :loading="sendingBirthTest"
                  @click="sendBirthAnnouncement(true)"
                >
                  <template #leading>
                    <UIcon name="i-lucide-flask-conical" />
                  </template>
                  Tester le mail de naissance
                </UButton>

                <!-- Bouton Production -->
                <UButton color="primary" block :loading="sendingBirthAll" @click="confirmSendToAll">
                  <template #leading>
                    <UIcon name="i-lucide-send" />
                  </template>
                  Prévenir les participants
                </UButton>
              </div>

              <!-- Résultat -->
              <div v-if="birthAnnouncementResult" class="pt-4">
                <UAlert
                  :color="birthAnnouncementResult.success ? 'success' : 'error'"
                  :title="birthAnnouncementResult.success ? 'Emails envoyés !' : 'Erreur'"
                  :description="birthAnnouncementResult.message"
                  :icon="
                    birthAnnouncementResult.success
                      ? 'i-lucide-check-circle'
                      : 'i-lucide-alert-circle'
                  "
                />
              </div>
            </div>
          </UCard>

          <!-- Modal de confirmation -->
          <UModal v-model:open="showConfirmModal">
            <template #content>
              <div class="p-6 space-y-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <UIcon name="i-lucide-alert-triangle" class="text-amber-600 text-xl" />
                  </div>
                  <h3 class="text-lg font-semibold">Confirmer l'envoi</h3>
                </div>
                <p class="text-[var(--ui-text-dimmed)]">
                  Vous êtes sur le point d'envoyer l'annonce de naissance à
                  <strong>tous les participants</strong>
                  de la Kermesse du Bébé.
                </p>
                <p class="text-sm text-[var(--ui-text-dimmed)]">
                  Cette action ne peut pas être annulée.
                </p>
                <div class="flex gap-3 pt-4">
                  <UButton
                    color="neutral"
                    variant="outline"
                    block
                    @click="showConfirmModal = false"
                  >
                    Annuler
                  </UButton>
                  <UButton
                    color="primary"
                    block
                    :loading="sendingBirthAll"
                    @click="sendBirthAnnouncement(false)"
                  >
                    Confirmer l'envoi
                  </UButton>
                </div>
              </div>
            </template>
          </UModal>

          <!-- Section Test Email (Existing) -->
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold">📧 Test de notification email</h2>
            </template>

            <div class="space-y-4">
              <p class="text-sm text-[var(--ui-text-dimmed)]">
                Envoyez un email de test sans créer de pari dans la base de données.
              </p>

              <UAlert
                color="primary"
                variant="soft"
                title="Note"
                description="Le test utilisera automatiquement 'Garçon' pour le sexe du bébé."
                icon="i-lucide-info"
              />

              <div class="grid gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Nom du participant</label>
                  <UInput v-model="testData.participantName" placeholder="Jean Dupont" />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2">Email du participant</label>
                  <UInput
                    v-model="testData.participantEmail"
                    type="email"
                    placeholder="jean.dupont@example.com"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2">Date de naissance estimée</label>
                  <UInput v-model="testData.estimatedDate" type="date" />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2">Poids estimé (kg)</label>
                  <UInput
                    v-model.number="testData.weight"
                    type="number"
                    step="0.1"
                    min="2.0"
                    max="5.0"
                    placeholder="3.5"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2">Prénom du bébé (optionnel)</label>
                  <UInput v-model="testData.firstName" placeholder="Lucas" />
                </div>
              </div>

              <div class="pt-4 border-t border-[var(--ui-border)]">
                <UButton
                  color="neutral"
                  variant="outline"
                  size="lg"
                  block
                  :loading="sending"
                  :disabled="!isFormValid"
                  @click="sendTestEmail"
                >
                  <template #leading>
                    <UIcon name="i-lucide-mail" />
                  </template>
                  Envoyer l'email de test
                </UButton>
              </div>

              <!-- Message de résultat -->
              <div v-if="result" class="pt-4">
                <UAlert
                  :color="result.success ? 'success' : 'error'"
                  :title="result.success ? 'Email envoyé !' : 'Erreur'"
                  :description="result.message"
                  :icon="result.success ? 'i-lucide-check-circle' : 'i-lucide-alert-circle'"
                />
              </div>
            </div>
          </UCard>

          <!-- Bouton retour -->
          <div class="mt-8 text-center">
            <UButton variant="link" color="neutral" to="/">
              <template #leading>
                <UIcon name="i-lucide-arrow-left" />
              </template>
              Retour à l'accueil
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useNuxtApp, useState } from '#app'
  import { useToast } from '#imports'

  const toast = useToast()
  const { $supabase } = useNuxtApp()

  // Auth
  const isAuthenticated = useState('isAuthenticated', () => false)
  const password = ref('')
  const loginError = ref('')
  const loggingIn = ref(false)

  // Birth Announcement
  const sendingBirthTest = ref(false)
  const sendingBirthAll = ref(false)
  const showConfirmModal = ref(false)
  const birthAnnouncementResult = ref<{ success: boolean; message: string } | null>(null)

  // Computed pour formater la date de naissance
  const formatBirthDate = computed(() => {
    if (!babyConfig.value.birth_date) return 'Non renseignée'
    return new Date(babyConfig.value.birth_date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  })

  function confirmSendToAll() {
    showConfirmModal.value = true
  }

  async function sendBirthAnnouncement(testMode: boolean) {
    if (testMode) {
      sendingBirthTest.value = true
    } else {
      sendingBirthAll.value = true
    }
    birthAnnouncementResult.value = null

    try {
      const response = await $fetch<{
        success: boolean
        messageId: string
        recipientCount: number
        testMode: boolean
      }>('/api/send-birth-announcement', {
        method: 'POST',
        body: {
          testMode,
          babyName: babyConfig.value.baby_name,
          birthDate: babyConfig.value.birth_date,
          birthTime: babyConfig.value.birth_time,
          weightKg: babyConfig.value.weight_kg,
          sex: babyConfig.value.sex,
        },
      })

      const modeLabel = testMode ? 'test' : 'tous les participants'
      birthAnnouncementResult.value = {
        success: true,
        message: `Email envoyé avec succès à ${response.recipientCount} destinataire${response.recipientCount > 1 ? 's' : ''} (${modeLabel})`,
      }

      toast.add({
        title: 'Email envoyé !',
        description: `${response.recipientCount} destinataire${response.recipientCount > 1 ? 's' : ''}`,
        color: 'success',
      })

      showConfirmModal.value = false
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'annonce:", error)
      birthAnnouncementResult.value = {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      }

      toast.add({
        title: 'Erreur',
        description: "Impossible d'envoyer l'annonce",
        color: 'error',
      })
    } finally {
      sendingBirthTest.value = false
      sendingBirthAll.value = false
    }
  }

  async function login() {
    loggingIn.value = true
    loginError.value = ''
    try {
      await $fetch('/api/auth', { method: 'POST', body: { password: password.value } })
      isAuthenticated.value = true
      fetchConfig()
    } catch {
      loginError.value = 'Mot de passe incorrect'
    } finally {
      loggingIn.value = false
    }
  }

  // Baby Config
  const sexOptions = [
    { label: 'Garçon', value: 'M' },
    { label: 'Fille', value: 'F' },
  ]

  const babyConfig = ref({
    is_born: false,
    baby_name: '',
    birth_date: '',
    birth_time: '',
    weight_kg: 3.5,
    height_cm: 50.0,
    sex: 'M',
  })
  const saving = ref(false)

  async function fetchConfig() {
    if (!$supabase) return
    try {
      const { data, error } = await $supabase.from('app_config').select('*').single()
      if (error && error.code !== 'PGRST116') throw error // PGRST116 is "The result contains 0 rows"

      if (data) {
        const dateObj = data.birth_date ? new Date(data.birth_date) : new Date()
        babyConfig.value = {
          is_born: data.is_born,
          baby_name: data.baby_name || '',
          birth_date: data.birth_date ? dateObj.toISOString().split('T')[0] || '' : '',
          birth_time: data.birth_date
            ? dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            : '',
          weight_kg: data.weight_kg || 3.5,
          height_cm: data.height_cm || 50.0,
          sex: data.sex || 'M',
        }
      }
    } catch (e) {
      console.error('Error fetching config:', e)
      toast.add({
        title: 'Erreur',
        description: 'Impossible de charger la configuration',
        color: 'error',
      })
    }
  }

  // Fonction de calcul des scores selon l'algorithme
  interface BetForScoring {
    id: string
    estimated_date: string
    weight_kg: number
    is_male: boolean
    created_at: string
  }

  async function calculateAndSaveScores(
    birthDate: string,
    actualWeightKg: number,
    actualSex: string
  ) {
    if (!$supabase) return

    // Récupérer tous les paris
    const { data: bets, error: fetchError } = await $supabase
      .from('bets')
      .select('id, estimated_date, weight_kg, is_male, created_at')
      .order('created_at', { ascending: true })

    if (fetchError) throw fetchError
    if (!bets || bets.length === 0) return

    const actualDate = new Date(birthDate)
    const actualWeightGrams = actualWeightKg * 1000 // Convertir en grammes

    // Calculer les écarts bruts pour chaque participant
    const betsWithDiffs = (bets as BetForScoring[]).map((bet) => {
      const betDate = new Date(bet.estimated_date)
      // Écart de date en jours (ignorer l'heure)
      const ecartDate = Math.abs(
        Math.floor((actualDate.getTime() - betDate.getTime()) / (1000 * 60 * 60 * 24))
      )

      // Écart de poids arrondi aux 100g (car les paris se font par tranches de 100g)
      const betWeightGrams = Number(bet.weight_kg) * 1000
      const ecartPoidsExact = Math.abs(actualWeightGrams - betWeightGrams)
      const ecartPoids = Math.round(ecartPoidsExact / 100) // Nombre de tranches de 100g d'écart

      // Vérification du sexe
      const betSex = bet.is_male ? 'M' : 'F'
      const sexeCorrect = betSex === actualSex

      return {
        id: bet.id,
        ecartDate,
        ecartPoids,
        sexeCorrect,
        createdAt: new Date(bet.created_at).getTime(),
      }
    })

    // Classement sur la date (rang avec égalités)
    const sortedByDate = [...betsWithDiffs].sort((a, b) => a.ecartDate - b.ecartDate)
    const rangDate: Record<string, number> = {}
    let currentRank = 1
    for (let i = 0; i < sortedByDate.length; i++) {
      const current = sortedByDate[i]
      const previous = sortedByDate[i - 1]
      if (current && i > 0 && previous && current.ecartDate !== previous.ecartDate) {
        currentRank = i + 1
      }
      if (current) {
        rangDate[current.id] = currentRank
      }
    }

    // Classement sur le poids (rang avec égalités)
    const sortedByWeight = [...betsWithDiffs].sort((a, b) => a.ecartPoids - b.ecartPoids)
    const rangPoids: Record<string, number> = {}
    currentRank = 1
    for (let i = 0; i < sortedByWeight.length; i++) {
      const current = sortedByWeight[i]
      const previous = sortedByWeight[i - 1]
      if (current && i > 0 && previous && current.ecartPoids !== previous.ecartPoids) {
        currentRank = i + 1
      }
      if (current) {
        rangPoids[current.id] = currentRank
      }
    }

    // Classement sur le sexe: correct = 1, incorrect = K + 1
    // où K = nombre de parieurs ayant trouvé le bon sexe
    const rangSexe: Record<string, number> = {}
    const N = betsWithDiffs.length // Nombre total de parieurs
    const K = betsWithDiffs.filter((bet) => bet.sexeCorrect).length // Nombre ayant le bon sexe
    const rangIncorrect = K + 1
    for (const bet of betsWithDiffs) {
      rangSexe[bet.id] = bet.sexeCorrect ? 1 : rangIncorrect
    }

    // Calcul du score final avec pondérations dynamiques:
    // Score = (K + 2) * (N + 1) * rang_date + (N + 1) * rang_sexe + rang_poids
    // Hiérarchie garantie: Date > Sexe > Poids
    const betsWithScores = betsWithDiffs.map((bet) => ({
      id: bet.id,
      score:
        (K + 2) * (N + 1) * (rangDate[bet.id] ?? 0) +
        (N + 1) * (rangSexe[bet.id] ?? 0) +
        (rangPoids[bet.id] ?? 0),
      rangDate: rangDate[bet.id] ?? 0,
      rangPoids: rangPoids[bet.id] ?? 0,
      rangSexe: rangSexe[bet.id] ?? 0,
      createdAt: bet.createdAt,
    }))

    // Mettre à jour les scores et rangs dans la base de données
    for (const bet of betsWithScores) {
      const { error: updateError } = await $supabase
        .from('bets')
        .update({
          score: bet.score,
          rang_date: bet.rangDate,
          rang_poids: bet.rangPoids,
          rang_sexe: bet.rangSexe,
        })
        .eq('id', bet.id)

      if (updateError) {
        console.error(`Erreur lors de la mise à jour du score pour ${bet.id}:`, updateError)
      }
    }
  }

  // Fonction pour recalculer les scores manuellement
  const recalculating = ref(false)
  async function recalculateScores() {
    if (!babyConfig.value.birth_date || !babyConfig.value.weight_kg || !babyConfig.value.sex) {
      toast.add({
        title: 'Erreur',
        description: 'Veuillez renseigner la date, le poids et le sexe du bébé',
        color: 'error',
      })
      return
    }

    recalculating.value = true
    try {
      await calculateAndSaveScores(
        babyConfig.value.birth_date,
        babyConfig.value.weight_kg,
        babyConfig.value.sex
      )
      toast.add({
        title: 'Succès',
        description: 'Les scores ont été recalculés',
        color: 'success',
      })
    } catch (e) {
      console.error('Error recalculating scores:', e)
      toast.add({
        title: 'Erreur',
        description: 'Impossible de recalculer les scores',
        color: 'error',
      })
    } finally {
      recalculating.value = false
    }
  }

  async function saveConfig() {
    saving.value = true
    try {
      let birthDateISO = null
      if (babyConfig.value.birth_date && babyConfig.value.birth_time) {
        const [hours = '0', minutes = '0'] = babyConfig.value.birth_time.split(':')
        const date = new Date(babyConfig.value.birth_date)
        date.setHours(parseInt(hours), parseInt(minutes))
        birthDateISO = date.toISOString()
      }

      const payload = {
        id: 1, // Force ID 1
        is_born: babyConfig.value.is_born,
        baby_name: babyConfig.value.baby_name,
        birth_date: birthDateISO,
        weight_kg: babyConfig.value.weight_kg,
        height_cm: babyConfig.value.height_cm,
        sex: babyConfig.value.sex,
      }

      const { error } = await $supabase.from('app_config').upsert(payload)
      if (error) throw error

      // Si le bébé est né, calculer et enregistrer les scores
      if (
        babyConfig.value.is_born &&
        babyConfig.value.birth_date &&
        babyConfig.value.weight_kg &&
        babyConfig.value.sex
      ) {
        await calculateAndSaveScores(
          babyConfig.value.birth_date,
          babyConfig.value.weight_kg,
          babyConfig.value.sex
        )
        toast.add({
          title: 'Succès',
          description: 'Configuration enregistrée et scores calculés',
          color: 'success',
        })
      } else {
        toast.add({
          title: 'Succès',
          description: 'Configuration enregistrée',
          color: 'success',
        })
      }
    } catch (e) {
      console.error('Error saving config:', e)
      toast.add({
        title: 'Erreur',
        description: "Impossible d'enregistrer la configuration",
        color: 'error',
      })
    } finally {
      saving.value = false
    }
  }

  // Test Email Data (Existing)
  const testData = ref({
    participantName: 'Jean Dupont',
    participantEmail: 'jean.dupont@example.com',
    sexe: 'male' as 'male' | 'female',
    estimatedDate: '2026-01-22',
    weight: 3.5,
    firstName: 'Lucas',
  })

  const sending = ref(false)
  const result = ref<{ success: boolean; message: string } | null>(null)

  // Configuration (Existing)
  const config = ref({
    gmailUser: '',
    notificationEmail: '',
    hasPassword: false,
  })

  // Validation du formulaire
  const isFormValid = computed(() => {
    return (
      testData.value.participantName.trim() !== '' &&
      testData.value.participantEmail.trim() !== '' &&
      testData.value.estimatedDate !== '' &&
      testData.value.weight > 0
    )
  })

  // Charger la configuration au montage si authentifié
  onMounted(async () => {
    if (isAuthenticated.value) {
      fetchConfig()
    }
    // Load email config anyway? Maybe not needed if protected. But let's keep it.
    try {
      const response = await $fetch<{
        gmailUser: string
        notificationEmail: string
        hasPassword: boolean
      }>('/api/email-config')
      config.value = response
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error)
    }
  })

  // Fonction d'envoi de l'email de test
  async function sendTestEmail() {
    if (!isFormValid.value) return

    sending.value = true
    result.value = null

    try {
      // Générer des layers d'avatar de test (avatar par défaut)
      const structure = await $fetch<{
        base: { width: number; height: number }
        layers: Array<{
          name: string
          x: number
          y: number
          width: number
          height: number
          z: number
          category: 'base' | 'top' | 'middle' | 'bottom'
          goesWith?: string
        }>
      }>('/PigGenerator/structure.json')

      const targetWidth = 120
      const scale = targetWidth / structure.base.width

      // Prendre juste les base layers pour le test
      const baseLayers = structure.layers.filter((l) => l.category === 'base')
      const avatarLayers = baseLayers.map((l) => ({
        key: l.name,
        src: `/PigGenerator/Base/${l.name}.svg`,
        width: l.width * scale,
        height: l.height * scale,
        left: l.x * scale - (l.width * scale) / 2,
        top: l.y * scale - (l.height * scale) / 2,
        z: l.z,
      }))

      await $fetch('/api/send-notification', {
        method: 'POST',
        body: {
          participantName: testData.value.participantName,
          participantEmail: testData.value.participantEmail,
          betDetails: {
            isMale: testData.value.sexe === 'male',
            estimatedDate: testData.value.estimatedDate,
            weight: testData.value.weight,
            firstName: testData.value.firstName || null,
          },
          avatarLayers,
        },
      })

      result.value = {
        success: true,
        message: `Email envoyé avec succès à ${config.value.notificationEmail}`,
      }

      toast.add({
        title: 'Email envoyé !',
        description: 'Vérifiez votre boîte de réception',
        color: 'success',
      })
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error)
      result.value = {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      }

      toast.add({
        title: 'Erreur',
        description: "Impossible d'envoyer l'email",
        color: 'error',
      })
    } finally {
      sending.value = false
    }
  }
</script>
