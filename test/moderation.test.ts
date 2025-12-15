import { expect, test, describe } from "bun:test";
import { moderationService } from "../src/ml/moderation.service";

describe("Moderation Service", () => {
    test("should detect toxic comment", async () => {
        // "You are stupid" is usually detected as toxic
        const toxic = "You are stupid and useless";
        const isToxic = await moderationService.isToxic(toxic);
        expect(isToxic).toBe(true);
    }, 20000); // Higher timeout for model loading

    test("should allow safe comment", async () => {
        const safe = "Hello, have a nice day";
        const isToxic = await moderationService.isToxic(safe);
        expect(isToxic).toBe(false);
    });
});
