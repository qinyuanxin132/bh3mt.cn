---
title: "西电CTF 2026 让我们说中文 wp"
slug: "xi-dian-ctf-2026-rang-wo-men-shuo-zhong-wen"
date: 2026-10-22
updated: 2026-10-22
published: true
categories: []
tags: []
---

# 西电CTF 2026 让我们说中文 wp

> 发布于 2026-10-22 13:27:13

### 先查看DIE

```
ELF64
Operation system: Ubuntu Linux (ABI: 3.2.0) [AMD64, 64位, EXEC]
Compiler: GCC ((Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0)
Language: C
Library: GLIBC (2.34) [EXEC AMD64-64]
```

尝试运行

```
 chmod +x chall14
  ./chall14
```

```
Input cipher: aaa   
Wrong!
```

又是一个效验输入的题

### 打开IDA 

main:

```C
__int64 __fastcall main(int a1, char **a2, char **a3)
{
  size_t v3; // rax
  const char *v4; // rax
  char *v5; // rbx
  char v7[4104]; // [rsp+0h] [rbp-1008h] BYREF

  __printf_chk(2, "Input cipher: ", a3);
if ( !fgets(v7, 4096, stdin) )
{  //如果fgets读取失败，代码走向这里
    puts("Input error."); // 1. 打印错误提示
    return 1;             // 2. 异常退出
}
  v7[strcspn(v7, "\r\n")] = 0;
  v3 = strlen(v7);  //v3是输入的v7的长度
  v4 = (const char *)sub_401480(v7, v3);  //那这个概率就是加密脚本了
  v5 = (char *)v4;
  if ( !v4 )
  {
    puts("Memory error.");
    return 1;
  }
  if ( !strcmp(
          v4,
          "KwC2gtPmKwn2NwTyKwGilvt0KwOiuqTvKw43utP2KwOxgttpKwC2gtPmKwn2lwUiKwIxNvtzKwn2lTa5Kw42KTP0KwIiNtt0Kw42NRT3KwM2g4"
          "JaKwn3NTarKwIxu5OrKw42NRT3KwOxKwUrKwIxu5OrKw42NRT3KwIxKtP3Kwn3N4PjKwIiK5T0Kw43lRUxKwIiNtt0Kw42NRT3Kw42NwOxKwOi"
          "KTPzKwKxg5OxKw42g5TpKwDxl4JrKwIxu5OrKw42NRT3KwIxKtP3KwM2g4JaKwC2g4P3KwDxKwOaKw42NwMqKwIxu5OrKw42NRT3KwIiN5TzKw"
          "Kxg5OxKw42g5TpKwDxl4JrKwIiNtt0Kw42NRT3KwOxK4JaKwKxg5OtKwGxlwU5Kwn3N4PjKwIiK5T0KwT3lTPzKwn3N4PjKwIiK5T0KwKxg5Mq"
          "KwIxu5OrKw42NRT3Kw43lvPjKwIxu5OrKw42NRT3KwM2g4JaKwn3NTarKw42KTPqKwn2lTa5Kw42KTP0") )
    puts("Correct!");
  else
    puts("Wrong!");
  free(v5);
  return 0;
}
```

分析加密逻辑

```C
_BYTE *sub_401480()
{
  _BYTE *result; // rax
  char v1; // cl
  _BYTE *v2; // rdi
  __int64 v3; // rdx

  result = (_BYTE *)sub_4012F0();
  if ( result )
  {
    v1 = *result;
    if ( *result )
    {
      v2 = result;
      do
      {
        if ( v1 != 61 )
        {
          v3 = 0;
          while ( aAbcdefghijklmn[v3] != v1 )
          {
            if ( ++v3 == 64 )
              goto LABEL_9;
          }
          *v2 = aSix5tarspjyoun[v3];
        }
LABEL_9:
        v1 = *++v2;
      }
      while ( v1 );
    }
  }
  return result;
}
```


再查看sub_4012F0()

```C
_BYTE *__fastcall sub_4012F0(__int64 a1, unsigned __int64 a2)
{
  _BYTE *v4; // rax
  _BYTE *v5; // rdi
  __int64 v6; // rcx
  unsigned __int64 v7; // rdx
  unsigned __int64 v8; // rsi
  unsigned int v9; // eax
  int v10; // r10d
  int v11; // esi
  int v12; // r9d
  unsigned int v13; // eax
  unsigned int v14; // esi
  __int16 v16; // dx

  v4 = malloc(4 * ((a2 + 2) / 3) + 1);
  v5 = v4;
  if ( !v4 )
    return v5;
  if ( !a2 )
    goto LABEL_10;
  v6 = 0;
  v7 = 0;
  do
  {
    while ( 1 )
    {
      v8 = v7 + 1;
      v9 = *(unsigned __int8 *)(a1 + v7);
      if ( v7 + 1 >= a2 )
      {
        v5[v6 + 2] = 61;
        LOBYTE(v16) = aAbcdefghijklmn[v9 >> 2];
        HIBYTE(v16) = aAbcdefghijklmn[(16 * (_BYTE)v9) & 0x30];
        *(_WORD *)&v5[v6] = v16;
        v7 = v8;
        break;
      }
      v10 = *(unsigned __int8 *)(a1 + v7 + 1) << 8;
      if ( v7 + 2 >= a2 )
      {
        v7 += 2LL;
        v12 = 0;
        v11 = 0;
      }
      else
      {
        v11 = *(unsigned __int8 *)(a1 + v7 + 2);
        v7 += 3LL;
        v12 = 1;
      }
      v13 = v9 << 16;
      v14 = v13 | v10 | v11;
      LOBYTE(v13) = aAbcdefghijklmn[v13 >> 18];
      BYTE1(v13) = aAbcdefghijklmn[(v14 >> 12) & 0x3F];
      *(_WORD *)&v5[v6] = v13;
      v5[v6 + 2] = aAbcdefghijklmn[(v14 >> 6) & 0x3F];
      if ( !v12 )
        break;
      v6 += 4;
      v5[v6 - 1] = aAbcdefghijklmn[v14 & 0x3F];
      if ( v7 >= a2 )
        goto LABEL_9;
    }
    v6 += 4;
    v5[v6 - 1] = 61;
  }
  while ( v7 < a2 );
LABEL_9:
  v4 = &v5[v6];
LABEL_10:
  *v4 = 0;
  return v5;
}
```

```
.rodata:00000000004022E0 aAbcdefghijklmn db 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',0
```

sub_4012F0() 应该是base编码

到这里就清楚了

程序先对标准输入进行了标准加密  
接着对输出进行换表加密

`Six5tarsPJYouNgLlKEw4Ik1nGABCDFHMOQRTUVWXZbcdefhjmpqvyz0236789+/`

接着将结果与

解密脚本：

```python
import base64

# 1. 提取的表
standard_table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
custom_table = "Six5tarsPJYouNgLlKEw4Ik1nGABCDFHMOQRTUVWXZbcdefhjmpqvyz0236789+/"

# 2. 从 IDA 中提取的密文
ciphertext = "KwC2gtPmKwn2NwTyKwGilvt0KwOiuqTvKw43utP2KwOxgttpKwC2gtPmKwn2lwUiKwIxNvtzKwn2lTa5Kw42KTP0KwIiNtt0Kw42NRT3KwM2g4JaKwn3NTarKwIxu5OrKw42NRT3KwOxKwUrKwIxu5OrKw42NRT3KwIxKtP3Kwn3N4PjKwIiK5T0Kw43lRUxKwIiNtt0Kw42NRT3Kw42NwOxKwOiKTPzKwKxg5OxKw42g5TpKwDxl4JrKwIxu5OrKw42NRT3KwIxKtP3KwM2g4JaKwC2g4P3KwDxKwOaKw42NwMqKwIxu5OrKw42NRT3KwIiN5TzKwKxg5OxKw42g5TpKwDxl4JrKwIiNtt0Kw42NRT3KwOxK4JaKwKxg5OtKwGxlwU5Kwn3N4PjKwIiK5T0KwT3lTPzKwn3N4PjKwIiK5T0KwKxg5MqKwIxu5OrKw42NRT3Kw43lvPjKwIxu5OrKw42NRT3KwM2g4JaKwn3NTarKw42KTPqKwn2lTa5Kw42KTP0"

# 3. 逆向换表：把自定义表中的字符换回标准 Base64 字符
translated_b64 = ""
for char in ciphertext:
    if char == '=':
        translated_b64 += '='
    else:
        # 找到该字符在自定义表中的索引
        idx = custom_table.find(char)
        if idx != -1:
            # 替换为标准表中对应索引的字符
            translated_b64 += standard_table[idx]
        else:
            translated_b64 += char

print(f"[*] 还原后的标准 Base64:\n{translated_b64}\n")

# 4. 最终解码
try:
    flag_bytes = base64.b64decode(translated_b64)
    # 因为题目叫“让我们说中文”，解码结果很可能是中文字符，用 utf-8 解析
    flag = flag_bytes.decode('utf-8')
    print(f"[+] 解密成功！Flag 为:\n{flag}")
except Exception as e:
    print(f"[-] 解码失败: {e}")
```

得到
```
E788B1E68595E6ACA7E8A394E590B8E8B8A2E788B1E68A9AE5B7A6E68BACE58FB7E5A4A7E58699E889BEE696AFE5B08FE58699E8BE9FE5B08FE58699E5BDB9E695B0E5AD97E59B9BE5A4A7E58699E5858BE8AFB6E4B88BE58892E7BABFE5B08FE58699E5BDB9E889BEE789B9E7BE8EE58583E5B08FE58699E5A496E4B88BE58892E7BABFE5A4A7E58699E8BEBEE4B88DE6BA9CE695B0E5AD97E99BB6E695B0E5AD97E4B883E5B08FE58699E59CB0E5B08FE58699E889BEE696AFE58FB3E68BACE58FB7
```

看起来像中文字符
```python
hex_str = "E788B1E68595E6ACA7E8A394E590B8E8B8A2E788B1E68A9AE5B7A6E68BACE58FB7E5A4A7E58699E889BEE696AFE5B08FE58699E8BE9FE5B08FE58699E5BDB9E695B0E5AD97E59B9BE5A4A7E58699E5858BE8AFB6E4B88BE58892E7BABFE5B08FE58699E5BDB9E889BEE789B9E7BE8EE58583E5B08FE58699E5A496E4B88BE58892E7BABFE5A4A7E58699E8BEBEE4B88DE6BA9CE695B0E5AD97E99BB6E695B0E5AD97E4B883E5B08FE58699E59CB0E5B08FE58699E889BEE696AFE58FB3E68BACE58FB7"
print(bytes.fromhex(hex_str).decode('utf-8'))
```

爱慕欧裔吸踢爱抚左括号大写艾斯小写辟小写役数字四
大写克诶下划线小写役艾特美元小写外下划线大写达不溜数字零数字七小写地小写艾斯右括号

神了，这是拼音谐音

moectf{Spe4K_e@$y_W07ds}