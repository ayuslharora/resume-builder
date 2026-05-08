import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addGraderHistoryEntry, getGraderHistory } from "../services/graderHistory";
import {
  buildSharedResumeGradeSource,
  extractShareTokenFromResumeLink,
} from "../services/sharedResumeGraderSource";
import { useFirestore } from "../hooks/useFirestore";
import { useAuth } from "../context/useAuth";
import {
  AlertCircle,
  Briefcase,
  CheckCircle,
  ClipboardList,
  Download,
  FileSearch,
  Link2,
  Loader2,
  RefreshCw,
  Send,
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

const REPORT_TABS = [
  ["overview", "Overview"],
  ["ats", "ATS"],
  ["match", "Job match"],
  ["rewrites", "Rewrites"],
  ["history", "History"],
];

async function loadParser() {
  return import("../services/parser");
}

async function loadGroq() {
  return import("../services/llm");
}

export default function Grader() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [compareRoles, setCompareRoles] = useState("");
  const [reviewTone, setReviewTone] = useState(REVIEW_TONES[0]);
  const [pastedResumeText, setPastedResumeText] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const [history, setHistory] = useState(() => getGraderHistory());
  const [bulletRewrites, setBulletRewrites] = useState([]);
  const [selectedBullet, setSelectedBullet] = useState("");
  const [appliedRewrites, setAppliedRewrites] = useState({});
  const [rewritingBullet, setRewritingBullet] = useState(false);
  const [improvingResume, setImprovingResume] = useState(false);
  const [sourceMode, setSourceMode] = useState("link");
  const [activeReportTab, setActiveReportTab] = useState("overview");

  const { createResume, getResumeByShareToken } = useFirestore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const alternateRoles = useMemo(() => parseRoleList(compareRoles), [compareRoles]);

  const ensureTargetRole = (action) => {
    if (!targetRole.trim()) {
      setError(`Add the job or role you are targeting before ${action}.`);
      return false;
    }
    return true;
  };

  const prepareForGrade = () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedBullet("");
    setBulletRewrites([]);
    setAppliedRewrites({});
    setActiveReportTab("overview");
  };

  const gradeResumeText = async ({ text, metadata, fileName }) => {
    if (!text.trim()) throw new Error("Document is empty.");

    const { gradeResume } = await loadGroq();
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
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ensureTargetRole("uploading your resume")) {
      e.target.value = "";
      return;
    }

    prepareForGrade();
    try {
      const { parseDocument } = await loadParser();
      const { text, metadata, fileName } = await parseDocument(file);
      await gradeResumeText({ text, metadata, fileName });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handlePastedTextGrade = async () => {
    if (!ensureTargetRole("grading pasted resume text")) return;

    prepareForGrade();
    try {
      await gradeResumeText({
        text: pastedResumeText,
        fileName: "Pasted Resume Text",
        metadata: {
          extractionMethod: "pasted-text",
          usedOcr: false,
          extractionWarning: null,
          confidence: {
            label: "High",
            score: 92,
            note: "This grade used text pasted directly into the grader, so OCR was not needed.",
          },
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSharedResumeLinkGrade = async () => {
    if (!ensureTargetRole("grading a ResuMe link")) return;

    const shareToken = extractShareTokenFromResumeLink(resumeLink);
    if (!shareToken) {
      setError("Paste a valid ResuMe shared resume link.");
      return;
    }

    prepareForGrade();
    try {
      const resume = await getResumeByShareToken(shareToken);
      await gradeResumeText(buildSharedResumeGradeSource(resume));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulletRewrite = async (bullet) => {
    if (!result) return;

    setSelectedBullet(bullet);
    setRewritingBullet(true);
    setBulletRewrites([]);

    try {
      const { rewriteResumeBullet } = await loadGroq();
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
      const { improveResume } = await loadGroq();
      const improvedResumeData = await improveResume(result.resumeText, {
        targetRole: result.targetRole,
        jobDescription: result.jobDescription,
        reviewTone: result.reviewTone,
        rewrittenResumeText: applySelectedRewrites(result.resumeText, appliedRewrites),
        sourceDocumentText: result.resumeText,
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

  if (result) {
    return (
      <div className="grader-page fade-in">
        <GraderReport
          result={result}
          activeTab={activeReportTab}
          setActiveTab={setActiveReportTab}
          history={history}
          selectedBullet={selectedBullet}
          bulletRewrites={bulletRewrites}
          appliedRewrites={appliedRewrites}
          rewritingBullet={rewritingBullet}
          improvingResume={improvingResume}
          onAgain={() => {
            setResult(null);
            setActiveReportTab("overview");
          }}
          onImprove={handleImproveResume}
          onBulletRewrite={handleBulletRewrite}
          onApplyRewrite={handleApplyRewrite}
        />
      </div>
    );
  }

  return (
    <div className="app-page app-page-narrow grader-page fade-in">
      <div className="mb-7">
        <div className="lbl-mono mb-2">Resume Grader</div>
        <h1 className="h-display m-0 text-[30px]">Grade your resume against any role.</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          Grade your resume against a target job, compare alternate roles, switch recruiter lenses, inspect ATS risks,
          rewrite weak bullets, and send an improved version straight into the builder.
        </p>
      </div>

      <div
        className="panel mb-4 overflow-hidden p-6"
      >
        <div className="relative">
          <div className="mb-6 flex flex-col gap-6">
            <div>
              <div className="lbl-mono mb-3">1 · Target role</div>
              <h2 className="h-display mb-2 text-[20px]">
                Configure the role before you upload
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
                Set the target role, add comparison roles if needed, choose the review lens, and paste any key job
                requirements before uploading the resume.
              </p>
            </div>

            <div className="grid max-w-4xl grid-cols-1 gap-3 text-xs md:grid-cols-3">
              <SetupPill label="Target role" value="Required" />
              <SetupPill label="Comparison" value="Up to 2 roles" />
              <SetupPill label="Job notes" value="Improves grading" />
            </div>
          </div>

          <hr className="hr mb-6" />
        </div>

        <div className="relative grid grid-cols-1 gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <InputCard
            label="Target Job"
            icon={<Briefcase size={18} className="text-primary shrink-0" />}
            control={
              <input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Frontend Developer Intern"
                className="field"
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
                className="field"
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

        <div className="relative mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <InputCard
            label="Compare Roles"
            icon={<Target size={18} className="text-primary shrink-0 mt-0.5" />}
            control={
              <textarea
                value={compareRoles}
                onChange={(e) => setCompareRoles(e.target.value)}
                placeholder={"Product Analyst\nData Analyst"}
                className="field min-h-[128px] resize-none"
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
                className="field min-h-[128px] resize-none"
              />
            }
          />
        </div>
      </div>

      {!result && !loading && (
        <div className="space-y-4">
          <div className="panel p-6">
            <div className="lbl-mono mb-4">2 · Resume source</div>
            <div className="seg mb-4 w-full max-w-[560px]">
              <button data-active={sourceMode === "link"} onClick={() => setSourceMode("link")}>
                Paste ResuMe Link
              </button>
              <button data-active={sourceMode === "text"} onClick={() => setSourceMode("text")}>
                Paste Resume Text
              </button>
              <button data-active={sourceMode === "upload"} onClick={() => setSourceMode("upload")}>
                Upload File
              </button>
            </div>

            {sourceMode === "link" && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Link2 size={16} className="text-primary shrink-0" />
                  <span className="text-sm font-medium">Paste ResuMe Link</span>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={resumeLink}
                    onChange={(e) => setResumeLink(e.target.value)}
                    placeholder="https://resume.ayuslh.in/shared/..."
                    className="field"
                  />
                  <button
                    type="button"
                    onClick={handleSharedResumeLinkGrade}
                    disabled={!resumeLink.trim()}
                    className="btn btn-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={14} /> Grade from Link
                  </button>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Best for resumes created here because it preserves structured text.
                </p>
              </div>
            )}

            {sourceMode === "text" && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <ClipboardList size={16} className="text-primary shrink-0" />
                  <span className="text-sm font-medium">Paste Resume Text</span>
                </div>
                <textarea
                  value={pastedResumeText}
                  onChange={(e) => setPastedResumeText(e.target.value)}
                  placeholder="Paste your full resume text..."
                  className="field min-h-[180px] resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handlePastedTextGrade}
                    disabled={!pastedResumeText.trim()}
                    className="btn btn-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={14} /> Grade Text
                  </button>
                </div>
              </div>
            )}

            {sourceMode === "upload" && (
              <div
                className="rounded-xl border-2 border-dashed p-8 text-center"
                style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}
                onClick={() => document.getElementById("grader-upload").click()}
              >
                <div className="sr-only">Select Resume Document</div>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
                  <UploadCloud size={18} className="text-[var(--muted)]" />
                </div>
                <div className="text-sm font-medium">Drop a file or browse</div>
                <div className="mt-1 text-xs text-[var(--muted)]">Supports PDF, DOCX, TXT</div>
                <button className="btn btn-outline mt-4">Choose file</button>
                <input id="grader-upload" type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div
          className="panel flex h-64 flex-col items-center justify-center"
        >
          <div className="relative w-12 h-12 mb-6">
            <div className="absolute inset-0 rounded-full" style={{ border: "2px solid var(--accent-soft)" }} />
            <div
              className="absolute inset-0 rounded-full animate-spin"
              style={{ border: "2px solid transparent", borderTopColor: "var(--accent)" }}
            />
          </div>
          <p className="text-sm font-medium text-[var(--text)] animate-pulse">
            Parsing your resume, comparing roles, and generating rewrite guidance...
          </p>
        </div>
      )}

      {error && (
        <div
          className="mb-6 flex flex-col items-center rounded-lg p-5"
          style={{ background: "var(--bad-soft)", border: "1px solid color-mix(in oklch, var(--bad), transparent 80%)" }}
        >
          <AlertCircle size={24} className="mb-2 text-[var(--bad)]" />
          <p className="text-center text-sm font-medium text-[var(--bad)]">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6 fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
            <div
              className="panel p-6 md:p-8"
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
                <div className={`h-display text-5xl tracking-tight ${getScoreClass(result.primaryGrade.score)}`}>
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
                <div className="scorebar mb-3">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${result.extractionConfidence.score}%`,
                      background: "var(--accent)",
                    }}
                  />
                </div>
                <p className="text-sm leading-relaxed text-[var(--muted)]">{result.extractionConfidence.note}</p>
                {result.metadata?.extractionWarning && (
                  <p className="mt-3 text-xs text-[var(--warn)]">{result.metadata.extractionWarning}</p>
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

            <FeedbackCard title="Missing Keywords" icon={<AlertCircle size={18} className="text-[var(--warn)]" />}>
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
                  <div key={entry.id} className="rounded-lg p-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
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
                <div key={`${section.section}-${i}`} className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
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
                <div key={`${item.keyword}-${i}`} className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
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

          <MetricCard title="ATS Risk Scanner" icon={<AlertCircle size={18} className="text-[var(--warn)]" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(result.primaryGrade.atsRisks || []).map((risk, i) => (
                <div key={`${risk.risk}-${i}`} className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h4 className="text-sm font-semibold text-on-surface">{risk.risk}</h4>
                    <span className={`text-xs font-semibold ${getRiskClass(risk.severity)}`}>{risk.severity}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{risk.details}</p>
                </div>
              ))}
            </div>
          </MetricCard>

          <MetricCard title="Top Priority Fixes" icon={<AlertCircle size={18} className="text-[var(--warn)]" />}>
            <div className="space-y-4">
              {(result.primaryGrade.priorityFixes || []).map((fix, i) => (
                <div key={i} className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
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
                  <div key={i} className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
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
                  <div key={i} className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
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
                      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
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
                  <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-2">Selected Bullet</p>
                    <p className="text-sm text-on-surface">{selectedBullet}</p>
                  </div>
                  {bulletRewrites.map((rewrite, i) => (
                    <div key={i} className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                      <p className="text-sm text-on-surface leading-relaxed mb-2">{rewrite.version}</p>
                      <p className="text-xs text-primary mb-1">{rewrite.focus}</p>
                      <p className="text-xs text-on-surface-variant mb-3">{rewrite.whyItWorks}</p>
                      <button onClick={() => handleApplyRewrite(selectedBullet, rewrite.version)} className="btn btn-outline">
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
            <button onClick={() => setResult(null)} className="btn btn-outline">
              <RefreshCw size={16} /> Grade Another
            </button>
            <button onClick={handleImproveResume} disabled={improvingResume} className="btn btn-accent">
              {improvingResume ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              Improve and Open in Builder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GraderReport({
  result,
  activeTab,
  setActiveTab,
  history,
  selectedBullet,
  bulletRewrites,
  appliedRewrites,
  rewritingBullet,
  improvingResume,
  onAgain,
  onImprove,
  onBulletRewrite,
  onApplyRewrite,
}) {
  const grade = result.primaryGrade || {};
  const sectionScores = grade.sectionScores || [];
  const keywordGaps = grade.keywordGaps || [];
  const parsedSections = sectionScores.length
    ? sectionScores.slice(0, 6).map((section) => section.section)
    : ["Profile", "Skills", "Experience", "Projects", "Education"];

  return (
    <section className="flex min-h-[calc(100vh-72px)] flex-col bg-[var(--surface)] text-[var(--text)]">
      <div
        className="border-b bg-[var(--bg)]"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="px-5 py-5 lg:px-10">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            <button type="button" onClick={onAgain} className="btn btn-ghost btn-sm self-start">
              <RefreshCw size={13} /> Grade another
            </button>
            <span className="v-hr hidden h-[18px] lg:block" />
            <div className="min-w-0 flex-1">
              <div className="mono truncate text-[13px] text-[var(--muted)]">
                {result.fileName} | {result.reviewTone} | vs. {result.targetRole}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-outline btn-sm"
              >
                <Download size={13} /> Export report
              </button>
              <button
                type="button"
                onClick={onImprove}
                disabled={improvingResume}
                className="btn btn-accent btn-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {improvingResume ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
                Improve in builder
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <ScoreRing value={grade.score ?? 0} />
            <div className="min-w-0">
              <div className="lbl-mono mb-1.5">Overall fit</div>
              <h1 className="h-display m-0 text-[22px] leading-tight">
                {getScoreTitle(grade.score ?? 0)}
              </h1>
              <p className="mt-2 max-w-4xl text-[13.5px] leading-relaxed text-[var(--muted)]">
                {grade.summary}
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                <span className="pill pill-good"><CheckCircle size={11} /> Tone matches lens</span>
                <span className={keywordGaps.length ? "pill pill-warn" : "pill pill-good"}>
                  <AlertCircle size={11} /> {keywordGaps.length} missing keywords
                </span>
                <span className="pill">Parsing {result.extractionConfidence?.score ?? 0}%</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 lg:items-end">
              <span className="mono text-[11.5px] text-[var(--muted)]">Sections parsed</span>
              <div className="flex max-w-[320px] flex-wrap gap-1.5 lg:justify-end">
                {parsedSections.map((section) => (
                  <span
                    key={section}
                    title={section}
                    className="inline-flex h-[24px] items-center rounded-md px-2 text-[11px] font-medium"
                    style={{ background: "var(--good-soft)", color: "var(--good)" }}
                  >
                    {getReadableSectionLabel(section)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-[18px] flex gap-1 overflow-x-auto">
            {REPORT_TABS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className="whitespace-nowrap px-4 py-3 text-sm font-medium transition"
                style={{
                  color: activeTab === id ? "var(--text)" : "var(--muted)",
                  borderBottom: activeTab === id ? "2px solid var(--text)" : "2px solid transparent",
                  marginBottom: -1,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="scroll flex-1 overflow-y-auto px-5 py-6 pb-20 lg:px-10">
        {renderReportTab(activeTab, {
          result,
          history,
          selectedBullet,
          bulletRewrites,
          appliedRewrites,
          rewritingBullet,
          onBulletRewrite,
          onApplyRewrite,
        })}
      </div>
    </section>
  );
}

function renderReportTab(activeTab, props) {
  if (activeTab === "ats") return <ATSReportTab {...props} />;
  if (activeTab === "match") return <MatchReportTab {...props} />;
  if (activeTab === "rewrites") return <RewritesReportTab {...props} />;
  if (activeTab === "history") return <HistoryReportTab {...props} />;
  return <OverviewReportTab {...props} />;
}

function OverviewReportTab({ result }) {
  const grade = result.primaryGrade || {};
  const priorityFixes = grade.priorityFixes || [];
  const sectionFeedback = grade.sectionFeedback || [];
  const sectionScores = grade.sectionScores || [];
  const strengths = grade.strengths || [];
  const keywordGaps = grade.keywordGaps || [];

  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        <ReportCard title="Summary" subtitle={`${result.reviewTone} perspective`}>
          <p className="text-sm leading-relaxed text-[var(--muted)]">{grade.summary}</p>
          {grade.tonePerspective && (
            <p className="mt-3 text-sm leading-relaxed text-[var(--text)]">
              {grade.tonePerspective}
            </p>
          )}
        </ReportCard>

        <ReportCard title="Top priority fixes">
          <div>
            {(priorityFixes.length ? priorityFixes : [{ issue: "No urgent fixes detected", whyItMatters: "The grader did not flag any high-priority blockers.", howToFix: "Review the lower-priority section feedback before submitting." }]).map((fix, index) => (
              <div
                key={`${fix.issue}-${index}`}
                className="flex flex-col gap-3 border-b py-3 last:border-b-0 md:flex-row md:items-center"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="mono flex h-[22px] w-[22px] shrink-0 items-center justify-center text-[11px] text-[var(--muted)]">
                  {index + 1}
                </span>
                <span className={`pill shrink-0 ${getPriorityPillClass(fix.priority || fix.severity || index)}`}>
                  {renderPriorityLevel(fix.priority || fix.severity || index)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium text-[var(--text)]">{fix.issue}</div>
                  <div className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{fix.whyItMatters}</div>
                </div>
                <button type="button" className="btn btn-ghost btn-sm self-start md:self-auto">
                  {getFixActionLabel(fix)}
                </button>
              </div>
            ))}
          </div>
        </ReportCard>

        <ReportCard title="Section-by-section review">
          <div className="space-y-2">
            {normalizeSectionReview(sectionFeedback, sectionScores).map((section, index) => (
              <div
                key={`${section.section}-${index}`}
                className="grid gap-3 py-2.5 md:grid-cols-[128px_100px_minmax(0,1fr)_44px] md:items-center"
              >
                <span className="text-[13px] font-medium text-[var(--text)]">{section.section}</span>
                <div className="scorebar">
                  <i
                    style={{
                      width: `${Math.max(0, Math.min(100, section.score ?? 0))}%`,
                      background: getScoreBarColor(section.score ?? 0),
                    }}
                  />
                </div>
                <span className="text-[12.5px] leading-relaxed text-[var(--muted)]">
                  {section.assessment || section.reason || "No section note returned."}
                </span>
                <span className="mono text-right text-xs text-[var(--text-2)]">{section.score ?? "--"}</span>
              </div>
            ))}
          </div>
        </ReportCard>
      </div>

      <aside className="space-y-4">
        <ReportCard title="Breakdown">
          <div className="space-y-3.5">
            {breakdownLabels.map(([key, label]) => (
              <ScoreBar key={key} label={label} score={grade.atsBreakdown?.[key] ?? 0} />
            ))}
          </div>
        </ReportCard>

        <ReportCard title="What's working">
          <ul className="space-y-3">
            {(strengths.length ? strengths : ["The grader did not return specific strengths."]).map((item, index) => (
              <ListItem key={index} tone="primary" text={item} />
            ))}
          </ul>
        </ReportCard>

        <ReportCard title="Missing keywords">
          <div className="flex flex-wrap gap-2">
            {(keywordGaps.length ? keywordGaps : ["No major keyword gaps"]).map((keyword) => (
              <span key={keyword} className={keywordGaps.length ? "pill pill-warn" : "pill pill-good"}>
                {keywordGaps.length ? `+ ${keyword}` : keyword}
              </span>
            ))}
          </div>
          {keywordGaps.length > 0 && (
            <button type="button" className="btn btn-outline btn-sm mt-3 w-full">
              Open keyword injector
            </button>
          )}
        </ReportCard>

        <ReportCard title="Parsing confidence">
          <div className="flex items-baseline gap-1.5">
            <span className="h-display text-[30px] leading-none">{result.extractionConfidence?.score ?? 0}%</span>
            <span className="text-xs text-[var(--muted)]">| {result.extractionConfidence?.label?.toLowerCase()} confidence</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{result.extractionConfidence?.note}</p>
          {result.metadata?.extractionWarning && (
            <p className="mt-3 rounded-lg p-2.5 text-xs leading-relaxed text-[var(--warn)]" style={{ background: "var(--warn-soft)" }}>
              {result.metadata.extractionWarning}
            </p>
          )}
        </ReportCard>
      </aside>
    </div>
  );
}

function ATSReportTab({ result }) {
  const grade = result.primaryGrade || {};

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <ReportCard title="ATS risk scanner">
        <div className="space-y-3">
          {(grade.atsRisks || []).map((risk, index) => (
            <div key={`${risk.risk}-${index}`} className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-[var(--text)]">{risk.risk}</h3>
                <span className={`text-xs font-semibold ${getRiskClass(risk.severity)}`}>{risk.severity}</span>
              </div>
              <p className="text-sm leading-relaxed text-[var(--muted)]">{risk.details}</p>
            </div>
          ))}
        </div>
      </ReportCard>

      <ReportCard title="Keyword injector">
        <div className="grid gap-3 md:grid-cols-2">
          {(grade.keywordPlacementSuggestions || []).map((item, index) => (
            <div key={`${item.keyword}-${index}`} className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-[var(--text)]">{item.keyword}</h3>
                <span className="text-xs text-[var(--accent)]">{item.targetSection}</span>
              </div>
              <p className="mb-2 text-sm leading-relaxed text-[var(--muted)]">{item.howToAdd}</p>
              <p className="text-sm leading-relaxed text-[var(--text)]">{item.example}</p>
            </div>
          ))}
        </div>
      </ReportCard>
    </div>
  );
}

function MatchReportTab({ result }) {
  const grade = result.primaryGrade || {};
  const matched = grade.jobMatch?.matchedRequirements || [];
  const partial = grade.jobMatch?.partialMatches || [];
  const missing = grade.jobMatch?.missingEvidence || [];

  return (
    <div className="space-y-4">
      <div className="grader-match-grid grid gap-5 lg:grid-cols-3">
        <ReportCard title="Matched requirements" right={<span className="pill pill-good">{matched.length}</span>}>
          <div className="grader-match-card-body">
            <MatchRequirementList items={matched} tone="good" emptyText="No matched requirements identified." />
          </div>
        </ReportCard>
        <ReportCard title="Partial matches" right={<span className="pill pill-warn">{partial.length}</span>}>
          <div className="grader-match-card-body">
            <MatchRequirementList items={partial} tone="warn" emptyText="No partial matches identified." />
          </div>
        </ReportCard>
        <ReportCard title="Missing evidence" right={<span className="pill pill-bad">{missing.length}</span>}>
          <div className="grader-match-card-body">
            <MatchRequirementList items={missing} tone="bad" emptyText="No missing evidence identified." />
          </div>
        </ReportCard>
      </div>

      <ReportCard title="Role comparison">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <RoleScoreRow role={result.targetRole} score={grade.score} primary />
          {(result.comparisons || []).map((item) => (
            <RoleScoreRow key={item.role} role={item.role} score={item.grade.score} />
          ))}
        </div>
      </ReportCard>
    </div>
  );
}

function RewritesReportTab({
  result,
  selectedBullet,
  bulletRewrites,
  appliedRewrites,
  rewritingBullet,
  onBulletRewrite,
  onApplyRewrite,
}) {
  const grade = result.primaryGrade || {};

  return (
    <div className="space-y-5">
      <ReportCard title="Suggested rewrites">
        <div className="grid gap-3 lg:grid-cols-2">
          {(grade.rewriteSuggestions || []).map((item, index) => (
            <div key={index} className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <p className="lbl-mono mb-2">Before</p>
              <p className="mb-4 text-sm leading-relaxed text-[var(--muted)]">{item.original}</p>
              <p className="lbl-mono mb-2 text-[var(--accent)]">After</p>
              <p className="mb-3 text-sm leading-relaxed text-[var(--text)]">{item.improved}</p>
              <p className="text-xs leading-relaxed text-[var(--muted)]">{item.reason}</p>
            </div>
          ))}
        </div>
      </ReportCard>

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <ReportCard title="Weak bullet rewrite mode">
          <div className="space-y-3">
            {(result.bulletCandidates || []).length > 0 ? (
              result.bulletCandidates.map((bullet) => (
                <button
                  key={bullet.originalBullet}
                  type="button"
                  onClick={() => onBulletRewrite(bullet.originalBullet)}
                  className="w-full rounded-xl border p-4 text-left transition hover:-translate-y-0.5"
                  style={{
                    borderColor: selectedBullet === bullet.originalBullet ? "var(--accent)" : "var(--border)",
                    background: selectedBullet === bullet.originalBullet ? "var(--accent-soft)" : "var(--surface)",
                  }}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${getRiskClass(bullet.priority)}`}>
                      {bullet.priority} priority
                    </span>
                    <span className="text-[11px] text-[var(--accent)]">{bullet.section}</span>
                  </div>
                  <div className="mb-2 text-sm leading-relaxed text-[var(--text)]">{bullet.originalBullet}</div>
                  <div className="text-xs leading-relaxed text-[var(--muted)]">{bullet.issue}</div>
                  {appliedRewrites[bullet.originalBullet] && (
                    <div className="mt-3 text-xs text-[var(--accent)]">Applied to improved draft</div>
                  )}
                </button>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">
                No weak bullets were identified clearly enough to rewrite individually.
              </p>
            )}
          </div>
        </ReportCard>

        <ReportCard title="Bullet rewrite suggestions">
          {rewritingBullet ? (
            <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
              <Loader2 size={16} className="animate-spin text-[var(--accent)]" />
              Generating stronger bullet options...
            </div>
          ) : bulletRewrites.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <p className="lbl-mono mb-2">Selected bullet</p>
                <p className="text-sm text-[var(--text)]">{selectedBullet}</p>
              </div>
              {bulletRewrites.map((rewrite, index) => (
                <div key={index} className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                  <p className="mb-2 text-sm leading-relaxed text-[var(--text)]">{rewrite.version}</p>
                  <p className="mb-1 text-xs text-[var(--accent)]">{rewrite.focus}</p>
                  <p className="mb-3 text-xs leading-relaxed text-[var(--muted)]">{rewrite.whyItWorks}</p>
                  <button type="button" onClick={() => onApplyRewrite(selectedBullet, rewrite.version)} className="btn btn-outline">
                    Apply to improved draft
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              Select one of the weakest bullets from the left to generate stronger, role-aware rewrites.
            </p>
          )}
        </ReportCard>
      </div>
    </div>
  );
}

function HistoryReportTab({ result, history }) {
  return (
    <ReportCard title="Report history">
      <div>
        {(history.length ? history : [{
          id: "current",
          targetRole: result.targetRole,
          fileName: result.fileName,
          reviewTone: result.reviewTone,
          score: result.primaryGrade?.score,
          createdAt: new Date().toISOString(),
        }]).slice(0, 9).map((entry, index, rows) => (
          <div
            key={entry.id}
            className="grid gap-3 border-b py-3 last:border-b-0 md:grid-cols-[120px_60px_1fr_1fr_auto] md:items-center"
            style={{ borderColor: "var(--border)" }}
          >
            <span className="mono text-xs text-[var(--muted)]">{formatHistoryDate(entry.createdAt)}</span>
            <span className={`h-display text-[22px] leading-none ${getScoreClass(entry.score)}`}>{entry.score}</span>
            <span className="text-sm text-[var(--text)]">{entry.reviewTone}</span>
            <span className="truncate text-sm text-[var(--muted)]">{entry.targetRole}</span>
            <button type="button" className="btn btn-ghost btn-sm" disabled={index === 0 && rows.length === 1}>
              Open
            </button>
          </div>
        ))}
      </div>
    </ReportCard>
  );
}

function ScoreRing({ value }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = 32;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative h-[88px] w-[88px] shrink-0" aria-label={`Score ${safeValue} out of 100`}>
      <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
        <circle cx="44" cy="44" r={radius} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - safeValue / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`h-display text-[26px] leading-none ${getScoreClass(safeValue)}`}>{safeValue}</span>
        <span className="mono text-[10px] text-[var(--muted)]">/ 100</span>
      </div>
    </div>
  );
}

function ReportCard({ title, subtitle, right, children }) {
  return (
    <section className="panel p-[18px]">
      <div className="mb-3.5 flex items-start gap-2">
        <div className="flex-1">
          <h2 className="text-[13px] font-semibold tracking-normal text-[var(--text)]">{title}</h2>
          {subtitle && <div className="mt-0.5 text-xs text-[var(--muted)]">{subtitle}</div>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function getScoreTitle(score) {
  if (score >= 85) return "Strong candidate - refine impact and keywords to land in the top 10%.";
  if (score >= 70) return "Good candidate - tighten evidence and missing keywords.";
  if (score >= 55) return "Promising base - fix the biggest ATS and role-match gaps.";
  return "Needs focused work before this role.";
}

function getReadableSectionLabel(section = "") {
  const normalized = section.toLowerCase();
  if (normalized.includes("personal")) return "Personal info";
  if (normalized.includes("profile") || normalized.includes("summary")) return "Summary";
  if (normalized.includes("skill")) return "Skills";
  if (normalized.includes("keyword")) return "Keywords";
  if (normalized.includes("experience") || normalized.includes("work")) return "Experience";
  if (normalized.includes("project")) return "Projects";
  if (normalized.includes("education")) return "Education";
  if (normalized.includes("achievement") || normalized.includes("accomplishment")) return "Achievements";
  return section.trim() || "Section";
}

function renderPriorityLevel(value) {
  if (typeof value === "number") {
    if (value < 2) return "high";
    if (value < 4) return "med";
    return "low";
  }

  const normalized = `${value}`.toLowerCase();
  if (normalized.includes("high")) return "high";
  if (normalized.includes("low")) return "low";
  return "med";
}

function getPriorityPillClass(value) {
  const priority = renderPriorityLevel(value);
  if (priority === "high") return "pill-bad";
  if (priority === "low") return "";
  return "pill-warn";
}

function getFixActionLabel(fix) {
  const text = `${fix.issue || ""} ${fix.howToFix || ""}`.toLowerCase();
  if (text.includes("keyword")) return "Apply suggestion";
  if (text.includes("rewrite") || text.includes("summary") || text.includes("bullet")) return "Rewrite";
  if (text.includes("section") || text.includes("order") || text.includes("move")) return "Reorder";
  return "Open editor";
}

function normalizeSectionReview(sectionFeedback, sectionScores) {
  const scoreBySection = new Map(
    (sectionScores || []).map((section) => [section.section, section.score])
  );

  if (sectionFeedback.length) {
    return sectionFeedback.map((section) => ({
      ...section,
      score: section.score ?? scoreBySection.get(section.section) ?? 75,
    }));
  }

  return sectionScores;
}

function getScoreBarColor(score) {
  if (score >= 90) return "var(--good)";
  if (score >= 75) return "var(--accent)";
  return "var(--warn)";
}

function MatchRequirementList({ items, tone, emptyText }) {
  return (
    <ul className="grader-match-list">
      {(items.length ? items : [emptyText]).map((item) => (
        <li key={item} className="grader-match-item" data-tone={items.length ? tone : "neutral"}>
          <span className="grader-match-item-marker" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function InputCard({ label, icon, control }) {
  return (
    <label className="block">
      <span className="lbl">{label}</span>
      <div
        className="mt-2 flex min-h-[76px] items-start gap-3 rounded-xl px-4 py-4 transition-colors"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        {icon}
        <div className="w-full pt-0.5">{control}</div>
      </div>
    </label>
  );
}

function SourcePanel({ label, icon, action, children }) {
  return (
    <div
      className="panel flex flex-col gap-4 p-5 md:p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {icon}
          <h3 className="truncate text-sm font-medium text-[var(--text)]">{label}</h3>
        </div>
        <div className="shrink-0">{action}</div>
      </div>
      {children}
    </div>
  );
}

function SetupPill({ label, value }) {
  return (
    <div
      className="flex min-h-[88px] flex-col justify-center rounded-xl px-5 py-4"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="lbl-mono mb-2">{label}</div>
      <div className="text-[15px] font-medium leading-snug text-[var(--text)]">{value}</div>
    </div>
  );
}

function MetricCard({ title, icon, children }) {
  return (
    <div
      className="panel p-6"
    >
      <div className="mb-5 flex items-center gap-2 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
        {icon}
        <h3 className="font-medium text-[var(--text)]">{title}</h3>
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
      ? "text-[var(--warn)]"
      : tone === "danger"
      ? "text-[var(--bad)]"
      : "text-[var(--accent)]";

  return (
    <li className="flex items-start gap-3 text-sm text-[var(--muted)]">
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
        <span className="text-[var(--text)]">{label}</span>
        <span className="text-[var(--muted)]">{safeScore}/100</span>
      </div>
      <div className="scorebar">
        <div
          className="h-full rounded-full"
          style={{
            width: `${safeScore}%`,
            background: "var(--accent)",
          }}
        />
      </div>
    </div>
  );
}

function RoleScoreRow({ role, score, primary = false }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg p-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div>
        <div className="text-sm text-[var(--text)]">{role}</div>
        {primary && <div className="mt-1 text-xs text-[var(--accent)]">Primary target</div>}
      </div>
      <div className={`text-lg font-semibold ${getScoreClass(score)}`}>{score}</div>
    </div>
  );
}

function DiffColumn({ title, tone, items }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <h4 className="mb-3 text-sm font-medium text-[var(--text)]">{title}</h4>
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
  if (score >= 80) return "text-[var(--accent)]";
  if (score >= 50) return "text-[var(--warn)]";
  return "text-[var(--bad)]";
}

function getRiskClass(severity = "medium") {
  if (severity === "high") return "text-[var(--bad)]";
  if (severity === "low") return "text-[var(--accent)]";
  return "text-[var(--warn)]";
}

function formatHistoryDate(value) {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}
