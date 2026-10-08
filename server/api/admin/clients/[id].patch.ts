import { z } from 'zod'
import { requirePlatformAdmin } from '../../../utils/platform-admin'

const schema = z.object({
  markupPercent: z.number().min(0).max(1000),
  markupFixed: z.number().min(0).max(100000),
  accessorialMarkupPercent: z.number().min(0).max(1000),
  accessorialMarkupFixed: z.number().min(0).max(100000)
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Client id is required.' })
  const { service, user } = await requirePlatformAdmin(event)
  const body = schema.parse(await readBody(event))
  const { data, error } = await service.from('organizations').update({
    markup_percent: body.markupPercent,
    markup_fixed: body.markupFixed,
    accessorial_markup_percent: body.accessorialMarkupPercent,
    accessorial_markup_fixed: body.accessorialMarkupFixed
  }).eq('id', id).select('id,name,slug,markup_percent,markup_fixed,accessorial_markup_percent,accessorial_markup_fixed').single()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  await service.from('audit_events').insert({ organization_id: id, actor_user_id: user.id, action: 'client.markup.updated', entity_type: 'organization', entity_id: id, metadata: body })
  return { client: data }
})
