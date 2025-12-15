import '@tensorflow/tfjs-backend-cpu';
import * as toxicity from '@tensorflow-models/toxicity';

class ModerationService {
    private model: toxicity.ToxicityClassifier | null = null;
    private threshold = 0.9; // 90% confidence threshold

    // Initialize the model once (Singleton/Lazy load)
    async init() {
        if (this.model) return;

        console.log("Loading AI Model (Toxicity)...");
        try {
            this.model = await toxicity.load(this.threshold, []);
            console.log("AI Model Loaded Successfully!");
        } catch (error) {
            console.error("Failed to load AI Model:", error);
            throw error;
        }
    }

    async isToxic(text: string): Promise<boolean> {
        if (!this.model) {
            await this.init();
        }

        try {
            // toxicity model manages memory internally for its predictions
            const predictions = await this.model!.classify([text]);

            // If any category (insult, threat, etc.) is a match
            return predictions.some(p => p.results[0].match === true);
        } catch (error) {
            console.error("Error during toxicity classification:", error);
            // Fail safe: accept comment if detection fails, or reject? 
            // Better to log and maybe accept to avoid blocking users due to ML errors, 
            // but strict moderation might prefer reject. Let's return false (not toxic) but log error.
            return false;
        }
    }
}

export const moderationService = new ModerationService();
