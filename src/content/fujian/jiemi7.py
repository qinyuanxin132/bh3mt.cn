b2030 = [
    0x7C, 0x08, 0xEA, 0x8E,
    0xE5, 0xCE, 0xF3, 0x99,
    0xF3, 0x5A, 0xAA, 0x60,
    0x27, 0x4D, 0x9F, 0x8D
]#对应v27

b2040 = [
    0xDD, 0xDF, 0xEB, 0x84,
    0x58, 0xE3, 0x6B, 0x64,
    0x98, 0x83, 0x77, 0x37,
    0x58, 0xA5, 0xD0, 0xC4
]#对应v26

b2050 = [
    0xE8, 0xD1, 0x4A, 0x82,
    0xE5, 0xE9, 0xFE, 0xC3,
    0xE9, 0xEA, 0xE5, 0xC4,
    0x00, 0x88, 0x60, 0x08
]#对应v29

b2060 = [
    0xF4, 0x25, 0xF4, 0x89,
    0x97, 0x94, 0x77, 0x59,
    0xC3, 0x37, 0xF5, 0x45,
    0x54, 0x99, 0x9B, 0x22
]#对应v28
v7  = 0x08608800
v8  = 0x89F425F4
v9  = 0x59779497
v10 = 0x45F537C3
v11 = 0x229B9954

v25 = 0x84EBDFDD
v12 = 0x824AD1E8
v13 = 0xC3FEE9E5
v14 = 0xC4E5EAE9

v20 = 0x37778398
v24 = 0x646BE358
v19 = 0xC4D0A558

v23 = 0x99F3CEE5
v18 = 0x8EEA087C
v21 = 0x8D9F4D27
v22 = 0x60AA5AF3
#.rodata:0000000000002020 dword_2020      dd 4D4F4543h, 54463230h, 32365858h, 54454121h
dword_2020 = [0x4D4F4543, 0x54463230,0x32365858,0x54454121]
v6 = 1492265175
count = 0
while v6 != 0:
    v7  = (v7 -  ((((16 * v14) ^ (v25 >> 3)) + ((4 * v25) ^ (v14 >> 5)))  ^ ((v6 ^ v25) + (v14 ^ dword_2020[(((v6 >> 2)&0xff) ^ 0xF) & 3])))) & 0xffffffff
    
    v14 = (v14 - ((((v13 >> 5) ^ (4 * v7))   + ((v7 >> 3) ^ (16 * v13)))  ^ ((v7 ^ v6)  + (v13 ^ dword_2020[(((v6 >> 2)&0xff) ^ 0xE) & 3]))))& 0xffffffff
    
    v13 = (v13 - ((((v12 >> 5) ^ (4 * v14))  + ((v14 >> 3) ^ (16 * v12))) ^ ((v14 ^ v6) + (v12 ^ dword_2020[(((v6 >> 2)&0xff) ^ 0xD) & 3])))) & 0xffffffff
    
    v12 = (v12 - ((((16 * v11) ^ (v13 >> 3)) + ((4 * v13) ^ (v11 >> 5))) ^ ((v6 ^ v13) + (v11 ^ dword_2020[(v6 >> 2) & 3])))) & 0xffffffff

    v11 = (v11 - ((((16 * v10) ^ (v12 >> 3)) + ((4 * v12) ^ (v10 >> 5))) ^ ((v6 ^ v12) + (v10 ^ dword_2020[(((v6 >> 2) & 0xff) ^ 0xB) & 3])))) & 0xffffffff

    v10 = (v10 - ((((16 * v9) ^ (v11 >> 3)) + ((4 * v11) ^ (v9 >> 5))) ^ ((v6 ^ v11) + (v9 ^ dword_2020[(((v6 >> 2) & 0xff) ^ 0xA) & 3])))) & 0xffffffff

    v9 = (v9 - ((((16 * v8) ^ (v10 >> 3)) + ((4 * v10) ^ (v8 >> 5))) ^ ((v6 ^ v10) + (v8 ^ dword_2020[(((v6 >> 2) & 0xff) ^ 9) & 3])))) & 0xffffffff

    v8 = (v8 - ((((16 * v21) ^ (v9 >> 3)) + ((4 * v9) ^ (v21 >> 5))) ^ ((v6 ^ v9) + (v21 ^ dword_2020[(v6 >> 2) & 3])))) & 0xffffffff

    v21 = (v21 - ((((16 * v22) ^ (v8 >> 3)) + ((4 * v8) ^ (v22 >> 5))) ^ ((v6 ^ v8) + (v22 ^ dword_2020[(((v6 >> 2) & 0xff) ^ 7) & 3])))) & 0xffffffff

    v22 = (v22 - ((((16 * v23) ^ (v21 >> 3)) + ((4 * v21) ^ (v23 >> 5))) ^ ((v6 ^ v21) + (v23 ^ dword_2020[(((v6 >> 2) & 0xff) ^ 6) & 3])))) & 0xffffffff

    v23 = (v23 - ((((16 * v18) ^ (v22 >> 3)) + ((4 * v22) ^ (v18 >> 5))) ^ ((v6 ^ v22) + (v18 ^ dword_2020[(((v6 >> 2) & 0xff) ^ 5) & 3])))) & 0xffffffff

    v18 = (v18 - ((((16 * v19) ^ (v23 >> 3)) + ((4 * v23) ^ (v19 >> 5))) ^ ((v6 ^ v23) + (v19 ^ dword_2020[(v6 >> 2) & 3])))) & 0xffffffff

    v19 = (v19 - ((((16 * v20) ^ (v18 >> 3)) + ((4 * v18) ^ (v20 >> 5))) ^ ((v6 ^ v18) + (v20 ^ dword_2020[(~((v6 >> 2) & 0xff)) & 3])))) & 0xffffffff

    v20 = (v20 - ((((16 * v24) ^ (v19 >> 3)) + ((4 * v19) ^ (v24 >> 5))) ^ ((v6 ^ v19) + (v24 ^ dword_2020[(((v6 >> 2) & 0xff) ^ 2) & 3])))) & 0xffffffff

    v24 = (v24 - ((((16 * v25) ^ (v20 >> 3)) + ((4 * v20) ^ (v25 >> 5))) ^ ((v6 ^ v20) + (v25 ^ dword_2020[(((v6 >> 2) & 0xff) ^ 1) & 3])))) & 0xffffffff

    v25 = (v25 - (((v6 ^ v24) + (v7 ^ dword_2020[(v6 >> 2) & 3])) ^ (((4 * v24) ^ (v7 >> 5)) + ((16 * v7) ^ (v24 >> 3))))) & 0xffffffff

    v6 = (v6 - 1597463007) & 0xffffffff
    count += 1
    print(count, hex(v6), flush=True)

v26 = [0,0,0,0]
v27 = [0,0,0,0]
v28 = [0,0,0,0]
v29 = [0,0,0,0]

v29[3] = v7
v28[0] = v8
v28[1] = v9
v28[2] = v10
v28[3] = v11
v26[0] = v25
v29[0] = v12
v29[1] = v13
v29[2] = v14
v26[2] = v20
v26[1] = v24
v26[3] = v19
v27[1] = v23
v27[0] = v18
v27[3] = v21
v27[2] = v22

result1 = [[0] * 4 for _ in range(4)]
result2 = [[0] * 4 for _ in range(4)]
result3 = [[0] * 4 for _ in range(4)]
result4 = [[0] * 4 for _ in range(4)]


for i in range(4):
    x = v26[i]
    for shift in [0, 8, 16, 24]:
        a = shift // 8
        result1[i][a] = ((x >> shift) & 0xff)

for i in range(4):
    x = v27[i]
    for shift in [0, 8, 16, 24]:
        a = shift // 8
        result2[i][a] = ((x >> shift) & 0xff)

for i in range(4):
    x = v28[i]
    for shift in [0, 8, 16, 24]:
        a = shift // 8
        result3[i][a] = ((x >> shift) & 0xff)

for i in range(4):
    x = v29[i]
    for shift in [0, 8, 16, 24]:
        a = shift // 8
        result4[i][a] = ((x >> shift) & 0xff)
print(result1)
print(result2)
print(result3)
print(result4)

