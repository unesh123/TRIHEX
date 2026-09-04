/**
 * Heuristic Static Security Scanner
 * Fast, isomorphic pattern-based static vulnerability analysis for agent skill scripts.
 * Evaluates scripts against RCE, reverse shells, root destruction, and credential exfiltration.
 */
import { AgentSkill } from "./types";

export type SkillRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "REVIEW_REQUIRED";

export type SecurityFindingCategory =
  | "REMOTE_CODE_EXEC"
  | "DESTRUCTIVE_COMMAND"
  | "PRIVILEGE_ESCALATION"
  | "CREDENTIAL_LEAK"
  | "REVERSE_SHELL"
  | "ARBITRARY_NETWORK";

export interface SecurityFinding {
  ruleId: string;
  category: SecurityFindingCategory;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  snippet: string;
  lineNumber?: number;
  filePath?: string;
}

export interface SkillSecurityScanResult {
  riskLevel: SkillRiskLevel;
  isExecutionSafe: boolean;
  sha256Checksum: string;
  findings: SecurityFinding[];
  scannedFilesCount: number;
  scannedBytes: number;
  scannedAt: string;
}

interface SecurityRule {
  id: string;
  category: SecurityFindingCategory;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  pattern: RegExp;
}

const SECURITY_RULES: SecurityRule[] = [
  // 1. Remote code execution / pipe to shell
  {
    id: "RCE_CURL_PIPE_SHELL",
    category: "REMOTE_CODE_EXEC",
    severity: "CRITICAL",
    message: "Untrusted remote payload piped directly to shell interpreter (curl/wget | sh/bash)",
    pattern: /(?:curl|wget)\s+[^\n|;&]+(?:\|\s*(?:sh|bash|zsh|dash|ksh|python|perl|ruby))/i,
  },
  {
    id: "RCE_POWERSHELL_IEX",
    category: "REMOTE_CODE_EXEC",
    severity: "CRITICAL",
    message: "PowerShell Invoke-Expression downloading and executing remote code",
    pattern: /(?:iex|invoke-expression)\s*(?:\(|\[)?\s*(?:irm|invoke-restmethod|curl|iwr|invoke-webrequest)/i,
  },
  {
    id: "RCE_PYTHON_EXEC_URL",
    category: "REMOTE_CODE_EXEC",
    severity: "HIGH",
    message: "Python executing remote script from URL in memory",
    pattern: /python[3]?\s+-c\s+["'].*?(?:urllib|requests).*?exec\(/i,
  },

  // 2. Destructive filesystem operations
  {
    id: "DESTRUCTIVE_ROOT_RM",
    category: "DESTRUCTIVE_COMMAND",
    severity: "CRITICAL",
    message: "Destructive recursive file deletion of root, home, or current directory",
    pattern: /rm\s+-(?:[a-z]*r[a-z]*f|[a-z]*f[a-z]*r)\s+(?:\/|\/\*|~|\.\/?\*)/i,
  },
  {
    id: "DESTRUCTIVE_WINDOWS_DEL",
    category: "DESTRUCTIVE_COMMAND",
    severity: "HIGH",
    message: "Unattended recursive file deletion in Windows shell",
    pattern: /del\s+\/[sfq\s]+\s+(?:[a-zA-Z]:\\|\*)/i,
  },
  {
    id: "DESTRUCTIVE_DISK_FORMAT",
    category: "DESTRUCTIVE_COMMAND",
    severity: "CRITICAL",
    message: "Filesystem format or raw device overwrite command",
    pattern: /(?:mkfs\.[a-z0-9]+|format\s+[a-zA-Z]:|dd\s+if=\/dev\/(?:zero|urandom)\s+of=\/dev\/)/i,
  },

  // 3. Privilege escalation
  {
    id: "PRIV_ESCALATION_SUDO",
    category: "PRIVILEGE_ESCALATION",
    severity: "HIGH",
    message: "Privilege escalation attempt using sudo or su root",
    pattern: /(?:sudo\s+(?:su|-i|bash|sh|rm)|su\s+-\s+root)/i,
  },
  {
    id: "PRIV_ESCALATION_PERMISSIONS",
    category: "PRIVILEGE_ESCALATION",
    severity: "HIGH",
    message: "Dangerous permission elevation granting global write/execute permissions (chmod 777)",
    pattern: /chmod\s+(?:-R\s+)?(?:777|a\+rwx|u\+s)/i,
  },

  // 4. Sensitive credential exfiltration
  {
    id: "CREDENTIAL_SSH_KEY_ACCESS",
    category: "CREDENTIAL_LEAK",
    severity: "HIGH",
    message: "Accessing private SSH keys or SSH identity configurations",
    pattern: /(?:cat|head|tail|grep|curl|nc)\s+[^\n]*?(?:~|\$HOME|\/root|\/home\/[^\s/]+)?\/\.ssh\/(?:id_rsa|id_ed25519|id_ecdsa)/i,
  },
  {
    id: "CREDENTIAL_SHADOW_PASSWD",
    category: "CREDENTIAL_LEAK",
    severity: "CRITICAL",
    message: "Direct access or read attempt on /etc/shadow or password database",
    pattern: /(?:cat|less|more|head|tail|cp)\s+\/etc\/(?:shadow|gshadow)/i,
  },
  {
    id: "CREDENTIAL_AWS_TOKENS",
    category: "CREDENTIAL_LEAK",
    severity: "HIGH",
    message: "Direct read or exfiltration of AWS credentials or config",
    pattern: /(?:\.aws\/(?:credentials|config)|AWS_SECRET_ACCESS_KEY|AWS_SESSION_TOKEN)/i,
  },

  // 5. Reverse shell & obfuscation
  {
    id: "REVERSE_SHELL_DEV_TCP",
    category: "REVERSE_SHELL",
    severity: "CRITICAL",
    message: "Interactive reverse shell connection over /dev/tcp",
    pattern: /(?:bash|sh)\s+-i\s+>&\s*\/dev\/tcp\/|\/dev\/tcp\/\d+\.\d+\.\d+\.\d+\/\d+/i,
  },
  {
    id: "REVERSE_SHELL_NETCAT",
    category: "REVERSE_SHELL",
    severity: "CRITICAL",
    message: "Netcat spawned with command execution flag (-e /bin/sh)",
    pattern: /(?:nc|ncat|netcat)\s+[^\n]*?-e\s+(?:\/bin\/(?:ba)?sh|cmd\.exe)/i,
  },
  {
    id: "OBFUSCATION_POWERSHELL_ENCODED",
    category: "REVERSE_SHELL",
    severity: "HIGH",
    message: "Obfuscated Base64-encoded command execution in PowerShell",
    pattern: /powershell[^\n]*?-(?:e|enc|encodedcommand)\s+[A-Za-z0-9+/=]{20,}/i,
  },

  // 6. Arbitrary network / raw IP
  {
    id: "NETWORK_RAW_IP_ENDPOINT",
    category: "ARBITRARY_NETWORK",
    severity: "MEDIUM",
    message: "Direct HTTP request to raw unauthenticated IP address instead of domain",
    pattern: /https?:\/\/(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]{2,5})?/i,
  },
];

/**
 * Universal fast SHA-256 computation that works in both Node.js and client browsers.
 */
export function computeUniversalSha256(input: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const words: number[] = [];
  const asciiBitLength = input.length * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let composite = input + "\x80";
  while (composite.length % 64 - 56) composite += "\x00";

  for (let i = 0; i < composite.length; i++) {
    const code = composite.charCodeAt(i) & 0xff;
    words[i >> 2] |= code << ((3 - i) % 4) * 8;
  }
  words[words.length] = (asciiBitLength / Math.pow(2, 32)) | 0;
  words[words.length] = asciiBitLength;

  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);

    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [(temp1 + temp2) | 0, a, hash[1], hash[2], (hash[3] + temp1) | 0, e, hash[5], hash[6]];
    }

    for (let i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  let result = "";
  for (let i = 0; i < 8; i++) {
    for (let j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? "0" : "") + b.toString(16);
    }
  }
  return result;
}

/**
 * Scans a single snippet or file content for security vulnerabilities and dangerous commands.
 */
export function scanSkillContent(
  content: string,
  filePath: string = "unnamed.txt"
): { findings: SecurityFinding[]; sha256: string } {
  const findings: SecurityFinding[] = [];
  const lines = content.split(/\r?\n/);
  const sha256 = computeUniversalSha256(content);

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const lineText = lines[lineIdx];
    for (const rule of SECURITY_RULES) {
      if (rule.pattern.test(lineText)) {
        findings.push({
          ruleId: rule.id,
          category: rule.category,
          severity: rule.severity,
          message: rule.message,
          snippet: lineText.trim().slice(0, 140),
          lineNumber: lineIdx + 1,
          filePath,
        });
      }
    }
  }

  return { findings, sha256 };
}

/**
 * Performs comprehensive security audit on an AgentSkill across all embedded files and scripts.
 */
export function scanAgentSkill(skill: AgentSkill): SkillSecurityScanResult {
  const allFindings: SecurityFinding[] = [];
  let totalBytes = 0;
  let concatenated = "";

  for (const file of skill.files) {
    totalBytes += file.sizeBytes || file.content.length;
    concatenated += file.content;

    const { findings } = scanSkillContent(file.content, file.path);
    allFindings.push(...findings);
  }

  // Also scan summary and description
  const metaContent = `${skill.name}\n${skill.summary}\n${skill.description}`;
  const metaScan = scanSkillContent(metaContent, "metadata");
  allFindings.push(...metaScan.findings);

  // Compute aggregate risk level
  let riskLevel: SkillRiskLevel = "LOW";
  let isExecutionSafe = true;

  const hasCritical = allFindings.some((f) => f.severity === "CRITICAL");
  const hasHigh = allFindings.some((f) => f.severity === "HIGH");
  const hasMedium = allFindings.some((f) => f.severity === "MEDIUM");

  if (hasCritical) {
    riskLevel = "REVIEW_REQUIRED";
    isExecutionSafe = false;
  } else if (hasHigh) {
    riskLevel = "HIGH";
    isExecutionSafe = false;
  } else if (hasMedium) {
    riskLevel = "MEDIUM";
    isExecutionSafe = false;
  } else {
    riskLevel = "LOW";
    isExecutionSafe = true;
  }

  return {
    riskLevel,
    isExecutionSafe,
    sha256Checksum: computeUniversalSha256(concatenated),
    findings: allFindings,
    scannedFilesCount: skill.files.length,
    scannedBytes: totalBytes,
    scannedAt: new Date().toISOString(),
  };
}
