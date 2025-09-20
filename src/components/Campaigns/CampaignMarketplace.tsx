import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, XCircle, RefreshCw, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateContent as geminiGenerateContent } from '../../lib/gemini';
import jsPDF from 'jspdf';

interface ATSResult {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  refined_resume: string;
}

export function CampaignMarketplace() {
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);

  const checkATSScore = async () => {
    if (!resumeText || !jobDescription) {
      toast.error('Please provide both your resume and a job description.');
      return;
    }
    setLoading(true);
    setAtsResult(null);

    try {
      const prompt = `
        Analyze the following resume against the job description. 
        Provide an ATS score, a summary, strengths, areas for improvement, and a refined version of the resume.
        Format the output as a JSON object with this exact structure:
        {
          "score": <number between 0-100>,
          "summary": "<one-sentence summary of the match>",
          "strengths": ["<strength 1>", "<strength 2>", ...],
          "improvements": ["<improvement 1>", "<improvement 2>", ...],
          "refined_resume": "<the full text of the refined resume, formatted with newlines>"
        }

        IMPORTANT: Respond with ONLY valid JSON. Do not include markdown, explanations, or text outside the JSON.

        Resume:
        ${resumeText}

        Job Description:
        ${jobDescription}
      `;

      let raw = await geminiGenerateContent(prompt);

      // Extract JSON safely
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Invalid response from AI');
      const result: ATSResult = JSON.parse(jsonMatch[0]);

      setAtsResult(result);
      toast.success('ATS analysis complete!');
    } catch (error) {
      console.error('Error checking ATS score:', error);
      toast.error('Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadRefinedPDF = () => {
    if (!atsResult || !atsResult.refined_resume) return;
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(atsResult.refined_resume, 10, 10, { maxWidth: 190 });
    doc.save('refined_resume.pdf');
    toast.success('Refined resume downloaded!');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">ATS Resume Checker</h1>

        {/* Resume Textarea */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Paste Your Resume</label>
          <textarea
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Paste your resume here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
        </div>

        {/* Job Description Textarea */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Paste Job Description</label>
          <textarea
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <button
          onClick={checkATSScore}
          disabled={loading || !resumeText || !jobDescription}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? <><RefreshCw className="h-5 w-5 animate-spin" /><span>Analyzing...</span></> :
          <><Zap className="h-5 w-5" /><span>Check ATS Score</span></>}
        </button>
      </motion.div>

      {atsResult && (
        <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <p className="text-xl font-bold mb-2">ATS Match Score: {atsResult.score}%</p>
          <p className="mb-4">{atsResult.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2"/>Strengths</h3>
              <ul className="list-disc list-inside text-sm">{atsResult.strengths.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center"><XCircle className="h-5 w-5 text-red-500 mr-2"/>Improvements</h3>
              <ul className="list-disc list-inside text-sm">{atsResult.improvements.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Refined Resume</h3>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap">{atsResult.refined_resume}</pre>
          </div>

          <button onClick={downloadRefinedPDF} className="flex items-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700">
            <Download className="h-5 w-5"/>
            <span>Download Refined PDF</span>
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
