/**
 * Bayesian inference for mastery tracking
 * Uses Bayesian updating to estimate mastery probability based on quiz performance
 */

interface Prior {
  alpha: number; // Success parameter
  beta: number; // Failure parameter
}

/**
 * Update mastery estimate using Bayesian inference
 * Uses Beta-Binomial conjugate prior for binary outcomes (correct/incorrect)
 */
export function updateMasteryEstimate(
  currentPrior: Prior,
  correctAnswers: number,
  totalQuestions: number
): {
  masteryProbability: number;
  confidence: number;
  newPrior: Prior;
} {
  const incorrectAnswers = totalQuestions - correctAnswers;
  
  // Update Beta distribution parameters
  const newPrior: Prior = {
    alpha: currentPrior.alpha + correctAnswers,
    beta: currentPrior.beta + incorrectAnswers,
  };

  // Calculate mastery probability (mean of Beta distribution)
  const masteryProbability = newPrior.alpha / (newPrior.alpha + newPrior.beta);

  // Calculate confidence (based on total observations)
  // More observations = higher confidence
  const totalObservations = newPrior.alpha + newPrior.beta;
  const confidence = Math.min(1, totalObservations / 50); // Confidence approaches 1 after ~50 observations

  return {
    masteryProbability,
    confidence,
    newPrior,
  };
}

/**
 * Get initial prior for a new topic
 * Uses uniform prior (alpha=1, beta=1) which assumes 50% mastery initially
 */
export function getInitialPrior(): Prior {
  return {
    alpha: 1,
    beta: 1,
  };
}

/**
 * Predict difficulty for next question based on mastery estimate
 */
export function predictNextDifficulty(
  masteryProbability: number,
  confidence: number
): 'easy' | 'medium' | 'hard' {
  // If low mastery, start easy
  if (masteryProbability < 0.4) {
    return 'easy';
  }
  
  // If high mastery with high confidence, use hard
  if (masteryProbability > 0.8 && confidence > 0.7) {
    return 'hard';
  }
  
  // Otherwise use medium
  return 'medium';
}

/**
 * Calculate adaptive question selection based on performance history
 */
export function calculateAdaptiveSelection(
  topicMastery: Map<string, Prior>,
  recentPerformance: Array<{ topic: string; isCorrect: boolean }>
): {
  nextTopic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reason: string;
} {
  // Update mastery estimates from recent performance
  recentPerformance.forEach(({ topic, isCorrect }) => {
    const prior = topicMastery.get(topic) || getInitialPrior();
    const update = updateMasteryEstimate(prior, isCorrect ? 1 : 0, 1);
    topicMastery.set(topic, update.newPrior);
  });

  // Find weakest topic (lowest mastery)
  let weakestTopic = '';
  let lowestMastery = 1;
  
  topicMastery.forEach((prior, topic) => {
    const mastery = prior.alpha / (prior.alpha + prior.beta);
    if (mastery < lowestMastery) {
      lowestMastery = mastery;
      weakestTopic = topic;
    }
  });

  // If no specific weak topic, use most recently incorrect
  if (!weakestTopic && recentPerformance.length > 0) {
    const lastIncorrect = recentPerformance
      .filter(p => !p.isCorrect)
      .pop();
    if (lastIncorrect) {
      weakestTopic = lastIncorrect.topic;
    }
  }

  // Default to first topic if still no selection
  if (!weakestTopic) {
    weakestTopic = Array.from(topicMastery.keys())[0] || 'general';
  }

  const prior = topicMastery.get(weakestTopic) || getInitialPrior();
  const masteryProbability = prior.alpha / (prior.alpha + prior.beta);
  const confidence = Math.min(1, (prior.alpha + prior.beta) / 50);
  const difficulty = predictNextDifficulty(masteryProbability, confidence);

  return {
    nextTopic: weakestTopic,
    difficulty,
    reason: `Focusing on ${weakestTopic} due to ${(masteryProbability * 100).toFixed(0)}% mastery (${(confidence * 100).toFixed(0)}% confidence)`,
  };
}
