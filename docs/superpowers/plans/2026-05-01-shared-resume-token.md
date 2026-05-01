# Shared Resume Token Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add publishable token-based resume links that require login and return viewers to the shared route after authentication.

**Architecture:** Resume documents will store `isShared` and `shareToken`, while a new `/shared/:token` route resolves the token to a resume after login. Publishing and link-copy controls will reuse the existing resume management UI, and login/route guards will preserve the attempted destination.

**Tech Stack:** React Router, Firebase Firestore, React state, Node test runner

---
