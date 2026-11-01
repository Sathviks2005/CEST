import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { EXERCISES } from '../data/exerciseData';
import { exerciseService } from '../services/exerciseService';
import { ExerciseHeader } from '../components/exercise/ExerciseHeader';
import { ExerciseInstructions } from '../components/exercise/ExerciseInstructions';
import { ExerciseResult } from '../components/exercise/ExerciseResult';
import { AttentionGridExercise } from '../components/exercise/AttentionGridExercise';
import { SequenceMemoryExercise } from '../components/exercise/SequenceMemoryExercise';
import { ProblemSolvingExercise } from '../components/exercise/ProblemSolvingExercise';

export const ExercisePage = () => {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Location state passed from PHQ-9 result page
  const assessmentMeta = location.state || {};

  const exerciseConfig = EXERCISES[exerciseId];

  const [phase, setPhase] = useState('instructions'); // 'instructions' | 'playing' | 'completed'
  const [resultData, setResultData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Reset view if route changes
    setPhase('instructions');
    setResultData(null);
  }, [exerciseId]);

  if (!exerciseConfig) {
    return (
      <div className="py-16 text-center space-y-4 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Exercise Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested CET-informed cognitive activity "{exerciseId}" does not exist.
        </p>
        <button
          type="button"
          onClick={() => navigate('/dashboard/self')}
          className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleStartExercise = () => {
    setPhase('playing');
  };

  const handleCompleteExercise = async (gameMetrics) => {
    setIsSubmitting(true);
    const payload = {
      assessmentId: assessmentMeta.assessmentId || null,
      assessmentType: 'PHQ-9 Patient Depression Questionnaire',
      assessmentScore: assessmentMeta.assessmentScore || null,
      assessmentSeverity: assessmentMeta.assessmentSeverity || '',
      exerciseId: exerciseConfig.id,
      exerciseName: exerciseConfig.name,
      cognitiveDomain: exerciseConfig.domain,
      difficulty: exerciseConfig.difficulty,
      score: gameMetrics.score,
      maxScore: gameMetrics.maxScore || 100,
      accuracy: gameMetrics.accuracy,
      timeTaken: gameMetrics.timeTaken,
      attempts: gameMetrics.attempts || 1,
      hintsUsed: gameMetrics.hintsUsed || 0,
      metrics: gameMetrics.metrics || {},
    };

    setResultData(payload);
    setPhase('completed');

    try {
      await exerciseService.submitResult(payload);
    } catch (err) {
      console.error('Error submitting exercise result:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTryAgain = () => {
    setResultData(null);
    setPhase('playing');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard/self');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {phase === 'instructions' && (
        <ExerciseInstructions
          title={exerciseConfig.name}
          domain={exerciseConfig.domain}
          difficulty={exerciseConfig.difficulty}
          estimatedDuration={exerciseConfig.estimatedDuration}
          instructions={exerciseConfig.instructions}
          shortDescription={exerciseConfig.shortDescription}
          onStart={handleStartExercise}
        />
      )}

      {phase === 'playing' && (
        <div className="space-y-6">
          <ExerciseHeader
            title={exerciseConfig.name}
            domain={exerciseConfig.domain}
            difficulty={exerciseConfig.difficulty}
            estimatedDuration={exerciseConfig.estimatedDuration}
            onExit={() => setPhase('instructions')}
          />

          {exerciseId === 'attention-grid' && (
            <AttentionGridExercise
              onComplete={handleCompleteExercise}
              onExit={() => setPhase('instructions')}
            />
          )}

          {exerciseId === 'sequence-memory' && (
            <SequenceMemoryExercise
              onComplete={handleCompleteExercise}
              onExit={() => setPhase('instructions')}
            />
          )}

          {exerciseId === 'problem-solving' && (
            <ProblemSolvingExercise
              onComplete={handleCompleteExercise}
              onExit={() => setPhase('instructions')}
            />
          )}
        </div>
      )}

      {phase === 'completed' && resultData && (
        <ExerciseResult
          score={resultData.score}
          maxScore={resultData.maxScore}
          accuracy={resultData.accuracy}
          timeTaken={resultData.timeTaken}
          attempts={resultData.attempts}
          cognitiveDomain={resultData.cognitiveDomain}
          exerciseName={resultData.exerciseName}
          onTryAgain={handleTryAgain}
          onBackToDashboard={handleBackToDashboard}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
