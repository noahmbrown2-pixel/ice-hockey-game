# 🤖 AI Agents README
# Version 4.0.0 | Updated: 2025-11-01

> **For AI Assistants**: This document is your entry point to the Archis Studio Blog project.
> Read this first before any implementation work.

> **v4.0 Update**: Design System fully implemented - variables + mixins ready to use

---

## 🎯 Project Overview

**Project**: Archis Studio Blog  
**Type**: Specification-Driven Jekyll Static Site  
**Theme**: Autumn Noir Future (Fashion + Gaming + AI + Space)  
**Base**: Jekyll 4.x + Minimal Mistakes Theme  
**Language**: Traditional Chinese (zh-TW) with English technical terms  
**Status**: v2.0 - Core features implemented ✅

---

## 📚 Critical: Read These First

### 1️⃣ **Mandatory Reading** (Read in Order)
```
1. agents.MD (this file)          ← You are here
2. docs/DOC_INDEX.md              ← Documentation map
3. docs/PROJECT_CHARTER.md         ← Project goals & principles
4. docs/AI_COLLABORATION_GUIDE.md  ← Collaboration workflows
5. docs/DESIGN_SYSTEM_SPEC.md      ← Design system specifications
```

### 2️⃣ **Implementation References**
```
docs/IMPLEMENTATION_CHECKLIST.md   ← 10-phase implementation guide
docs/LAYOUT_SPEC.md                ← Layout specifications
docs/NAVIGATION_SPEC.md            ← Navigation design
docs/ASSET_SPEC.md                 ← Asset management
docs/CONTENT_STRATEGY.md           ← Content creation guidelines
```

> **Note**: 7 redundant/outdated docs removed in v3.0 for clarity

---

## 🔑 Core Principles (Keep It Simple)

### Design Principles
- **Content First**: Minimal visual distraction
- **Systematic Design**: Scalable & maintainable
- **Mobile-First**: Responsive across all devices
- **Dark Mode**: Autumn Noir aesthetic base

### Development Principles
- **Specification-Driven**: All features have clear specs in `docs/`
- **AI-Collaborative**: Designed for human-AI partnership
- **Version Controlled**: Track all changes with proper commit messages
- **Quality First**: Test thoroughly before committing

---

## 🚀 Quick Start Guide

### Step 1: Understand Current State
```bash
# Check current directory structure
ls -la

# Current state (v4.0):
# ✅ docs/                      - 9 core specifications (streamlined)
# ✅ _sass/design-system/       - Design system (variables + mixins) ⭐ NEW
# ✅ _config.yml                - Jekyll configuration
# ✅ _layouts/                  - Custom layouts (home, post, posts)
# ✅ _includes/                 - Custom components (hero, masthead, author-profile)
# ✅ _pages/                    - About, Posts, Categories pages
# ✅ _sass/custom/              - Custom styling (使用 design-system)
# ✅ assets/                    - CSS and images
# ✅ Gemfile                    - Ruby dependencies
# ✅ README.md                  - Complete documentation
```

### Step 2: Identify Task Type

**Simple Task** (文件修正、小更新、錯誤修復):
- Execute → Confirm
- Direct implementation, then commit

**Complex Task** (新功能、重構、多檔案變更):
- Plan → Confirm → Implement → Verify
- Detailed planning before execution

### Step 3: Follow Workflows
Refer to `docs/AI_COLLABORATION_GUIDE.md` for detailed workflows.

---

## 📋 Implementation Phases (Current: Phase 9 Complete)

### Phase 0-9: ✅ COMPLETED
- ✅ Phase 0: Project cleanup
- ✅ Phase 1-3: Basic setup & design system
- ✅ Phase 4-5: Home page (Hero + Featured + Categories)
- ✅ Phase 6: About page (Terminal + RPG + Journey timeline)
- ✅ Phase 7-8: Posts archive & article template
- ✅ Phase 9: Style optimization & responsive design

### Phase 10: ⏳ Future Enhancements
- [ ] Search functionality
- [ ] Comment system
- [ ] SEO optimization
- [ ] Performance monitoring
- [ ] Analytics integration

**Current Implementation Status**: 90% complete (9/10 phases)

---

## 🎨 Design System Quick Reference

**⚠️ Important**: This is conceptual overview only. For exact values, colors, and specifications, always refer to `docs/DESIGN_SYSTEM_SPEC.md`.

### Design Concept: Four-Style Fusion
Our design system blends four distinct aesthetics:

1. **🎭 Fashion Editorial**
   - Elegant typography with serif headlines
   - Editorial-style layouts
   - Sophisticated spacing and proportions

2. **🍂 Autumn Noir** 
   - Dark mode foundation with warm tones
   - Deep blacks and rich autumn colors
   - Cozy, intimate atmosphere

3. **🎮 Gaming Pixel Art**
   - Retro-futuristic accents
   - Monospace fonts for code
   - Pixel-perfect alignment

4. **🚀 AI Future Space**
   - Cosmic gradients and starfield effects
   - Futuristic color accents
   - Holographic and sci-fi elements

### Key System Components

**Color Philosophy**:
- Base: Dark backgrounds (Noir aesthetic)
- Accents: Autumn warm tones + Future cool tones
- Contrast: High readability, WCAG AA compliant
- See `docs/DESIGN_SYSTEM_SPEC.md` § 色彩系統 for exact values

**Typography Approach**:
- Headlines: Serif fonts (Fashion editorial feel)
- Body: Sans-serif (Modern readability)
- Code: Monospace (Pixel/gaming aesthetic)
- See `docs/DESIGN_SYSTEM_SPEC.md` § Typography System for font stacks and scales

**Spacing Strategy**:
- Based on 8px grid system
- Consistent, predictable spacing
- Responsive scaling across breakpoints
- See `docs/DESIGN_SYSTEM_SPEC.md` § Spacing System for exact values

**Component Style**:
- Minimal Mistakes foundation
- Custom overlays for theme fusion
- Reusable, modular components
- See `docs/LAYOUT_SPEC.md` and `docs/NAVIGATION_SPEC.md` for details

### 📖 Always Reference Documentation
Before implementing any design element:
1. Check `docs/DESIGN_SYSTEM_SPEC.md` for exact specifications
2. Verify against `docs/LAYOUT_SPEC.md` for layout details
3. Cross-reference `docs/NAVIGATION_SPEC.md` for navigation elements
4. **Never guess values** - specifications are the source of truth

### 🎨 Design System Implementation (v4.0)

**⭐ NEW**: Design system已完整實作於 `_sass/design-system/`

**快速開始**：
```scss
// 使用顏色變數（Single Source of Truth）
.my-element {
  color: $autumn-gold;              // ✅ 正確
  border-color: category-color('ai'); // ✅ 正確
  // color: #D4A017;                // ❌ 不要硬編碼！
}

// 使用 Mixin 自動生成 8 色樣式
.my-badge {
  padding: 0.5rem 1rem;
  @include generate-category-badges('--');
  // 自動生成 .my-badge--ai, .my-badge--dev, ... (8個)
}
```

**核心檔案**：
- `_sass/design-system/_variables.scss` (155行) - 單一真相來源
- `_sass/design-system/_mixins.scss` (270行) - DRY 工具

**詳細指南**：參考 `docs/DESIGN_SYSTEM_SPEC.md` § 實作說明

---

## 📁 File Operations Rules

### Before Any Modification
1. **Read First**: Always view file content before editing
2. **Understand Context**: Check related files and dependencies
3. **Check Specs**: Verify against documentation in `docs/`

### During Modification
1. **Minimal Changes**: Smallest possible changes to achieve goal
2. **Precise Edits**: Use `str_replace` for exact modifications
3. **Version Updates**: Update version numbers in document headers
4. **Keep Consistency**: Follow existing patterns and conventions

### After Modification
1. **Verify**: Re-read file to confirm changes are correct
2. **Test**: Check functionality works as expected
3. **Document**: Update `docs/DOC_INDEX.md` if needed
4. **Commit**: Use Conventional Commits format with AI attribution

---

## 🔄 Git Workflow

### Commit Message Format
```
<type>(<scope>): <description>

[optional body with details]

Authored-by: <AI-Agent-Name>
```

### Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: CSS/styling changes
- `refactor`: Code restructuring
- `test`: Testing related
- `chore`: Maintenance tasks

### AI Agent Names
- **Claude** → `Authored-by: Claude`
- **ChatGPT** → `Authored-by: GPT`
- **Amazon Q** → `Authored-by: Q`
- **Copilot** → `Authored-by: Copilot`
- **Gemini** → `Authored-by: Gemini`

### Git Rules
✅ **Allowed**: `git status`, `git diff`, `git add`, `git commit`  
❌ **Forbidden**: `git push` (requires human approval)

### Commit Strategy
- Commit after each logical unit of work
- Keep commits atomic and focused
- All commits stay local until human confirms
- Clear, descriptive commit messages

---

## 🧪 Quality Checklist

Before marking any task complete, verify:

### Design Compliance
- [ ] Follows Design System specifications
- [ ] Colors match specifications in `docs/DESIGN_SYSTEM_SPEC.md`
- [ ] Typography uses correct font families and scales
- [ ] Spacing follows specifications exactly

### Responsive Design
- [ ] Mobile (< 768px) layout tested
- [ ] Tablet (768px - 1024px) layout tested
- [ ] Desktop (> 1024px) layout tested
- [ ] All breakpoints work correctly

### Code Quality
- [ ] Valid HTML/CSS/SCSS syntax
- [ ] Minimal Mistakes conventions followed
- [ ] No duplicate code
- [ ] Comments added where necessary (sparingly)

### Accessibility
- [ ] Semantic HTML structure
- [ ] ARIA labels where needed
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Keyboard navigation works

### Documentation
- [ ] Specifications followed exactly
- [ ] Version numbers updated
- [ ] Changes logged in CHANGELOG sections
- [ ] `docs/DOC_INDEX.md` updated if needed

---

## 🚫 Do NOT Do

### Forbidden Actions
- ❌ Modify Design System specs without human approval
- ❌ Push to remote repository
- ❌ Delete documentation files
- ❌ Change project goals or principles
- ❌ Add features not in specifications
- ❌ Use colors/fonts not defined in specs
- ❌ Ignore responsive design requirements
- ❌ Skip quality checks

### When in Doubt
1. **Stop**: Don't guess or assume
2. **Ask**: Request clarification from human
3. **Propose**: Offer options with pros/cons
4. **Wait**: Get approval before proceeding

---

## 💡 Decision Request Template

When you need human decision:

```markdown
## 🤔 Decision Required

**Context**: [Brief situation description]
**Question**: [Specific decision needed]

**Option A**: [Description]
- Pros: [List advantages]
- Cons: [List disadvantages]

**Option B**: [Description]
- Pros: [List advantages]
- Cons: [List disadvantages]

**Recommendation**: [Your suggested option with reasoning]
```

---

## 📊 Progress Reporting

### Simple Task Format
```markdown
## ✅ Completed

- [Specific action taken]
- Files modified: [list]
- Commit: [hash]
```

### Complex Task Format
```markdown
## 🔄 Progress Report

### ✅ Completed
- [Specific tasks finished]

### 🔧 Technical Details
- [Methods/approaches used]
- [Challenges and solutions]

### 📝 Git Status
- Commit: [hash]
- Files: [list]
- Next: [next steps]

### 🧪 Testing
- [ ] Functionality verified
- [ ] Responsive design checked
- [ ] Documentation updated
- [ ] Specifications followed
```

---

## 🆘 Error Handling

When errors occur:

```markdown
## ⚠️ Error Report

**Action Attempted**: [What you tried to do]

**Error Message**:
```
[Full error message here]
```

**Analysis**: [Your understanding of the cause]

**Suggested Fix**: [Proposed solution or request for guidance]
```

---

## 🔍 Troubleshooting Guide

### Common Issues

**Issue**: Don't know where to start
- **Solution**: Read `docs/DOC_INDEX.md` → Check current phase in `IMPLEMENTATION_CHECKLIST.md`

**Issue**: Specification unclear
- **Solution**: Ask human for clarification, propose interpretation options

**Issue**: Conflicting requirements
- **Solution**: Document the conflict, ask human for priority decision

**Issue**: Tool/command not working
- **Solution**: Report error with full context, suggest alternatives

**Issue**: Need specific design value
- **Solution**: Look up in `docs/DESIGN_SYSTEM_SPEC.md`, never guess or improvise

---

## 📖 Documentation Standards

### Version Format
```
# File Title
# Version X.Y.Z | Updated: YYYY-MM-DD
```

### Version Increment Rules
- **Major (+1.0.0)**: Significant architectural changes
- **Minor (+0.1.0)**: New features or specifications
- **Patch (+0.0.1)**: Bug fixes or small adjustments

### Changelog Format
```markdown
## 📝 CHANGELOG

### vX.Y.Z (YYYY-MM-DD)
- Change description
- Another change
```

---

## 🎯 Success Criteria

A task is complete when:

1. ✅ Specifications followed exactly
2. ✅ Code quality standards met
3. ✅ Responsive design working
4. ✅ Accessibility requirements met
5. ✅ Documentation updated
6. ✅ Tested and verified
7. ✅ Committed with proper message
8. ✅ Human approved

---

## 🤝 Collaboration Philosophy

### Human-AI Partnership
- **Human**: Sets goals, makes decisions, provides vision
- **AI**: Executes plans, proposes solutions, ensures quality
- **Together**: Build beautiful, functional, maintainable code

### Communication Style
- **Technical Terms**: English (API, Component, CSS, etc.)
- **Discussion**: Traditional Chinese (繁體中文)
- **Code**: English
- **Docs**: Chinese for guides, English for technical specs

### Respect Boundaries
- AI agents are assistants, not decision makers
- Always seek approval for significant changes
- Provide options, not dictates
- Be transparent about limitations

---

## 📞 Getting Help

### When Stuck
1. Re-read relevant specification docs
2. Check similar examples in specs
3. Propose multiple solution options
4. Ask human for guidance

### Useful Commands
```bash
# Check documentation index
cat docs/DOC_INDEX.md

# Search for concept across docs
grep -r "concept" docs/

# Check current Git status
git status

# View recent commits
git log --oneline -5

# Check file structure
tree -L 2 -a -I '.git'
```

---

## 🎓 Learning Resources

### Understanding This Project
- **Design Philosophy**: See `PROJECT_CHARTER.md` § Design Principles
- **Technical Stack**: Jekyll + Minimal Mistakes → Official docs
- **Workflow**: `AI_COLLABORATION_GUIDE.md` § Workflows
- **Implementation**: `IMPLEMENTATION_CHECKLIST.md` (10 phases)

### External Resources
- **Jekyll**: https://jekyllrb.com/docs/
- **Minimal Mistakes**: https://mmistakes.github.io/minimal-mistakes/docs/
- **Conventional Commits**: https://www.conventionalcommits.org/
- **WCAG Accessibility**: https://www.w3.org/WAI/WCAG21/quickref/

---

## ✨ Final Notes

### This Project Is Special
- **Specification-Driven**: Every feature has a clear spec
- **Design System First**: Consistent, scalable design
- **AI-Friendly**: Built for human-AI collaboration
- **Quality-Focused**: Excellence over speed

### Your Role Matters
As an AI agent, you are:
- A **precise executor** of specifications
- A **quality guardian** of the codebase
- A **collaborative partner** to the human maintainer
- A **documentation keeper** of changes

### Keep It Simple
- Follow specifications exactly
- Make minimal necessary changes
- Ask when uncertain
- Test thoroughly
- Document clearly

---

**Welcome to the Archis Studio Blog project! 🍂✨**

Let's build something beautiful together.

---

**Maintained by**: Archi Chen & AI Assistants
**Last Updated**: 2025-11-01
**Version**: 4.0.0 - Design System Fully Implemented
**Status**: Production-Ready with Professional Design System

---

## 📝 CHANGELOG

### v4.0.0 (2025-11-01)
- **Design System 完整實作** 🎨
  - 新增 `_sass/design-system/` 目錄（425行）
  - _variables.scss: 單一真相來源（8色系統、字體、間距）
  - _mixins.scss: DRY 工具（自動生成 badge/card/portal）
  - 消除 75+ 處硬編碼顏色
  - 減少 303 行重複代碼（98%）
- **Quick Start 更新**：標註 design-system 新目錄
- **Design System Quick Reference 擴充**：新增實作範例與檔案位置
- **文件更新**：
  - docs/DESIGN_SYSTEM_SPEC.md v3.0 → v4.0（新增實作說明章節）
  - docs/DOC_INDEX.md v3.1 → v4.0（索引設計系統檔案）
  - README.md 專案結構加入 design-system 說明

### v3.1.0 (2025-10-28)
- **Documentation audience clarification**: 明確標示所有文件的閱讀受眾
  - README.md → 訪客（開發者、讀者）
  - agents.MD → AI Agents 入口
  - docs/ → AI Agents 查閱手冊
- **Version unified**: All core docs updated to v3.0.0 (2025-10-28)
- **DOC_INDEX.md optimized**: Reduced from 378 to 122 lines (68% reduction)

### v3.0.0 (2025-10-26)
- Documentation streamlined: 16 → 9 core files (44% reduction)
- Removed redundant/outdated docs
- Updated mandatory reading list

### v2.0.0 (2025-10-24)
- Phase 9 完成：8 色配色系統完整實作
- 更新專案狀態為 Core Features Complete

### v1.0.0 (2025-10-11)
- AI Agents 初版指南建立
