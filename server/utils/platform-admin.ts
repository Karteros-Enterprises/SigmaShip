import type { H3Event } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'
export async function requirePlatformAdmin(event:H3Event){
 const user=await serverSupabaseUser(event)
 if(!user) throw createError({statusCode:401,statusMessage:'Authentication required.'})
 const service=serverSupabaseServiceRole<Database>(event)
 const {data,error}=await service.from('platform_users' as never).select('role, active').eq('user_id',user.id).maybeSingle() as any
 if(error||!data?.active) throw createError({statusCode:403,statusMessage:'Platform administrator access required.'})
 return {user,role:data.role,service}
}
