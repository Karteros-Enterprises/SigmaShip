import { z } from 'zod'
import { requirePlatformAdmin } from '../../../../utils/platform-admin'

const schema = z.object({ active: z.boolean() })

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Client ID required.' })
  const { service, role } = await requirePlatformAdmin(event)
  if (role !== 'owner' && role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Only platform owners and administrators can change account access.' })
  }
  const { active } = schema.parse(await readBody(event))
  const { data, error } = await service.from('organizations')
    .update({ is_active: active }).eq('id', id)
    .select('id,name,is_active').single()
  if (error || !data) throw createError({ statusCode: 500, statusMessage: 'Unable to update ΣigmaSpace status.' })
  return { client: data }
})
