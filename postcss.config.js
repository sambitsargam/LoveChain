module.exports = {
  plugins: [
    require("tailwindcss"),
    require("autoprefixer"),
    require("postcss-flexbugs-fixes"),
    require("cssnano")({
      preset: "default",
    }),
  ],
};
