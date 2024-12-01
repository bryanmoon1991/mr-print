import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from "@supabase/supabase-js"

export default async function handleEdgeFunctionError(error: any) {
    if (error instanceof FunctionsHttpError) {
        const errorMessage = await error.context.json()
        console.error('Edge function error: ', errorMessage)
        return {
            message: Boolean(errorMessage.error) ? errorMessage.error : JSON.stringify(errorMessage)
        }
      } else if (error instanceof FunctionsRelayError) {
        return {
            message: error.message
        }
      } else if (error instanceof FunctionsFetchError) {
        return {
            message: error.message
        }
      }
}