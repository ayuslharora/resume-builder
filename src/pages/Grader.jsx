import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseDocument } from "../services/parser";
import { gradeResume, improveResume, rewriteResumeBullet } from "../services/groq";
import { addGraderHistoryEntry, getGraderHistory } from "../services/graderHistory";
import { useFirestore } from "../hooks/useFirestore";
import { useAuth } from "../context/AuthContext";
import {
  AlertCircle,
  Briefcase,
  CheckCircle,
  FileSearch,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  UploadCloud,
  Wand2,
} from "lucide-react";

const REVIEW_TONES = [
  "ATS strict",
  "HR recruiter",
  "Hiring manager",
  "Campus placement",
];

const breakdownLabels = [
  ["formatting", "Formatting"],
  ["keywords", "Keywords"],
  ["impact", "Impact"],
  ["clarity", "Clarity"],
];

export default function Grader() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [compareRoles, setCompareRoles] = useState("");
  const [reviewTone, setReviewTone] = useState(REVIEW_TONES[0]);
  const [history, setHistory] = useState(() => getGraderHistory());
  const [bulletRewrites, setBulletRewrites] = useState([]);
  const [selectedBullet, setSelectedBullet] = useState("");
  const [appliedRewrites, setAppliedRewrites] = useState({});
  const [rewritingBullet, setRewritingBullet] = useState(false);
  const [improvingResume, setImprovingResume] = useState(false);

  const { createResume } = useFirestore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const alternateRoles = useMemo(() => parseRoleList(compareRoles), [compareRoles]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!targetRole.trim()) {
      setError("Add the job or role you are targeting before uploading your resume.");
      e.target.value = "";
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedBullet("");
    setBulletRewrites([]);
    setAppliedRewrites({});

    try {
      const { text, metadata, fileName } = await parseDocument(file);
      if (!text.trim()) throw new Error("Document is empty.");

      const primaryContext = {
        targetRole: targetRole.trim(),
        jobDescription: jobDescription.trim(),
        reviewTone,
      };

      const [primaryGrade, comparisonGrades] = await Promise.all([
        gradeResume(text, primaryContext),
        Promise.all(
          alternateRoles.map(async (role) => ({
            role,
            grade: await gradeResume(text, {
              targetRole: role,
              jobDescription: jobDescription.trim(),
              reviewTone,
            }),
          }))
        ),
      ]);

      const extractionConfidence = metadata?.confidence || {
        label: "Medium",
        score: 70,
        note: "Text extraction completed with standard confidence.",
      };

      const combinedRisks = dedupeRiskList([
        ...(primaryGrade.atsRisks || []),
        ...buildHeuristicAtsRisks(text, metadata),
      ]);

      const nextResult = {
        fileName,
        resumeText: text,
        targetRole: targetRole.trim(),
        jobDescription: jobDescription.trim(),
        reviewTone,
        metadata,
        extractionConfidence,
        primaryGrade: { ...primaryGrade, atsRisks: combinedRisks },
        comparisons: comparisonGrades,
        bulletCandidates: deriveWeakBulletCandidates(primaryGrade.weakBullets, text),
      };

      setResult(nextResult);

      const nextHistory = addGraderHistoryEntry({
        id: `${Date.now()}`,
        createdAt: new Date().toISOString(),
        fileName,
        targetRole: primaryContext.targetRole,
        reviewTone,
        score: primaryGrade.score,
        comparisonScores: comparisonGrades.map((item) => ({
          role: item.role,
          score: item.grade.score,
        })),
      });
      setHistory(nextHistory);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleBulletRewrite = async (bullet) => {
    if (!result) return;

    setSelectedBullet(bullet);
    setRewritingBullet(true);
    setBulletRewrites([]);

    try {
      const rewriteResult = await rewriteResumeBullet(bullet, {
        targetRole: result.targetRole,
        jobDescription: result.jobDescription,
        reviewTone: result.reviewTone,
        resumeText: result.resumeText,
      });
      setBulletRewrites(rewriteResult.rewrites || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setRewritingBullet(false);
    }
  };

  const handleImproveResume = async () => {
    if (!result || !currentUser) return;

    setImprovingResume(true);
    setError(null);

    try {
      const improvedResumeData = await improveResume(result.resumeText, {
        targetRole: result.targetRole,
        jobDescription: result.jobDescription,
        reviewTone: result.reviewTone,
        rewrittenResumeText: applySelectedRewrites(result.resumeText, appliedRewrites),
      });

      const resumeId = await createResume(currentUser.uid, {
        title: `${result.targetRole} Improved Resume`,
        status: "complete",
        targetRole: result.targetRole,
        bragSheetText: result.resumeText,
        templateId: "professional",
        interviewAnswers: {
          targetRole: result.targetRole,
          targetCompanyType: "",
          experienceLevel: "",
          skillsToHighlight: (result.primaryGrade.keywordPlacementSuggestions || [])
            .map((item) => item.keyword)
            .join(", "),
          careerObjective: "",
          technologiesToEmphasize: (result.primaryGrade.keywordGaps || []).join(", "),
          preferredLength: "1-page",
          additionalContext: result.jobDescription,
        },
        resumeData: improvedResumeData,
      });

      navigate(`/builder/${resumeId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setImprovingResume(false);
    }
  };

  const handleApplyRewrite = (originalBullet, replacement) => {
    setAppliedRewrites((current) => ({
      ...current,
      [originalBullet]: replacement,
    }));
  };

  return (
    <div className="max-w-6xl mx-auto py-8 fade-in">
      <div className="text-center mb-10">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{
            background: "rgba(6,182,212,0.08)",
            border: "1px solid rgba(6,182,212,0.2)",
            boxShadow: "0 0 24px rgba(6,182,212,0.15)",
          }}
        >
          <CheckCircle size={24} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-on-surface mb-3">Resume Grader</h1>
        <p className="text-on-surface-variant max-w-3xl mx-auto">
          Grade your resume against a target job, compare alternate roles, switch recruiter lenses, inspect ATS risks,
          rewrite weak bullets, and send an improved version straight into the builder.
        </p>
      </div>

      <div
        className="p-7 md:p-10 rounded-[28px] mb-10 relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(28,36,58,0.72) 0%, rgba(17,23,40,0.62) 100%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div
          className="absolute -top-20 -right-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: "rgba(6,182,212,0.08)", filter: "blur(42px)" }}
        />

        <div className="relative">
          <div className="flex flex-col gap-7 md:gap-8 mb-7 md:mb-8">
            <div>
              <div className="text-[10px] font-bold tracking-[0.24em] uppercase text-primary/80 mb-2">
                Grading Setup
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-on-surface mb-3">
                Configure the role before you upload
              </h2>
              <p className="text-sm md:text-[15px] text-on-surface-variant max-w-2xl leading-relaxed">
                Set the target role, add comparison roles if needed, choose the review lens, and paste any key job
                requirements before uploading the resume.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 text-xs max-w-4xl">
              <SetupPill label="Target role" value="Required" />
              <SetupPill label="Comparison" value="Up to 2 roles" />
              <SetupPill label="Job notes" value="Improves grading" />
            </div>
          </div>

          <div className="h-px mb-7 md:mb-8" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))" }} />
        </div>

        <div className="relative grid grid-cols-1 xl:grid-cols-[1.08fr_0.92fr] gap-6 md:gap-8">
          <InputCard
            label="Target Job"
            icon={<Briefcase size={18} className="text-primary shrink-0" />}
            control={
              <input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Frontend Developer Intern"
                className="w-full bg-transparent outline-none text-sm text-on-surface placeholder:text-on-surface-variant"
              />
            }
          />

          <InputCard
            label="Review Lens"
            icon={<Sparkles size={18} className="text-primary shrink-0" />}
            control={
              <select
                value={reviewTone}
                onChange={(e) => setReviewTone(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-on-surface"
              >
                {REVIEW_TONES.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            }
          />
        </div>

        <div className="relative grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 mt-6 md:mt-8">
          <InputCard
            label="Compare Roles"
            icon={<Target size={18} className="text-primary shrink-0 mt-0.5" />}
            control={
              <textarea
                value={compareRoles}
                onChange={(e) => setCompareRoles(e.target.value)}
                placeholder={"Product Analyst\nData Analyst"}
                className="w-full min-h-[128px] resize-none bg-transparent outline-none text-sm leading-relaxed text-on-surface placeholder:text-on-surface-variant"
              />
            }
          />
          <InputCard
            label="Job Notes"
            icon={<FileSearch size={18} className="text-primary shrink-0 mt-0.5" />}
            control={
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the JD, must-have skills, or company expectations."
                className="w-full min-h-[128px] resize-none bg-transparent outline-none text-sm leading-relaxed text-on-surface placeholder:text-on-surface-variant"
              />
            }
          />
        </div>
      </div>

      {!result && !loading && (
        <div className="mt-3 md:mt-5 space-y-4">
          <div className="px-1">
            <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-on-surface-variant mb-2">
              Your Resume
            </div>
            <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              Upload the document you want graded after the role setup is in place. PDFs, DOCX files, and plain text
              resumes are supported.
            </p>
          </div>

          <div
            className="min-h-[20rem] rounded-[26px] px-8 py-10 md:px-10 md:py-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group"
            style={{
              background: "rgba(25,31,49,0.4)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "2px dashed rgba(255,255,255,0.1)",
            }}
            onClick={() => document.getElementById("grader-upload").click()}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(6,182,212,0.4)";
              e.currentTarget.style.boxShadow = "0 0 32px rgba(6,182,212,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              className="w-18 h-18 rounded-full flex items-center justify-center mb-6 transition-transform duration-200 group-hover:scale-110"
              style={{ background: "rgba(25,31,49,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <UploadCloud size={30} className="text-on-surface-variant group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2 text-center">Select Resume Document</h3>
            <p className="text-sm text-on-surface-variant text-center max-w-xl px-2 leading-relaxed">
              Supports `.pdf`, `.docx`, and `.txt`. Scanned PDFs fall back to OCR automatically when embedded text is
              missing.
            </p>
            <div className="text-xs text-primary/80 font-medium mt-5">Click anywhere in this panel to choose a file</div>
            <input id="grader-upload" type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
          </div>
        </div>
      )}

      {loading && (
        <div
          className="h-64 rounded-2xl flex flex-col items-center justify-center"
          style={{
            background: "rgba(25,31,49,0.4)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="relative w-12 h-12 mb-6">
            <div className="absolute inset-0 rounded-full" style={{ border: "2px solid rgba(6,182,212,0.15)" }} />
            <div
              className="absolute inset-0 rounded-full animate-spin"
              style={{ border: "2px solid transparent", borderTopColor: "#06b6d4" }}
            />
          </div>
          <p className="text-sm font-semibold text-on-surface animate-pulse">
            Parsing your resume, comparing roles, and generating rewrite guidance...
          </p>
        </div>
      )}

      {error && (
        <div
          className="p-5 rounded-xl flex flex-col items-center mb-6"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <AlertCircle size={24} className="text-red-400 mb-2" />
          <p className="text-sm font-medium text-red-400 text-center">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6 fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
            <div
              className="p-8 md:p-10 rounded-xl"
              style={{
                background: "rgba(25,31,49,0.5)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-3">
                    Overall Score
                  </div>
                  <h2 className="text-2xl font-bold text-on-surface leading-tight">
                    Fit for {result.targetRole}
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-2">
                    Lens: {result.reviewTone} · File: {result.fileName}
                  </p>
                </div>
                <div className={`text-5xl font-black tracking-tight ${getScoreClass(result.primaryGrade.score)}`}>
                  {result.primaryGrade.score}
                </div>
              </div>
              <p className="text-on-surface-variant leading-relaxed mb-4">{result.primaryGrade.summary}</p>
              <p className="text-sm text-on-surface leading-relaxed mb-4">{result.primaryGrade.fitAssessment}</p>
              <div className="text-xs text-primary/80 font-medium">
                {result.primaryGrade.tonePerspective}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <MetricCard title="ATS Breakdown" icon={<Sparkles size={18} className="text-primary" />}>
                <div className="space-y-4">
                  {breakdownLabels.map(([key, label]) => (
                    <ScoreBar key={key} label={label} score={result.primaryGrade.atsBreakdown?.[key] ?? 0} />
                  ))}
                </div>
              </MetricCard>

              <MetricCard title="Parsing Confidence" icon={<FileSearch size={18} className="text-primary" />}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-on-surface">{result.extractionConfidence.label}</span>
                  <span className="text-sm text-on-surface-variant">{result.extractionConfidence.score}/100</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${result.extractionConfidence.score}%`,
                      background: "linear-gradient(90deg, #06b6d4 0%, #67e8f9 100%)",
                    }}
                  />
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">{result.extractionConfidence.note}</p>
                {result.metadata?.extractionWarning && (
                  <p className="text-xs text-orange-300 mt-3">{result.metadata.extractionWarning}</p>
                )}
              </MetricCard>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <FeedbackCard title="What’s Working" icon={<CheckCircle size={18} className="text-primary" />}>
              {(result.primaryGrade.strengths || []).map((item, i) => (
                <ListItem key={i} tone="primary" text={item} />
              ))}
            </FeedbackCard>

            <FeedbackCard title="Missing Keywords" icon={<AlertCircle size={18} className="text-orange-400" />}>
              {(result.primaryGrade.keywordGaps?.length
                ? result.primaryGrade.keywordGaps
                : ["No major keyword gaps identified for the selected role."]).map((item, i) => (
                <ListItem key={i} tone="warning" text={item} />
              ))}
            </FeedbackCard>

            <FeedbackCard title="Role Comparison" icon={<Target size={18} className="text-primary" />}>
              <div className="space-y-3">
                <RoleScoreRow role={result.targetRole} score={result.primaryGrade.score} primary />
                {(result.comparisons || []).map((item) => (
                  <RoleScoreRow key={item.role} role={item.role} score={item.grade.score} />
                ))}
              </div>
            </FeedbackCard>

            <FeedbackCard title="Report History" icon={<RefreshCw size={18} className="text-primary" />}>
              <div className="space-y-3">
                {history.slice(0, 4).map((entry) => (
                  <div key={entry.id} className="rounded-lg p-3" style={{ background: "rgba(7,13,31,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-on-surface">{entry.targetRole}</span>
                      <span className={`text-sm font-bold ${getScoreClass(entry.score)}`}>{entry.score}</span>
                    </div>
                    <div className="text-xs text-on-surface-variant mt-2">
                      {formatHistoryDate(entry.createdAt)} · {entry.reviewTone}
                    </div>
                  </div>
                ))}
              </div>
            </FeedbackCard>
          </div>

          <MetricCard title="Section Match Score" icon={<Target size={18} className="text-primary" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(result.primaryGrade.sectionScores || []).map((section, i) => (
                <div key={`${section.section}-${i}`} className="rounded-xl p-4" style={{ background: "rgba(7,13,31,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h4 className="text-sm font-semibold text-on-surface">{section.section}</h4>
                    <span className={`text-sm font-bold ${getScoreClass(section.score)}`}>{section.score}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{section.reason}</p>
                </div>
              ))}
            </div>
          </MetricCard>

          <MetricCard title="Keyword Injector" icon={<Sparkles size={18} className="text-primary" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(result.primaryGrade.keywordPlacementSuggestions || []).map((item, i) => (
                <div key={`${item.keyword}-${i}`} className="rounded-xl p-4" style={{ background: "rgba(7,13,31,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h4 className="text-sm font-semibold text-on-surface">{item.keyword}</h4>
                    <span className="text-xs text-primary">{item.targetSection}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-2">{item.howToAdd}</p>
                  <p className="text-sm text-on-surface">{item.example}</p>
                </div>
              ))}
            </div>
          </MetricCard>

          <MetricCard title="Resume vs Job Description" icon={<FileSearch size={18} className="text-primary" />}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <DiffColumn title="Matched Requirements" tone="primary" items={result.primaryGrade.jobMatch?.matchedRequirements || []} />
              <DiffColumn title="Partial Matches" tone="warning" items={result.primaryGrade.jobMatch?.partialMatches || []} />
              <DiffColumn title="Missing Evidence" tone="danger" items={result.primaryGrade.jobMatch?.missingEvidence || []} />
            </div>
          </MetricCard>

          <MetricCard title="ATS Risk Scanner" icon={<AlertCircle size={18} className="text-orange-400" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(result.primaryGrade.atsRisks || []).map((risk, i) => (
                <div key={`${risk.risk}-${i}`} className="rounded-xl p-4" style={{ background: "rgba(7,13,31,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h4 className="text-sm font-semibold text-on-surface">{risk.risk}</h4>
                    <span className={`text-xs font-semibold ${getRiskClass(risk.severity)}`}>{risk.severity}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{risk.details}</p>
                </div>
              ))}
            </div>
          </MetricCard>

          <MetricCard title="Top Priority Fixes" icon={<AlertCircle size={18} className="text-orange-400" />}>
            <div className="space-y-4">
              {(result.primaryGrade.priorityFixes || []).map((fix, i) => (
                <div key={i} className="rounded-xl p-4" style={{ background: "rgba(7,13,31,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <h4 className="text-sm font-semibold text-on-surface mb-2">{fix.issue}</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-2">{fix.whyItMatters}</p>
                  <p className="text-sm text-on-surface leading-relaxed">{fix.howToFix}</p>
                </div>
              ))}
            </div>
          </MetricCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MetricCard title="Section-by-Section Review" icon={<FileSearch size={18} className="text-primary" />}>
              <div className="space-y-4">
                {(result.primaryGrade.sectionFeedback || []).map((section, i) => (
                  <div key={i} className="rounded-xl p-4" style={{ background: "rgba(7,13,31,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <h4 className="text-sm font-semibold text-on-surface mb-2">{section.section}</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed mb-3">{section.assessment}</p>
                    <ul className="space-y-2">
                      {(section.changes || []).map((change, changeIndex) => (
                        <ListItem key={changeIndex} tone="primary" text={change} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </MetricCard>

            <MetricCard title="Suggested Rewrites" icon={<Wand2 size={18} className="text-primary" />}>
              <div className="space-y-4">
                {(result.primaryGrade.rewriteSuggestions || []).map((item, i) => (
                  <div key={i} className="rounded-xl p-4" style={{ background: "rgba(7,13,31,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-2">Before</p>
                    <p className="text-sm text-on-surface-variant leading-relaxed mb-3">{item.original}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">After</p>
                    <p className="text-sm text-on-surface leading-relaxed mb-3">{item.improved}</p>
                    <p className="text-xs text-on-surface-variant">{item.reason}</p>
                  </div>
                ))}
              </div>
            </MetricCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-6">
            <MetricCard title="Weak Bullet Rewrite Mode" icon={<Wand2 size={18} className="text-primary" />}>
              <div className="space-y-3">
                {(result.bulletCandidates || []).length > 0 ? (
                  result.bulletCandidates.map((bullet) => (
                    <button
                      key={bullet.originalBullet}
                      onClick={() => handleBulletRewrite(bullet.originalBullet)}
                      className={`w-full text-left rounded-xl p-4 transition ${
                        selectedBullet === bullet.originalBullet ? "ring-1 ring-primary/60" : ""
                      }`}
                      style={{ background: "rgba(7,13,31,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${getRiskClass(bullet.priority)}`}>
                          {bullet.priority} priority
                        </span>
                        <span className="text-[11px] text-primary">{bullet.section}</span>
                      </div>
                      <div className="text-sm text-on-surface leading-relaxed mb-2">{bullet.originalBullet}</div>
                      <div className="text-xs text-on-surface-variant">{bullet.issue}</div>
                      {appliedRewrites[bullet.originalBullet] && (
                        <div className="text-xs text-primary mt-3">Applied to improved draft</div>
                      )}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-on-surface-variant">
                    No weak bullets were identified clearly enough to rewrite individually.
                  </p>
                )}
              </div>
            </MetricCard>

            <MetricCard title="Bullet Rewrite Suggestions" icon={<Sparkles size={18} className="text-primary" />}>
              {rewritingBullet ? (
                <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <Loader2 size={16} className="animate-spin text-primary" />
                  Generating stronger bullet options...
                </div>
              ) : bulletRewrites.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-xl p-4" style={{ background: "rgba(7,13,31,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-2">Selected Bullet</p>
                    <p className="text-sm text-on-surface">{selectedBullet}</p>
                  </div>
                  {bulletRewrites.map((rewrite, i) => (
                    <div key={i} className="rounded-xl p-4" style={{ background: "rgba(7,13,31,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-sm text-on-surface leading-relaxed mb-2">{rewrite.version}</p>
                      <p className="text-xs text-primary mb-1">{rewrite.focus}</p>
                      <p className="text-xs text-on-surface-variant mb-3">{rewrite.whyItWorks}</p>
                      <button onClick={() => handleApplyRewrite(selectedBullet, rewrite.version)} className="btn-ghost">
                        Apply to Improved Draft
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">
                  Select one of the weakest bullets from the left to generate stronger, role-aware rewrites.
                </p>
              )}
            </MetricCard>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <button onClick={() => setResult(null)} className="btn-ghost">
              <RefreshCw size={16} /> Grade Another
            </button>
            <button onClick={handleImproveResume} disabled={improvingResume} className="btn-primary">
              {improvingResume ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              Improve and Open in Builder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InputCard({ label, icon, control }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-on-surface-variant">{label}</span>
      <div
        className="mt-3 flex items-start gap-3 rounded-2xl px-5 py-4 min-h-[76px] transition-colors"
        style={{
          background: "rgba(9,14,28,0.62)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {icon}
        <div className="w-full pt-0.5">{control}</div>
      </div>
    </label>
  );
}

function SetupPill({ label, value }) {
  return (
    <div
      className="rounded-2xl px-5 py-4 min-h-[88px] flex flex-col justify-center"
      style={{
        background: "rgba(9,14,28,0.52)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="text-on-surface-variant uppercase tracking-[0.18em] text-[10px] mb-2">{label}</div>
      <div className="text-on-surface font-semibold text-[15px] leading-snug">{value}</div>
    </div>
  );
}

function MetricCard({ title, icon, children }) {
  return (
    <div
      className="p-6 rounded-xl"
      style={{
        background: "rgba(25,31,49,0.5)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-2 mb-5 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {icon}
        <h3 className="font-semibold text-on-surface">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FeedbackCard({ title, icon, children }) {
  return (
    <MetricCard title={title} icon={icon}>
      <ul className="space-y-3">{children}</ul>
    </MetricCard>
  );
}

function ListItem({ text, tone }) {
  const color =
    tone === "warning"
      ? "text-orange-400"
      : tone === "danger"
      ? "text-red-400"
      : "text-primary";

  return (
    <li className="flex gap-3 text-sm text-on-surface-variant items-start">
      <span className={`${color} mt-0.5 shrink-0`}>&middot;</span>
      <span className="leading-relaxed">{text}</span>
    </li>
  );
}

function ScoreBar({ label, score }) {
  const safeScore = Math.max(0, Math.min(100, score));

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-on-surface">{label}</span>
        <span className="text-on-surface-variant">{safeScore}/100</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${safeScore}%`,
            background: "linear-gradient(90deg, #06b6d4 0%, #67e8f9 100%)",
          }}
        />
      </div>
    </div>
  );
}

function RoleScoreRow({ role, score, primary = false }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg p-3" style={{ background: "rgba(7,13,31,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div>
        <div className="text-sm text-on-surface">{role}</div>
        {primary && <div className="text-xs text-primary mt-1">Primary target</div>}
      </div>
      <div className={`text-lg font-bold ${getScoreClass(score)}`}>{score}</div>
    </div>
  );
}

function DiffColumn({ title, tone, items }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(7,13,31,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <h4 className="text-sm font-semibold text-on-surface mb-3">{title}</h4>
      <ul className="space-y-2">
        {(items.length ? items : ["No items identified."]).map((item, index) => (
          <ListItem key={index} text={item} tone={tone} />
        ))}
      </ul>
    </div>
  );
}

function parseRoleList(value) {
  return Array.from(
    new Set(
      value
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  ).slice(0, 2);
}

function deriveWeakBulletCandidates(weakBullets, text) {
  if (Array.isArray(weakBullets) && weakBullets.length > 0) {
    return weakBullets.slice(0, 8);
  }

  const lines = text
    .split("\n")
    .map((line) => line.replace(/^[•*-]\s*/, "").trim())
    .filter((line) => line.length >= 35 && line.length <= 220);

  const likelyBullets = lines
    .filter((line) => {
      const wordCount = line.split(/\s+/).length;
      return wordCount >= 6 && wordCount <= 35;
    })
    .slice(0, 8);

  return likelyBullets.map((line) => ({
    originalBullet: line,
    section: "General",
    issue: "Detected as a likely bullet, but it was not explicitly ranked by the grader.",
    priority: "medium",
  }));
}

function applySelectedRewrites(text, rewriteMap) {
  return Object.entries(rewriteMap).reduce((currentText, [original, replacement]) => {
    if (!original || !replacement) return currentText;
    return currentText.includes(original)
      ? currentText.replace(original, replacement)
      : currentText;
  }, text);
}

function buildHeuristicAtsRisks(text, metadata) {
  const risks = [];
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const longLines = lines.filter((line) => line.length > 140);

  if (metadata?.usedOcr) {
    risks.push({
      risk: "OCR-dependent parsing",
      severity: "high",
      details: "This report relied on OCR fallback. Recruiter and ATS parsing may miss or distort some content in scanned PDFs.",
    });
  }

  if (longLines.length > 4) {
    risks.push({
      risk: "Dense bullet formatting",
      severity: "medium",
      details: "Several extracted lines are unusually long, which often signals bulky bullets or compressed formatting that weakens skimmability.",
    });
  }

  if (!/\b(project|experience|education|skills)\b/i.test(text)) {
    risks.push({
      risk: "Weak section labeling",
      severity: "medium",
      details: "Common resume section headings were not clearly detected in the extracted text, which can hurt ATS section mapping.",
    });
  }

  return risks;
}

function dedupeRiskList(risks) {
  const seen = new Set();
  return risks.filter((risk) => {
    const key = `${risk.risk}-${risk.details}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getScoreClass(score) {
  if (score >= 80) return "text-primary";
  if (score >= 50) return "text-orange-400";
  return "text-red-400";
}

function getRiskClass(severity = "medium") {
  if (severity === "high") return "text-red-400";
  if (severity === "low") return "text-primary";
  return "text-orange-400";
}

function formatHistoryDate(value) {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}
