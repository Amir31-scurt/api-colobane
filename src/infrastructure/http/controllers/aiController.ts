import { Request, Response } from "express";

/**
 * Generates a professional store description based on name and keywords.
 * In a production environment, this would call an LLM like Gemini or OpenAI.
 */
export async function generateDescriptionController(req: Request, res: Response) {
    try {
        const { storeName, keywords } = req.body;

        if (!storeName || !keywords) {
            return res.status(400).json({ error: "STORE_NAME_AND_KEYWORDS_REQUIRED" });
        }

        // --- AI Implementation ---
        // If you had a GEMINI_API_KEY, you would do:
        // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        // const prompt = `Write a professional 2-3 sentence store description for "${storeName}" that sells: ${keywords}. Make it sound premium and appealing for a marketplace called Colobane.`;
        // const result = await model.generateContent(prompt);
        // const description = result.response.text();

        // --- Fallback / Simple Logic (High Quality Template) ---
        const words = keywords.split(',').map((w: string) => w.trim());
        const list = words.join(', ').replace(/, ([^,]*)$/, ' et $1'); // Nice list formatting
        
        const descriptions = [
            `Bienvenue chez ${storeName}, votre nouvelle escale incontournable sur Colobane. Nous mettons à votre disposition une sélection exclusive de ${list}, alliant authenticité et excellence pour sublimer votre quotidien.`,
            `Chez ${storeName}, la passion de la qualité rencontre le savoir-faire. Explorez notre collection dédiée aux ${list} et laissez-vous séduire par des pièces uniques, choisies avec soin pour les clients les plus exigeants de Colobane.`,
            `L'élégance et le style s'invitent chez vous avec ${storeName}. Spécialistes en ${list}, nous sommes fiers de vous présenter des articles d'exception qui racontent une histoire. Découvrez le meilleur du marché sénégalais en un clic.`,
            `${storeName} est fier de rejoindre la communauté Colobane. Notre boutique vous propose une gamme variée de ${list}, avec un engagement constant vers la satisfaction client et la durabilité de nos produits.`
        ];

        // Pick a random template or combine
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];

        // Simulate a small delay to "show the process" in UI
        await new Promise(resolve => setTimeout(resolve, 1500));

        return res.json({ description });
    } catch (error) {
        console.error("[generateDescription]", error);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
