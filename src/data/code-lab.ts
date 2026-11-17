export const languageIds = [
  "python",
  "c",
  "cpp",
  "javascript",
  "typescript",
  "java",
  "go",
  "php",
  "ruby",
  "lua",
  "sql",
] as const;
export type Language = (typeof languageIds)[number];
export type Draft = { source: string; stdin: string };
export const examples: Record<Language, Record<string, Draft>> = {
  python: {
    hello: {
      source:
        'print("你好，世界！这里是泠的代码实验室。")\n\nfor i in range(1, 4):\n    print(f"第 {i} 次尝试，离答案更近一点。")\n',
      stdin: "",
    },
    sum: {
      source:
        '# 输入两个整数，以空格分隔\na, b = map(int, input().split())\nprint(f"{a} + {b} = {a + b}")\n',
      stdin: "12 30\n",
    },
    algorithm: {
      source:
        '# 输出前 n 个斐波那契数\nn = int(input())\na, b = 0, 1\nfor _ in range(n):\n    print(a, end=" ")\n    a, b = b, a + b\nprint()\n',
      stdin: "10\n",
    },
  },
  c: {
    hello: {
      source:
        '#include <stdio.h>\n\nint main(void) {\n    printf("你好，世界！这里是泠的代码实验室。\\n");\n    for (int i = 1; i <= 3; ++i) {\n        printf("第 %d 次尝试，离答案更近一点。\\n", i);\n    }\n    return 0;\n}\n',
      stdin: "",
    },
    sum: {
      source:
        '#include <stdio.h>\n\nint main(void) {\n    long long a, b;\n    if (scanf("%lld %lld", &a, &b) != 2) {\n        fprintf(stderr, "请输入两个整数\\n");\n        return 1;\n    }\n    printf("%lld + %lld = %lld\\n", a, b, a + b);\n    return 0;\n}\n',
      stdin: "12 30\n",
    },
    algorithm: {
      source:
        '#include <stdio.h>\n\nint main(void) {\n    int n;\n    if (scanf("%d", &n) != 1 || n < 0 || n > 90) return 1;\n    unsigned long long a = 0, b = 1;\n    for (int i = 0; i < n; ++i) {\n        printf("%llu ", a);\n        unsigned long long next = a + b;\n        a = b; b = next;\n    }\n    printf("\\n");\n    return 0;\n}\n',
      stdin: "10\n",
    },
  },
  cpp: {
    hello: {
      source:
        '#include <iostream>\n#include <string>\n#include <vector>\n\nint main() {\n    std::vector<std::string> notes = {"你好，世界！", "这里是泠的代码实验室。"};\n    for (const auto& note : notes) {\n        std::cout << note << "\\n";\n    }\n}\n',
      stdin: "",
    },
    sum: {
      source:
        '#include <iostream>\n\nint main() {\n    long long a, b;\n    if (!(std::cin >> a >> b)) {\n        std::cerr << "请输入两个整数\\n";\n        return 1;\n    }\n    std::cout << a << " + " << b << " = " << a + b << "\\n";\n}\n',
      stdin: "12 30\n",
    },
    algorithm: {
      source:
        '#include <iostream>\n#include <vector>\n\nint main() {\n    int n;\n    if (!(std::cin >> n) || n < 0 || n > 90) return 1;\n    std::vector<unsigned long long> fib = {0, 1};\n    for (int i = 2; i < n; ++i) fib.push_back(fib[i - 1] + fib[i - 2]);\n    for (int i = 0; i < n; ++i) std::cout << fib[i] << " ";\n    std::cout << "\\n";\n}\n',
      stdin: "10\n",
    },
  },
  javascript: {
    hello: {
      source: 'console.log("你好，世界！这里是泠的代码实验室。");\n',
      stdin: "",
    },
    sum: {
      source:
        "const [a, b] = stdin.trim().split(/\\s+/).map(Number);\nconsole.log(`${a} + ${b} = ${a + b}`);\n",
      stdin: "12 30\n",
    },
    algorithm: {
      source:
        'const n = Number(readline());\nlet a = 0, b = 1;\nconst result = [];\nfor (let i = 0; i < n; i++) {\n  result.push(a);\n  [a, b] = [b, a + b];\n}\nconsole.log(result.join(" "));\n',
      stdin: "10\n",
    },
  },
  typescript: {
    hello: {
      source:
        'const greeting: string = "你好，世界！这里是泠的代码实验室。";\nconsole.log(greeting);\n',
      stdin: "",
    },
    sum: {
      source:
        "const [a, b]: number[] = stdin.trim().split(/\\s+/).map(Number);\nconsole.log(`${a} + ${b} = ${a + b}`);\n",
      stdin: "12 30\n",
    },
    algorithm: {
      source:
        'const n: number = Number(readline());\nlet a: number = 0, b: number = 1;\nconst result: number[] = [];\nfor (let i = 0; i < n; i++) {\n  result.push(a);\n  [a, b] = [b, a + b];\n}\nconsole.log(result.join(" "));\n',
      stdin: "10\n",
    },
  },
  java: {
    hello: {
      source:
        'public class Main {\n    public static void main(String[] args) {\n        System.out.println("你好，世界！这里是泠的代码实验室。");\n    }\n}\n',
      stdin: "",
    },
    sum: {
      source:
        'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        long a = in.nextLong(), b = in.nextLong();\n        System.out.println(a + " + " + b + " = " + (a + b));\n    }\n}\n',
      stdin: "12 30\n",
    },
    algorithm: {
      source:
        'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt();\n        long a = 0, b = 1;\n        for (int i = 0; i < n; i++) {\n            System.out.print(a + " ");\n            long next = a + b; a = b; b = next;\n        }\n        System.out.println();\n    }\n}\n',
      stdin: "10\n",
    },
  },
  go: {
    hello: {
      source:
        'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("你好，世界！这里是泠的代码实验室。")\n}\n',
      stdin: "",
    },
    sum: {
      source:
        'package main\n\nimport "fmt"\n\nfunc main() {\n    var a, b int\n    fmt.Scan(&a, &b)\n    fmt.Printf("%d + %d = %d\\n", a, b, a + b)\n}\n',
      stdin: "12 30\n",
    },
    algorithm: {
      source:
        'package main\n\nimport "fmt"\n\nfunc main() {\n    var n int\n    fmt.Scan(&n)\n    a, b := 0, 1\n    for i := 0; i < n; i++ {\n        fmt.Printf("%d ", a)\n        a, b = b, a + b\n    }\n    fmt.Println()\n}\n',
      stdin: "10\n",
    },
  },
  php: {
    hello: {
      source: '<?php\necho "你好，世界！这里是泠的代码实验室。\\n";\n',
      stdin: "",
    },
    sum: {
      source:
        '<?php\n[$a, $b] = array_map("intval", preg_split("/\\s+/", trim(fgets(STDIN))));\necho "$a + $b = " . ($a + $b) . "\\n";\n',
      stdin: "12 30\n",
    },
    algorithm: {
      source:
        '<?php\n$n = intval(trim(fgets(STDIN)));\n$a = 0; $b = 1;\nfor ($i = 0; $i < $n; $i++) {\n    echo "$a ";\n    [$a, $b] = [$b, $a + $b];\n}\necho "\\n";\n',
      stdin: "10\n",
    },
  },
  ruby: {
    hello: { source: 'puts "你好，世界！这里是泠的代码实验室。"\n', stdin: "" },
    sum: {
      source:
        'a, b = gets.split.map { |s| s.to_i }\nputs "#{a} + #{b} = #{a + b}"\n',
      stdin: "12 30\n",
    },
    algorithm: {
      source:
        'n = gets.to_i\na, b = 0, 1\nresult = []\nn.times do\n  result << a\n  a, b = b, a + b\nend\nputs result.join(" ")\n',
      stdin: "10\n",
    },
  },
  lua: {
    hello: {
      source: 'print("你好，世界！这里是泠的代码实验室。")\n',
      stdin: "",
    },
    sum: {
      source:
        'local a, b = io.read("*n", "*n")\nprint(string.format("%d + %d = %d", a, b, a + b))\n',
      stdin: "12 30\n",
    },
    algorithm: {
      source:
        'local n = io.read("*n")\nlocal a, b = 0, 1\nlocal result = {}\nfor i = 1, n do\n  result[i] = tostring(a)\n  a, b = b, a + b\nend\nprint(table.concat(result, " "))\n',
      stdin: "10\n",
    },
  },
  sql: {
    hello: {
      source: "SELECT '你好，世界！这里是泠的代码实验室。' AS greeting;\n",
      stdin: "",
    },
    sum: {
      source:
        "-- 标准输入的各行放在 stdin(line) 表里\nWITH values_in AS (\n  SELECT CAST(substr(line, 1, instr(line, ' ') - 1) AS INTEGER) AS a,\n         CAST(substr(line, instr(line, ' ') + 1) AS INTEGER) AS b\n  FROM stdin LIMIT 1\n)\nSELECT a || ' + ' || b || ' = ' || (a + b) AS result FROM values_in;\n",
      stdin: "12 30\n",
    },
    algorithm: {
      source:
        "WITH RECURSIVE fib(i, a, b) AS (\n  SELECT 0, 0, 1\n  UNION ALL\n  SELECT i + 1, b, a + b FROM fib\n  WHERE i + 1 < CAST((SELECT line FROM stdin LIMIT 1) AS INTEGER)\n)\nSELECT group_concat(a, ' ') AS sequence FROM fib;\n",
      stdin: "10\n",
    },
  },
};

export const languageInfo: Record<
  Language,
  { label: string; filename: string; grammar: string; note: string }
> = {
  python: {
    label: "Python",
    filename: "main.py",
    grammar: "python",
    note: "Python 标准库 · 输入按 UTF-8 原样读取，读完为 EOF。",
  },
  c: {
    label: "C · C17",
    filename: "main.c",
    grammar: "c",
    note: "Clang / C17 · 使用 scanf、fgets 等读取标准输入。",
  },
  cpp: {
    label: "C++ · C++20",
    filename: "main.cpp",
    grammar: "c++",
    note: "Clang / C++20 · libc++ 标准库，支持 cin；暂不支持异常和线程。",
  },
  javascript: {
    label: "JavaScript",
    filename: "main.js",
    grammar: "javascript",
    note: "浏览器 JavaScript · stdin 为完整输入，readline() 逐行读取；不提供 Node.js 模块或 DOM。",
  },
  typescript: {
    label: "TypeScript",
    filename: "main.ts",
    grammar: "typescript",
    note: "转译后在浏览器运行 · stdin / readline() 读取输入；不进行类型检查。",
  },
  java: {
    label: "Java",
    filename: "Main.java",
    grammar: "java",
    note: "javac + TeaVM · 支持常用 Scanner 输入兼容层，部分 Java 标准库 API 受限。",
  },
  go: {
    label: "Go",
    filename: "main.go",
    grammar: "go",
    note: "Yaegi Go 解释器 · 支持常用标准库和 fmt.Scan，不提供 cgo。",
  },
  php: {
    label: "PHP · 8.4",
    filename: "main.php",
    grammar: "php",
    note: "PHP 8.4 · 源码以 <?php 开始；STDIN / php://stdin 读取预填输入。",
  },
  ruby: {
    label: "Ruby · mruby",
    filename: "main.rb",
    grammar: "ruby",
    note: "mruby · gets 读取输入；提供核心语言，暂不支持 gems 和 CRuby 扩展。",
  },
  lua: {
    label: "Lua · 5.4",
    filename: "main.lua",
    grammar: "lua",
    note: "Lua 5.4 · io.read 读取输入，使用标准 print / io.write 输出。",
  },
  sql: {
    label: "SQL · SQLite",
    filename: "main.sql",
    grammar: "sql",
    note: "SQLite 内存数据库 · 每次运行重新创建；标准输入各行可通过 stdin(line) 表查询。",
  },
};
