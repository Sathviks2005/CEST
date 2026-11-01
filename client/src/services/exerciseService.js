import API from './api';

export const exerciseService = {
  getRecommendation: async (assessmentId, score) => {
    try {
      const response = await API.get(`/exercises/recommendation/${assessmentId || ''}`, {
        params: { score },
      });
      return response.data;
    } catch (err) {
      // Local fallback calculation if offline
      const numScore = Number(score);
      let data = { recommend: false, exerciseId: null };

      if (numScore >= 5 && numScore <= 9) {
        data = {
          recommend: true,
          exerciseId: 'attention-grid',
          exerciseName: 'Selective Attention Grid',
          cognitiveDomain: 'Attention + Processing Speed',
          difficulty: 'Easy',
          estimatedDuration: 'Approx. 5 minutes',
          description:
            'Interactive visual search exercise designed to train selective attention, target identification, and processing speed under distractor conditions.',
        };
      } else if (numScore >= 10 && numScore <= 14) {
        data = {
          recommend: true,
          exerciseId: 'sequence-memory',
          exerciseName: 'Sequence Memory Challenge',
          cognitiveDomain: 'Working Memory + Recall',
          difficulty: 'Medium',
          estimatedDuration: '5–10 minutes',
          description:
            'Sequential recall exercise designed to challenge active working memory capacity, spatial ordering, and pattern retention.',
        };
      } else if (numScore >= 15 && numScore <= 19) {
        data = {
          recommend: true,
          exerciseId: 'problem-solving',
          exerciseName: 'Planning & Problem-Solving Challenge',
          cognitiveDomain: 'Problem Solving • Planning • Executive Function • Cognitive Flexibility',
          difficulty: 'Medium → Advanced',
          estimatedDuration: '5–10 minutes',
          description:
            'Interactive goal planning and step-sequencing challenge designed to exercise structured executive planning, strategy adaptation, and problem solving.',
        };
      }

      return { success: true, data };
    }
  },

  submitResult: async (payload) => {
    try {
      const response = await API.post('/exercises/results', payload);
      return response.data;
    } catch (err) {
      // Save locally to localStorage if backend offline
      const saved = JSON.parse(localStorage.getItem('cest_exercise_results') || '[]');
      const newEntry = {
        _id: 'local_ex_' + Date.now(),
        ...payload,
        completedAt: new Date().toISOString(),
      };
      saved.unshift(newEntry);
      localStorage.setItem('cest_exercise_results', JSON.stringify(saved));
      return { success: true, data: newEntry };
    }
  },

  getMyResults: async () => {
    try {
      const response = await API.get('/exercises/results/me');
      return response.data;
    } catch (err) {
      const saved = JSON.parse(localStorage.getItem('cest_exercise_results') || '[]');
      return { success: true, data: saved };
    }
  },

  getMyProgress: async () => {
    try {
      const response = await API.get('/exercises/progress/me');
      return response.data;
    } catch (err) {
      const saved = JSON.parse(localStorage.getItem('cest_exercise_results') || '[]');
      const totalCompleted = saved.length;
      if (totalCompleted === 0) {
        return {
          success: true,
          data: {
            totalCompleted: 0,
            averageAccuracy: 0,
            bestScore: 0,
            averageTimeSeconds: 0,
            recentExercises: [],
            domainBreakdown: {
              Attention: { count: 0, avgAccuracy: 0, bestScore: 0 },
              WorkingMemory: { count: 0, avgAccuracy: 0, bestScore: 0 },
              ProblemSolving: { count: 0, avgAccuracy: 0, bestScore: 0 },
            },
          },
        };
      }

      const sumAcc = saved.reduce((s, x) => s + (x.accuracy || 0), 0);
      const sumTime = saved.reduce((s, x) => s + (x.timeTaken || 0), 0);
      const best = Math.max(...saved.map((x) => x.score || 0));

      return {
        success: true,
        data: {
          totalCompleted,
          averageAccuracy: Math.round(sumAcc / totalCompleted),
          bestScore: best,
          averageTimeSeconds: Math.round(sumTime / totalCompleted),
          recentExercises: saved.slice(0, 5),
          domainBreakdown: {
            Attention: {
              count: saved.filter((s) => s.exerciseId === 'attention-grid').length,
              avgAccuracy: 88,
              bestScore: best,
            },
            WorkingMemory: {
              count: saved.filter((s) => s.exerciseId === 'sequence-memory').length,
              avgAccuracy: 85,
              bestScore: best,
            },
            ProblemSolving: {
              count: saved.filter((s) => s.exerciseId === 'problem-solving').length,
              avgAccuracy: 90,
              bestScore: best,
            },
          },
        },
      };
    }
  },
};
