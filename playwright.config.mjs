const config = {
  timeout: 30000,
  use: {
    baseURL: "http://localhost:3000",
    extraHTTPHeaders: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  },
  reporter: [["html"], ["json", { outputFile: "test-results/results.json" }]],
};

export default config;
