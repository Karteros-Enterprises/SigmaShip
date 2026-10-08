import { requirePlatformAdmin } from '../../utils/platform-admin'
export default defineEventHandler(async(event)=>{
 const {service}=await requirePlatformAdmin(event)
 const [{data:orgs,error:o},{data:ships,error:s}]=await Promise.all([
  service.from('organizations').select('id,name,slug,created_at').order('created_at',{ascending:false}),
  service.from('shipments').select('id,organization_id,status,carrier,service,tracking_number,customer_charge,currency,created_at').order('created_at',{ascending:false}).limit(500)
 ])
 if(o||s) throw createError({statusCode:500,statusMessage:'Unable to load platform operations.'})
 return {organizations:orgs??[],shipments:ships??[]}
})
