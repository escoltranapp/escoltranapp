// Regras manuais: quando deals vêm do WhatsApp via Meta sem UTM,
// infere UTM a partir do prefixo do título
export const MANUAL_CAMPAIGN_RULES: Array<{
  test: (titulo: string) => boolean
  utm_source: string
  utm_medium: string
  utm_campaign: string
}> = [
  {
    test: (titulo) => titulo?.startsWith('HMI - '),
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: 'Meta Ads - HMI',
  },
  {
    test: (titulo) => titulo?.toLowerCase().includes('google'),
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'Google Ads Search',
  }
]

export function normalizeSourceLabel(raw?: string | null): string {
  if (!raw) return 'Direto'
  const s = raw.toLowerCase()
  if (['facebook', 'fb', 'meta', 'instagram', 'ig'].includes(s)) return 'Meta Ads'
  if (['google', 'gads', 'google-ads'].includes(s)) return 'Google Ads'
  if (s === 'organic' || s === 'organico') return 'Orgânico'
  if (s === 'direct' || s === 'direto') return 'Direto'
  if (s === 'whatsapp') return 'WhatsApp'
  return raw
}

export function getProductGroup(titulo?: string | null): 'HMI' | 'Sistema' | 'other' {
  if (!titulo) return 'other'
  if (titulo.startsWith('HMI')) return 'HMI'
  if (/sistema/i.test(titulo)) return 'Sistema'
  return 'other'
}

export interface DealUTM {
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  utmContent?: string | null
  utmTerm?: string | null
  titulo?: string | null
}

export function classifyDeal(deal: DealUTM): DealUTM {
  if (deal.utmSource) return deal
  for (const rule of MANUAL_CAMPAIGN_RULES) {
    if (rule.test(deal.titulo ?? '')) {
      return {
        ...deal,
        utmSource: rule.utm_source,
        utmMedium: rule.utm_medium,
        utmCampaign: rule.utm_campaign,
      }
    }
  }
  return deal
}

export interface ContactUTM {
  utmSourceFirst?: string | null
  utmMediumFirst?: string | null
  utmCampaignFirst?: string | null
  utmContentFirst?: string | null
}

export function classifyContact(contact: ContactUTM, dealTitle?: string): ContactUTM {
  if (contact.utmSourceFirst) return contact
  for (const rule of MANUAL_CAMPAIGN_RULES) {
    if (rule.test(dealTitle ?? '')) {
      return {
        ...contact,
        utmSourceFirst: rule.utm_source,
        utmMediumFirst: rule.utm_medium,
        utmCampaignFirst: rule.utm_campaign,
      }
    }
  }
  return contact
}
