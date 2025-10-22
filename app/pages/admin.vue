<template>
  <UContainer>
    <div class="py-10">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold mb-8 text-center">🔧 Administration</h1>

        <!-- Section Test Email -->
        <UCard class="mb-6">
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
                color="primary"
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

        <!-- Section Configuration -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">⚙️ Configuration actuelle</h2>
          </template>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between items-center">
              <span class="text-[var(--ui-text-dimmed)]">Email expéditeur:</span>
              <span class="font-mono text-xs">{{ config.gmailUser || 'Non configuré' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[var(--ui-text-dimmed)]">Destinataires:</span>
              <span class="font-mono text-xs">
                {{ config.notificationEmail || 'Non configuré' }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[var(--ui-text-dimmed)]">Mot de passe configuré:</span>
              <span :class="config.hasPassword ? 'text-green-600' : 'text-red-600'">
                {{ config.hasPassword ? '✓ Oui' : '✗ Non' }}
              </span>
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
  </UContainer>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useToast } from '#imports'

  const toast = useToast()

  // Données du formulaire de test
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

  // Configuration
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

  // Charger la configuration au montage
  onMounted(async () => {
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
