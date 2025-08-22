/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Bỏ qua lỗi ESLint khi build (vẫn chạy lint local nếu muốn)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Cho phép build ngay cả khi có lỗi type
    ignoreBuildErrors: true,
  },
};

export default nextConfig; // nếu dùng .mjs
// module.exports = nextConfig; // nếu dùng .js
