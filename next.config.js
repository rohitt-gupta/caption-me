/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config) => {
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
