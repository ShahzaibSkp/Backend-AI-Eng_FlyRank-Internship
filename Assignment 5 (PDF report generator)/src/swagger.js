module.exports = {
  openapi: "3.0.3",
  info: { title: "PDF Report Generator", version: "1.0.0", description: "Asynchronous sales report generation API." },
  servers: [{ url: "http://localhost:3000" }],
  paths: {
    "/health": { get: { responses: { 200: { description: "Service is healthy" } } } },
    "/reports": {
      get: { parameters: [{ name: "status", in: "query", schema: { type: "string" } }], responses: { 200: { description: "Report jobs" } } },
      post: {
        summary: "Queue a PDF report",
        requestBody: { required: false, content: { "application/json": { schema: { $ref: "#/components/schemas/ReportRequest" } } } },
        responses: { 202: { description: "Report queued" }, 400: { description: "Invalid request" } }
      }
    },
    "/reports/{id}": {
      get: { parameters: [{ $ref: "#/components/parameters/ReportId" }], responses: { 200: { description: "Report status" }, 404: { description: "Not found" } } }
    },
    "/reports/{id}/download": {
      get: { parameters: [{ $ref: "#/components/parameters/ReportId" }], responses: { 200: { description: "PDF artifact" }, 409: { description: "Not complete" } } }
    },
    "/reports/{id}/retry": {
      post: { parameters: [{ $ref: "#/components/parameters/ReportId" }], responses: { 202: { description: "Report requeued" } } }
    }
  },
  components: {
    parameters: { ReportId: { name: "id", in: "path", required: true, schema: { type: "string" } } },
    schemas: { ReportRequest: { type: "object", properties: { from: { type: "string", format: "date-time" }, to: { type: "string", format: "date-time" }, format: { type: "string", enum: ["pdf"] } } } }
  }
};
