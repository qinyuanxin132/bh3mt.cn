import fs from 'node:fs';
import path from 'node:path';

export type SkillStatus = 'mastered' | 'learning' | 'locked';

export interface SkillNode {
  id: string;
  title: string;
  status: SkillStatus;
  relatedPost?: {
    title: string;
    slug: string;
  };
}

export interface SkillBranch {
  code: string;
  title: string;
  subtitle: string;
  tier: string;
  nodes: SkillNode[];
  masteredCount: number;
  learningCount: number;
  lockedCount: number;
}

export interface RoadmapStage {
  index: number;
  title: string;
  duration: string;
  isCurrent: boolean;
  goal: string;
  tasks: string[];
  acceptance: string[];
}

export interface QueueItem {
  id: string;
  name: string;
  focus: string;
  statusText: string;
  statusKind: 'done' | 'active' | 'todo';
  note: string;
}

export interface RadarItem {
  dimension: string;
  level: string;
  tone: 'good' | 'mid' | 'weak';
  detail: string;
}

export interface PitfallItem {
  title: string;
  detail: string;
}

export interface LogEntry {
  heading: string;
  highlights: string[];
}

export interface ReLearningData {
  updatedAt: string;
  currentLevel: string;
  environment: string;
  currentStageSummary: string;
  branches: SkillBranch[];
  totals: {
    total: number;
    mastered: number;
    learning: number;
    locked: number;
    touchedPercent: number;
    masteredPercent: number;
  };
  stages: RoadmapStage[];
  queue: QueueItem[];
  radar: RadarItem[];
  pitfalls: PitfallItem[];
  logs: LogEntry[];
}

const DOCS_DIR = path.resolve(process.cwd(), 'docs/re-learning');

const BRANCH_META: Record<string, { subtitle: string; tier: string }> = {
  A: { subtitle: 'Assembly & Binary Format', tier: 'TIER 01 · 根基' },
  B: { subtitle: 'Dynamic Debugging', tier: 'TIER 02 · 当前重点' },
  C: { subtitle: 'Algorithms & Crypto', tier: 'TIER 02 · 核心主线' },
  D: { subtitle: 'Multi-Language RE', tier: 'TIER 03 · 拓展' },
  E: { subtitle: 'Packers & Anti-Analysis', tier: 'TIER 03 · 对抗' },
  F: { subtitle: 'Advanced Research', tier: 'TIER 04 · 进阶' },
};

const RELATED_POST_RULES: Array<{ keyword: string; title: string; slug: string }> = [
  { keyword: 'x86-64 寄存器', title: '汇编学习 #3 周记', slug: 'hui-bian-yu-yan-xue-xi-3' },
  { keyword: '条件跳转', title: '汇编学习 #2', slug: 'hui-bian-yu-yan-xue-xi-2' },
  { keyword: '多寄存器数据流追踪', title: 'myctf 字节锁链 wp', slug: 'MYCTF-zi-jie-suo-lian-wp' },
  { keyword: 'ELF 文件结构', title: 'ELF 文件结构入门', slug: 'elf-wen-jian-jie-gou-ru-men' },
  { keyword: 'PE 文件结构', title: 'PE 结构学习 #1', slug: 'PE-jie-gou-1' },
  { keyword: 'GDB + pwndbg 基础', title: 'GDB学习0-->0.1', slug: 'gdb-0-1-stady-1' },
  { keyword: 'PIE 程序动态定位', title: 'GDB学习0-->0.1', slug: 'gdb-0-1-stady-1' },
  { keyword: '运行时修改寄存器', title: 'GDB学习0-->0.1', slug: 'gdb-0-1-stady-1' },
  { keyword: 'Linux / Windows 常见反调试', title: 'GDB学习0-->0.1', slug: 'gdb-0-1-stady-1' },
  { keyword: '位运算与字节变换', title: 'myctf 字节锁链 wp', slug: 'MYCTF-zi-jie-suo-lian-wp' },
  { keyword: '流密码与分组密码', title: '从加密推解密-通用原理', slug: 'cong-jia-mi-tui-jie-mi-tong-yong-yuan-li' },
  { keyword: '约束求解 Z3', title: 'Z3 约束求解入门', slug: 'z3-ru-men-1' },
  { keyword: 'C++ 逆向基础', title: 'C++ 入门学习 #2', slug: 'cpp-xue-xi-1' },
  { keyword: 'Python 逆向', title: '成都好室友 pyc wp', slug: 'xi-dian-ctf-cheng-du-hao-shi-you-wp' },
  { keyword: 'Android 逆向入门', title: 'Linux 下 APK 反编译笔记', slug: 'linuxhuan-jing-xia-de-android-apkfan-bian-yi-xue-xi-bi-ji' },
  { keyword: '标准 UPX', title: '0xGame ez_upx wp', slug: '0xgame-2026-re-ez_upx-wp' },
  { keyword: '花指令识别', title: '0xGame ez_flower wp', slug: 'ez_flower' },
];

function readDoc(filename: string): string {
  const fullPath = path.join(DOCS_DIR, filename);
  if (!fs.existsSync(fullPath)) return '';
  return fs.readFileSync(fullPath, 'utf-8');
}

function stripInlineMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

function matchRelatedPost(nodeTitle: string): SkillNode['relatedPost'] {
  const found = RELATED_POST_RULES.find((rule) => nodeTitle.includes(rule.keyword));
  return found ? { title: found.title, slug: found.slug } : undefined;
}

function parseBranches(roadmapMd: string): SkillBranch[] {
  const branches: SkillBranch[] = [];
  const lines = roadmapMd.split(/\r?\n/);
  let current: SkillBranch | null = null;

  for (const line of lines) {
    if (line.startsWith('## 二、')) break;

    const branchMatch = line.match(/^###\s+模块\s+([A-Z])：(.+)$/);
    if (branchMatch) {
      const code = branchMatch[1];
      const title = branchMatch[2].trim();
      const meta = BRANCH_META[code] ?? { subtitle: 'Skill Branch', tier: 'BRANCH' };
      current = {
        code,
        title,
        subtitle: meta.subtitle,
        tier: meta.tier,
        nodes: [],
        masteredCount: 0,
        learningCount: 0,
        lockedCount: 0,
      };
      branches.push(current);
      continue;
    }

    if (!current) continue;
    const itemMatch = line.match(/^- \[( |~|x|X)\]\s+(.+)$/);
    if (itemMatch) {
      const mark = itemMatch[1].toLowerCase();
      const status: SkillStatus = mark === 'x' ? 'mastered' : mark === '~' ? 'learning' : 'locked';
      const title = stripInlineMd(itemMatch[2]);
      current.nodes.push({
        id: `${current.code}-${current.nodes.length + 1}`,
        title,
        status,
        relatedPost: matchRelatedPost(title),
      });
      if (status === 'mastered') current.masteredCount += 1;
      else if (status === 'learning') current.learningCount += 1;
      else current.lockedCount += 1;
    }
  }

  return branches;
}

function parseStages(roadmapMd: string): RoadmapStage[] {
  const stages: RoadmapStage[] = [];
  const sectionIdx = roadmapMd.indexOf('## 二、');
  if (sectionIdx === -1) return stages;

  const lines = roadmapMd.slice(sectionIdx).split(/\r?\n/);
  let current: RoadmapStage | null = null;
  let mode: 'none' | 'tasks' | 'acceptance' = 'none';

  for (const line of lines) {
    const stageMatch = line.match(/^###\s+阶段\s*(\d+)（([^）]+)）：(.+)$/);
    if (stageMatch) {
      const index = Number(stageMatch[1]);
      const duration = stageMatch[2].trim();
      const title = stageMatch[3].trim();
      current = {
        index,
        title,
        duration,
        isCurrent: duration.includes('当下'),
        goal: '',
        tasks: [],
        acceptance: [],
      };
      stages.push(current);
      mode = 'none';
      continue;
    }

    if (!current) continue;

    if (line.includes('**核心目标**')) {
      current.goal = stripInlineMd(line.replace(/^-?\s*\*\*核心目标\*\*[:：]\s*/, ''));
      mode = 'none';
    } else if (line.includes('**具体任务**')) {
      mode = 'tasks';
    } else if (line.includes('**验收标准**')) {
      mode = 'acceptance';
    } else if (/^\s+\d+\.\s+/.test(line)) {
      const item = stripInlineMd(line.replace(/^\s+\d+\.\s+/, ''));
      if (mode === 'acceptance') current.acceptance.push(item);
      else current.tasks.push(item);
    } else if (/^\s+-\s+/.test(line)) {
      const item = stripInlineMd(line.replace(/^\s+-\s+/, ''));
      if (mode === 'acceptance') current.acceptance.push(item);
      else current.tasks.push(item);
    }
  }

  return stages;
}

function parseQueue(progressMd: string): { currentStageSummary: string; queue: QueueItem[] } {
  const stageMatch = progressMd.match(/当前所在阶段[:：]\s*\*\*(.+?)\*\*/);
  const currentStageSummary = stageMatch ? stageMatch[1].trim() : '阶段 1';

  const queue: QueueItem[] = [];
  const lines = progressMd.split(/\r?\n/);
  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    const cols = line
      .split('|')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    if (cols.length < 5) continue;
    if (cols[0] === '编号' || cols[0].startsWith('---')) continue;

    const statusText = cols[3];
    const statusKind: QueueItem['statusKind'] = statusText.includes('✅')
      ? 'done'
      : statusText.includes('🔄')
        ? 'active'
        : 'todo';

    queue.push({
      id: cols[0],
      name: stripInlineMd(cols[1]),
      focus: stripInlineMd(cols[2]),
      statusText,
      statusKind,
      note: stripInlineMd(cols[4]),
    });
  }

  return { currentStageSummary, queue };
}

function parseProfile(profileMd: string): {
  updatedAt: string;
  currentLevel: string;
  environment: string;
  radar: RadarItem[];
  pitfalls: PitfallItem[];
} {
  const updatedMatch = profileMd.match(/最后更新[:：]\s*([0-9-]+)/);
  const levelMatch = profileMd.match(/当前定位[:：]\s*\*\*(.+?)\*\*/);
  const envMatch = profileMd.match(/实验环境[:：]\s*(.+)/);

  const radar: RadarItem[] = [];
  const pitfalls: PitfallItem[] = [];
  const lines = profileMd.split(/\r?\n/);
  let inPitfalls = false;

  for (const line of lines) {
    if (line.startsWith('## 三、')) {
      inPitfalls = true;
      continue;
    }

    if (!inPitfalls && line.startsWith('|')) {
      const cols = line
        .split('|')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      if (cols.length >= 3 && cols[0] !== '能力维度' && !cols[0].startsWith('---')) {
        const level = cols[1];
        const tone: RadarItem['tone'] = level.includes('🟢')
          ? 'good'
          : level.includes('🟡')
            ? 'mid'
            : 'weak';
        radar.push({
          dimension: stripInlineMd(cols[0]),
          level: level.replace(/[🟢🟡🔴]\s*/g, '').trim(),
          tone,
          detail: stripInlineMd(cols[2]),
        });
      }
    }

    if (inPitfalls) {
      const pfMatch = line.match(/^\d+\.\s+\*\*(.+?)\*\*[:：]\s*(.*)$/);
      if (pfMatch) {
        pitfalls.push({
          title: pfMatch[1].trim(),
          detail: stripInlineMd(pfMatch[2]),
        });
      }
    }
  }

  return {
    updatedAt: updatedMatch ? updatedMatch[1].trim() : '',
    currentLevel: levelMatch ? levelMatch[1].trim() : 'CTF Reverse 学习中',
    environment: envMatch ? envMatch[1].trim() : 'Arch Linux x86-64',
    radar,
    pitfalls,
  };
}

function parseLogs(logMd: string): LogEntry[] {
  const logs: LogEntry[] = [];
  const lines = logMd.split(/\r?\n/);
  let current: LogEntry | null = null;

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      current = { heading: h2[1].trim(), highlights: [] };
      logs.push(current);
      continue;
    }
    if (!current) continue;
    const bullet = line.match(/^-\s+(.+)$/);
    if (bullet) {
      current.highlights.push(stripInlineMd(bullet[1]));
    }
  }

  return logs.slice(0, 6);
}

export function loadReLearningData(): ReLearningData {
  const roadmapMd = readDoc('ROADMAP.md');
  const progressMd = readDoc('PROGRESS.md');
  const profileMd = readDoc('PROFILE.md');
  const logMd = readDoc('LOG.md');

  const branches = parseBranches(roadmapMd);
  const stages = parseStages(roadmapMd);
  const { currentStageSummary, queue } = parseQueue(progressMd);
  const { updatedAt, currentLevel, environment, radar, pitfalls } = parseProfile(profileMd);
  const logs = parseLogs(logMd);

  const total = branches.reduce((acc, b) => acc + b.nodes.length, 0);
  const mastered = branches.reduce((acc, b) => acc + b.masteredCount, 0);
  const learning = branches.reduce((acc, b) => acc + b.learningCount, 0);
  const locked = branches.reduce((acc, b) => acc + b.lockedCount, 0);

  return {
    updatedAt,
    currentLevel,
    environment,
    currentStageSummary,
    branches,
    totals: {
      total,
      mastered,
      learning,
      locked,
      touchedPercent: total ? Math.round(((mastered + learning) / total) * 100) : 0,
      masteredPercent: total ? Math.round((mastered / total) * 100) : 0,
    },
    stages,
    queue,
    radar,
    pitfalls,
    logs,
  };
}
