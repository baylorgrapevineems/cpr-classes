import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure PDF templates are bundled into the forms API serverless function
  outputFileTracingIncludes: {
    "/api/admin/classes/[id]/forms": ["./public/templates/**"],
  },
};

export default nextConfig;
