<script setup lang="ts">
import type { CanonicalAddress, Package } from '#shared/types/domain'

definePageMeta({
  layout: 'portal',
  middleware: ['auth', 'onboarded']
})

useHead({ title: 'Ship' })

interface QuoteOption {
  id: string
  provider: string
  serviceCode: string
  serviceName: string
  customerPrice: number
  currency: string
  transitDays: number | null
  estimatedDelivery: string | null
  expiresAt: string
}

interface PurchasedShipment {
  id: string
  carrier: string
  service: string
  trackingNumber: string
  trackingUrl?: string
  labelUrl: string
  customerCharge: number
  currency: string
}

const provinceOptions = [
  { label: 'Ontario', value: 'ON' }, { label: 'Quebec', value: 'QC' },
  { label: 'British Columbia', value: 'BC' }, { label: 'Alberta', value: 'AB' },
  { label: 'Manitoba', value: 'MB' }, { label: 'Saskatchewan', value: 'SK' },
  { label: 'Nova Scotia', value: 'NS' }, { label: 'New Brunswick', value: 'NB' },
  { label: 'Newfoundland and Labrador', value: 'NL' }, { label: 'Prince Edward Island', value: 'PE' },
  { label: 'Yukon', value: 'YT' }, { label: 'Northwest Territories', value: 'NT' },
  { label: 'Nunavut', value: 'NU' }
]
const stateOptions = [
  ...'AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC'.split(' ').map(value => ({ label: value, value }))
]
const addressOptions = (country: string) => country === 'US' ? stateOptions : provinceOptions
const senderExtras = reactive({ reference: '', poBox: false, notifications: false, save: false, search: '' })
const recipientExtras = reactive({ reference: '', poBox: false, notifications: false, save: false, search: '' })
const addressBook = ref<{ label: string, address: CanonicalAddress }[]>([])
const senderBookSelection = ref('')
const recipientBookSelection = ref('')
const addressBookItems = computed(() => addressBook.value.map((item, index) => ({ label: item.label, value: String(index) })))
function selectSavedAddress(which: 'sender' | 'recipient', index: string) {
  const entry = addressBook.value[Number(index)]
  if (entry) Object.assign(which === 'sender' ? sender : recipient, entry.address)
}
function saveAddressesToBook() {
  for (const [address, extras] of [[sender, senderExtras], [recipient, recipientExtras]] as const) {
    if (extras.save) {
      addressBook.value.push({ label: [address.company, address.contactName, address.city].filter(Boolean).join(' · '), address: { ...address } })
      extras.save = false
    }
  }
  if (import.meta.client) localStorage.setItem('sigmaship-address-book', JSON.stringify(addressBook.value))
}
onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem('sigmaship-address-book') || '[]')
    if (Array.isArray(saved)) addressBook.value = saved
  } catch { /* Ignore invalid locally saved entries. */ }
})
function clearAddress(which: 'sender' | 'recipient') {
  const address = which === 'sender' ? sender : recipient
  const extras = which === 'sender' ? senderExtras : recipientExtras
  Object.assign(address, { contactName: '', company: '', address1: '', address2: '', city: '', region: '', postalCode: '', countryCode: 'CA', phone: '', email: '', residential: false })
  Object.assign(extras, { reference: '', poBox: false, notifications: false, save: false, search: '' })
}

const countryOptions = [
  { label: 'Canada', value: 'CA' },
  { label: 'United States', value: 'US' }
]

const sender = reactive<CanonicalAddress>({
  contactName: '',
  company: '',
  address1: '',
  address2: '',
  city: '',
  region: '',
  postalCode: '',
  countryCode: 'CA',
  phone: '',
  email: '',
  residential: false
})

const recipient = reactive<CanonicalAddress>({
  contactName: '',
  company: '',
  address1: '',
  address2: '',
  city: '',
  region: '',
  postalCode: '',
  countryCode: 'CA',
  phone: '',
  email: '',
  residential: false
})

const parcel = reactive<Package>({
  weight: 1,
  weightUnit: 'lb',
  length: 10,
  width: 8,
  height: 4,
  dimensionUnit: 'in'
})

const quotes = ref<QuoteOption[]>([])
const selectedQuoteId = ref('')
const purchasedShipment = ref<PurchasedShipment | null>(null)
const quoting = ref(false)
const purchasing = ref(false)
const toast = useToast()

interface FetchErrorData {
  statusMessage?: string
  message?: string
}

function getRequestErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== 'object' || error === null || !('data' in error)) {
    return fallback
  }

  const data = (error as { data?: FetchErrorData }).data

  return data?.statusMessage || data?.message || fallback
}

const selectedQuote = computed(() =>
  quotes.value.find((quote) => quote.id === selectedQuoteId.value)
)

const senderComplete = computed(() => Boolean(sender.contactName && sender.address1 && sender.city && sender.region && sender.postalCode))
const recipientComplete = computed(() => Boolean(recipient.contactName && recipient.address1 && recipient.city && recipient.region && recipient.postalCode))
const addressSummary = (address: CanonicalAddress) => [address.address1, address.city, address.region, address.postalCode, address.countryCode].filter(Boolean).join(', ')
const parcelSummary = computed(() => `${parcel.weight} ${parcel.weightUnit} · ${parcel.length} × ${parcel.width} × ${parcel.height} ${parcel.dimensionUnit}`)

const isInternational = computed(
  () => sender.countryCode !== recipient.countryCode
)

function shipmentPayload() {
  return {
    sender: { ...sender },
    recipient: { ...recipient },
    packages: [{ ...parcel }],
    currency: 'CAD'
  }
}

async function compareRates() {
  if (!sender.region || !recipient.region) {
    toast.add({
      title: 'Province / State required',
      description: 'Select a province or state for both sender and recipient before comparing rates.',
      color: 'warning',
      icon: 'i-lucide-map-pin'
    })
    return
  }
  purchasedShipment.value = null
  selectedQuoteId.value = ''
  quoting.value = true

  try {
    const response = await $fetch<{ quotes: QuoteOption[] }>('/api/shipping/quotes', {
      method: 'POST',
      body: shipmentPayload()
    })

    quotes.value = response.quotes
    saveAddressesToBook()
  } catch (error: unknown) {
    toast.add({ title: 'Unable to fetch rates', description: getRequestErrorMessage(error, 'Please try again.'), color: 'error', icon: 'i-lucide-circle-alert' })
  } finally {
    quoting.value = false
  }
}

async function buyLabel() {
  if (!selectedQuote.value) {
    return
  }

  purchasing.value = true

  try {
    const response = await $fetch<{ shipment: PurchasedShipment }>(
      '/api/shipping/shipments',
      {
        method: 'POST',
        body: {
          ...shipmentPayload(),
          quoteId: selectedQuote.value.id
        }
      }
    )

    purchasedShipment.value = response.shipment
  } catch (error: unknown) {
    toast.add({ title: 'Shipment could not be created', description: getRequestErrorMessage(error, 'Please try again.'), color: 'error', icon: 'i-lucide-circle-alert' })
  } finally {
    purchasing.value = false
  }
}

function swapAddresses() {
  const senderCopy = { ...sender }
  Object.assign(sender, recipient)
  Object.assign(recipient, senderCopy)
  quotes.value = []
  selectedQuoteId.value = ''
}

function money(amount: number, currency: string) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency
  }).format(amount)
}
</script>

<template>
  <div class="page-stack">
    <AppPageHeader
      eyebrow="Shipping"
      title="Create shipment"
      description="Enter the shipment once. SigmaShip compares eligible services, locks the selected rate and creates the label."
    />

    <div class="shipment-layout">
      <form class="shipment-form-stack" @submit.prevent="compareRates">
        <div class="address-pair">
        <UCard>
          <template #header>
            <div class="card-heading">
              <div><p class="eyebrow">01 / FROM</p><h2>Sender Address</h2></div>
              <UButton type="button" color="neutral" variant="ghost" icon="i-lucide-eraser" @click="clearAddress('sender')">Clear</UButton>
            </div>
          </template>
          <div class="placeholder-grid">
            <UFormField label="Address Book" class="span-2">
              <USelect v-model="senderBookSelection" class="w-full" :items="addressBookItems" placeholder="Search your saved addresses" @update:model-value="selectSavedAddress('sender', $event)" />
            </UFormField>
            <UFormField label="Company">
              <UInput v-model="sender.company" class="w-full" />
            </UFormField>
            <UFormField label="Attention / Contact name">
              <UInput v-model="sender.contactName" class="w-full" required />
            </UFormField>
            <UFormField label="Search Address" class="span-2">
              <UInput v-model="sender.address1" class="w-full" placeholder="Street address" required />
            </UFormField>
            <UFormField label="Address line 2" class="span-2">
              <UInput v-model="sender.address2" class="w-full" placeholder="Unit, suite, building (optional)" />
            </UFormField>
            <UFormField label="Country">
              <USelect v-model="sender.countryCode" class="w-full" :items="countryOptions" required @update:model-value="sender.region = ''" />
            </UFormField>
            <UFormField label="Province / State">
              <USelect v-model="sender.region" class="w-full" :items="addressOptions(sender.countryCode)" placeholder="Select province / state" required />
            </UFormField>
            <UFormField label="City">
              <UInput v-model="sender.city" class="w-full" required />
            </UFormField>
            <UFormField label="Postal / ZIP">
              <UInput v-model="sender.postalCode" class="w-full" required />
            </UFormField>
            <UFormField label="Phone">
              <UInput v-model="sender.phone" type="tel" class="w-full" required />
            </UFormField>
            <UFormField label="Email">
              <UInput v-model="sender.email" type="email" class="w-full" />
            </UFormField>
            
            <div class="span-2 address-options">
              <label><input v-model="sender.residential" type="checkbox" /> Residential address</label>
              <label><input v-model="senderExtras.notifications" type="checkbox" /> Shipment notification</label>
              <label><input v-model="senderExtras.poBox" type="checkbox" /> P.O. Box</label>
              <label><input v-model="senderExtras.save" type="checkbox" /> Save to address book</label>
            </div>
          </div>
          
        </UCard>

        <UCard>
          <template #header>
            <div class="card-heading">
              <div><p class="eyebrow">02 / TO</p><h2>Recipient Address</h2></div>
              <UButton type="button" color="neutral" variant="ghost" icon="i-lucide-eraser" @click="clearAddress('recipient')">Clear</UButton>
            </div>
          </template>
          <div class="placeholder-grid">
            <UFormField label="Address Book" class="span-2">
              <USelect v-model="recipientBookSelection" class="w-full" :items="addressBookItems" placeholder="Search your saved addresses" @update:model-value="selectSavedAddress('recipient', $event)" />
            </UFormField>
            <UFormField label="Company">
              <UInput v-model="recipient.company" class="w-full" />
            </UFormField>
            <UFormField label="Attention / Contact name">
              <UInput v-model="recipient.contactName" class="w-full" required />
            </UFormField>
            <UFormField label="Search Address" class="span-2">
              <UInput v-model="recipient.address1" class="w-full" placeholder="Street address" required />
            </UFormField>
            <UFormField label="Address line 2" class="span-2">
              <UInput v-model="recipient.address2" class="w-full" placeholder="Unit, suite, building (optional)" />
            </UFormField>
            <UFormField label="Country">
              <USelect v-model="recipient.countryCode" class="w-full" :items="countryOptions" required @update:model-value="recipient.region = ''" />
            </UFormField>
            <UFormField label="Province / State">
              <USelect v-model="recipient.region" class="w-full" :items="addressOptions(recipient.countryCode)" placeholder="Select province / state" required />
            </UFormField>
            <UFormField label="City">
              <UInput v-model="recipient.city" class="w-full" required />
            </UFormField>
            <UFormField label="Postal / ZIP">
              <UInput v-model="recipient.postalCode" class="w-full" required />
            </UFormField>
            <UFormField label="Phone">
              <UInput v-model="recipient.phone" type="tel" class="w-full" required />
            </UFormField>
            <UFormField label="Email">
              <UInput v-model="recipient.email" type="email" class="w-full" />
            </UFormField>
            <UFormField label="Reference code" class="span-2"><UInput v-model="recipientExtras.reference" class="w-full" /></UFormField>
            <div class="span-2 address-options">
              <label><input v-model="recipient.residential" type="checkbox" /> Residential address</label>
              <label><input v-model="recipientExtras.notifications" type="checkbox" /> Shipment notification</label>
              <label><input v-model="recipientExtras.poBox" type="checkbox" /> P.O. Box</label>
              <label><input v-model="recipientExtras.save" type="checkbox" /> Save to address book</label>
            </div>
          </div>
          <UAlert v-if="isInternational" class="shipping-notice" color="warning" variant="subtle" icon="i-lucide-globe-2" title="Cross-border shipment" description="Customs details are required before live international label purchase." />
        </UCard>
        <UButton class="address-swap" type="button" color="primary" variant="solid" icon="i-lucide-arrow-left-right" aria-label="Swap sender and recipient" title="Swap sender and recipient" @click="swapAddresses" />
        </div>

        <UCard>
          <template #header>
            <div class="card-heading">
              <div>
                <p class="eyebrow">03 / PACKAGE</p>
                <h2>Parcel</h2>
              </div>
              <span class="package-summary">
                {{ parcel.weight }} {{ parcel.weightUnit }} ·
                {{ parcel.length }} × {{ parcel.width }} × {{ parcel.height }} {{ parcel.dimensionUnit }}
              </span>
            </div>
          </template>

          <div class="package-grid">
            <UFormField label="Weight">
              <UInput v-model.number="parcel.weight" type="number" min="0.01" step="0.01" required />
            </UFormField>
            <UFormField label="Unit">
              <USelect v-model="parcel.weightUnit" :items="['lb', 'kg']" />
            </UFormField>
            <UFormField label="Length">
              <UInput v-model.number="parcel.length" type="number" min="0.01" step="0.01" required />
            </UFormField>
            <UFormField label="Width">
              <UInput v-model.number="parcel.width" type="number" min="0.01" step="0.01" required />
            </UFormField>
            <UFormField label="Height">
              <UInput v-model.number="parcel.height" type="number" min="0.01" step="0.01" required />
            </UFormField>
            <UFormField label="Dimensions">
              <USelect v-model="parcel.dimensionUnit" :items="['in', 'cm']" />
            </UFormField>
          </div>

          <template #footer>
            <UButton
              type="submit"
              size="xl"
              block
              icon="i-lucide-git-compare-arrows"
              :loading="quoting"
            >
              Σigma Rates
            </UButton>
          </template>
        </UCard>

        <section v-if="quotes.length" class="rate-section">
          <div class="rate-heading">
            <div>
              <p class="eyebrow">04 / COMPARE</p>
              <h2>Choose a service</h2>
            </div>
            <span>{{ quotes.length }} live sandbox rates</span>
          </div>

          <button
            v-for="quote in quotes"
            :key="quote.id"
            type="button"
            class="rate-card"
            :class="{ selected: selectedQuoteId === quote.id }"
            @click="selectedQuoteId = quote.id"
          >
            <span class="rate-radio" />
            <span class="rate-service">
              <strong>{{ quote.serviceName }}</strong>
              <small>
                {{ quote.transitDays ? `${quote.transitDays} business day${quote.transitDays === 1 ? '' : 's'}` : 'Transit calculated by carrier' }}
              </small>
            </span>
            <span class="rate-price">
              <strong>{{ money(quote.customerPrice, quote.currency) }}</strong>
              <small>{{ quote.currency }}</small>
            </span>
          </button>

          <UButton
            v-if="selectedQuote"
            size="xl"
            block
            trailing-icon="i-lucide-arrow-right"
            :loading="purchasing"
            @click="buyLabel"
          >
            Create shipment · {{ money(selectedQuote.customerPrice, selectedQuote.currency) }}
          </UButton>
        </section>

        <UCard v-if="purchasedShipment" class="shipment-success">
          <div class="success-mark">
            <UIcon name="i-lucide-check" />
          </div>
          <div>
            <p class="eyebrow">LABEL CREATED</p>
            <h2>{{ purchasedShipment.trackingNumber }}</h2>
            <p>{{ purchasedShipment.service }} · {{ money(purchasedShipment.customerCharge, purchasedShipment.currency) }}</p>
          </div>
          <UButton
            :to="purchasedShipment.labelUrl"
            target="_blank"
            color="neutral"
            variant="outline"
            icon="i-lucide-printer"
          >
            Open label
          </UButton>
        </UCard>
      </form>

      <aside class="shipment-overview">
        <UCard>
          <template #header>
            <div>
              <p class="eyebrow">Shipment overview</p>
              <h2>One shipment. One flow.</h2>
            </div>
          </template>

          <div class="overview-steps">
            <div class="overview-step" :class="{ active: senderComplete }">
              <span>1</span><div><strong>Sender · {{ senderComplete ? 'Ready' : 'Incomplete' }}</strong><p>{{ sender.contactName || 'Contact required' }}<template v-if="sender.company"> · {{ sender.company }}</template></p><p>{{ addressSummary(sender) || 'Enter origin address' }}</p></div>
            </div>
            <div class="overview-step" :class="{ active: recipientComplete }">
              <span>2</span><div><strong>Recipient · {{ recipientComplete ? 'Ready' : 'Incomplete' }}</strong><p>{{ recipient.contactName || 'Contact required' }}<template v-if="recipient.company"> · {{ recipient.company }}</template></p><p>{{ addressSummary(recipient) || 'Enter destination address' }}</p></div>
            </div>
            <div class="overview-step active">
              <span>3</span><div><strong>Package details</strong><p>{{ parcelSummary }}</p><p>{{ isInternational ? 'Cross-border shipment · customs details required for live purchase' : 'Domestic shipment' }}</p></div>
            </div>
            <div class="overview-step" :class="{ active: quotes.length }">
              <span>4</span><div><strong>Σigma Rates</strong><p>{{ quoting ? 'Comparing available services…' : quotes.length ? `${quotes.length} services available` : 'Compare available carrier services' }}</p><p v-if="selectedQuote">{{ selectedQuote.serviceName }} · {{ money(selectedQuote.customerPrice, selectedQuote.currency) }} · {{ selectedQuote.transitDays ? selectedQuote.transitDays + ' business days' : 'Transit pending' }}</p></div>
            </div>
            <div class="overview-step" :class="{ active: selectedQuote }">
              <span>5</span><div><strong>Shipment creation</strong><p>{{ purchasing ? 'Creating shipment…' : purchasedShipment ? 'Shipment created' : selectedQuote ? `Ready to purchase · ${money(selectedQuote.customerPrice, selectedQuote.currency)}` : 'Select a rate to continue' }}</p><p v-if="purchasedShipment">{{ purchasedShipment.carrier }} · {{ purchasedShipment.service }}</p></div>
            </div>
            <div class="overview-step" :class="{ active: purchasedShipment }">
              <span>6</span><div><strong>Label & tracking</strong><p>{{ purchasedShipment?.trackingNumber || 'Label and tracking available after purchase' }}</p><p v-if="purchasedShipment">Label ready · Schedule a pickup from Pick Ups</p></div>
            </div>
          </div>
        </UCard>
      </aside>
    </div>
  </div>
</template>
