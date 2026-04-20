const MEMBER_IDS = [
  "mom",
  "dad",
  "grandpa",
  "grandma",
  "daughter1",
  "daughter2",
  "son",
  "helperA",
  "helperB",
  "helperC",
  "driver",
  "driverLei",
  "chef",
  "kk"
];

const LOCATION_IDS = [
  "none",
  "floor1-kitchen",
  "floor1-dining",
  "floor1-living",
  "floor1-study",
  "floor1-bathroom",
  "floor1-golf",
  "floor1-golf-bathroom",
  "floor2-living",
  "floor2-mom-bedroom",
  "floor2-grandparents-bedroom",
  "floor2-angela-bedroom",
  "floor2-alisa-bedroom",
  "floor2-aron-bedroom",
  "outdoor-lawn",
  "outdoor-parking",
  "outdoor-water"
];

const taskPlanSchema = {
  type: "object",
  additionalProperties: false,
  required: ["actions"],
  properties: {
    actions: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "kind",
          "title",
          "date",
          "time",
          "location",
          "personIds",
          "assigneeIds",
          "rideMode",
          "driverId",
          "prep",
          "note"
        ],
        properties: {
          kind: { type: "string", enum: ["task", "linked_schedule", "feedback"] },
          title: { type: "string" },
          date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
          time: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
          location: { type: "string", enum: LOCATION_IDS },
          personIds: {
            type: "array",
            items: { type: "string", enum: MEMBER_IDS }
          },
          assigneeIds: {
            type: "array",
            items: { type: "string", enum: MEMBER_IDS }
          },
          rideMode: { type: "string", enum: ["no", "yes", "dropoff", "pickup"] },
          driverId: { type: "string", enum: ["driver", "driverLei"] },
          prep: { type: "string" },
          note: { type: "string" }
        }
      }
    }
  }
};

function buildPrompt(payload) {
  return [
    "你是一个家庭任务小助手，只把自然语言解析成 JSON，不要输出解释。",
    "家庭成员 ID：mom=妈妈/张老师/张辉，dad=爸爸，grandpa=姥爷/外公，grandma=姥姥/外婆，daughter1=Angela/安安/李馨逸，daughter2=Alisa/玥/月月/玥玥/李馨玥，son=Aron/康康/李兴睿，helperA=服务员A/佣人A/阿姨A，helperB=服务员B/佣人B/阿姨B，helperC=服务员C/佣人C/阿姨C，driver=陈管家/陈先生/陈小峰/陈晓峰/小陈，driverLei=司机阿磊，chef=齐厨师，kk=家庭教师KK。",
    "地点 ID：none=不指定地点，floor1-kitchen=厨房，floor1-dining=餐厅，floor1-living=大客厅，floor1-study=书房，floor1-bathroom=卫生间，floor1-golf=高尔夫球房间，floor1-golf-bathroom=高尔夫球房间卫生间，floor2-living=二层客厅，floor2-mom-bedroom=妈妈卧室，floor2-grandparents-bedroom=姥姥姥爷卧室，floor2-angela-bedroom=Angela卧室，floor2-alisa-bedroom=Alisa卧室，floor2-aron-bedroom=Aron卧室，outdoor-lawn=草坪，outdoor-parking=停车场，outdoor-water=水系。",
    "规则：明确写了执行人/服务员/厨师/司机/陈管家，就放进 assigneeIds。活动属于某些家庭成员本人时放进 personIds。",
    "多人同一个活动，只输出一个 linked_schedule action，不要给每个执行人复制一份。",
    "如果需要接送，rideMode=yes；只送去=dropoff；只接回=pickup；不需要接送=no。接送人默认 driver。",
    "如果只是服务员、厨师、司机、陈管家自己的工作，用 kind=task，personIds 为空。",
    "如果孩子或妈妈提出吃饭、课程、出行等需求，用 linked_schedule 或 task 按实际关系处理。",
    "如果分不清谁处理，assigneeIds 用 driver，让陈管家协调。",
    "日期必须是 YYYY-MM-DD。时间必须是 HH:MM。上午但没有具体时间用 09:00，下午用 15:00，晚上用 19:00。",
    `今天是 ${payload.today}，当前页面选择日期是 ${payload.selectedDate}，说话人是 ${payload.requesterId}。`,
    `用户原话：${payload.text}`
  ].join("\n");
}

function extractOutputText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  const parts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) parts.push(content.text);
    }
  }
  return parts.join("");
}

async function parseTaskWithGPT(payload) {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error("OPENAI_API_KEY is not set");
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: "You convert household Chinese instructions into strict structured task JSON."
        },
        {
          role: "user",
          content: buildPrompt(payload)
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "family_task_plan",
          strict: true,
          schema: taskPlanSchema
        }
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error && data.error.message ? data.error.message : "OpenAI request failed");
    error.statusCode = response.status;
    throw error;
  }

  const outputText = extractOutputText(data);
  return JSON.parse(outputText);
}

module.exports = {
  parseTaskWithGPT
};
