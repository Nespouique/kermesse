<template>
  <UContainer>
    <!-- Modal de succès après enregistrement du pari -->
    <ClientOnly>
      <UModal
        v-model:open="showSuccessModal"
        title="Félicitations !"
        :close="false"
        :ui="{
          header: 'flex justify-center',
          title: 'w-full text-center text-3xl font-extrabold',
          body: 'text-center',
          footer: 'justify-center',
        }"
      >
        <template #body>
          <div class="space-y-6 py-2 px-2">
            <p class="leading-relaxed text-lg">
              Votre pari a été enregistré. Rendez-vous à la naissance pour découvrir si vous avez
              gagné le gros lot !
            </p>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-center w-full">
            <UButton
              color="neutral"
              variant="solid"
              label="Voir les autres paris"
              size="lg"
              @click="goToParisTab"
            />
          </div>
        </template>
      </UModal>
    </ClientOnly>
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
        <h2 class="text-xl font-medium mb-2">
          En hommage aux kermesses bretonnes où les participants parient sur le poids du cochon.
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
          root: 'gap-0 flex-col w-full',
          list: 'divide-x-1 divide-gray-800 dark:divide-gray-200 rounded-none bg-[var(--ui-bg)] shadow-md',
          trigger: 'rounded-none data-[state=inactive]:text-[var(--ui-text)]',
          indicator: 'rounded-none',
        }"
      >
        <!-- Premier tab : Faire mon pari -->
        <template #pari>
          <div id="stepper-section">
            <div class="bg-[var(--ui-bg)] rounded-none shadow-md px-4 sm:px-20 py-6 sm:py-10">
              <UStepper
                v-model="currentStep"
                color="neutral"
                :items="stepperItems"
                size="lg"
                class="w-full pt-2"
              >
                <!-- Step 1: Pari -->
                <template #pari-content>
                  <div class="pt-6">
                    <TicketForm @change="handleBetChange" @cancel="resetForm" />
                  </div>
                </template>

                <!-- Step 2: Avatar -->
                <template #avatar-content>
                  <div class="pt-6">
                    <div class="space-y-6">
                      <h3 class="text-lg font-bold text-center">Personnalisez votre cochon !</h3>
                      <AvatarBuilder @change="onAvatarChange" />
                    </div>
                  </div>
                </template>

                <!-- Step 3: Informations utilisateur -->
                <template #info-content>
                  <div class="pt-6">
                    <div class="space-y-9">
                      <h3 class="text-lg font-bold mb-6 text-center">
                        Aidez nous à vous retrouver !
                      </h3>
                      <div class="space-y-9">
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
                        <div>
                          <label class="block text-sm font-medium mb-3">Email *</label>
                          <UInput
                            v-model="userInfo.email"
                            type="email"
                            placeholder="vous@example.com"
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
            </div>
            <!-- Boutons de navigation (hors fond blanc) -->
            <div class="flex justify-between mt-4 gap-4">
              <UButton
                color="neutral"
                variant="solid"
                label="Précédent"
                :disabled="!canGoPrev"
                class="shadow-lg"
                @click="goToPrevStep"
              />
              <UButton
                color="neutral"
                variant="solid"
                :label="isLastStep ? (submitting ? 'Envoi...' : 'Envoyer') : 'Suivant'"
                :disabled="submitting || !canGoNext"
                class="shadow-lg"
                @click="isLastStep ? submitFinalForm() : goToNextStep()"
              />
            </div>
          </div>
        </template>

        <!-- Deuxième tab : Voir les paris -->
        <template #paris>
          <div id="bets-section" class="bg-[var(--ui-bg)] rounded-none shadow-md px-4 py-6">
            <BetsList @loaded="onBetsLoaded" />
          </div>
        </template>
      </UTabs>
    </div>
    <div id="prizes-link" class="mt-8 text-center">
      <UButton
        variant="link"
        color="neutral"
        class="!underline underline-offset-2"
        @click="showPrizes = true"
      >
        Voir les lots
      </UButton>
    </div>
    <PrizesModal v-model="showPrizes" />
  </UContainer>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, watch, nextTick } from 'vue'
  import BabyCountdown from '~/components/BabyCountdown.vue'
  import TicketForm from '~/components/TicketForm.vue'
  import AvatarBuilder from '~/components/AvatarBuilder.vue'
  import BetsList from '~/components/BetsList.vue'
  import PrizesModal from '~/components/PrizesModal.vue'
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
  const showSuccessModal = ref(false)
  const showPrizes = ref(false)
  watch(showSuccessModal, async (val) => {
    console.log('showSuccessModal ->', val)
    if (val) {
      await nextTick()
      setTimeout(() => triggerConfetti(), 80)
    }
  })
  const toast = useToast()

  // Variables pour les tabs et stepper
  const activeTab = ref<string | undefined>(undefined) // Aucun tab sélectionné par défaut
  const currentStep = ref(0)

  // Données utilisateur
  const userInfo = ref({
    firstName: '',
    lastName: '',
    email: '', // optionnel
  })

  function normalizeName(raw: string): string {
    if (!raw) return ''
    return raw
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) =>
        word
          .split('-')
          .map((part) =>
            part
              .split("'")
              .map((seg) => (seg ? seg.charAt(0).toUpperCase() + seg.slice(1) : seg))
              .join("'")
          )
          .join('-')
      )
      .join(' ')
  }

  // État d'envoi
  const submitting = ref(false)

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

  // Scroll automatique lors du changement de tab – attente d'un layout stable pour éviter l'effet "ascenseur"
  function scrollTabIntoView(tab: string) {
    const targetId =
      tab === 'paris' ? 'bets-section' : tab === 'pari' ? 'stepper-section' : 'tabs-section'
    const isDynamic = tab === 'paris'
    const performScroll = () => {
      const el = document.getElementById(targetId) || document.getElementById('tabs-section')
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      window.scrollTo({ top: rect.top + scrollTop, behavior: 'smooth' })
    }

    // Pour le tab dynamique, attendre que la hauteur du document se stabilise (3 frames consécutives identiques)
    if (isDynamic) {
      let lastHeight = document.body.scrollHeight
      let stableFrames = 0
      let frames = 0
      const maxFrames = 40 // ~2/3s à 60fps max
      const check = () => {
        frames++
        const h = document.body.scrollHeight
        if (h === lastHeight) {
          stableFrames++
        } else {
          stableFrames = 0
          lastHeight = h
        }
        if (stableFrames >= 3 || frames >= maxFrames) {
          performScroll()
        } else {
          requestAnimationFrame(check)
        }
      }
      // Laisser la transition des tabs commencer avant le suivi
      nextTick(() => requestAnimationFrame(check))
    } else {
      // Cas simple
      nextTick(() => setTimeout(performScroll, 30))
    }
  }

  watch(activeTab, (newTab) => {
    if (!newTab) return
    scrollTabIntoView(newTab)
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
    const email = userInfo.value.email.trim()
    const emailOk = email.length > 0
    const isValid =
      userInfo.value.firstName.trim() !== '' && userInfo.value.lastName.trim() !== '' && emailOk
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
      email: '',
    }
    betData.value = null
    submitting.value = false
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
      toast.add({
        title: 'Champs manquants',
        description: 'Veuillez remplir prénom et nom.',
        color: 'error',
      })
      return
    }
    if (!userInfo.value.email.trim()) {
      toast.add({
        title: 'Email requis',
        description: 'Veuillez saisir votre adresse email.',
        color: 'error',
      })
      return
    }

    const finalData = {
      bet: betData.value,
      user: userInfo.value,
      avatar: avatarSelection.value,
    }

    console.log('Pari final soumis:', finalData)
    // Intégration Supabase
    const { $supabase } = useNuxtApp()
    if (!$supabase) {
      toast.add({
        title: 'Configuration',
        description: 'Supabase non configuré.',
        color: 'error',
      })
      return
    }
    ;(async () => {
      try {
        submitting.value = true
        // Insert participant (puis select si conflit) pour éviter besoin policy UPDATE
        if (!userInfo.value.email) return
        const participantEmail = userInfo.value.email.trim().toLowerCase()
        let participantId: string | null = null
        // Normaliser les noms (Jean-Marc / Nom De Famille)
        const normalizedFirst = normalizeName(userInfo.value.firstName)
        const normalizedLast = normalizeName(userInfo.value.lastName)
        // Met à jour l'état local (pour cohérence d'affichage post-submit éventuel)
        userInfo.value.firstName = normalizedFirst
        userInfo.value.lastName = normalizedLast

        const { data: inserted, error: insertErr } = await $supabase
          .from('participants')
          .insert({
            email: participantEmail,
            first_name: normalizedFirst,
            last_name: normalizedLast,
          })
          .select('id')
          .single()
        if (insertErr) {
          const ie = insertErr as unknown as { code?: string; message?: string }
          if (ie.code === '23505') {
            // Conflit email participant => déjà inscrit => on arrête (pas de tentative bet)
            toast.add({
              title: 'Erreur - Email déjà utilisé',
              description: "Vous ne pouvez faire qu'un seul pari par adresse mail",
              color: 'error',
            })
            return
          } else if (ie.code === '42501') {
            toast.add({
              title: 'Erreur - Accès refusé',
              description:
                "Impossible d'enregistrer le participant (RLS). Contactez un administrateur.",
              color: 'error',
            })
            return
          } else {
            throw insertErr
          }
        } else if (inserted) {
          participantId = inserted.id
        }
        if (!participantId) throw new Error('ID participant manquant')

        // Insert bet (one per participant enforced by db unique constraint)
        if (!betData.value) throw new Error('Données de pari manquantes')

        interface CalendarLike {
          year?: number
          month?: number
          day?: number
        }
        const estimatedDateRaw = betData.value.estimatedDate as unknown as CalendarLike | undefined
        let dateISO: string | null = null
        if (
          estimatedDateRaw &&
          typeof estimatedDateRaw.year === 'number' &&
          typeof estimatedDateRaw.month === 'number' &&
          typeof estimatedDateRaw.day === 'number'
        ) {
          const y = estimatedDateRaw.year
          const m = String(estimatedDateRaw.month).padStart(2, '0')
          const d = String(estimatedDateRaw.day).padStart(2, '0')
          dateISO = `${y}-${m}-${d}`
        }
        if (!dateISO) throw new Error('Date estimée invalide')

        const { data: bet, error: bErr } = await $supabase
          .from('bets')
          .insert({
            participant_id: participantId,
            is_male: betData.value.isMale,
            estimated_date: dateISO,
            weight_kg: betData.value.weight,
            baby_first_name: betData.value.firstName || null,
          })
          .select()
          .single()
        if (bErr) {
          const errObj = bErr as unknown as { code?: string; message?: string }
          if (errObj.code === '23505') {
            toast.add({
              title: 'Erreur - Email déjà utilisé',
              description: "Vous ne pouvez faire qu'un seul pari par adresse mail",
              color: 'error',
            })
            return
          }
          throw bErr
        }

        // Insert avatar layers (store just names)
        const { top, middle, bottom } = avatarSelection.value
        const { error: aErr } = await $supabase.from('avatars').insert({
          bet_id: bet.id,
          top_layer: top?.name || null,
          middle_layer: middle?.name || null,
          bottom_layer: bottom?.name || null,
        })
        if (aErr) throw aErr

        showSuccessModal.value = true
        resetForm()
      } catch (err) {
        console.error(err)
        toast.add({
          title: 'Erreur',
          description:
            err instanceof Error ? err.message : "Erreur inconnue lors de l'enregistrement",
          color: 'error',
        })
      } finally {
        submitting.value = false
      }
    })()
  }

  function goToParisTab() {
    showSuccessModal.value = false
    activeTab.value = 'paris'
  }

  async function triggerConfetti() {
    if (typeof window === 'undefined') return
    try {
      // @ts-expect-error Module déclaré via types/canvas-confetti.d.ts
      const { default: confetti } = await import('canvas-confetti')
      const fire = (particleCount: number, spread: number, delay = 0) =>
        setTimeout(() => confetti({ particleCount, spread, origin: { y: 0.5 } }), delay)
      fire(120, 70)
      fire(80, 60, 250)
      fire(60, 80, 500)
      fire(40, 50, 700)
      fire(150, 90, 3000)
      fire(80, 60, 3300)
    } catch (e) {
      console.warn('Confetti non chargé', e)
    }
  }

  function onBetsLoaded() {
    // Scroll uniquement si l'onglet paris est actif
    if (activeTab.value !== 'paris') return
    const el = document.getElementById('bets-section')
    if (!el) return
    // Utiliser requestAnimationFrame pour s'assurer que le layout final est appliqué
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      window.scrollTo({ top: rect.top + scrollTop, behavior: 'smooth' })
    })
  }
</script>
