const { parseTaskWithGPT } = require("../gpt-task-parser");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const plan = await parseTaskWithGPT(request.body || {});
    response.status(200).json(plan);
  } catch (error) {
    response.status(error.statusCode || 500).json({
      error: error.message || "GPT parsing failed"
    });
  }
};
