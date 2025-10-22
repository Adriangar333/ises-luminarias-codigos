
import { GoogleGenAI } from '@google/genai';

const GEMINI_PROMPT = `Tu tarea es actuar como un experto en OCR para infraestructura urbana. Extrae el número de serie de la luminaria en la imagen. Presta mucha atención a los siguientes detalles:
1. Los números suelen estar pintados a mano y pueden estar desgastados, distorsionados o en un ángulo difícil.
2. El código suele ser de 5 dígitos.
3. Un '0' puede parecer un 'O', o incluso un 'W' o '11' si está mal pintado, como en el caso de '08390'. Sé muy cuidadoso al diferenciar.
4. Ignora cualquier otro texto o símbolo que no sea parte del código principal.
Responde únicamente con el número de serie extraído. Si no puedes determinar el número con certeza, responde con 'No encontrado'.`;

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const extractCodeFromImage = async (file: File, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API key is missing. Please provide an API key in the settings.");
  }

  const ai = new GoogleGenAI({ apiKey, vertexai: true });

  try {
    const imagePart = await fileToGenerativePart(file);
    const textPart = { text: GEMINI_PROMPT };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [imagePart, textPart]
      },
    });

    const text = response.text;
    return text.trim();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error('La clave de API no es válida. Por favor, revísala.');
        }
    }
    throw new Error('Fallo al procesar la imagen con la API de Gemini.');
  }
};
