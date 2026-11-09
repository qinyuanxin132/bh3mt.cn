---
title: "西电CTF 2026 请 fanchai 喝茶 wp"
slug: "xi-dian-ctf-2026-qing-fanchai-he-cha"
date: 2026-11-5
updated: 2026-11-5
published: true
categories: ["西电CTF_2026"]
tags: ["西电CTF_2026"]
---

# 西电CTF 2026 请 fanchai 喝茶 wp

> 发布于 2026-11-5 13:40:33

打开IDA找到main

```c
__int64 __fastcall main(int a1, char **a2, char **a3)
{
  char *v3; // rsi
  __m128i *v4; // rdi
  __int64 v5; // rcx
  unsigned int v6; // edx
  unsigned __int32 v7; // esi
  unsigned __int32 v8; // ebp
  unsigned __int32 v9; // ebx
  unsigned __int32 v10; // r11d
  unsigned __int32 v11; // r10d
  unsigned __int32 v12; // r9d
  unsigned __int32 v13; // r8d
  unsigned __int32 v14; // edi
  __m128i v15; // xmm0
  __m128i v16; // xmm0
  unsigned __int32 v18; // [rsp+0h] [rbp-E8h]
  unsigned __int32 v19; // [rsp+4h] [rbp-E4h]
  unsigned __int32 v20; // [rsp+8h] [rbp-E0h]
  unsigned __int32 v21; // [rsp+Ch] [rbp-DCh]
  unsigned __int32 v22; // [rsp+10h] [rbp-D8h]
  unsigned __int32 v23; // [rsp+14h] [rbp-D4h]
  unsigned __int32 v24; // [rsp+18h] [rbp-D0h]
  unsigned __int32 v25; // [rsp+1Ch] [rbp-CCh]
  __m128i v26; // [rsp+20h] [rbp-C8h] BYREF
  __m128i v27; // [rsp+30h] [rbp-B8h]
  __m128i v28; // [rsp+40h] [rbp-A8h]
  __m128i v29; // [rsp+50h] [rbp-98h]
  char s[136]; // [rsp+60h] [rbp-88h] BYREF

  fwrite("Input flag: ", 1u, 0xCu, stdout);
  fflush(stdout);
  if ( !fgets(s, 66, stdin) )
    goto LABEL_9;
  s[strcspn(s, "\r\n")] = 0;
  if ( strlen(s) != 64 )
    goto LABEL_9;
  v3 = s;
  v4 = &v26;
  v5 = 16;
  v6 = 0;
  while ( v5 )
  {
    v4->m128i_i32[0] = *(_DWORD *)v3;
    v3 += 4;
    v4 = (__m128i *)((char *)v4 + 4);
    --v5;
  }
  v7 = v29.m128i_u32[3];
  v8 = v28.m128i_i32[0];
  v9 = v28.m128i_u32[1];
  v10 = v28.m128i_u32[2];
  v11 = v28.m128i_u32[3];
  v25 = v26.m128i_i32[0];
  v12 = v29.m128i_i32[0];
  v13 = v29.m128i_u32[1];
  v14 = v29.m128i_u32[2];
  v20 = v26.m128i_u32[2];
  v24 = v26.m128i_u32[1];
  v19 = v26.m128i_u32[3];
  v23 = v27.m128i_u32[1];
  v18 = v27.m128i_i32[0];
  v21 = v27.m128i_u32[3];
  v22 = v27.m128i_u32[2];
  do
  {
    v6 += 1597463007;
    v25 += ((v6 ^ v24) + (v7 ^ dword_2020[(v6 >> 2) & 3])) ^ (((4 * v24) ^ (v7 >> 5)) + ((16 * v7) ^ (v24 >> 3)));
    v24 += (((16 * v25) ^ (v20 >> 3)) + ((4 * v20) ^ (v25 >> 5)))
         ^ ((v6 ^ v20) + (v25 ^ dword_2020[((unsigned __int8)(v6 >> 2) ^ 1) & 3]));
    v20 += (((16 * v24) ^ (v19 >> 3)) + ((4 * v19) ^ (v24 >> 5)))
         ^ ((v6 ^ v19) + (v24 ^ dword_2020[((unsigned __int8)(v6 >> 2) ^ 2) & 3]));
    v19 += (((16 * v20) ^ (v18 >> 3)) + ((4 * v18) ^ (v20 >> 5)))
         ^ ((v6 ^ v18) + (v20 ^ dword_2020[~(unsigned __int8)(v6 >> 2) & 3]));
    v18 += (((16 * v19) ^ (v23 >> 3)) + ((4 * v23) ^ (v19 >> 5))) ^ ((v6 ^ v23) + (v19 ^ dword_2020[(v6 >> 2) & 3]));
    v23 += (((16 * v18) ^ (v22 >> 3)) + ((4 * v22) ^ (v18 >> 5)))
         ^ ((v6 ^ v22) + (v18 ^ dword_2020[((unsigned __int8)(v6 >> 2) ^ 5) & 3]));
    v22 += (((16 * v23) ^ (v21 >> 3)) + ((4 * v21) ^ (v23 >> 5)))
         ^ ((v6 ^ v21) + (v23 ^ dword_2020[((unsigned __int8)(v6 >> 2) ^ 6) & 3]));
    v21 += (((16 * v22) ^ (v8 >> 3)) + ((4 * v8) ^ (v22 >> 5)))
         ^ ((v8 ^ v6) + (v22 ^ dword_2020[((unsigned __int8)(v6 >> 2) ^ 7) & 3]));
    v8 += (((16 * v21) ^ (v9 >> 3)) + ((4 * v9) ^ (v21 >> 5))) ^ ((v9 ^ v6) + (v21 ^ dword_2020[(v6 >> 2) & 3]));
    v9 += (((16 * v8) ^ (v10 >> 3)) + ((4 * v10) ^ (v8 >> 5)))
        ^ ((v10 ^ v6) + (v8 ^ dword_2020[((unsigned __int8)(v6 >> 2) ^ 9) & 3]));
    v10 += (((16 * v9) ^ (v11 >> 3)) + ((4 * v11) ^ (v9 >> 5)))
         ^ ((v11 ^ v6) + (v9 ^ dword_2020[((unsigned __int8)(v6 >> 2) ^ 0xA) & 3]));
    v11 += (((16 * v10) ^ (v12 >> 3)) + ((4 * v12) ^ (v10 >> 5)))
         ^ ((v12 ^ v6) + (v10 ^ dword_2020[((unsigned __int8)(v6 >> 2) ^ 0xB) & 3]));
    v12 += (((16 * v11) ^ (v13 >> 3)) + ((4 * v13) ^ (v11 >> 5))) ^ ((v13 ^ v6) + (v11 ^ dword_2020[(v6 >> 2) & 3]));
    v13 += (((v12 >> 5) ^ (4 * v14)) + ((v14 >> 3) ^ (16 * v12)))
         ^ ((v14 ^ v6) + (v12 ^ dword_2020[((unsigned __int8)(v6 >> 2) ^ 0xD) & 3]));
    v14 += (((v13 >> 5) ^ (4 * v7)) + ((v7 >> 3) ^ (16 * v13)))
         ^ ((v7 ^ v6) + (v13 ^ dword_2020[((unsigned __int8)(v6 >> 2) ^ 0xE) & 3]));
    v7 += (((16 * v14) ^ (v25 >> 3)) + ((4 * v25) ^ (v14 >> 5)))
        ^ ((v6 ^ v25) + (v14 ^ dword_2020[((unsigned __int8)(v6 >> 2) ^ 0xF) & 3]));
  }
  while ( v6 != 1492265175 );
  v28.m128i_i64[0] = __PAIR64__(v9, v8);
  v26.m128i_i64[0] = __PAIR64__(v24, v25);
  v28.m128i_i64[1] = __PAIR64__(v11, v10);
  v26.m128i_i64[1] = __PAIR64__(v19, v20);
  v29.m128i_i64[0] = __PAIR64__(v13, v12);
  v27.m128i_i64[0] = __PAIR64__(v23, v18);
  v29.m128i_i64[1] = __PAIR64__(v7, v14);
  v27.m128i_i64[1] = __PAIR64__(v21, v22);
  v15 = _mm_or_si128(
          _mm_or_si128(
            _mm_xor_si128(_mm_load_si128((const __m128i *)&xmmword_2030), v27),
            _mm_xor_si128(_mm_load_si128((const __m128i *)&xmmword_2040), v26)),
          _mm_or_si128(
            _mm_xor_si128(_mm_load_si128((const __m128i *)&xmmword_2050), v29),
            _mm_xor_si128(_mm_load_si128((const __m128i *)&xmmword_2060), v28)));
  v16 = _mm_or_si128(v15, _mm_srli_si128(v15, 8));
  if ( !_mm_cvtsi128_si32(_mm_or_si128(v16, _mm_srli_si128(v16, 4))) )
  {
    puts("Correct!");
    return 0;
  }
  else
  {
LABEL_9:
    puts("Wrong.");
    return 1;
  }
}
```

```
  if ( strlen(s) != 64 )
    goto LABEL_9;
```
长度是64
