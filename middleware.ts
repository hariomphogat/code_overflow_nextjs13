/* prettier-ignore */
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/webhook/route",
    "/api/ipclient",
    "/api/ipclient/route",
    "/api/country",
    "/api/country/route",
    "/api/findjobs",
    "/api/findjobs/route",
    "/question/:id",
    "/tags",
    "/tags/:id",
    "/profile/:id",
    "/community",
    "/jobs",
  ],
  ignoredRoutes: ["/api/webhook", "/api/chatgpt"],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
