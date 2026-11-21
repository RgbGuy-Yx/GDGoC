import React, { useState } from 'react';
import { addEvaluation } from '../../api/evaluationApi';
import { Award, AlertCircle, CheckCircle2 } from 'lucide-react';

export const EvaluationForm = ({ candidateId, onEvaluationAdded }) => {
  const [score, setScore] = useState(8);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 10) {
      setError('Score must be a number between 0 and 10.');
      return;
    }

    if (!remarks.trim()) {
      setError('Please provide detailed interview remarks.');
      return;
    }

    setLoading(true);
    try {
      const res = await addEvaluation(candidateId, {
        score: numScore,
        remarks: remarks.trim()
      });

      if (res.success) {
        setSuccess('Evaluation submitted and saved to history.');
        setRemarks('');
        setScore(8);
        if (onEvaluationAdded) {
          onEvaluationAdded(res.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to submit interview evaluation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 shadow-ambient">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-full bg-[#F0FDF4] border border-[#B8F7CF] text-[#166534]">
          <Award className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-sm font-semibold text-[#171717] tracking-tight">Add Interview Evaluation</h3>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-[#F0FDF4] border border-[#B8F7CF] text-xs text-[#166534]">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#7AF1A7]" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Score Slider & Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-[#171717]">Overall Score (0 - 10)</label>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F0FDF4] text-[#166534] border border-[#B8F7CF]">
              {score} / 10
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={score}
              onChange={(e) => setScore(parseFloat(e.target.value))}
              className="w-full accent-[#171717] cursor-pointer"
            />
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={score}
              onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
              className="w-16 px-2 py-1 text-xs text-center border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#171717] font-semibold text-[#171717] bg-[#FAFAFA]"
            />
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-xs font-medium text-[#171717] mb-1">
            Interview Assessment & Feedback
          </label>
          <textarea
            rows="3"
            required
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Assess technical depth, problem solving, domain proficiency, GDGoC alignment..."
            className="w-full px-3 py-2 text-xs border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#171717] text-[#171717] bg-[#FAFAFA] placeholder-[#A3A3A3]"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#171717] hover:bg-[#262626] text-white text-xs font-medium shadow-2xs active:scale-[0.99] transition-all disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Evaluation'}
        </button>
      </form>
    </div>
  );
};
