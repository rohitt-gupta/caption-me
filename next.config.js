/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config) => {
		webpack: (config) => {
			config.resolve.fallback = { fs: false };
			return config;
		},
			config.module.rules.push({
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: {
					loader: "file-loader",
					options: {
						outputPath: "static/fonts/", // Change the output path as needed
					},
				},
			});
		return config;
	},
};

module.exports = nextConfig;
