<template>
  <UContainer>
    <!-- Switch en haut à droite -->
    <div class="flex justify-end">
      <USwitch
        :model-value="isMounted ? isDark : false"
        color="neutral"
        size="lg"
        unchecked-icon="i-lucide-sun"
        checked-icon="i-lucide-moon"
        @update:model-value="
          (val) => {
            if (isMounted) isDark = val
          }
        "
      />
    </div>

    <!-- Section image + titre -->
    <div class="flex flex-col sm:flex-row items-center gap-6 mb-6">
      <div
        class="rounded-full shadow-xl flex items-center justify-center shrink-0 bulle-bg-subtle max-w-[200px] aspect-square mx-auto sm:w-44 sm:h-44 sm:max-w-none sm:mx-0 md:w-56 md:h-56"
      >
        <img
          src="/kermesse.svg"
          alt="Kermesse"
          class="object-contain w-4/5 h-4/5 max-w-full max-h-full"
        />
      </div>
      <div class="text-center sm:text-left">
        <h1 class="font-bold mb-6 sm:mb-2 drop-shadow-lg text-5xl">Kermesse du Bébé</h1>
        <h2 class="text-xl font-medium">
          Inspiré des kermesses bretonnes où les participants parient sur le poids d'un cochon.
          <br />
          Ici, c'est notre petit cochon à naître qui fait l'objet de tous les paris !
          <br />
          Que la tradition continue...
        </h2>
      </div>
    </div>

    <BabyCountdown class="mb-10 sm:mb-12" />

    <!-- Section avec Tabs -->
    <div id="tabs-section" class="mx-auto">
      <UTabs
        v-model="activeTab"
        color="neutral"
        :items="tabItems"
        class="w-full"
        size="xl"
        :ui="{
          list: 'divide-x-1 divide-gray-800 dark:divide-gray-200 rounded-none bg-[var(--ui-bg)]',
          trigger: 'rounded-none data-[state=inactive]:text-[var(--ui-text)]',
          indicator: 'rounded-none',
        }"
      >
        <!-- Premier tab : Faire mon pari -->
        <template #pari>
          <div id="stepper-section" class="py-6 sm:p-6">
            <UStepper
              v-model="currentStep"
              color="neutral"
              :items="stepperItems"
              size="lg"
              class="w-full"
              :ui="{
                trigger: 'bg-[var(--ui-bg)] data-[state=inactive]:text-[var(--ui-text)]',
                separator: 'bg-[var(--ui-bg)]',
              }"
            >
              <!-- Step 1: Pari -->
              <template #pari-content>
                <div class="pt-6 min-h-[350px]">
                  <TicketForm @change="handleBetChange" @cancel="resetForm" />
                </div>
              </template>

              <!-- Step 2: Avatar -->
              <template #avatar-content>
                <div class="pt-6 min-h-[350px]">
                  <div class="space-y-6">
                    <h3 class="text-lg font-bold text-center">
                      Personnalisez votre petit cochon !
                    </h3>
                    <AvatarBuilder @change="onAvatarChange" />
                  </div>
                </div>
              </template>

              <!-- Step 3: Informations utilisateur -->
              <template #info-content>
                <div class="pt-6 min-h-[350px]">
                  <div class="space-y-9">
                    <h3 class="text-lg font-bold mb-6 text-center">
                      Aidez nous à vous retrouver !
                    </h3>
                    <div class="grid grid-cols-2 gap-6 sm:gap-16">
                      <div>
                        <label class="block text-sm font-medium mb-3">Prénom *</label>
                        <UInput
                          v-model="userInfo.firstName"
                          placeholder="Entrez votre prénom"
                          color="primary"
                          variant="outline"
                          required
                          class="w-full"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium mb-3">Nom *</label>
                        <UInput
                          v-model="userInfo.lastName"
                          placeholder="Entrez votre nom"
                          color="primary"
                          variant="outline"
                          required
                          class="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </UStepper>

            <!-- Boutons de navigation unifiés -->
            <div class="flex justify-between">
              <UButton
                color="neutral"
                label="Précédent"
                :disabled="!canGoPrev"
                @click="goToPrevStep"
              />
              <UButton
                color="neutral"
                :label="isLastStep ? 'Envoyer' : 'Suivant'"
                :disabled="!canGoNext"
                @click="isLastStep ? submitFinalForm() : goToNextStep()"
              />
            </div>
          </div>
        </template>

        <!-- Deuxième tab : Voir les paris -->
        <template #paris>
          <div class="py-6 sm:p-6 text-center">
            <h3 class="text-lg font-semibold mb-4">Liste des paris</h3>
            <p class="text-gray-600 dark:text-gray-400">Fonctionnalité à venir...</p>
          </div>
        </template>
      </UTabs>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, watch, nextTick } from 'vue'
  import BabyCountdown from '~/components/BabyCountdown.vue'
  import TicketForm from '~/components/TicketForm.vue'
  import AvatarBuilder from '~/components/AvatarBuilder.vue'
  import { useColorMode } from '@vueuse/core'

  const colorMode = useColorMode()
  const isDark = computed({
    get() {
      return colorMode.value === 'dark'
    },
    set(_isDark) {
      colorMode.value = _isDark ? 'dark' : 'light'
    },
  })

  const isMounted = ref(false)

  // Variables pour les tabs et stepper
  const activeTab = ref<string | undefined>(undefined) // Aucun tab sélectionné par défaut
  const currentStep = ref(0)

  // Données utilisateur
  const userInfo = ref({
    firstName: '',
    lastName: '',
  })

  // Données du formulaire de pari (conservées depuis TicketForm)
  const betData = ref<{
    isMale: boolean
    estimatedDate: unknown
    weight: number
    firstName: string
  } | null>(null)

  // Configuration des tabs
  const tabItems = [
    {
      label: 'Faire mon pari',
      icon: 'i-lucide-dices',
      value: 'pari',
      slot: 'pari',
    },
    {
      label: 'Voir les paris',
      icon: 'i-lucide-eye',
      value: 'paris',
      slot: 'paris',
    },
  ]

  // Configuration du stepper
  const stepperItems = [
    {
      title: 'Pari',
      icon: 'i-lucide-dices',
      slot: 'pari-content',
    },
    {
      title: 'Avatar',
      icon: 'i-lucide-piggy-bank',
      slot: 'avatar-content',
    },
    {
      title: 'Informations',
      icon: 'i-lucide-user',
      slot: 'info-content',
    },
  ]

  onMounted(() => {
    isMounted.value = true
  })

  // Watcher pour gérer les changements d'étape via le stepper
  watch(currentStep, (newStep) => {
    console.log('Step changed to:', newStep, typeof newStep)
    // S'assurer que currentStep est bien un nombre
    if (typeof newStep !== 'number') {
      console.warn('currentStep should be a number, got:', newStep)
      return
    }
    // Force la réévaluation des validations
    nextTick(() => {
      console.log('After step change - canGoNext:', canGoNext.value, 'canGoPrev:', canGoPrev.value)
      // Scroll la section stepper en haut de l'écran
      setTimeout(() => {
        const el = document.getElementById('stepper-section')
        if (el) {
          const rect = el.getBoundingClientRect()
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop
          const y = rect.top + scrollTop
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }, 50)
    })
  })

  // Watcher pour le scroll automatique lors du changement de tab
  watch(activeTab, (newTab) => {
    if (newTab) {
      nextTick(() => {
        nextTick(() => {
          setTimeout(() => {
            const tabsElement = document.getElementById('tabs-section')
            if (tabsElement) {
              const rect = tabsElement.getBoundingClientRect()
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop
              const y = rect.top + scrollTop
              window.scrollTo({ top: y, behavior: 'smooth' })
            }
          }, 100)
        })
      })
    }
  })

  // Computed pour la validation des étapes
  const isStep1Valid = computed(() => {
    const isValid = betData.value !== null
    console.log('Step 1 validation:', isValid, betData.value)
    return isValid
  })

  // Avatar selection state
  type LayerItem = {
    name: string
    x: number
    y: number
    width: number
    height: number
    z: number
    category: 'top' | 'middle' | 'bottom' | 'base'
    goesWith?: string
  }

  const avatarSelection = ref<Record<'top' | 'middle' | 'bottom', LayerItem | null>>({
    top: null,
    middle: null,
    bottom: null,
  })

  function onAvatarChange(sel: Record<'top' | 'middle' | 'bottom', LayerItem | null>) {
    avatarSelection.value = sel
  }

  const isStep2Valid = computed(() => {
    // Avatar step is always valid; optionally require at least one selection
    const isValid = true
    console.log('Step 2 validation:', isValid, avatarSelection.value)
    return isValid
  })

  const isStep3Valid = computed(() => {
    const isValid = userInfo.value.firstName.trim() !== '' && userInfo.value.lastName.trim() !== ''
    console.log('Step 3 validation:', isValid, userInfo.value)
    return isValid
  })

  const canGoNext = computed(() => {
    let canGo = false
    switch (currentStep.value) {
      case 0:
        canGo = isStep1Valid.value
        break
      case 1:
        canGo = isStep2Valid.value
        break
      case 2:
        canGo = isStep3Valid.value
        break
      default:
        canGo = false
    }
    console.log('Can go next:', canGo, 'Current step:', currentStep.value)
    return canGo
  })

  const canGoPrev = computed(() => {
    const canGo = currentStep.value > 0
    console.log('Can go prev:', canGo, 'Current step:', currentStep.value)
    return canGo
  })

  const isLastStep = computed(() => {
    const isLast = currentStep.value === stepperItems.length - 1
    console.log(
      'Is last step:',
      isLast,
      'Current step:',
      currentStep.value,
      'Total steps:',
      stepperItems.length
    )
    return isLast
  })

  // Fonctions de navigation du stepper
  function goToNextStep() {
    if (currentStep.value < stepperItems.length - 1) {
      currentStep.value++
    }
  }

  function goToPrevStep() {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  function resetForm() {
    currentStep.value = 0
    userInfo.value = {
      firstName: '',
      lastName: '',
    }
    betData.value = null
  }

  function handleBetChange(data: {
    isMale: boolean
    estimatedDate: unknown
    weight: number
    firstName: string
  }) {
    console.log('handleBetChange appelée avec:', data)
    betData.value = data
    console.log('betData.value après assignation:', betData.value)
  }

  function submitFinalForm() {
    if (!userInfo.value.firstName || !userInfo.value.lastName) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    const finalData = {
      bet: betData.value,
      user: userInfo.value,
      avatar: avatarSelection.value,
    }

    console.log('Pari final soumis:', finalData)
    // TODO: Intégrer avec Supabase
    alert('Pari enregistré avec succès !')

    // Reset du formulaire
    resetForm()
  }
</script>
