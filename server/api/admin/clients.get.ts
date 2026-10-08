import { requirePlatformAdmin } from '../../utils/platform-admin'

export default defineEventHandler(async (event) => {
  const { service } = await requirePlatformAdmin(event)
  const { data, error } = await service
    .from('organizations')
    .select('id,name,slug,created_at,markup_percent,markup_fixed,accessorial_markup_percent,accessorial_markup_fixed')
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: `Unable to load clients: ${error.message}` })
  return { clients: data ?? [] }
})
