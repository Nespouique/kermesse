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
            <form @submit.prevent="login" class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">Mot de passe</label>
                <UInput
                  v-model="password"
                  type="password"
                  placeholder="Mot de passe administrateur"
                />
              </div>
              <div v-if="loginError" class="text-red-500 text-sm">{{ loginError }}</div>
              <UButton type="submit" color="primary" block :loading="loggingIn"
                >Se connecter</UButton
              >
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
                  {{ babyConfig.is_born ? "Né(e)" : "En attente" }}
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
                  <UInput
                    v-model.number="babyConfig.weight_kg"
                    type="number"
                    step="0.01"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Taille (cm)</label>
                  <UInput
                    v-model.number="babyConfig.height_cm"
                    type="number"
                    step="0.1"
                  />
                </div>
              </div>

              <div class="pt-4 border-t border-[var(--ui-border)]">
                <UButton color="primary" block :loading="saving" @click="saveConfig">
                  Enregistrer les informations
                </UButton>
              </div>
            </div>
          </UCard>

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
                  <label class="block text-sm font-medium mb-2"
                    >Email du participant</label
                  >
                  <UInput
                    v-model="testData.participantEmail"
                    type="email"
                    placeholder="jean.dupont@example.com"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2"
                    >Date de naissance estimée</label
                  >
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
                  <label class="block text-sm font-medium mb-2"
                    >Prénom du bébé (optionnel)</label
                  >
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
                  :icon="
                    result.success ? 'i-lucide-check-circle' : 'i-lucide-alert-circle'
                  "
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
import { ref, computed, onMounted } from "vue";
import { useToast } from "#imports";

const toast = useToast();
const { $supabase } = useNuxtApp();

// Auth
const isAuthenticated = useState("isAuthenticated", () => false);
const password = ref("");
const loginError = ref("");
const loggingIn = ref(false);

async function login() {
  loggingIn.value = true;
  loginError.value = "";
  try {
    await $fetch("/api/auth", { method: "POST", body: { password: password.value } });
    isAuthenticated.value = true;
    fetchConfig();
  } catch (e) {
    loginError.value = "Mot de passe incorrect";
  } finally {
    loggingIn.value = false;
  }
}

// Baby Config
const sexOptions = [
  { label: "Garçon", value: "M" },
  { label: "Fille", value: "F" },
];

const babyConfig = ref({
  is_born: false,
  baby_name: "",
  birth_date: "",
  birth_time: "",
  weight_kg: 3.5,
  height_cm: 50.0,
  sex: "M",
});
const saving = ref(false);

async function fetchConfig() {
  if (!$supabase) return;
  try {
    const { data, error } = await $supabase.from("app_config").select("*").single();
    if (error && error.code !== "PGRST116") throw error; // PGRST116 is "The result contains 0 rows"

    if (data) {
      const dateObj = data.birth_date ? new Date(data.birth_date) : new Date();
      babyConfig.value = {
        is_born: data.is_born,
        baby_name: data.baby_name || "",
        birth_date: data.birth_date ? dateObj.toISOString().split("T")[0] : "",
        birth_time: data.birth_date
          ? dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
          : "",
        weight_kg: data.weight_kg || 3.5,
        height_cm: data.height_cm || 50.0,
        sex: data.sex || "M",
      };
    }
  } catch (e) {
    console.error("Error fetching config:", e);
    toast.add({
      title: "Erreur",
      description: "Impossible de charger la configuration",
      color: "error",
    });
  }
}

async function saveConfig() {
  saving.value = true;
  try {
    let birthDateISO = null;
    if (babyConfig.value.birth_date && babyConfig.value.birth_time) {
      const [hours, minutes] = babyConfig.value.birth_time.split(":");
      const date = new Date(babyConfig.value.birth_date);
      date.setHours(parseInt(hours), parseInt(minutes));
      birthDateISO = date.toISOString();
    }

    const payload = {
      id: 1, // Force ID 1
      is_born: babyConfig.value.is_born,
      baby_name: babyConfig.value.baby_name,
      birth_date: birthDateISO,
      weight_kg: babyConfig.value.weight_kg,
      height_cm: babyConfig.value.height_cm,
      sex: babyConfig.value.sex,
    };

    const { error } = await $supabase.from("app_config").upsert(payload);
    if (error) throw error;

    toast.add({
      title: "Succès",
      description: "Configuration enregistrée",
      color: "success",
    });
  } catch (e) {
    console.error("Error saving config:", e);
    toast.add({
      title: "Erreur",
      description: "Impossible d'enregistrer la configuration",
      color: "error",
    });
  } finally {
    saving.value = false;
  }
}

// Test Email Data (Existing)
const testData = ref({
  participantName: "Jean Dupont",
  participantEmail: "jean.dupont@example.com",
  sexe: "male" as "male" | "female",
  estimatedDate: "2026-01-22",
  weight: 3.5,
  firstName: "Lucas",
});

const sending = ref(false);
const result = ref<{ success: boolean; message: string } | null>(null);

// Configuration (Existing)
const config = ref({
  gmailUser: "",
  notificationEmail: "",
  hasPassword: false,
});

// Validation du formulaire
const isFormValid = computed(() => {
  return (
    testData.value.participantName.trim() !== "" &&
    testData.value.participantEmail.trim() !== "" &&
    testData.value.estimatedDate !== "" &&
    testData.value.weight > 0
  );
});

// Charger la configuration au montage si authentifié
onMounted(async () => {
  if (isAuthenticated.value) {
    fetchConfig();
  }
  // Load email config anyway? Maybe not needed if protected. But let's keep it.
  try {
    const response = await $fetch<{
      gmailUser: string;
      notificationEmail: string;
      hasPassword: boolean;
    }>("/api/email-config");
    config.value = response;
  } catch (error) {
    console.error("Erreur lors du chargement de la configuration:", error);
  }
});

// Fonction d'envoi de l'email de test
async function sendTestEmail() {
  if (!isFormValid.value) return;

  sending.value = true;
  result.value = null;

  try {
    // Générer des layers d'avatar de test (avatar par défaut)
    const structure = await $fetch<{
      base: { width: number; height: number };
      layers: Array<{
        name: string;
        x: number;
        y: number;
        width: number;
        height: number;
        z: number;
        category: "base" | "top" | "middle" | "bottom";
        goesWith?: string;
      }>;
    }>("/PigGenerator/structure.json");

    const targetWidth = 120;
    const scale = targetWidth / structure.base.width;

    // Prendre juste les base layers pour le test
    const baseLayers = structure.layers.filter((l) => l.category === "base");
    const avatarLayers = baseLayers.map((l) => ({
      key: l.name,
      src: `/PigGenerator/Base/${l.name}.svg`,
      width: l.width * scale,
      height: l.height * scale,
      left: l.x * scale - (l.width * scale) / 2,
      top: l.y * scale - (l.height * scale) / 2,
      z: l.z,
    }));

    await $fetch("/api/send-notification", {
      method: "POST",
      body: {
        participantName: testData.value.participantName,
        participantEmail: testData.value.participantEmail,
        betDetails: {
          isMale: testData.value.sexe === "male",
          estimatedDate: testData.value.estimatedDate,
          weight: testData.value.weight,
          firstName: testData.value.firstName || null,
        },
        avatarLayers,
      },
    });

    result.value = {
      success: true,
      message: `Email envoyé avec succès à ${config.value.notificationEmail}`,
    };

    toast.add({
      title: "Email envoyé !",
      description: "Vérifiez votre boîte de réception",
      color: "success",
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi:", error);
    result.value = {
      success: false,
      message: error instanceof Error ? error.message : "Erreur inconnue",
    };

    toast.add({
      title: "Erreur",
      description: "Impossible d'envoyer l'email",
      color: "error",
    });
  } finally {
    sending.value = false;
  }
}
</script>
