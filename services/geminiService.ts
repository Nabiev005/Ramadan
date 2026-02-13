
import { GoogleGenAI } from "@google/genai";
import { JournalEntry } from "../types";

// Always use the process.env.API_KEY directly for initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getDailyReflection = async (entry: JournalEntry): Promise<string> => {
  try {
    const completedDeeds = entry.goodDeeds.filter(d => d.completed).map(d => d.label).join(", ");
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

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.7 },
    });

    // Directly access .text property as it is a getter, not a method
    return response.text || "Бүгүнкү күнүңүз берекелүү болсун!";
  } catch (error) {
    return "Ниеттериңиз кабыл болсун!";
  }
};

export const getDailyChallenge = async (dayNumber: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Рамазандын ${dayNumber}-күнү үчүн бир кичинекей, бирок сооптуу "жакшы иш" чакырыгын ойлоп табыңыз. Мисалы: "Бүгүн кошунаңызга таттуу бериңиз". Кыргыз тилинде, бир сүйлөм.`,
    });
    return response.text || "Бүгүн бир адамга жылмаюу тартуулаңыз.";
  } catch {
    return "Бүгүн ата-энеңизге чалып, абалын сураңыз.";
  }
};

export const askSpiritualGuide = async (question: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Сиз ислам адеп-ахлагы жана Орозо боюнча насаатчысыз. Суроого кыргыз тилинде, жылуу жана туура жооп бериңиз: ${question}`,
      config: { temperature: 0.8 },
    });
    return response.text || "Кечириңиз, суроого жооп бере албай жатам.";
  } catch (error) {
    return "Байланыш үзүлүп жатат.";
  }
};
