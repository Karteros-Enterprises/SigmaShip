import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireShippingContext } from '../../../utils/shipping-context'

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      "'": '&apos;',
      '"': '&quot;'
    }

    return entities[character] ?? character
  })
}

export default defineEventHandler(async (event) => {
  const { organizationId } = await requireShippingContext(event)
  const shipmentId = getRouterParam(event, 'id')

  if (!shipmentId) {
    throw createError({ statusCode: 400, statusMessage: 'Shipment ID required.' })
  }

  const service = serverSupabaseServiceRole<Database>(event)
  const { data: shipment } = await service
    .from('shipments')
    .select('id, tracking_number, service, sender_address, recipient_address')
    .eq('id', shipmentId)
    .eq('organization_id', organizationId)
    .maybeSingle()

  if (!shipment?.tracking_number) {
    throw createError({ statusCode: 404, statusMessage: 'Label not found.' })
  }

  const tracking = escapeXml(shipment.tracking_number)
  const serviceName = escapeXml(shipment.service ?? 'Sandbox Service')

  setHeader(event, 'content-type', 'image/svg+xml; charset=utf-8')
  setHeader(event, 'content-disposition', `inline; filename="sigmaship-${tracking}.svg"`)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200">
    <rect width="800" height="1200" fill="white"/>
    <text x="60" y="90" font-family="Arial" font-size="54" font-weight="700">Σ SigmaShip</text>
    <line x1="60" y1="125" x2="740" y2="125" stroke="black" stroke-width="4"/>
    <text x="60" y="205" font-family="Arial" font-size="24">SANDBOX LABEL</text>
    <text x="60" y="270" font-family="Arial" font-size="34" font-weight="700">${serviceName}</text>
    <rect x="60" y="360" width="680" height="330" fill="none" stroke="black" stroke-width="5"/>
    <g fill="black">
      ${Array.from({ length: 36 }, (_, index) => {
        const width = index % 3 === 0 ? 8 : 4
        const x = 90 + index * 17
        return `<rect x="${x}" y="400" width="${width}" height="240"/>`
      }).join('')}
    </g>
    <text x="400" y="750" text-anchor="middle" font-family="monospace" font-size="38" font-weight="700">${tracking}</text>
    <text x="60" y="1080" font-family="Arial" font-size="22">Proof-of-concept carrier label — not valid for transport.</text>
  </svg>`
})
