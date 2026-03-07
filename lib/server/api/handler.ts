import { fail } from "@/lib/api-response";
import { ApiError } from "@/lib/server/api/errors";

type AnyAsyncRouteHandler<TArgs extends unknown[]> = (...args: TArgs) => Promise<Response>;

export const withApiRoute =
  <TArgs extends unknown[]>(handler: AnyAsyncRouteHandler<TArgs>): AnyAsyncRouteHandler<TArgs> =>
  async (...args: TArgs) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "digest" in error &&
        (error as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE"
      ) {
        throw error;
      }

      if (error instanceof ApiError) {
        return fail(error.message, error.status, {
          code: error.code,
          details: error.details
        });
      }

      console.error("[api-route-error]", error);
      return fail("Internal server error", 500, { code: "INTERNAL_SERVER_ERROR" });
    }
  };
