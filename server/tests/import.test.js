import { jest } from "@jest/globals"; 
import request from "supertest";

global.mockGenerateContent = jest.fn();

jest.unstable_mockModule("@google/genai", () => {
  return {
    GoogleGenAI: class {
      constructor() {
        this.models = {
          generateContent: async (...args) => {
            return global.mockGenerateContent(...args);
          },
        };
      }
    },
  };
});


const { default: app } = await import("../app.js");

describe("GrowEasy CRM AI Pipeline Endpoint Evaluation", () => {
  beforeEach(() => {
    global.mockGenerateContent.mockClear();
  });

  
  test("Should automatically skip records missing both email and mobile details", async () => {
    
    const simulatedGeminiOutput = JSON.stringify({
      totalImported: 0,
      totalSkipped: 1,
      records: []
    });

    
    global.mockGenerateContent.mockResolvedValue({
      text: simulatedGeminiOutput
    });

    const invalidCsvContent = "Full Name,Email Address,Phone\nSpam Lead,,";
    const csvBuffer = Buffer.from(invalidCsvContent, "utf-8");

    const response = await request(app)
      .post("/api/v1/csvimpoter/import")
      .attach("csvfile", csvBuffer, "invalid_leads.csv"); 

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.totalSkipped).toBe(1);
    expect(response.body.data.totalImported).toBe(0);
  });


  test("Should accept a valid CSV file and return correct GrowEasy CRM layout", async () => {
    const simulatedGeminiOutput = JSON.stringify({
      totalImported: 1,
      totalSkipped: 0,
      records: [
        {
          created_at: "2026-05-13 14:35:22",
          name: "Priya Singh",
          email: "priya.singh@example.com",
          country_code: "+91",
          mobile_without_country_code: "1234567890",
          company: "Enterprise Corp",
          crm_status: "SALE_DONE",
          data_source: "leads_on_demand"
        }
      ]
    });

    global.mockGenerateContent.mockResolvedValue({
      text: simulatedGeminiOutput
    });

    const validCsvContent = "Name,Mail,Contact,Org,Status\nPriya Singh,priya.singh@example.com,911234567890,Enterprise Corp,Won";
    const csvBuffer = Buffer.from(validCsvContent, "utf-8");

    const response = await request(app)
      .post("/api/v1/csvimpoter/import")
      .attach("csvfile", csvBuffer, "clean_leads.csv");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.records[0].crm_status).toBe("SALE_DONE");
    expect(response.body.data.records[0].name).toBe("Priya Singh");
  });

 
  test("Should gracefully return a 500 status code block if the Gemini API breaks", async () => {
   
    global.mockGenerateContent.mockRejectedValue(new Error("Gemini quota exceeded or server down"));

    const validCsvContent = "Name,Mail\nAmanda Smith,amanda@example.com";
    const csvBuffer = Buffer.from(validCsvContent, "utf-8");

    const response = await request(app)
      .post("/api/v1/csvimpoter/import")
      .attach("csvfile", csvBuffer, "crash_test.csv");

    expect(response.status).toBe(500);
   
    expect(response.body.message || response.body.error).toBeDefined();
  });
});