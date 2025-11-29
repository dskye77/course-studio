/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    domains: ["picsum.photos", "res.cloudinary.com"],
  },
};

export default nextConfig;
