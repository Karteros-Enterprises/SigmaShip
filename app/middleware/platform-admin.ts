export default defineNuxtRouteMiddleware(async()=>{
 if(import.meta.server) return
 const user=useSupabaseUser()
 if(!user.value) return navigateTo('/login')
 try{ await $fetch('/api/admin/overview') }catch(error:any){
  if(error?.statusCode===403||error?.status===403) return navigateTo('/ship')
  if(error?.statusCode===401||error?.status===401) return navigateTo('/login')
 }
})
