import { GoogleGenerativeAI } from "@google/generative-ai";
import { JournalEntry } from "../types";

// Vite'те API ачкычты туура чакыруу (import.meta.env колдонулат)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// 404 катасын болтурбоо үчүн туура моделди колдонобуз: gemini-1.5-flash
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5"
});

export const getDailyReflection = async (entry: JournalEntry): Promise<string> => {
  try {
    const completedDeeds = entry.goodDeeds
      .filter(d => d.completed)
      .map(d => d.label)
      .join(", ");

    const prompt = `
      Колдонуучунун Орозо күндөлүгү боюнча маалымат:
      Күн: ${entry.date}
      Орозо кармадыбы: ${entry.isFasting ? 'Ооба' : 'Жок'}
      Ниет: ${entry.intention}
      Куран: ${entry.quranPages} бет
      Жасаган жакшы иштери: ${completedDeeds || 'Азырынча белгилене элек'}

      Бул маалыматтын негизинде колдонуучуга Рамазан 2026 үчүн мотивация берүүчү, жылуу сөз жана рухий кеңеш (кыргыз тилинде) жазып бериңиз. 
      Хадистерден мисал келтириңиз. Жооп кыска болсун.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text(); 
  } catch (error) {
    console.error("Reflection Error:", error);
    return "Ниеттериңиз кабыл болсун! Бүгүнкү күнүңүз берекелүү болсун!";
  }
};

export const getDailyChallenge = async (dayNumber: number): Promise<string> => {
  try {
    const prompt = `Рамазандын ${dayNumber}-күнү үчүн бир кичинекей, бирок сооптуу "жакшы иш" чакырыгын ойлоп табыңыз. Мисалы: "Бүгүн кошунаңызга таттуу бериңиз". Кыргыз тилинде, бир сүйлөм.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Challenge Error:", error);
    return "Бүгүн бир адамга жылмаюу тартуулаңыз.";
  }
};

export const askSpiritualGuide = async (question: string): Promise<string> => {
  try {
    const prompt = `Сиз ислам адеп-ахлагы жана Орозо боюнча насаатчысыз. Суроого кыргыз тилинде, жылуу жана туура жооп бериңиз: ${question}`;
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { 
        temperature: 0.8,
        maxOutputTokens: 500
      }
    });
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Guide Error:", error);
    return "Кечириңиз, байланыш үзүлүп жатат. Кайра аракет кылып көрүңүз.";
  }
};