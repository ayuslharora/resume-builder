// Legacy compatibility shim for tests and any old imports that still expect
// `src/services/groq.js` to exist. The real implementation lives in `llm.js`.
// Candidate's raw background/source document
// Relevant source document context
// targetContext.sourceDocumentText

export * from './llm.js';
