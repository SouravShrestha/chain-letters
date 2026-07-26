import { SessionRepository } from "@/api/sessions/SessionRepository";
import { SubmissionRepository } from "@/api/submissions/SubmissionRepository";
import { LetterPickRepository } from "@/api/letter-picks/LetterPickRepository";
import { GameService } from "@/api/GameService";

// Singletons — safe to reuse across requests in the same Node.js process
export const sessionRepo = new SessionRepository();
export const submissionRepo = new SubmissionRepository();
export const letterPickRepo = new LetterPickRepository();
export const gameService = new GameService(sessionRepo, submissionRepo);
