---
title: "TDCTF 2026 Crypto wp"
slug: "tdctf-2026-crypto-wp"
date: 2026-11-23
updated: 2026-11-23
published: true
categories: ["TDCTF_2026"]
tags: ["TDCTF_2026", "Crypto"]
---

# TDCTF 2026 Crypto wp

> 发布于 2026-11-23 06:25:00

把这次通达校赛的 10 道密码题整理到一起，基本都是入门套路，顺便留个脚本以后忘的时候翻。

### crypto01_base

打开是一长串十六进制：

```
4c4a575851324332474e3247535453494a563546514d535a47425246495254544d564c445136444447453448555453494a5932574d554a3548553d3d3d3d3d3d
```

经典的编码套娃，一层层解就行：

先 Hex 转成字符串，看到末尾一堆 `=` 而且全是大写字母和数字，那就是 Base32：

```
LJWXQ2C2GN2GSTSIJV5FQMSZGBRFIRTTMVLDQ6DDGE4HUTSIJY2WMUJ5HU======
```

Base32 解完变成 `ZmxhZ3tiNHMzX2Y0bTFseV8xc18zNHN5fQ==`，一眼 Base64，再解一遍就出 flag 了。

```python
import base64

s = open("crypto01_base.txt").read().strip()
print(base64.b64decode(base64.b32decode(bytes.fromhex(s))).decode())
```

flag{b4s3_f4m1ly_1s_34sy}

### crypto02_morse

```
- -.. -.-. - ..-. ..--- ----- ..--- -....
```

非常简单的摩斯密码，对着表翻一下就是 `TDCTF2026`，题目让套上花括号。

flag{TDCTF2026}

### crypto03_caesar

```
synt{p43f4e_p1cu3e_1f_34fl}
```

凯撒密码，提示移位 1-25。其实看开头 `synt` 对应 `flag`，`s` 到 `f` 差 13 位，就是 ROT13。

写个小循环把 1 到 25 跑一遍找 `flag{` 开头：

```python
s = "synt{p43f4e_p1cu3e_1f_34fl}"
for k in range(1, 26):
    res = ""
    for ch in s:
        if "a" <= ch <= "z":
            res += chr((ord(ch) - ord("a") - k) % 26 + ord("a"))
        else:
            res += ch
    if res.startswith("flag{"):
        print(k, res)
```

flag{c43s4r_c1ph3r_1s_34sy}

### crypto04_rail

```
f{lnc3lgr1_3c_1hra4f3p}
```

提示栅栏密码，分组数是 3。

刚开始按普通的 3 组切分试了一下，出来一堆乱码，换成 **W 型栅栏**（3 栏折线）就正常了。

```python
s = "f{lnc3lgr1_3c_1hra4f3p}"
n = len(s)
rails = 3
cycle = 2 * (rails - 1)

lens = [0] * rails
for i in range(n):
    r = i % cycle
    if r >= rails:
        r = cycle - r
    lens[r] += 1

parts = []
idx = 0
for l in lens:
    parts.append(list(s[idx:idx + l]))
    idx += l

out = []
for i in range(n):
    r = i % cycle
    if r >= rails:
        r = cycle - r
    out.append(parts[r].pop(0))

print("".join(out))
```

flag{r41l_f3nc3_c1ph3r}

### crypto05_bacon

```
BAABB AAABB AAABA BAABB AABAB
```

培根密码，把 `A` 换成 `0`，`B` 换成 `1`，每 5 位转成十进制再按 26 个字母（0=A ... 25=Z）对应回去就行。

```python
s = "BAABB AAABB AAABA BAABB AABAB".split()
res = "".join(chr(ord("A") + int(x.replace("A", "0").replace("B", "1"), 2)) for x in s)
print(res)
```

解出来是 `TDCTF`，套上花括号。

flag{TDCTF}

### crypto06_pigpen

```
◰ ◲ ◳ ◰ ◧ ◨
```

题目直接把对应关系给出来了：`◰ -> P, ◲ -> I, ◳ -> G, ◧ -> E, ◨ -> N`。

照着替换得到 `PIGPEN`，套上花括号。

flag{PIGPEN}

### crypto07_core

```
爱国公正敬业富强爱国民主爱国法治诚信和谐爱国和谐自由富强敬业公正自由和谐法治友善敬业诚信自由自由敬业富强敬业敬业自由和谐敬业法治法治友善自由和谐敬业文明爱国和谐自由富强爱国自由自由和谐诚信平等
```

这题卡了我一下。一开始拿标准的核心价值观解码（10 和 11 做转义那种）跑，结果解出来的十六进制是奇数位，直接报错了。

把每个词在编码表里的下标打印出来看了眼：

```
[8, 6, 9, 0, 8, 1, 8, 7, 10, 3, ..., 10, 5]
```

一共 48 个数，试着把前两个按 12 进制算了一下：`8 * 12 + 6 = 102`，正好是 `'f'`；`9 * 12 + 0 = 108`，正好是 `'l'`；最后 `10 * 12 + 5 = 125`，正好是 `'}'`。

原来这题是直接拿 12 个词当 **12 进制**来编 ASCII 码的，每两个词代表一个字符。

```python
values = ["富强", "民主", "文明", "和谐", "自由", "平等", "公正", "法治", "爱国", "敬业", "诚信", "友善"]
s = "爱国公正敬业富强爱国民主爱国法治诚信和谐爱国和谐自由富强敬业公正自由和谐法治友善敬业诚信自由自由敬业富强敬业敬业自由和谐敬业法治法治友善自由和谐敬业文明爱国和谐自由富强爱国自由自由和谐诚信平等"
tokens = [values.index(s[i:i + 2]) for i in range(0, len(s), 2)]
print("".join(chr(tokens[i] * 12 + tokens[i + 1]) for i in range(0, len(tokens), 2)))
```

flag{c0r3_v4lu3s_3nc0d3}

### crypto08_rsa

最基础的 RSA，题目把 `p, q, e, c` 全给了，直接套公式算 `phi` 和私钥 `d`。

Python 3 自带 `pow(e, -1, phi)` 求模逆，连 `pycryptodome` 都不用装：

```python
p = 76695483023687954912218508678851810935257031426035132888946374705354311334899
q = 81991787261210265835199299715584680940581043296260541420766598479526543215693
e = 65537
c = 750653682471286481696664122781220055219502218791419279351951520466564596322430820058135297634333935149928860349920073194589467678600947043507958220679499

n = p * q
phi = (p - 1) * (q - 1)
d = pow(e, -1, phi)
m = pow(c, d, n)
print(m.to_bytes((m.bit_length() + 7) // 8, "big").decode())
```

flag{rs4_b4s1cs_p_q_d}

### crypto09_rsa_lowexp

RSA 小公钥指数攻击，`e = 3`。

明文很短，$m^3$ 还没超过 `n`，取模压根没回绕，直接对 `c` 开立方根就行。没装 `gmpy2` 的话写个二分查找求整数立方根也很快：

```python
c = 265750796544749612156533451145121218013839982260102867839043726093141512691178502619976475828916148908299156234618664256957199582653033424391761825032331637306903492553062076520037

lo, hi = 0, c
while lo < hi:
    mid = (lo + hi) // 2
    if mid ** 3 < c:
        lo = mid + 1
    else:
        hi = mid

print(lo.to_bytes((lo.bit_length() + 7) // 8, "big").decode())
```

flag{l0w_exp0n3nt_4tt4ck}

### crypto10_rsa_common

RSA 共模攻击。同一个 `n`，用互素的两个指数 `e1 = 65537` 和 `e2 = 3` 加密了同一个明文。

用扩展欧几里得求出一组整数 `a, b` 满足 `a * e1 + b * e2 = 1`，然后算 `c1^a * c2^b mod n` 就能直接把 `m` 还原出来。

注意 `a` 和 `b` 里面肯定有一个是负数，负数次幂要先用 `pow(c, -1, n)` 求逆元再做正数次幂。

```python
n = 115935619084510180220428272347273592098392610761929270582054752156963723811831868832896973559336265774700136506286679030780193356767645994577952690623459722785924596938147909392787351250008305189424006869053660154746810231371171243640195540707934668768712230908664747777551924508794008520408811178730014719063
e1 = 65537
c1 = 48625254821567734319539860003315651182964027117944692170524130655104546653819646735465139677622228784629713351626239409465181761927194873613527559538873293165045540660789311047014574742879443726264298335097117055913248671804550333004392892298092306072535432200889137061101500104189852858302791152667915189583
e2 = 3
c2 = 74802199268253743687324493470470104829166668388017968527219084799294489158700233391672136070265462278928074573717405183406977157450260123371571295290227771219588437060963597499076440693627295333

def egcd(a, b):
    if b == 0:
        return a, 1, 0
    g, x, y = egcd(b, a % b)
    return g, y, x - (a // b) * y

g, a, b = egcd(e1, e2)
p1 = pow(c1, a, n) if a >= 0 else pow(pow(c1, -1, n), -a, n)
p2 = pow(c2, b, n) if b >= 0 else pow(pow(c2, -1, n), -b, n)
m = (p1 * p2) % n
print(m.to_bytes((m.bit_length() + 7) // 8, "big").decode())
```

flag{c0mm0n_m0dulus_4tt4ck}
